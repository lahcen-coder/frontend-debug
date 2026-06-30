import { useEffect, useRef, useState } from 'react'
import { Zap, MessageSquare, Scale, Sun, Timer } from 'lucide-react'

// ── Score → colour mapping ────────────────────────────────────────────────────

function scoreTheme(score) {
  if (score >= 80) return {
    ring: '#34d399',  // emerald-400
    text: 'text-emerald-400',
    label: 'Excellent',
    sublabel: 'Deeply in sync',
    glow: 'shadow-emerald-500/20',
    bg: 'from-emerald-500/10 via-transparent to-transparent',
    bar: 'from-emerald-400 to-teal-400',
  }
  if (score >= 60) return {
    ring: '#d946ef',  // brand-500
    text: 'text-brand-400',
    label: 'Great',
    sublabel: 'Strong connection',
    glow: 'shadow-brand-500/20',
    bg: 'from-brand-500/10 via-transparent to-transparent',
    bar: 'from-brand-400 to-rose-400',
  }
  if (score >= 40) return {
    ring: '#fbbf24',  // amber-400
    text: 'text-amber-400',
    label: 'Growing',
    sublabel: 'Room to flourish',
    glow: 'shadow-amber-500/20',
    bg: 'from-amber-500/10 via-transparent to-transparent',
    bar: 'from-amber-400 to-orange-400',
  }
  return {
    ring: '#fb7185',  // rose-400
    text: 'text-rose-400',
    label: 'Nurture',
    sublabel: 'Needs some care',
    glow: 'shadow-rose-500/20',
    bg: 'from-rose-500/10 via-transparent to-transparent',
    bar: 'from-rose-400 to-pink-400',
  }
}

// ── Animated counter ──────────────────────────────────────────────────────────

function useCounter(target, durationMs = 1200) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (!target) return
    const start = performance.now()
    const animate = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / durationMs, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, durationMs])

  return value
}

// ── Circular gauge ────────────────────────────────────────────────────────────

function GaugeRing({ score, theme }) {
  const r         = 56
  const circ      = 2 * Math.PI * r
  const offset    = circ - (score / 100) * circ
  const displayed = useCounter(score)

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Outer glow pulse */}
      <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${theme.glow}`}
        style={{ background: theme.ring }} />

      <svg width="148" height="148" className="-rotate-90">
        {/* Track */}
        <circle
          cx="74" cy="74" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress arc */}
        <circle
          cx="74" cy="74" r={r}
          fill="none"
          stroke={theme.ring}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        {/* Subtle inner shadow ring */}
        <circle
          cx="74" cy="74" r={r - 10}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
      </svg>

      <div className="absolute text-center">
        <p className={`text-5xl font-bold tabular-nums ${theme.text}`}>{displayed}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 font-medium tracking-wide uppercase">
          {theme.label}
        </p>
      </div>
    </div>
  )
}

// ── Breakdown bar ─────────────────────────────────────────────────────────────

const BREAKDOWN_ITEMS = [
  { key: 'responsiveness', label: 'Responsiveness', icon: Timer,       tip: 'How quickly each person responds' },
  { key: 'balance',        label: 'Balance',        icon: Scale,       tip: 'Equal give-and-take in the conversation' },
  { key: 'positivity',     label: 'Positivity',     icon: Sun,         tip: 'Overall emotional warmth and optimism' },
  { key: 'consistency',    label: 'Consistency',    icon: MessageSquare, tip: 'How regularly you both engage' },
]

function BreakdownBar({ label, value, icon: Icon, theme }) {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value ?? 0), 200)
    return () => clearTimeout(t)
  }, [value])

  if (value == null) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon size={11} className="opacity-70" />
          {label}
        </span>
        <span className="text-xs font-semibold text-slate-200 tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${theme.bar} rounded-full transition-all duration-1000`}
          style={{ width: `${animated}%`, transitionDelay: '200ms' }}
        />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChemistryScore({ score = 0, breakdown = {} }) {
  const theme = scoreTheme(score)
  const hasBreakdown = Object.values(breakdown).some((v) => v != null)

  return (
    <div className={`card bg-gradient-to-br ${theme.bg} border border-white/8
      shadow-lg ${theme.glow}`}>

      <div className="flex items-center gap-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
          <Zap size={14} className="text-brand-400" />
        </div>
        <h2 className="font-semibold text-white text-lg">Chemistry Score</h2>
        <div className="ml-auto px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10
          text-xs text-slate-400">
          {theme.sublabel}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <GaugeRing score={score} theme={theme} />

        <div className="flex-1 w-full">
          {hasBreakdown ? (
            <div className="space-y-3.5">
              {BREAKDOWN_ITEMS.map(({ key, label, icon }) => (
                <BreakdownBar
                  key={key}
                  label={label}
                  icon={icon}
                  value={breakdown[key]}
                  theme={theme}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed">
                This score reflects how well-matched your communication patterns are —
                response time, balance, positivity, and consistency.
              </p>
              <p className={`text-sm font-medium ${theme.text}`}>
                {score >= 80
                  ? 'You two have a beautiful rhythm together. 💜'
                  : score >= 60
                  ? 'There\'s a real spark here with great potential.'
                  : score >= 40
                  ? 'Growing together takes time — you\'re on your way.'
                  : 'Every relationship is a work in progress. Be gentle with each other.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
