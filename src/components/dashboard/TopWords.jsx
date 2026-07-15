import { Hash } from 'lucide-react'
import { getLabel } from '../../lib/reportLabels'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

/**
 * report.top_words → [{ word, count }]
 * The words/phrases the two people use the most.
 */
export default function TopWords({ words = [], language = 'english' }) {
  if (!words.length) return null

  const max = Math.max(...words.map((w) => w.count || 1), 1)

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center">
          <Hash size={14} className="text-cyan-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('top_words', language)}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((w, i) => {
          // Scale font size by relative frequency for a lightweight "word cloud" feel
          const ratio = (w.count || 1) / max
          const scale = 0.85 + ratio * 0.75 // 0.85rem → 1.6rem
          return (
            <span
              key={i}
              dir={isRTL(w.word) ? 'rtl' : 'ltr'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                bg-cyan-500/10 border border-cyan-500/20 text-cyan-200"
              style={{ fontSize: `${scale}rem` }}
            >
              <span className="font-medium leading-none">{w.word}</span>
              {w.count > 0 && (
                <span className="text-[10px] text-cyan-400/70 bg-cyan-500/10
                  rounded-full px-1.5 py-0.5 leading-none">
                  {w.count}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
