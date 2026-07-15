import { useState } from 'react'
import { Lightbulb, Copy, CheckCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getLabel } from '../../lib/reportLabels'

// ── Vibe badge config ─────────────────────────────────────────────────────────

const VIBE_CONFIG = {
  cosy:        { label: 'Cosy',        bg: 'bg-amber-500/15  border-amber-500/25  text-amber-300',   emoji: '🏡' },
  adventurous: { label: 'Adventurous', bg: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300', emoji: '🏔️' },
  creative:    { label: 'Creative',    bg: 'bg-brand-500/15  border-brand-500/25  text-brand-300',   emoji: '🎨' },
  relaxing:    { label: 'Relaxing',    bg: 'bg-blue-500/15   border-blue-500/25   text-blue-300',    emoji: '🌊' },
  social:      { label: 'Social',      bg: 'bg-rose-500/15   border-rose-500/25   text-rose-300',    emoji: '🎉' },
}

function VibeBadge({ vibe }) {
  const cfg = VIBE_CONFIG[vibe?.toLowerCase()] ?? {
    label: vibe ?? 'Idea',
    bg: 'bg-white/8 border-white/12 text-slate-400',
    emoji: '✨',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px]
      font-medium ${cfg.bg}`}>
      <span className="text-xs leading-none">{cfg.emoji}</span>
      {cfg.label}
    </span>
  )
}

// ── Single suggestion card ────────────────────────────────────────────────────

function SuggestionCard({ item, index, copied, onCopy }) {
  return (
    <div className="group flex items-start gap-3 p-4 bg-white/3 hover:bg-white/5
      border border-white/8 hover:border-brand-500/20 rounded-xl
      transition-all duration-200">

      {/* Index bubble */}
      <div className="w-6 h-6 rounded-full bg-brand-500/15 border border-brand-500/20
        flex items-center justify-center text-[11px] font-bold text-brand-400 shrink-0 mt-0.5">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        {item.vibe && (
          <div className="mb-1.5">
            <VibeBadge vibe={item.vibe} />
          </div>
        )}
        <p className="text-sm text-slate-100 font-medium leading-snug">
          {item.activity}
        </p>
        {item.reason && (
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {item.reason}
          </p>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={() => onCopy(item.activity, index)}
        aria-label="Copy suggestion"
        className="shrink-0 p-2 rounded-lg opacity-0 group-hover:opacity-100
          hover:bg-white/10 text-slate-500 hover:text-white transition-all duration-150"
      >
        {copied === index
          ? <CheckCheck size={14} className="text-emerald-400" />
          : <Copy size={14} />
        }
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * New Phase 2 schema:
 *   report.activity_suggestions → [{ activity, reason, vibe }]
 */
export default function Icebreakers({ suggestions = [], language = 'english' }) {
  const [copied, setCopied] = useState(null)

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(index)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2_000)
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  if (!suggestions.length) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Lightbulb size={14} className="text-amber-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('activity_ideas', language)}</h2>
        <span className="ml-auto text-xs text-slate-500">
          {suggestions.length} personalised suggestion{suggestions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2.5">
        {suggestions.map((item, i) => (
          <SuggestionCard
            key={i}
            item={item}
            index={i}
            copied={copied}
            onCopy={handleCopy}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 text-center">
        All suggestions are based on topics from your actual conversation. 💜
      </p>
    </div>
  )
}
