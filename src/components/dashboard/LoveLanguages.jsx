import { Heart, Gift } from 'lucide-react'
import { getLabel } from '../../lib/reportLabels'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

function PersonCard({ person, index }) {
  if (!person || (!person.name && !person.primary && !person.how_to_show_love?.length)) return null

  const isA      = index === 0
  const accent   = isA ? 'bg-brand-500/20 border-brand-500/20 text-brand-300'
                       : 'bg-rose-500/20  border-rose-500/20  text-rose-300'
  const initial  = (person.name || '?')[0]?.toUpperCase()
  const rtlName  = isRTL(person.name)

  return (
    <div className="p-5 bg-white/3 border border-white/8 rounded-2xl space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full border flex items-center justify-center
          text-base font-bold shrink-0 ${accent}`}>
          {initial}
        </div>
        <div dir={rtlName ? 'rtl' : 'ltr'}>
          <p className="font-semibold text-white text-sm">{person.name || `Person ${index + 1}`}</p>
          {person.primary && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full
              bg-pink-500/12 border border-pink-500/20 text-[11px] text-pink-300">
              <Heart size={9} /> {person.primary}
            </span>
          )}
        </div>
      </div>

      {person.how_to_show_love?.length > 0 && (
        <ul className="space-y-1.5">
          {person.how_to_show_love.map((tip, i) => (
            <li key={i} dir={isRTL(tip) ? 'rtl' : 'ltr'}
              className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
              <Heart size={12} className="text-pink-400/70 shrink-0 mt-1" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * report.love_languages → { person_a: { name, primary, how_to_show_love[] }, person_b: {...} }
 */
export default function LoveLanguages({ data = {}, language = 'english' }) {
  const { person_a, person_b } = data
  const hasA = person_a && (person_a.name || person_a.primary || person_a.how_to_show_love?.length)
  const hasB = person_b && (person_b.name || person_b.primary || person_b.how_to_show_love?.length)

  if (!hasA && !hasB) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center">
          <Gift size={14} className="text-pink-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('love_languages', language)}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <PersonCard person={person_a} index={0} />
        <PersonCard person={person_b} index={1} />
      </div>

      <p className="text-[11px] text-slate-600 mt-4 text-center">
        How to make each other feel truly loved. 💜
      </p>
    </div>
  )
}
