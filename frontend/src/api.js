import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000, // 20s — show error instead of hanging forever on network issues
})

export function apiErrorMessage(err) {
  if (!err.response) {
    if (err.code === 'ECONNABORTED') return 'Connection timed out. Check your internet or try mobile data / another network.'
    return 'Cannot reach server. Your network may be blocking pos.marqueeflow.com — try mobile data or VPN.'
  }
  return err.response?.data?.message || err.response?.data?.error || 'Request failed'
}

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pos_token')
  if (token) cfg.headers.Authorization = 'Bearer ' + token
  return cfg
})
api.interceptors.response.use(r => r, err => {
  const url = err.config?.url || ''
  // Leave the startup auth probe to AuthContext (it won't log out on transient
  // failures). Only hard-redirect on a 401 from a normal in-app request.
  if (err.response?.status === 401 && !url.includes('/auth/me')) {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})
export default api
