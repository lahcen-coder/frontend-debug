import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
  Share2, Trash2, AlertTriangle, ArrowLeft,
  ExternalLink, Download, Loader2, RefreshCw,
  HeartCrack, Phone,
} from 'lucide-react'

import { useAnalysisStore } from '../store/analysisStore'
import api from '../lib/api'

import ChemistryScore        from '../components/dashboard/ChemistryScore'
import CommonGround          from '../components/dashboard/CommonGround'
import MemoryBox             from '../components/dashboard/MemoryBox'
import Icebreakers           from '../components/dashboard/Icebreakers'
import CommunicationStyle    from '../components/dashboard/CommunicationStyle'
import MisunderstandingResolver from '../components/dashboard/MisunderstandingResolver'
import ConnectionQuestions    from '../components/dashboard/ConnectionQuestions'
import LoveLanguages          from '../components/dashboard/LoveLanguages'
import SweetMessages          from '../components/dashboard/SweetMessages'
import MakeThemHappy          from '../components/dashboard/MakeThemHappy'
import TopWords               from '../components/dashboard/TopWords'
import MostPositive           from '../components/dashboard/MostPositive'
import ConversationSummary    from '../components/dashboard/ConversationSummary'

// ── UI atoms ──────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm glass border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="font-semibold text-white text-lg mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function Button({ children, onClick, disabled, loading, variant = 'primary', className = '', size = 'md' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/20',
    secondary: 'bg-white/8 hover:bg-white/12 text-white border border-white/10',
    danger:    'bg-rose-600/80 hover:bg-rose-500 text-white',
  }
  const sizes = { sm: 'py-1.5 px-3 text-sm', md: 'py-2.5 px-5 text-sm' }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Safety banner ─────────────────────────────────────────────────────────────

function SafetyBanner() {
  return (
    <div className="mb-6 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/8">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
          <HeartCrack size={18} className="text-amber-400" />
        </div>
        <div>
          <p className="font-semibold text-amber-300 mb-1">
            We noticed some difficult patterns in this conversation.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            We care about your wellbeing above everything else. If you're going through something
            hard — tension, hurt, or conflict that feels overwhelming — please know you're not alone.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://findahelpline.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs
                hover:bg-amber-500/25 transition-colors"
            >
              <Phone size={11} /> Find a helpline
            </a>
            <a
              href="https://www.relate.org.uk"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                bg-white/5 border border-white/10 text-slate-400 text-xs hover:text-white
                hover:border-white/20 transition-colors"
            >
              <ExternalLink size={11} /> Relationship counselling
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Loading state ─────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="relative inline-block mb-6">
        <div className="w-14 h-14 rounded-full border-4 border-brand-500/15 border-t-brand-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xl">💜</div>
      </div>
      <p className="text-slate-400 text-sm">Loading your report…</p>
    </div>
  )
}

// ── Error state ───────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20
        flex items-center justify-center mx-auto mb-5">
        <AlertTriangle size={24} className="text-rose-400" />
      </div>
      <p className="text-slate-200 font-medium mb-2">{message || 'Report not found.'}</p>
      <p className="text-slate-500 text-sm mb-6">
        It may still be processing, or the link may be invalid.
      </p>
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" size="sm">
            <RefreshCw size={13} /> Try again
          </Button>
        )}
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft size={13} /> Back to history
        </Link>
      </div>
    </div>
  )
}

// ── Share modal ───────────────────────────────────────────────────────────────

function ShareModal({ open, onClose, analysisId }) {
  const [email,   setEmail]   = useState('')
  const [sharing, setSharing] = useState(false)
  const [sent,    setSent]    = useState(false)

  const handleShare = async () => {
    if (!email.trim()) return
    setSharing(true)
    try {
      await api.post(`/analyses/${analysisId}/share`, { email: email.trim() })
      setSent(true)
      toast.success('Invite sent! 📬')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not send invite.')
    } finally {
      setSharing(false)
    }
  }

  const handleClose = () => { setEmail(''); setSent(false); onClose() }

  return (
    <Modal open={open} onClose={handleClose} title="Share this report">
      {sent ? (
        <div className="text-center py-4">
          <p className="text-3xl mb-3">📬</p>
          <p className="text-white font-semibold mb-1">Invite sent!</p>
          <p className="text-sm text-slate-400 mb-5">
            {email} will receive a secure link to view this report.
          </p>
          <Button variant="secondary" onClick={handleClose} className="w-full">Done</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            Invite your partner or a friend to view this report together.
            They'll get a secure, time-limited link by email.
          </p>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Their email address
            </label>
            <input
              type="email"
              className="input"
              placeholder="partner@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleShare()}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleShare} loading={sharing} disabled={!email.trim()} className="flex-1">
              Send invite
            </Button>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          </div>
        </>
      )}
    </Modal>
  )
}

// ── Delete modal ──────────────────────────────────────────────────────────────

function DeleteModal({ open, onClose, onConfirm, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Delete this analysis?">
      <p className="text-sm text-slate-400 mb-6 leading-relaxed">
        This will permanently delete this report and all its insights.
        Your usage credit will <strong className="text-white">not</strong> be refunded.
        This cannot be undone.
      </p>
      <div className="flex gap-2">
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">
          Yes, delete it
        </Button>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Dashboard Page
// ══════════════════════════════════════════════════════════════════════════════

export default function Dashboard() {
  const { id } = useParams()
  const {
    fetchReport, currentReport: report, currentAnalysisMeta: meta,
    deleteAnalysis, isLoadingReport, error,
  } = useAnalysisStore()

  const [shareOpen,  setShareOpen]  = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const load = () =>
    fetchReport(id).catch(() => {/* handled by store error state */})

  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAnalysis(id)
      toast.success('Analysis deleted.')
      window.location.href = '/history'
    } catch {
      toast.error('Could not delete. Please try again.')
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoadingReport) return <LoadingState />

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !report) return <ErrorState message={error} onRetry={load} />

  // ── Data extraction (new Phase 2 schema) ───────────────────────────────────
  const {
    chemistry_score        = 0,
    common_interests       = [],
    communication_style    = {},
    misunderstanding_resolver = {},
    memory_box             = [],
    activity_suggestions   = [],
    connection_questions   = [],
    love_languages         = {},
    sweet_messages         = [],
    make_them_happy        = {},
    top_words              = [],
    most_positive          = {},
    conversation_summary   = '',
    safety_flag            = false,
    generated_at,
  } = report

  // Extract inside jokes from memory_box for CommonGround display
  const insideJokes = memory_box
    .filter((m) => m.type === 'funny')
    .map((m) => m.quote)
    .filter(Boolean)

  const formattedDate = generated_at
    ? new Date(generated_at).toLocaleDateString(undefined, {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300
              text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> History
          </Link>
          <h1 className="text-2xl font-bold text-white">Your Relationship Report</h1>
          <p className="text-slate-400 text-sm mt-1">
            Generated with care and without judgment.{' '}
            {formattedDate && (
              <span className="text-slate-600 text-xs">{formattedDate}</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" size="sm" onClick={() => setShareOpen(true)}>
            <Share2 size={13} /> Share
          </Button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/8
              hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
            aria-label="Delete analysis"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Safety banner (shown before report if safety_flag = true) ────────── */}
      {safety_flag && <SafetyBanner />}

      {/* ── Report grid ──────────────────────────────────────────────────────── */}
      <div className="space-y-5">

        {/* 1 — Chemistry score (always first — the "aha" moment) */}
        <ChemistryScore score={chemistry_score} breakdown={{}} />

        {/* 2 — Common interests + inside jokes (colourful, light) */}
        {(common_interests.length > 0 || insideJokes.length > 0) && (
          <CommonGround interests={common_interests} insideJokes={insideJokes} />
        )}

        {/* 3 — Communication styles (side-by-side profile cards) */}
        {(communication_style?.person_a || communication_style?.person_b) && (
          <CommunicationStyle data={communication_style} />
        )}

        {/* 4 — Misunderstanding resolver (accordion) */}
        {misunderstanding_resolver && (
          <MisunderstandingResolver data={misunderstanding_resolver} />
        )}

        {/* 5 — Memory box (top 3 moments) */}
        {memory_box.length > 0 && <MemoryBox memories={memory_box} />}

        {/* 6 — Activity suggestions (personalised ideas + copy button) */}
        {activity_suggestions.length > 0 && (
          <Icebreakers suggestions={activity_suggestions} />
        )}

        {/* 7 — Connection questions (deep questions to grow closer) */}
        {connection_questions.length > 0 && (
          <ConnectionQuestions questions={connection_questions} />
        )}

        {/* 8 — Love languages (how to make each other feel loved) */}
        {(love_languages?.person_a || love_languages?.person_b) && (
          <LoveLanguages data={love_languages} />
        )}

        {/* 9 — Sweet messages (ready-to-send heartfelt notes) */}
        {sweet_messages.length > 0 && (
          <SweetMessages messages={sweet_messages} />
        )}

        {/* 10 — Little things that make them happy */}
        {(make_them_happy?.person_a || make_them_happy?.person_b) && (
          <MakeThemHappy data={make_them_happy} />
        )}

        {/* 11 — Words you use most */}
        {top_words.length > 0 && <TopWords words={top_words} />}

        {/* 12 — Who brings the most positivity */}
        {most_positive?.name && <MostPositive data={most_positive} />}

        {/* 13 — One-sentence summary (always last) */}
        {conversation_summary && <ConversationSummary summary={conversation_summary} />}

      </div>

      {/* ── Footer note ──────────────────────────────────────────────────────── */}
      <div className="mt-10 p-4 glass rounded-2xl text-center border border-white/5">
        <p className="text-xs text-slate-600 leading-relaxed">
          This report was generated by AI and is intended to spark reflection, not replace
          professional advice. If you're experiencing serious relationship difficulties,
          please consider speaking with a qualified counsellor.
        </p>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        analysisId={id}
      />
      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
