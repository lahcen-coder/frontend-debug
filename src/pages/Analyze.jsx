import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Upload, FileArchive, FileText, X, Users, MessageCircle,
  ShieldCheck, Info, ChevronLeft, AlertTriangle, Loader2,
  CheckCircle2, Lock, Sparkles,
} from 'lucide-react'

import { getPartners, extractMessages as igExtract, validateMessages } from '../lib/parsers/instagram'
import {
  getParticipants, extractMessages as waExtract,
  readWhatsAppFile, validateMessages as waValidate,
} from '../lib/parsers/whatsapp'
import { useAnalysisStore } from '../store/analysisStore'
import { useAuthStore } from '../store/authStore'

// ── Constants ──────────────────────────────────────────────────────────────────

const STEP = { UPLOAD: 0, SELECT: 1, CONSENT: 2, PROCESSING: 3 }

const STEP_LABELS = ['Upload', 'Select', 'Confirm', 'Analyzing']

const PROCESSING_MESSAGES = [
  { text: 'Reading between the lines…',    emoji: '💜' },
  { text: 'Looking for inside jokes…',     emoji: '😄' },
  { text: 'Measuring the chemistry…',      emoji: '⚗️' },
  { text: 'Finding what connects you…',    emoji: '🌟' },
  { text: 'Writing your insights…',        emoji: '✍️' },
  { text: 'Almost ready…',                 emoji: '🎉' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function sizeLabel(bytes) {
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEP_LABELS.map((label, i) => {
        const done    = step > i
        const active  = step === i
        const last    = i === STEP_LABELS.length - 1
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300 ${
                  done   ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30'
                  : active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-4 ring-brand-500/20'
                  : 'bg-white/8 text-slate-500 border border-white/10'
                }`}>
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-brand-400' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {!last && (
              <div className={`w-16 h-px mx-1 mb-5 transition-all duration-500 ${
                done ? 'bg-brand-600' : 'bg-white/8'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function UploadZone({ onFileAccepted }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile]         = useState(null)
  const inputRef = useRef()

  const accept = useCallback((f) => {
    if (!f) return
    const isZip = f.name.endsWith('.zip') || f.type.includes('zip')
    const isTxt = f.name.endsWith('.txt') || f.type === 'text/plain'
    if (!isZip && !isTxt) {
      toast.error('Please upload a .zip (Instagram) or .txt (WhatsApp) file.')
      return
    }
    const type = isZip ? 'instagram' : 'whatsapp'
    setFile({ file: f, type })
    onFileAccepted({ file: f, type })
  }, [onFileAccepted])

  const clear = () => { setFile(null); onFileAccepted(null) }

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload chat export file"
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-200 outline-none
            ${dragging
              ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
              : 'border-white/12 hover:border-brand-500/50 hover:bg-white/3'
            }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files[0]) }}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".zip,.txt"
            onChange={(e) => accept(e.target.files[0])}
          />
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20
              flex items-center justify-center mx-auto">
              <Upload size={28} className="text-brand-400" />
            </div>
          </div>
          <p className="text-lg font-semibold text-white mb-1">
            Drop your chat export here
          </p>
          <p className="text-sm text-slate-400 mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileArchive size={12} className="text-brand-400" /> Instagram <span className="opacity-60">(.zip)</span>
            </span>
            <span className="text-slate-700">·</span>
            <span className="flex items-center gap-1.5">
              <FileText size={12} className="text-emerald-400" /> WhatsApp <span className="opacity-60">(.txt)</span>
            </span>
          </div>
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <Lock size={10} />
            Parsed 100% in your browser — your file never leaves your device
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-white/8">
          {file.type === 'instagram'
            ? <FileArchive size={28} className="text-brand-400 shrink-0" />
            : <FileText    size={28} className="text-emerald-400 shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">{file.file.name}</p>
            <p className="text-xs text-slate-400 capitalize mt-0.5">
              {file.type === 'instagram' ? 'Instagram ZIP' : 'WhatsApp TXT'} ·{' '}
              {sizeLabel(file.file.size)}
            </p>
          </div>
          <button
            onClick={clear}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
        <div className="p-3 glass rounded-xl">
          <p className="font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <FileArchive size={11} className="text-brand-400" /> Instagram
          </p>
          Settings → Your activity → Download your information → Messages → JSON → Request download → Upload the ZIP
        </div>
        <div className="p-3 glass rounded-xl">
          <p className="font-medium text-slate-300 mb-1 flex items-center gap-1.5">
            <FileText size={11} className="text-emerald-400" /> WhatsApp
          </p>
          Open chat → ⋮ → More → Export chat → Without media → Upload the .txt file
        </div>
      </div>
    </div>
  )
}

function ContactList({ contacts, selected, onSelect, label }) {
  if (!contacts.length) return null
  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <Users size={14} className="text-brand-400" />
        {label}
      </p>
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {contacts.map((c) => {
          const isSelected = selected === (c.folderName ?? c.name)
          return (
            <button
              key={c.folderName ?? c.name}
              onClick={() => onSelect(c)}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border
                text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-sm shadow-brand-500/10'
                  : 'bg-white/3 border-white/8 text-slate-300 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center
                  text-sm font-bold shrink-0 ${
                  isSelected ? 'bg-brand-500/30 text-brand-300' : 'bg-white/8 text-slate-400'
                }`}>
                  {(c.displayName ?? c.name)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm leading-tight">{c.displayName ?? c.name}</p>
                  {c.folderName && c.folderName !== c.displayName && (
                    <p className="text-[11px] text-slate-500 mt-0.5">@{c.folderName.split('_')[0]}</p>
                  )}
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                <MessageCircle size={11} />
                {(c.messageCount ?? 0).toLocaleString()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ConsentGate({ messageCount, onConsent, isSubmitting }) {
  const [gdpr, setGdpr]       = useState(false)
  const [piiRedact, setPii]   = useState(false)

  return (
    <div className="p-5 glass rounded-2xl border border-brand-500/20 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-brand-400" />
        <h3 className="font-semibold text-white">Privacy confirmation</h3>
      </div>

      <div className="space-y-2 p-3.5 bg-white/3 rounded-xl text-xs text-slate-400">
        <p className="flex items-start gap-2">
          <Info size={12} className="mt-0.5 shrink-0 text-brand-400" />
          <span>
            Only <strong className="text-white">{messageCount.toLocaleString()} text messages</strong>{' '}
            (sender + text + timestamp) will be sent to our servers.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Info size={12} className="mt-0.5 shrink-0 text-brand-400" />
          <span>
            Your original file stays on your device. Raw messages are{' '}
            <strong className="text-white">never stored</strong> — only the AI-generated insights.
          </span>
        </p>
        <p className="flex items-start gap-2">
          <Info size={12} className="mt-0.5 shrink-0 text-brand-400" />
          <span>You can delete your report permanently at any time from your account.</span>
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={piiRedact}
          onChange={(e) => setPii(e.target.checked)}
          className="mt-0.5 accent-brand-500 w-4 h-4"
        />
        <span className="text-xs text-slate-300 leading-relaxed">
          Also redact emails, phone numbers, and URLs from messages before sending{' '}
          <span className="text-slate-500">(recommended for extra privacy)</span>.
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={gdpr}
          onChange={(e) => setGdpr(e.target.checked)}
          className="mt-0.5 accent-brand-500 w-4 h-4"
        />
        <span className="text-xs text-slate-300 leading-relaxed">
          I confirm I have the right to analyze this conversation and I consent to the above data
          being processed to generate my report.
        </span>
      </label>

      <button
        disabled={!gdpr || isSubmitting}
        onClick={() => onConsent({ piiRedact })}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {isSubmitting
          ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
          : <><Sparkles size={16} /> Analyze this conversation</>
        }
      </button>
    </div>
  )
}

function ProcessingScreen({ status }) {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % PROCESSING_MESSAGES.length)
    }, 4_500)
    return () => clearInterval(t)
  }, [])

  const msg = PROCESSING_MESSAGES[msgIdx]

  return (
    <div className="card text-center py-16 relative overflow-hidden">
      {/* Background glow orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Spinning ring */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <svg width="80" height="80" className="-rotate-90 animate-spin" style={{ animationDuration: '3s' }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(217,70,239,0.12)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="url(#grad)" strokeWidth="6"
            strokeDasharray="213" strokeDashoffset="160"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute text-3xl" style={{ animationDuration: '3s' }}>
          {msg.emoji}
        </span>
      </div>

      {/* Status text */}
      <h2 className="text-xl font-semibold text-white mb-2">
        Analyzing your conversation…
      </h2>
      <p
        key={msgIdx}
        className="text-slate-400 text-sm transition-opacity duration-500"
        style={{ animation: 'fadeIn 0.5s ease' }}
      >
        {msg.text}
      </p>
      <p className="text-slate-600 text-xs mt-4">
        This usually takes 15–60 seconds. Please don't close the tab.
      </p>

      {status && (
        <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-slate-500
          px-3 py-1.5 bg-white/5 rounded-full border border-white/8">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Status: {status}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function Analyze() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const { submitAnalysis, pollStatus, isSubmitting } = useAnalysisStore()

  // ── State ──────────────────────────────────────────────────────────────────
  const [step, setStep]       = useState(STEP.UPLOAD)
  const [fileInfo, setFileInfo]  = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [pollStatus_, setPollStatus] = useState(null)

  // Instagram specific
  const [igPartners, setIgPartners]   = useState([])
  const [igMyName, setIgMyName]       = useState(null)
  const [igMyNameInput, setIgMyNameInput] = useState('')

  // WhatsApp specific
  const [waParticipants, setWaParticipants] = useState([])
  const [waContent, setWaContent]           = useState(null)

  // Selected
  const [selectedPartner, setSelectedPartner] = useState(null) // { name, displayName, folderName? }
  const [cleanMessages, setCleanMessages]     = useState([])

  // ── File accepted → parse immediately ─────────────────────────────────────
  const handleFileAccepted = useCallback(async (info) => {
    if (!info) {
      setFileInfo(null)
      setParseError(null)
      setIgPartners([])
      setWaParticipants([])
      setWaContent(null)
      setStep(STEP.UPLOAD)
      return
    }

    setFileInfo(info)
    setIsParsing(true)
    setParseError(null)

    try {
      if (info.type === 'instagram') {
        const { partners, myName } = await getPartners(info.file)
        if (!partners.length) throw new Error('No conversations found in this Instagram export.')
        setIgPartners(partners)
        setIgMyName(myName)
        if (myName) setIgMyNameInput(myName)
        setStep(STEP.SELECT)
      } else {
        const content = await readWhatsAppFile(info.file)
        const { participants } = getParticipants(content)
        if (!participants.length) throw new Error('Could not parse this WhatsApp export. Check the file format.')
        if (participants.length > 2) {
          throw new Error('Group chats are not supported yet. Please export a 1-on-1 conversation.')
        }
        setWaParticipants(participants)
        setWaContent(content)
        setStep(STEP.SELECT)
      }
    } catch (e) {
      setParseError(e.message || 'Failed to parse file. Please try a different export.')
      toast.error(e.message || 'Failed to parse file.')
    } finally {
      setIsParsing(false)
    }
  }, [])

  // ── Partner selected → extract messages ─────────────────────────────────────
  const handlePartnerSelect = useCallback(async (contact) => {
    setSelectedPartner(contact)
    setParseError(null)

    try {
      let messages = []
      const maxMessages = user?.plan?.max_messages_per_analysis ?? 20_000

      if (fileInfo.type === 'instagram') {
        const myName = igMyName || igMyNameInput.trim()
        if (!myName) {
          toast.error('Please enter your display name before selecting a partner.')
          return
        }
        messages = await igExtract(fileInfo.file, contact.folderName, myName, { maxMessages })
      } else {
        // For WhatsApp: the selected contact is the PARTNER → "me" is the other participant
        const me = waParticipants.find((p) => p.name !== contact.name)
        if (!me) throw new Error('Could not determine your name in the conversation.')
        messages = waExtract(waContent, me.name, { maxMessages })
      }

      const errs = fileInfo.type === 'instagram'
        ? validateMessages(messages)
        : waValidate(messages)

      if (errs.length) throw new Error(errs[0])

      setCleanMessages(messages)
      setStep(STEP.CONSENT)
    } catch (e) {
      toast.error(e.message || 'Could not extract messages.')
      setParseError(e.message)
    }
  }, [fileInfo, igMyName, igMyNameInput, waParticipants, waContent, user])

  // ── Consent confirmed → submit + poll ──────────────────────────────────────
  const handleConsent = useCallback(async ({ piiRedact }) => {
    setStep(STEP.PROCESSING)

    let messages = cleanMessages

    // Optional PII redaction (emails, phones, URLs)
    if (piiRedact) {
      const piiRe = /(\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|https?:\/\/\S+|\b(\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}\b)/gi
      messages = messages.map((m) => ({ ...m, text: m.text.replace(piiRe, '[redacted]') }))
    }

    const partnerName = selectedPartner?.displayName ?? selectedPartner?.name ?? 'Unknown'

    try {
      const analysis = await submitAnalysis({
        platform:     fileInfo.type,   // 'instagram' | 'whatsapp'
        partner_name: partnerName,
        messages,
      })

      const done = await pollStatus(analysis.id, {
        onProgress: (a) => setPollStatus(a.status),
      })

      if (done?.status === 'completed') {
        toast.success('Your report is ready! ✨')
        navigate(`/dashboard/${analysis.id}`)
      } else {
        toast.error('Analysis failed. Your credit was refunded automatically.')
        setStep(STEP.UPLOAD)
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Something went wrong.'
      toast.error(msg)

      // Quota exceeded → stay on consent to show message
      if (err.response?.status === 429) {
        setStep(STEP.CONSENT)
      } else {
        setStep(STEP.CONSENT)
      }
    }
  }, [cleanMessages, selectedPartner, fileInfo, submitAnalysis, pollStatus, navigate])

  // ── Render ──────────────────────────────────────────────────────────────────

  const igMyNameResolved = igMyName || igMyNameInput.trim()

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
          bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
          <Lock size={11} /> Privacy-first analysis
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Analyze a conversation</h1>
        <p className="text-slate-400 text-sm">
          Upload your chat export and discover your connection — with kindness, not judgment.
        </p>
      </div>

      <StepIndicator step={step} />

      {/* ── Step 0: Upload ──────────────────────────────────────────────────── */}
      {step === STEP.UPLOAD && (
        <div className="space-y-4">
          <UploadZone onFileAccepted={handleFileAccepted} />

          {isParsing && (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm py-2">
              <Loader2 size={15} className="animate-spin text-brand-400" />
              Parsing your file locally…
            </div>
          )}

          {parseError && (
            <div className="flex items-start gap-2.5 p-3.5 glass border border-rose-500/20
              rounded-xl text-rose-400 text-sm">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>
      )}

      {/* ── Step 1: Select partner ─────────────────────────────────────────── */}
      {step === STEP.SELECT && (
        <div className="card space-y-5">
          {/* Uploaded file chip */}
          <div className="flex items-center gap-2.5 p-3 bg-white/3 rounded-xl border border-white/8">
            {fileInfo?.type === 'instagram'
              ? <FileArchive size={18} className="text-brand-400 shrink-0" />
              : <FileText    size={18} className="text-emerald-400 shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{fileInfo?.file.name}</p>
              <p className="text-[11px] text-slate-500">
                {fileInfo?.type === 'instagram'
                  ? `${igPartners.length} conversation${igPartners.length !== 1 ? 's' : ''} found`
                  : `${waParticipants.length} participants found`
                }
              </p>
            </div>
            <button
              onClick={() => { setStep(STEP.UPLOAD); setFileInfo(null) }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Change
            </button>
          </div>

          {/* Instagram: "my name" fallback input if auto-detection failed */}
          {fileInfo?.type === 'instagram' && !igMyName && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                What's your display name in this export?
                <span className="text-slate-600 font-normal ml-1">(Check the JSON files for your username)</span>
              </label>
              <input
                className="input text-sm"
                placeholder="Your display name…"
                value={igMyNameInput}
                onChange={(e) => setIgMyNameInput(e.target.value)}
              />
            </div>
          )}

          {/* Contact list */}
          {fileInfo?.type === 'instagram' ? (
            <ContactList
              contacts={igPartners}
              selected={selectedPartner?.folderName}
              onSelect={handlePartnerSelect}
              label="Select the person to analyze"
            />
          ) : (
            <ContactList
              contacts={waParticipants}
              selected={selectedPartner?.name}
              onSelect={handlePartnerSelect}
              label="Who is your partner in this conversation?"
            />
          )}

          {isParsing && (
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Loader2 size={14} className="animate-spin" /> Extracting messages…
            </div>
          )}

          {parseError && (
            <div className="flex items-start gap-2 p-3 glass border border-rose-500/20
              rounded-xl text-rose-400 text-xs">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              {parseError}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Consent ────────────────────────────────────────────────── */}
      {step === STEP.CONSENT && (
        <div className="space-y-4">
          <button
            onClick={() => setStep(STEP.SELECT)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ChevronLeft size={15} /> Back to contact
          </button>

          {/* Selected partner summary */}
          {selectedPartner && (
            <div className="flex items-center gap-3 p-4 glass rounded-2xl border border-white/8">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/20
                flex items-center justify-center text-brand-300 font-bold shrink-0">
                {(selectedPartner.displayName ?? selectedPartner.name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {selectedPartner.displayName ?? selectedPartner.name}
                </p>
                <p className="text-xs text-slate-400">
                  {cleanMessages.length.toLocaleString()} messages extracted
                </p>
              </div>
            </div>
          )}

          <ConsentGate
            messageCount={cleanMessages.length}
            onConsent={handleConsent}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* ── Step 3: Processing ─────────────────────────────────────────────── */}
      {step === STEP.PROCESSING && (
        <ProcessingScreen status={pollStatus_} />
      )}
    </div>
  )
}
