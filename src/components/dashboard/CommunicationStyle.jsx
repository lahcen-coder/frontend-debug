import { MessageCircle, TrendingUp, Smile, Timer, Repeat2 } from 'lucide-react'

// ── Profile card ──────────────────────────────────────────────────────────────

const EMOJI_USAGE_LABELS = { rare: '🤐 Rare', occasional: '🙂 Occasional', frequent: '😄 Frequent' }
const LENGTH_LABELS       = { short: '📝 Short', medium: '📄 Medium', long: '📖 Long' }

function StatPill({ label }) {
  return (
    <span className="px-2.5 py-1 rounded-full bg-white/6 border border-white/10
      text-[11px] text-slate-400 font-medium">
      {label}
    </span>
  )
}

function PersonCard({ person, index }) {
  if (!person || !Object.keys(person).length) return null

  const initial   = (person.name ?? '?')[0]?.toUpperCase()
  const isA       = index === 0
  const accentBg  = isA ? 'bg-brand-500/20  border-brand-500/20  text-brand-300'
                        : 'bg-rose-500/20   border-rose-500/20   text-rose-300'
  const barColor  = isA ? 'from-brand-400 to-violet-400'
                        : 'from-rose-400   to-pink-400'

  return (
    <div className="p-5 bg-white/3 hover:bg-white/[0.045] border border-white/8
      rounded-2xl transition-all duration-200 space-y-4">

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center
          text-base font-bold shrink-0 ${accentBg}`}>
          {initial}
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{person.name ?? `Person ${index + 1}`}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {person.emoji_usage && (
              <StatPill label={EMOJI_USAGE_LABELS[person.emoji_usage] ?? person.emoji_usage} />
            )}
            {person.typical_response_length && (
              <StatPill label={LENGTH_LABELS[person.typical_response_length] ?? person.typical_response_length} />
            )}
            {person.initiates_conversations != null && (
              <StatPill label={person.initiates_conversations ? '💬 Initiates' : '↩️ Responds'} />
            )}
          </div>
        </div>
      </div>

      {/* Style summary */}
      {person.style_summary && (
        <p className="text-sm text-slate-300 leading-relaxed">
          {person.style_summary}
        </p>
      )}

      {/* Strengths */}
      {person.strengths?.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <TrendingUp size={10} className="text-emerald-400" /> Strengths
          </p>
          <div className="flex flex-wrap gap-1.5">
            {person.strengths.map((s, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-500/10
                border border-emerald-500/20 text-xs text-emerald-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Growth edge */}
      {person.growth_edge && (
        <div className="p-3 bg-amber-500/8 border border-amber-500/15 rounded-xl">
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Smile size={10} /> Growth edge
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">{person.growth_edge}</p>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * New Phase 2 schema:
 *   report.communication_style → { person_a: CommunicationProfile, person_b: CommunicationProfile }
 */
export default function CommunicationStyle({ data = {} }) {
  const { person_a, person_b } = data

  if (!person_a && !person_b) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <MessageCircle size={14} className="text-violet-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">Communication Styles</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {person_a && <PersonCard person={person_a} index={0} />}
        {person_b && <PersonCard person={person_b} index={1} />}
      </div>
    </div>
  )
}
