import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, Zap, Globe, Sparkles, Lightbulb } from 'lucide-react'

const features = [
  { icon: <Zap size={22} className="text-brand-400" />, title: 'Chemistry Score', desc: 'See responsiveness, balance, positivity, and consistency at a glance.' },
  { icon: <Globe size={22} className="text-blue-400" />, title: 'Common Ground', desc: 'Discover shared topics, interests, and the inside jokes that make you, you.' },
  { icon: <Sparkles size={22} className="text-amber-400" />, title: 'Memory Box', desc: 'Relive your first message, funniest moments, and sweetest exchanges.' },
  { icon: <Lightbulb size={22} className="text-emerald-400" />, title: 'Ice-breakers & Ideas', desc: 'Personalized conversation starters and activity ideas based on your history.' },
  { icon: <Heart size={22} className="text-rose-400" fill="currentColor" />, title: 'Shared Dashboard', desc: 'Invite your partner or friend to view insights together.' },
  { icon: <ShieldCheck size={22} className="text-brand-400" />, title: 'Privacy by design', desc: 'Parsed 100% in your browser. Your file never leaves your device.' },
]

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-rose-700/10 rounded-full blur-3xl" />
      </div>

      {/* Hero */}
      <section className="relative max-w-4xl mx-auto px-4 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-brand-300 border border-brand-500/20 mb-8">
          <ShieldCheck size={12} /> Privacy-first — your file never leaves your browser
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Understand each other{' '}
          <span className="bg-gradient-to-r from-brand-400 to-rose-400 bg-clip-text text-transparent">better</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
          Debug Together analyzes your chats to help friends, couples, and partners find common ground, celebrate great moments, and resolve misunderstandings — gently, without judgment.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn-primary text-base px-7 py-3">Start for free →</Link>
          <Link to="/pricing" className="btn-secondary text-base px-7 py-3">See pricing</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-center text-3xl font-bold text-white mb-3">Everything you need to connect deeper</h2>
        <p className="text-center text-slate-400 mb-12 max-w-xl mx-auto">From chemistry scoring to memory boxes — built for real relationships.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-white/15 transition-all hover:shadow-lg hover:shadow-brand-500/5 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
        <div className="card border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-rose-500/5">
          <Heart size={32} className="text-brand-400 mx-auto mb-4" fill="currentColor" />
          <h2 className="text-2xl font-bold text-white mb-2">Ready to understand each other better?</h2>
          <p className="text-slate-400 mb-6 text-sm">Free forever. No credit card required. Your privacy guaranteed.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex">Get started free →</Link>
        </div>
      </section>
    </div>
  )
}
