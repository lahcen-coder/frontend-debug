import { useState } from 'react'
import { MessagesSquare, Copy, CheckCheck, HelpCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Detect RTL (Arabic / Darija) text so questions render right-to-left.
function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

function QuestionCard({ item, index, copied, onCopy }) {
  const rtl = isRTL(item.question)

  return (
    <div className="group flex items-start gap-3 p-4 bg-white/3 hover:bg-white/5
      border border-white/8 hover:border-brand-500/20 rounded-xl transition-all duration-200">

      <div className="w-6 h-6 rounded-full bg-brand-500/15 border border-brand-500/20
        flex items-center justify-center text-[11px] font-bold text-brand-400 shrink-0 mt-0.5">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0" dir={rtl ? 'rtl' : 'ltr'}>
        <p className="text-sm text-slate-100 font-medium leading-relaxed">
          {item.question}
        </p>
        {item.why && (
          <p className="flex items-start gap-1.5 text-xs text-slate-500 mt-2 leading-relaxed">
            <HelpCircle size={12} className="text-brand-400/70 shrink-0 mt-0.5" />
            <span>{item.why}</span>
          </p>
        )}
      </div>

      <button
        onClick={() => onCopy(item.question, index)}
        aria-label="Copy question"
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

/**
 * report.connection_questions → [{ question, why }]
 * Deep, heartfelt questions the two people can ask each other to grow closer.
 */
export default function ConnectionQuestions({ questions = [] }) {
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

  if (!questions.length) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-pink-500/15 flex items-center justify-center">
          <MessagesSquare size={14} className="text-pink-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">Questions to Grow Closer</h2>
        <span className="ml-auto text-xs text-slate-500">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2.5">
        {questions.map((item, i) => (
          <QuestionCard
            key={i}
            item={item}
            index={i}
            copied={copied}
            onCopy={handleCopy}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 text-center">
        Ask each other these — no rush, no pressure. Just curiosity and care. 💜
      </p>
    </div>
  )
}
