/**
 * Instagram Chat Export Parser
 *
 * Parses Instagram's downloaded data ZIP archives entirely in the browser.
 * No chat content ever leaves the device — only the extracted clean message
 * array is sent to the backend.
 *
 * Instagram export ZIP structure:
 *   your_instagram_data/
 *     messages/
 *       inbox/
 *         partnerUsername_HASH/
 *           message_1.json
 *           message_2.json   ← paginated, merge all
 *
 * Known quirks handled here:
 *  1. Mojibake encoding — Instagram stores UTF-8 text as latin-1 bytes.
 *     "é" appears as "Ã©" unless decoded correctly.
 *  2. Pagination — long conversations are split across message_1.json,
 *     message_2.json, etc. All files must be merged and sorted.
 *  3. Message types — only "Generic" messages have text content.
 *     Photo, audio, video, call, and share entries are marked as [media].
 */

import JSZip from 'jszip';

// ── Constants ──────────────────────────────────────────────────────────────────

/** File path prefix for DM inbox folders inside the ZIP. */
const INBOX_PREFIX_RE = /^(?:.*\/)?messages\/inbox\/([^/]+)\/message_\d+\.json$/i;

/** System/automated message senders to ignore. */
const SYSTEM_SENDER_RE = /^(Instagram User|instagrammer)$/i;

// ── Encoding Fix ───────────────────────────────────────────────────────────────

/**
 * Repair Instagram's mojibake encoding.
 *
 * Instagram exports encode UTF-8 strings as if they were latin-1. We reverse
 * this by converting each code-point back to its raw byte value, then
 * re-interpreting the resulting byte sequence as UTF-8.
 *
 * @param {string} str
 * @returns {string}
 */
function fixEncoding(str) {
  if (!str || typeof str !== 'string') return str ?? '';
  try {
    // escape() percent-encodes non-ASCII chars using their raw byte values.
    // decodeURIComponent() then reinterprets them as UTF-8.
    return decodeURIComponent(escape(str));
  } catch {
    return str; // already valid UTF-8 or unrecoverable
  }
}

// ── ZIP Loading ────────────────────────────────────────────────────────────────

/**
 * Load a JSZip instance from a File or Blob.
 *
 * @param {File|Blob} file
 * @returns {Promise<JSZip>}
 */
async function loadZip(file) {
  try {
    return await JSZip.loadAsync(file);
  } catch (err) {
    throw new Error(
      'Could not read the ZIP file. Make sure you uploaded a valid Instagram data export. ' +
        `(${err.message})`
    );
  }
}

/**
 * Parse a JSON file inside the ZIP.
 *
 * @param {JSZip.JSZipObject} zipEntry
 * @returns {Promise<any>}
 */
async function parseJsonEntry(zipEntry) {
  const raw = await zipEntry.async('string');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Could not parse JSON in ${zipEntry.name}`);
  }
}

// ── Partner Discovery ──────────────────────────────────────────────────────────

/**
 * @typedef {Object} InstagramPartner
 * @property {string} folderName  - Raw folder name used as a stable key.
 * @property {string} displayName - Human-readable name (encoding-fixed).
 * @property {number} messageCount - Approximate message count.
 */

/**
 * Scan the ZIP for DM conversation folders and return all partners.
 *
 * Also detects "my name" by finding the participant who appears in EVERY
 * conversation (that common name must be the account owner).
 *
 * @param {File|Blob} zipFile
 * @returns {Promise<{ partners: InstagramPartner[], myName: string|null }>}
 */
export async function getPartners(zipFile) {
  const zip = await loadZip(zipFile);

  // Group JSON entries by inbox folder name
  const folderMap = new Map(); // folderName → [zipEntry, ...]

  zip.forEach((relativePath, entry) => {
    if (entry.dir) return;
    const match = relativePath.match(INBOX_PREFIX_RE);
    if (!match) return;

    const folderName = match[1];
    if (!folderMap.has(folderName)) folderMap.set(folderName, []);
    folderMap.get(folderName).push(entry);
  });

  if (folderMap.size === 0) {
    throw new Error(
      'No conversation folders found. ' +
        'Make sure you selected "Messages" when requesting your Instagram data.'
    );
  }

  // Read the first JSON file from each folder to get participant info
  const participantFrequency = new Map(); // participantName → appearance count
  const partners = [];

  for (const [folderName, entries] of folderMap.entries()) {
    // Sort so message_1.json is always first
    entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    let data;
    try {
      data = await parseJsonEntry(entries[0]);
    } catch {
      continue; // skip unreadable conversations
    }

    const title = fixEncoding(data.title ?? folderName);
    const participants = (data.participants ?? []).map((p) => fixEncoding(p.name));
    const totalMessages = (data.messages ?? []).length;

    participants.forEach((name) => {
      participantFrequency.set(name, (participantFrequency.get(name) ?? 0) + 1);
    });

    partners.push({ folderName, displayName: title, messageCount: totalMessages });
  }

  // The participant who appears across ALL (or most) conversations is "me"
  const totalConversations = folderMap.size;
  let myName = null;
  let maxCount = 0;

  for (const [name, count] of participantFrequency.entries()) {
    if (count > maxCount) {
      maxCount = count;
      myName = name;
    }
  }

  // Only accept as "myName" if they appear in at least half of conversations
  if (maxCount < Math.max(1, Math.floor(totalConversations / 2))) {
    myName = null;
  }

  // Sort partners by approximate message count (descending) for better UX
  partners.sort((a, b) => b.messageCount - a.messageCount);

  return { partners, myName };
}

// ── Message Extraction ─────────────────────────────────────────────────────────

/**
 * @typedef {Object} CleanMessage
 * @property {'me'|string} sender - 'me' for the account owner, display name otherwise.
 * @property {string}       text
 * @property {string}       timestamp - ISO 8601 string.
 */

/**
 * Extract, decode, and clean all messages from a specific partner's folder.
 *
 * @param {File|Blob} zipFile
 * @param {string}    folderName - From getPartners().partners[].folderName
 * @param {string}    myName     - From getPartners().myName (or user-provided)
 * @param {object}    [options]
 * @param {boolean}   [options.includeMedia=false]  Include [media] placeholder messages.
 * @param {boolean}   [options.includeDeleted=false] Include [deleted] placeholder messages.
 * @param {number}    [options.maxMessages=Infinity] Hard cap on messages (most recent kept).
 * @returns {Promise<CleanMessage[]>}
 */
export async function extractMessages(zipFile, folderName, myName, options = {}) {
  const { includeMedia = false, includeDeleted = false, maxMessages = Infinity } = options;

  if (!myName || typeof myName !== 'string' || myName.trim() === '') {
    throw new Error('myName is required to identify which side of the conversation is "me".');
  }

  const zip = await loadZip(zipFile);

  // Collect all message JSON files for this folder
  const entries = [];
  const escapedFolder = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const folderRe = new RegExp(
    `(?:.*\\/)?messages\\/inbox\\/${escapedFolder}\\/message_\\d+\\.json$`,
    'i'
  );

  zip.forEach((relativePath, entry) => {
    if (!entry.dir && folderRe.test(relativePath)) entries.push(entry);
  });

  if (entries.length === 0) {
    throw new Error(`No message files found for folder: ${folderName}`);
  }

  entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // Parse and merge all paginated JSON files
  const allMessages = [];

  for (const entry of entries) {
    let data;
    try {
      data = await parseJsonEntry(entry);
    } catch {
      continue;
    }

    for (const msg of data.messages ?? []) {
      const processed = processMessage(msg, myName, includeMedia, includeDeleted);
      if (processed) allMessages.push(processed);
    }
  }

  // Instagram paginates newest-first. Sort ascending by timestamp.
  allMessages.sort((a, b) => a._ts - b._ts);

  // Apply message cap (keep the most recent messages within the limit)
  const trimmed =
    allMessages.length > maxMessages
      ? allMessages.slice(allMessages.length - maxMessages)
      : allMessages;

  // Strip the internal _ts field before returning
  return trimmed.map(({ _ts, ...rest }) => rest);
}

/**
 * Process a single raw Instagram message object into the clean format.
 *
 * @param {object}  msg
 * @param {string}  myName
 * @param {boolean} includeMedia
 * @param {boolean} includeDeleted
 * @returns {(CleanMessage & { _ts: number })|null}
 */
function processMessage(msg, myName, includeMedia, includeDeleted) {
  const rawSender = msg.sender_name ?? '';
  if (!rawSender || SYSTEM_SENDER_RE.test(rawSender)) return null;

  const senderFixed = fixEncoding(rawSender);
  const sender = senderFixed === myName ? 'me' : senderFixed;
  const ts = msg.timestamp_ms ?? 0;
  const timestamp = ts ? new Date(ts).toISOString() : new Date().toISOString();

  // Deleted / unsent messages
  if (msg.is_unsent ?? false) {
    return includeDeleted ? { sender, text: '[deleted]', timestamp, _ts: ts } : null;
  }

  // Text content — key off the presence of `content`, NOT msg.type.
  // Instagram uses "Generic" for text today, but the type field is unreliable
  // across export versions, so we treat any message with real text as text.
  if (typeof msg.content === 'string' && msg.content.trim() !== '') {
    const text = fixEncoding(msg.content).trim();
    if (!text) return null;
    // Filter out Instagram's automated reaction / like notifications
    if (/reacted .+ to your message/i.test(text)) return null;
    if (/^liked a message$/i.test(text)) return null;
    return { sender, text, timestamp, _ts: ts };
  }

  // Shared content (links, reels, profiles)
  if (msg.share?.link) {
    return { sender, text: `[link: ${msg.share.link}]`, timestamp, _ts: ts };
  }

  // Media-only message (photo, video, audio, file, sticker)
  if (includeMedia) {
    const mediaType =
      msg.photos ? 'photo' :
      msg.videos ? 'video' :
      msg.audio_files ? 'audio' :
      msg.files ? 'file' :
      msg.sticker ? 'sticker' :
      null;
    if (mediaType) return { sender, text: `[${mediaType}]`, timestamp, _ts: ts };
  }

  // Call events, subscriptions, reactions, etc. — skip
  return null;
}

// ── Validation Helper ──────────────────────────────────────────────────────────

/**
 * Validate a clean messages array before sending to the API.
 * Returns an array of human-readable error strings (empty = valid).
 *
 * @param {CleanMessage[]} messages
 * @param {number} [minMessages=10]
 * @param {number} [maxMessages=20000]
 * @returns {string[]}
 */
export function validateMessages(messages, minMessages = 10, maxMessages = 20_000) {
  const errors = [];

  if (!Array.isArray(messages) || messages.length < minMessages) {
    errors.push(`At least ${minMessages} messages are required for analysis.`);
  }

  if (messages.length > maxMessages) {
    errors.push(`Too many messages (${messages.length}). Maximum is ${maxMessages}.`);
  }

  const invalidRows = messages.filter(
    (m) => typeof m.sender !== 'string' || typeof m.text !== 'string' || !m.text.trim()
  );
  if (invalidRows.length > 0) {
    errors.push(`${invalidRows.length} message(s) have missing or invalid fields.`);
  }

  return errors;
}
