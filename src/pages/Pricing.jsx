import { Check, Zap, Star, Crown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: <Zap size={20} className="text-slate-400" />,
    color: 'border-white/10',
    features: ['1 analysis/month', 'Up to 2,000 messages', 'Chemistry Score (basic)', 'Common Ground (preview)', '3 Ice-breakers', 'Last 1 report'],
    cta: 'Current plan',
    ctaDisabled: true,
  },
  {
    key: 'plus',
    name: 'Plus',
    price: '$7.99',
    period: '/month',
    icon: <Star size={20} className="text-brand-400" />,
    color: 'border-brand-500/40',
    badge: 'Most popular',
    features: ['10 analyses/month', 'Up to 20,000 messages', 'Full Chemistry Score', 'Misunderstanding Resolver (5/mo)', 'Shared Dashboard', 'PDF export', 'Last 12 reports', '50 AI Assistant messages'],
    cta: 'Upgrade to Plus',
    priceId: import.meta.env.VITE_STRIPE_PLUS_PRICE_ID,
  },
  {
    key: 'premium',
    name: 'Premium',
    price: '$14.99',
    period: '/month',
    icon: <Crown size={20} className="text-amber-400" />,
    color: 'border-amber-500/30',
    features: ['Unlimited analyses*', 'Up to 100,000 messages', 'Everything in Plus', 'Priority AI model', 'Unlimited Resolver*', 'Full history', '500 AI Assistant messages'],
    cta: 'Upgrade to Premium',
    priceId: import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID,
  },
]

export default function Pricing() {
  const { token } = useAuthStore()
  const [loadingKey, setLoadingKey] = useState(null)

  const handleCheckout = async (plan) => {
    if (!plan.priceId) return
    if (!token) { window.location.href = '/register'; return }
    setLoadingKey(plan.key)
    try {
      const res = await api.post('/billing/checkout', { price_id: plan.priceId })
      window.location.href = res.data.data.url
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Could not start checkout.')
    } finally {
      setLoadingKey(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Simple, honest pricing</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">Start free. Upgrade when you're ready. Cancel anytime — your data stays yours.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.key} className={`card border ${plan.color} relative flex flex-col ${plan.badge ? 'shadow-lg shadow-brand-500/10' : ''}`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              {plan.icon}
              <span className="font-semibold text-white">{plan.name}</span>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.ctaDisabled || loadingKey === plan.key}
              onClick={() => handleCheckout(plan)}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                plan.ctaDisabled ? 'bg-white/5 text-slate-500 cursor-default'
                : plan.key === 'plus' ? 'btn-primary'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
              }`}
            >
              {loadingKey === plan.key ? 'Redirecting...' : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-600 mt-8">* Subject to fair-use limits. Powered by Stripe — secure, encrypted payments.</p>
    </div>
  )
}
