import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setToken: (token) => {
        localStorage.setItem('auth_token', token)
        set({ token })
      },

      login: async (email, password) => {
        set({ isLoading: true })
        const res = await api.post('/auth/login', { email, password })
        const { token, user } = res.data.data
        localStorage.setItem('auth_token', token)
        set({ token, user, isLoading: false })
        return user
      },

      register: async (name, email, password, password_confirmation) => {
        set({ isLoading: true })
        const res = await api.post('/auth/register', {
          name,
          email,
          password,
          password_confirmation,
          consent: true,
          marketing_opt_in: false,
        })
        const { token, user } = res.data.data
        localStorage.setItem('auth_token', token)
        set({ token, user, isLoading: false })
        return user
      },

      logout: async () => {
        try { await api.post('/auth/logout') } catch { /* ignore */ }
        localStorage.removeItem('auth_token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      fetchMe: async () => {
        try {
          const res = await api.get('/auth/me')
          set({ user: res.data.data })
        } catch {
          set({ user: null, token: null })
        }
      },

      isAuthenticated: () => !!get().token,
    }),
    { name: 'debug-together-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)
