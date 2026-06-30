import { Compass } from 'lucide-react'

// ── Tag colour palette (cycles through) ──────────────────────────────────────

const TAG_PALETTES = [
  { bg: 'bg-brand-500/15 border-brand-500/25',  text: 'text-brand-300'   },
  { bg: 'bg-blue-500/15  border-blue-500/25',   text: 'text-blue-300'    },
  { bg: 'bg-emerald-500/15 border-emerald-500/25', text: 'text-emerald-300' },
  { bg: 'bg-amber-500/15 border-amber-500/25',  text: 'text-amber-300'   },
  { bg: 'bg-rose-500/15  border-rose-500/25',   text: 'text-rose-300'    },
  { bg: 'bg-violet-500/15 border-violet-500/25', text: 'text-violet-300' },
  { bg: 'bg-teal-500/15  border-teal-500/25',   text: 'text-teal-300'    },
  { bg: 'bg-orange-500/15 border-orange-500/25', text: 'text-orange-300' },
]

function InterestTag({ label, index }) {
  const p = TAG_PALETTES[index % TAG_PALETTES.length]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs
      font-medium ${p.bg} ${p.text} transition-all duration-200 hover:scale-105 cursor-default`}>
      {label}
    </span>
  )
}

// ── Inside-joke card ──────────────────────────────────────────────────────────

function JokeCard({ text, index }) {
  const emojis = ['😄', '😂', '🤣', '😆', '🥲']
  return (
    <div className="p-3.5 bg-white/3 hover:bg-white/5 border border-white/8
      hover:border-white/12 rounded-xl transition-all duration-200 group">
      <div className="flex items-start gap-2.5">
        <span className="text-base shrink-0 mt-0.5">{emojis[index % emojis.length]}</span>
        <p className="text-sm text-slate-300 leading-relaxed italic">
          "{text}"
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * @param {{ interests: string[], insideJokes?: string[] }} props
 *
 * New Phase 2 schema:
 *   report.common_interests  → string[]
 *   report.memory_box        → [{ type, moment, quote }]  (inside jokes sourced here if needed)
 */
export default function CommonGround({ interests = [], insideJokes = [] }) {
  if (!interests.length && !insideJokes.length) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
          <Compass size={14} className="text-blue-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">Common Ground</h2>
        {interests.length > 0 && (
          <span className="ml-auto text-xs text-slate-500">
            {interests.length} shared interest{interests.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {interests.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Shared Interests
          </p>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, i) => (
              <InterestTag key={i} label={interest} index={i} />
            ))}
          </div>
        </div>
      )}

      {insideJokes.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Inside References
          </p>
          <div className="space-y-2">
            {insideJokes.map((joke, i) => (
              <JokeCard key={i} text={joke} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
