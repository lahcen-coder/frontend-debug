import { Link, useNavigate } from 'react-router-dom'
import { Heart, Menu, X, User, History, CreditCard, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const authed = isAuthenticated()

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-rose-500 flex items-center justify-center">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <span className="bg-gradient-to-r from-brand-400 to-rose-400 bg-clip-text text-transparent">
            Debug Together
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {authed ? (
            <>
              <Link to="/analyze" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Analyze</Link>
              <Link to="/history" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">History</Link>
              <Link to="/pricing" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">Upgrade</Link>
              <div className="relative group ml-2">
                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-rose-500 flex items-center justify-center text-sm font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </button>
                <div className="absolute right-0 top-10 w-48 glass rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all">
                  <div className="p-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    <Link to="/account" className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"><User size={14} /> Account</Link>
                    <button onClick={logout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"><LogOut size={14} /> Sign out</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Get started free</Link>
            </>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-slate-950 px-4 py-3 flex flex-col gap-2">
          {authed ? (
            <>
              <Link to="/analyze" onClick={() => setOpen(false)} className="py-2 text-slate-300 hover:text-white text-sm">Analyze</Link>
              <Link to="/history" onClick={() => setOpen(false)} className="py-2 text-slate-300 hover:text-white text-sm">History</Link>
              <Link to="/pricing" onClick={() => setOpen(false)} className="py-2 text-slate-300 hover:text-white text-sm">Upgrade</Link>
              <Link to="/account" onClick={() => setOpen(false)} className="py-2 text-slate-300 hover:text-white text-sm">Account</Link>
              <button onClick={logout} className="py-2 text-left text-rose-400 text-sm">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="py-2 text-slate-300 text-sm">Sign in</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">Get started free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
