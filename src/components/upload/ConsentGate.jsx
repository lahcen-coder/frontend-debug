import { ShieldCheck, Info } from 'lucide-react'
import { useState } from 'react'

export default function ConsentGate({ messageCount, onConsent }) {
  const [checked, setChecked] = useState(false)
  const [piiRedact, setPiiRedact] = useState(false)

  const handleContinue = () => {
    if (!checked) return
    onConsent({ piiRedact })
  }

  return (
    <div className="p-5 glass rounded-2xl border border-brand-500/20">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={20} className="text-brand-400" />
        <h3 className="font-semibold text-white">Privacy confirmation</h3>
      </div>

      <div className="text-xs text-slate-400 space-y-1.5 mb-4 p-3 bg-white/3 rounded-xl">
        <p className="flex items-start gap-2"><Info size={12} className="mt-0.5 shrink-0 text-brand-400" /> <span>Only <strong className="text-white">{messageCount.toLocaleString()} text messages</strong> from the selected conversation (sender + text + timestamp) will be sent to our servers.</span></p>
        <p className="flex items-start gap-2"><Info size={12} className="mt-0.5 shrink-0 text-brand-400" /> <span>Your ZIP/TXT file stays on your device. Raw messages are <strong className="text-white">never stored</strong> — only the generated insights.</span></p>
        <p className="flex items-start gap-2"><Info size={12} className="mt-0.5 shrink-0 text-brand-400" /> <span>You can delete your analysis at any time from your account.</span></p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer mb-3">
        <input type="checkbox" checked={piiRedact} onChange={(e) => setPiiRedact(e.target.checked)} className="mt-0.5 accent-brand-500" />
        <span className="text-xs text-slate-300">Also redact emails, phone numbers, and links from the messages before sending (recommended for extra privacy).</span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer mb-4">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 accent-brand-500" />
        <span className="text-xs text-slate-300">I confirm I have the right to analyze this conversation and I consent to the above data being processed to generate my report.</span>
      </label>

      <button
        disabled={!checked}
        onClick={handleContinue}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Analyze this conversation
      </button>
    </div>
  )
}
