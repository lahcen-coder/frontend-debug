import { Users, MessageCircle } from 'lucide-react'

export default function ContactSelector({ contacts, selected, onSelect }) {
  if (!contacts.length) return null

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
        <Users size={15} /> Select the person to analyze
      </label>
      <div className="grid gap-2 max-h-60 overflow-y-auto pr-1">
        {contacts.map((c) => (
          <button
            key={c.name}
            onClick={() => onSelect(c.name)}
            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 ${
              selected === c.name
                ? 'bg-brand-500/15 border-brand-500/40 text-white'
                : 'bg-white/3 border-white/10 text-slate-300 hover:bg-white/8 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                selected === c.name ? 'bg-brand-500/30 text-brand-300' : 'bg-white/10 text-slate-400'
              }`}>
                {c.name[0]?.toUpperCase()}
              </div>
              <span className="font-medium text-sm">{c.name}</span>
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MessageCircle size={12} /> {c.messageCount.toLocaleString()}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
