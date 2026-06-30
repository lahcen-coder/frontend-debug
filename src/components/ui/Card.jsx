export default function Card({ children, className = '', glow }) {
  return (
    <div className={`card ${glow ? 'shadow-lg shadow-brand-500/10' : ''} ${className}`}>
      {children}
    </div>
  )
}
