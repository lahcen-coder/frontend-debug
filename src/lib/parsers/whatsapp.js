/**
 * WhatsApp Chat Export Parser
 *
 * Parses WhatsApp's exported .txt chat files entirely in the browser.
 * No chat content ever leaves the device.
 *
 * WhatsApp exports two primary formats depending on the OS and locale:
 *
 *   iOS (bracketed):
 *     [DD/MM/YYYY, HH:MM:SS] Name: Message text
 *     [DD/MM/YYYY, HH:MM:SS AM] Name: Message text
 *
 *   Android (hyphenated):
 *     DD/MM/YYYY, HH:MM - Name: Message text
 *     DD/MM/YYYY HH:MM - Name: Message text
 *
 * Multi-line messages: continuation lines do not start with a date prefix.
 * We collect them and append to the previous message.
 *
 * System messages (e.g. "end-to-end encrypted", "changed the subject",
 * "left", "added") are detected and filtered out.
 */

// ── Format Detection Patterns ─────────────────────────────────────────────────

/**
 * iOS format: [DD/MM/YYYY, HH:MM:SS] Name: text
 * The time may include seconds and/or AM/PM.
 */
const IOS_HEADER_RE =
  /^\[(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\]\s+([^:]+):\s*(.*)/i;

/**
 * Android format: DD/MM/YYYY, HH:MM - Name: text
 * The separator is either a hyphen or an em-dash (–).
 */
const ANDROID_HEADER_RE =
  /^(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AP]M)?)\s*[-–]\s+([^:]+):\s*(.*)/i;

/**
 * Quick test whether a line starts a new message (either format).
 */
const IS_NEW_MESSAGE_RE =
  /^(?:\[\d{1,2}[\/\.\-]|\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}[,\s])/;

// ── System Message Filters ────────────────────────────────────────────────────

/**
 * Content patterns that identify WhatsApp system messages.
 * These have no sender (the "name" field contains the whole system text).
 */
const SYSTEM_CONTENT_RE = [
  /messages and calls are end-to-end encrypted/i,
  /changed the subject/i,
  /changed the group description/i,
  /changed this group's icon/i,
  /created group/i,
  /added you/i,
  /was added/i,
  /left$/i,
  /joined using this group's invite link/i,
  /your security code with .+ changed/i,
  /pinned a message/i,
  /turned on disappearing messages/i,
  /turned off disappearing messages/i,
];

/**
 * Content patterns for media/deleted messages.
 * These are kept as placeholder text rather than skipped.
 */
const MEDIA_RE = /<media omitted>/i;
const DELETED_RE = /this message was deleted/i;
const MISSED_CALL_RE = /missed (voice|video) call/i;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Detect which header format the file uses.
 *
 * @param {string[]} lines
 * @returns {'ios'|'android'|null}
 */
function detectFormat(lines) {
  for (const line of lines.slice(0, 20)) {
    if (IOS_HEADER_RE.test(line)) return 'ios';
    if (ANDROID_HEADER_RE.test(line)) return 'android';
  }
  return null;
}

/**
 * Parse a date+time string into an ISO timestamp.
 * Handles DD/MM/YYYY and MM/DD/YYYY ordering heuristically.
 *
 * @param {string} datePart  e.g. "25/12/2023" or "12/25/23"
 * @param {string} timePart  e.g. "14:30:00" or "2:30 PM"
 * @returns {string} ISO 8601 string, or empty string on failure.
 */
function parseTimestamp(datePart, timePart) {
  // Normalise separators
  const normDate = datePart.replace(/[.\-]/g, '/');
  const [p1, p2, p3] = normDate.split('/').map(Number);

  // Detect year position (4-digit = year in position 3)
  let day, month, year;
  if (p3 > 31) {
    // DD/MM/YYYY
    [day, month, year] = [p1, p2, p3];
  } else if (p1 > 31) {
    // YYYY/MM/DD
    [year, month, day] = [p1, p2, p3];
  } else if (p2 > 12) {
    // MM/DD/YY where day > 12 rules out day-first
    [month, day, year] = [p1, p2, p3 < 100 ? 2000 + p3 : p3];
  } else {
    // Ambiguous — default to DD/MM/YY (most common internationally)
    [day, month, year] = [p1, p2, p3 < 100 ? 2000 + p3 : p3];
  }

  // Parse time with AM/PM support
  let [timeClock, meridiem] = timePart.trim().split(/\s+/);
  let [h, m, s = '0'] = timeClock.split(':').map(Number);

  if (meridiem) {
    if (meridiem.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (meridiem.toUpperCase() === 'AM' && h === 12) h = 0;
  }

  try {
    const d = new Date(Date.UTC(year, month - 1, day, h, m, s));
    return isNaN(d.getTime()) ? '' : d.toISOString();
  } catch {
    return '';
  }
}

/**
 * Parse a single header line using the detected format regex.
 *
 * @param {string} line
 * @param {'ios'|'android'} format
 * @returns {{ dateStr: string, timeStr: string, sender: string, text: string }|null}
 */
function parseHeader(line, format) {
  const re = format === 'ios' ? IOS_HEADER_RE : ANDROID_HEADER_RE;
  const m = line.match(re);
  if (!m) return null;
  return {
    dateStr: m[1],
    timeStr: m[2],
    sender:  m[3].trim(),
    text:    m[4],
  };
}

/**
 * Determine whether a parsed sender+text pair represents a WhatsApp system event.
 *
 * WhatsApp system messages appear with no colon separator, so the regex may
 * still pick them up with the entire system text in the "sender" field.
 *
 * @param {string} sender
 * @param {string} text
 * @returns {boolean}
 */
function isSystemMessage(sender, text) {
  const combined = `${sender}: ${text}`;
  return SYSTEM_CONTENT_RE.some((re) => re.test(combined) || re.test(sender));
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} WaParticipant
 * @property {string} name
 * @property {number} messageCount
 */

/**
 * @typedef {Object} CleanMessage
 * @property {'me'|string} sender
 * @property {string}       text
 * @property {string}       timestamp - ISO 8601 string.
 */

/**
 * Extract the list of participants from a WhatsApp .txt export.
 *
 * @param {string} content - Raw text content of the .txt file.
 * @returns {{ participants: WaParticipant[], detectedFormat: 'ios'|'android'|null }}
 */
export function getParticipants(content) {
  if (!content || typeof content !== 'string') {
    throw new Error('WhatsApp export content must be a non-empty string.');
  }

  const lines = content.split('\n');
  const format = detectFormat(lines);

  if (!format) {
    throw new Error(
      'Could not detect WhatsApp export format. ' +
        'Please export without media and ensure the file is a .txt file.'
    );
  }

  const counts = new Map();

  for (const line of lines) {
    const parsed = parseHeader(line, format);
    if (!parsed) continue;
    if (isSystemMessage(parsed.sender, parsed.text)) continue;

    counts.set(parsed.sender, (counts.get(parsed.sender) ?? 0) + 1);
  }

  const participants = [...counts.entries()]
    .map(([name, messageCount]) => ({ name, messageCount }))
    .sort((a, b) => b.messageCount - a.messageCount);

  return { participants, detectedFormat: format };
}

/**
 * Parse and clean all messages from a WhatsApp .txt export.
 *
 * @param {string} content  - Raw text content of the .txt file.
 * @param {string} myName   - Your exact display name in the export (from getParticipants).
 * @param {object} [options]
 * @param {boolean} [options.includeMedia=false]    Include [media] placeholder rows.
 * @param {boolean} [options.includeDeleted=false]  Include [deleted] placeholder rows.
 * @param {boolean} [options.includeMissedCalls=false]
 * @param {number}  [options.maxMessages=Infinity]
 * @returns {CleanMessage[]}
 */
export function extractMessages(content, myName, options = {}) {
  const {
    includeMedia      = false,
    includeDeleted    = false,
    includeMissedCalls = false,
    maxMessages       = Infinity,
  } = options;

  if (!myName || typeof myName !== 'string') {
    throw new Error('myName is required to map messages to "me" vs the other participant.');
  }

  const lines = content.split('\n');
  const format = detectFormat(lines);

  if (!format) {
    throw new Error('Could not detect WhatsApp export format.');
  }

  const messages = [];
  let current = null; // { sender, text, timestamp }

  const flushCurrent = () => {
    if (!current) return;
    const text = current.text.trim();
    if (text) messages.push({ ...current, text });
    current = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!IS_NEW_MESSAGE_RE.test(line)) {
      // Continuation of a multi-line message
      if (current) {
        current.text += '\n' + line;
      }
      continue;
    }

    const parsed = parseHeader(line, format);
    if (!parsed) {
      if (current) current.text += '\n' + line;
      continue;
    }

    // Flush the previous message before starting a new one
    flushCurrent();

    const { dateStr, timeStr, sender, text } = parsed;

    // Skip system events
    if (isSystemMessage(sender, text)) continue;

    // Handle media / deleted / missed-call placeholders
    if (MEDIA_RE.test(text)) {
      if (includeMedia) {
        const ts = parseTimestamp(dateStr, timeStr);
        const resolvedSender = sender === myName ? 'me' : sender;
        messages.push({ sender: resolvedSender, text: '[media]', timestamp: ts });
      }
      continue;
    }

    if (DELETED_RE.test(text)) {
      if (includeDeleted) {
        const ts = parseTimestamp(dateStr, timeStr);
        const resolvedSender = sender === myName ? 'me' : sender;
        messages.push({ sender: resolvedSender, text: '[deleted]', timestamp: ts });
      }
      continue;
    }

    if (MISSED_CALL_RE.test(text)) {
      if (includeMissedCalls) {
        const ts = parseTimestamp(dateStr, timeStr);
        const resolvedSender = sender === myName ? 'me' : sender;
        messages.push({ sender: resolvedSender, text: '[missed call]', timestamp: ts });
      }
      continue;
    }

    const timestamp = parseTimestamp(dateStr, timeStr);
    const resolvedSender = sender === myName ? 'me' : sender;
    current = { sender: resolvedSender, text, timestamp };
  }

  // Flush the final message
  flushCurrent();

  // Apply cap (keep most recent)
  return messages.length > maxMessages
    ? messages.slice(messages.length - maxMessages)
    : messages;
}

/**
 * Read a File object as text, auto-detecting encoding.
 * WhatsApp exports are typically UTF-8, but some devices export as UTF-16.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function readWhatsAppFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Could not read the WhatsApp export file.'));
    reader.readAsText(file, 'UTF-8');
  });
}

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
    errors.push(`At least ${minMessages} messages are required for a meaningful analysis.`);
  }

  if (messages.length > maxMessages) {
    errors.push(`Too many messages (${messages.length}). Maximum allowed is ${maxMessages}.`);
  }

  const uniqueSenders = new Set(messages.map((m) => m.sender));
  if (uniqueSenders.size < 2) {
    errors.push('Messages from at least 2 participants are required.');
  }

  const invalidRows = messages.filter(
    (m) => typeof m.sender !== 'string' || typeof m.text !== 'string' || !m.text.trim()
  );
  if (invalidRows.length > 0) {
    errors.push(`${invalidRows.length} message(s) have missing or empty fields.`);
  }

  return errors;
}
