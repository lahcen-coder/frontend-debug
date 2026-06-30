export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <input className={`input ${error ? 'border-rose-500/50 ring-rose-500/30' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
