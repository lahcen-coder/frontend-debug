import { Quote } from 'lucide-react'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

/**
 * report.conversation_summary → string
 * A single warm sentence capturing the essence of the whole conversation.
 */
export default function ConversationSummary({ summary = '' }) {
  const text = (summary || '').trim()
  if (!text) return null

  return (
    <div className="card bg-gradient-to-br from-brand-500/10 to-violet-500/5 border-brand-500/15">
      <div className="flex items-start gap-3">
        <Quote size={22} className="text-brand-400 shrink-0 mt-1" />
        <div>
          <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-2">
            In one sentence
          </p>
          <p dir={isRTL(text) ? 'rtl' : 'ltr'}
            className="text-lg text-white font-medium leading-relaxed">
            {text}
          </p>
        </div>
      </div>
    </div>
  )
}
