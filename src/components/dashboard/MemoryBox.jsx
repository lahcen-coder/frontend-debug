import { Sparkles } from 'lucide-react'

// ── Memory type config ────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  funny: {
    emoji:   '😂',
    label:   'Funniest moment',
    bg:      'from-amber-500/10  to-transparent',
    border:  'border-amber-500/20',
    accent:  'text-amber-300',
  },
  sweet: {
    emoji:   '💝',
    label:   'Sweetest moment',
    bg:      'from-rose-500/10   to-transparent',
    border:  'border-rose-500/20',
    accent:  'text-rose-300',
  },
  milestone: {
    emoji:   '🌟',
    label:   'Milestone',
    bg:      'from-emerald-500/10 to-transparent',
    border:  'border-emerald-500/20',
    accent:  'text-emerald-300',
  },
}

const FALLBACK = {
  emoji:  '💬',
  label:  'Memorable moment',
  bg:     'from-brand-500/10  to-transparent',
  border: 'border-brand-500/20',
  accent: 'text-brand-300',
}

// ── Single memory card ────────────────────────────────────────────────────────

function MemoryCard({ memory, index }) {
  const cfg = TYPE_CONFIG[memory.type] ?? FALLBACK

  return (
    <div
      className={`p-5 bg-gradient-to-br ${cfg.bg} border ${cfg.border} rounded-2xl
        hover:brightness-110 transition-all duration-200`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg leading-none">{cfg.emoji}</span>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${cfg.accent}`}>
          {cfg.label}
        </span>
      </div>

      {/* Moment description */}
      <p className="text-sm text-slate-200 leading-relaxed mb-3">
        {memory.moment}
      </p>

      {/* Direct quote from the conversation */}
      {memory.quote && (
        <blockquote className="border-l-2 border-white/15 pl-3">
          <p className="text-xs text-slate-400 italic leading-relaxed">
            "{memory.quote}"
          </p>
        </blockquote>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * New Phase 2 schema:
 *   report.memory_box → [{ type: 'funny'|'sweet'|'milestone', moment, quote }]
 *   Up to 3 items returned by the AI.
 */
export default function MemoryBox({ memories = [] }) {
  if (!memories.length) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">Memory Box</h2>
        <span className="ml-auto text-xs text-slate-500">
          {memories.length} moment{memories.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid gap-3">
        {memories.map((memory, i) => (
          <MemoryCard key={i} memory={memory} index={i} />
        ))}
      </div>
    </div>
  )
}
