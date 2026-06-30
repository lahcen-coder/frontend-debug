const colors = {
  purple: 'bg-brand-500/15 text-brand-300 border-brand-500/20',
  green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  rose:   'bg-rose-500/15 text-rose-300 border-rose-500/20',
  amber:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  blue:   'bg-blue-500/15 text-blue-300 border-blue-500/20',
  slate:  'bg-slate-500/15 text-slate-300 border-slate-500/20',
}

export default function Badge({ children, color = 'purple', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${colors[color]} ${className}`}>
      {children}
    </span>
  )
}
