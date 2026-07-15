import { useState } from 'react'
import { Mail, Copy, CheckCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getLabel } from '../../lib/reportLabels'

function isRTL(text = '') {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text)
}

const OCCASION_EMOJI = {
  'good morning':  '🌅',
  appreciation:    '🙏',
  'miss you':      '🥰',
  apology:         '🤍',
  'just because':  '💌',
  encouragement:   '💪',
}

function MessageCard({ item, index, copied, onCopy }) {
  const rtl     = isRTL(item.text)
  const occ     = (item.occasion || '').toLowerCase()
  const emoji   = OCCASION_EMOJI[occ] ?? '💌'

  return (
    <div className="group p-4 bg-white/3 hover:bg-white/5 border border-white/8
      hover:border-pink-500/20 rounded-xl transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        {item.occasion && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            bg-pink-500/12 border border-pink-500/20 text-[10px] font-medium text-pink-300">
            <span className="text-xs leading-none">{emoji}</span> {item.occasion}
          </span>
        )}
        <button
          onClick={() => onCopy(item.text, index)}
          aria-label="Copy message"
          className="ml-auto shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100
            hover:bg-white/10 text-slate-500 hover:text-white transition-all duration-150"
        >
          {copied === index
            ? <CheckCheck size={14} className="text-emerald-400" />
            : <Copy size={14} />
          }
        </button>
      </div>
      <p dir={rtl ? 'rtl' : 'ltr'} className="text-sm text-slate-100 leading-relaxed italic">
        “{item.text}”
      </p>
    </div>
  )
}

/**
 * report.sweet_messages → [{ text, occasion }]
 */
export default function SweetMessages({ messages = [], language = 'english' }) {
  const [copied, setCopied] = useState(null)

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(index)
      toast.success('Copied — ready to send! 💜')
      setTimeout(() => setCopied(null), 2_000)
    } catch {
      toast.error('Could not copy. Please copy manually.')
    }
  }

  if (!messages.length) return null

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center">
          <Mail size={14} className="text-rose-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">{getLabel('sweet_messages', language)}</h2>
        <span className="ml-auto text-xs text-slate-500">{messages.length}</span>
      </div>

      <div className="space-y-2.5">
        {messages.map((item, i) => (
          <MessageCard key={i} item={item} index={i} copied={copied} onCopy={handleCopy} />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 text-center">
        Tap copy and send one to brighten their day. 💌
      </p>
    </div>
  )
}
