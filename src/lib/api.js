import axios from 'axios'

// Priority: runtime config (injected by the container) → build-time env → local default
const runtimeConfig = (typeof window !== 'undefined' && window.__APP_CONFIG__) || {}
const baseURL =
  runtimeConfig.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL,
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
