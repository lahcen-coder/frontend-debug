import { useState } from 'react'
import { HeartHandshake, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { getLabel } from '../../lib/reportLabels'

// ── Resolution accordion card ─────────────────────────────────────────────────

function ResolutionCard({ resolution, index }) {
  const [open, setOpen] = useState(index === 0) // first one open by default

  return (
    <div className="border border-white/8 rounded-2xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-3 p-4
          text-left hover:bg-white/3 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/25
            flex items-center justify-center text-[10px] font-bold text-amber-400 shrink-0 mt-0.5">
            {index + 1}
          </span>
          <p className="text-sm text-slate-300 leading-snug">{resolution.original_tension}</p>
        </div>
        {open
          ? <ChevronUp size={15} className="text-slate-500 shrink-0 mt-0.5" />
          : <ChevronDown size={15} className="text-slate-500 shrink-0 mt-0.5" />
        }
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/6">
          {/* What each person likely needed */}
          {(resolution.likely_need_a || resolution.likely_need_b) && (
            <div className="grid sm:grid-cols-2 gap-2 pt-3">
              {resolution.likely_need_a && (
                <div className="p-3 bg-brand-500/8 border border-brand-500/12 rounded-xl">
                  <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-1">
                    Likely needed
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">{resolution.likely_need_a}</p>
                </div>
              )}
              {resolution.likely_need_b && (
                <div className="p-3 bg-rose-500/8 border border-rose-500/12 rounded-xl">
                  <p className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">
                    Likely needed
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">{resolution.likely_need_b}</p>
                </div>
              )}
            </div>
          )}

          {/* Warm reframe */}
          {resolution.reframe && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/8
              border border-emerald-500/15 rounded-xl">
              <HeartHandshake size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  A warmer perspective
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">{resolution.reframe}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── No conflicts state ────────────────────────────────────────────────────────

function NoConflicts() {
  return (
    <div className="flex items-center gap-3 p-4 bg-emerald-500/8 border border-emerald-500/15 rounded-xl">
      <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
      <div>
        <p className="text-sm font-medium text-emerald-300">Smooth sailing! 🌿</p>
        <p className="text-xs text-slate-400 mt-0.5">
          No significant conflicts or tension were detected in your conversation.
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * New Phase 2 schema:
 *   report.misunderstanding_resolver → {
 *     conflicts_detected: number,
 *     resolutions: [{ original_tension, likely_need_a, likely_need_b, reframe }]
 *   }
 */
export default function MisunderstandingResolver({ data = {}, language = 'english' }) {
  const { conflicts_detected = 0, resolutions = [] } = data

  if (!resolutions && conflicts_detected === 0) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <HeartHandshake size={14} className="text-amber-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('misunderstanding_resolver', language)}</h2>
        {conflicts_detected > 0 && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full bg-amber-500/12 border
            border-amber-500/20 text-xs text-amber-400">
            {conflicts_detected} moment{conflicts_detected !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {!resolutions.length || conflicts_detected === 0 ? (
        <NoConflicts />
      ) : (
        <div className="space-y-2.5">
          {resolutions.map((res, i) => (
            <ResolutionCard key={i} resolution={res} index={i} />
          ))}

          <p className="text-[11px] text-slate-600 pt-2 text-center">
            Every tension hides unmet needs. Understanding them is the first step. 💜
          </p>
        </div>
      )}
    </div>
  )
}
