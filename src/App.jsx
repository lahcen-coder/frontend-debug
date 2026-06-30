import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import Navbar from './components/shared/Navbar'
import ProtectedRoute from './components/shared/ProtectedRoute'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Analyze from './pages/Analyze'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Pricing from './pages/Pricing'
import Account from './pages/Account'

export default function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
  }, [token])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' },
          success: { iconTheme: { primary: '#a78bfa', secondary: '#1e293b' } },
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pricing" element={<Pricing />} />

            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/dashboard/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

            <Route path="*" element={
              <div className="text-center py-32 text-slate-400">
                <p className="text-5xl font-bold text-white mb-4">404</p>
                <p className="mb-6">Page not found.</p>
                <a href="/" className="text-brand-400 hover:underline">Go home →</a>
              </div>
            } />
          </Routes>
        </main>
        <footer className="border-t border-white/5 text-center text-xs text-slate-600 py-6">
          © {new Date().getFullYear()} Debug Together · <a href="/privacy" className="hover:text-slate-400">Privacy</a> · <a href="/terms" className="hover:text-slate-400">Terms</a>
        </footer>
      </div>
    </BrowserRouter>
  )
}
