import { Sparkles, Smile } from 'lucide-react'
import { getLabel } from '../../lib/reportLabels'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

function PersonCard({ person, index }) {
  if (!person || (!person.name && !person.tips?.length)) return null

  const isA     = index === 0
  const accent  = isA ? 'bg-brand-500/20 border-brand-500/20 text-brand-300'
                      : 'bg-rose-500/20  border-rose-500/20  text-rose-300'
  const initial = (person.name || '?')[0]?.toUpperCase()

  return (
    <div className="p-5 bg-white/3 border border-white/8 rounded-2xl space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full border flex items-center justify-center
          text-sm font-bold shrink-0 ${accent}`}>
          {initial}
        </div>
        <p dir={isRTL(person.name) ? 'rtl' : 'ltr'} className="font-semibold text-white text-sm">
          {person.name || `Person ${index + 1}`}
        </p>
      </div>

      {person.tips?.length > 0 && (
        <ul className="space-y-1.5">
          {person.tips.map((tip, i) => (
            <li key={i} dir={isRTL(tip) ? 'rtl' : 'ltr'}
              className="flex items-start gap-2 text-sm text-slate-300 leading-relaxed">
              <Smile size={12} className="text-amber-400/80 shrink-0 mt-1" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * report.make_them_happy → { person_a: { name, tips[] }, person_b: {...} }
 */
export default function MakeThemHappy({ data = {}, language = 'english' }) {
  const { person_a, person_b } = data
  const hasA = person_a && (person_a.name || person_a.tips?.length)
  const hasB = person_b && (person_b.name || person_b.tips?.length)

  if (!hasA && !hasB) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('make_them_happy', language)}</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <PersonCard person={person_a} index={0} />
        <PersonCard person={person_b} index={1} />
      </div>
    </div>
  )
}
