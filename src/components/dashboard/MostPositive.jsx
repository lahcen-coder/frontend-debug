import { Sun } from 'lucide-react'
import { getLabel } from '../../lib/reportLabels'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

/**
 * report.most_positive → { name, reason }
 * Highlights whoever brings the most positivity to the conversation.
 */
export default function MostPositive({ data = {}, language = 'english' }) {
  const { name, reason } = data
  if (!name) return null

  const initial = name[0]?.toUpperCase()

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-yellow-500/15 flex items-center justify-center">
          <Sun size={14} className="text-yellow-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('most_positive', language)}</h2>
      </div>

      <div className="flex items-start gap-4 p-5 rounded-2xl
        bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/15">
        <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/25
          flex items-center justify-center text-lg font-bold text-yellow-300 shrink-0">
          {initial}
        </div>
        <div className="min-w-0">
          <p dir={isRTL(name) ? 'rtl' : 'ltr'} className="font-semibold text-white">
            {name} <span className="text-yellow-400">☀️</span>
          </p>
          {reason && (
            <p dir={isRTL(reason) ? 'rtl' : 'ltr'}
              className="text-sm text-slate-300 leading-relaxed mt-1.5">
              {reason}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
