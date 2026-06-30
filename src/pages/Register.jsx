import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Passwords do not match.'] })
      return
    }
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      toast.success('Account created! Welcome to Debug Together 💜')
      navigate('/analyze')
    } catch (err) {
      const data = err.response?.data
      if (data?.error?.details) setErrors(data.error.details)
      else toast.error(data?.error?.message || 'Registration failed.')
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-rose-500 mb-4 shadow-lg shadow-brand-500/30">
            <Heart size={24} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Free forever — no credit card needed</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <Input label="Your name" placeholder="Alex" value={form.name} onChange={set('name')} error={errors.name?.[0]} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email?.[0]} required />
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} error={errors.password?.[0]} required />
          <Input label="Confirm password" type="password" placeholder="••••••••" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation?.[0]} required />

          <p className="text-xs text-slate-500 -mt-1">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-brand-400 hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" loading={isLoading} className="w-full mt-1">
            Create free account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
