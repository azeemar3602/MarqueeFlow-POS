import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const blocked = sessionStorage.getItem('pos_blocked_msg')
    if (blocked) {
      setError('blocked:' + blocked)
      sessionStorage.removeItem('pos_blocked_msg')
    }
  }, [])

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      navigate('/')
    } catch (e) {
      const err = e.response?.data?.error
      const msg = e.response?.data?.message
      if (err === 'pending') {
        setError('pending:' + (msg || 'Your account is awaiting admin approval.'))
      } else if (err === 'rejected') {
        setError('rejected:' + (msg || 'Your registration was rejected. Please contact support.'))
      } else if (err === 'blocked') {
        setError('blocked:' + (msg || 'Your account access has expired. Please contact the administrator.'))
      } else {
        setError(msg || err || 'Login failed')
      }
    }
    setLoading(false)
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your store dashboard — billing, inventory, credit and reports."
      footer={
        <p className="text-center text-sm text-slate-500 mt-6">
          New store? <Link to="/register" className="text-teal-600 font-semibold hover:text-teal-700">Create account</Link>
        </p>
      }
    >
      <form onSubmit={submit} className="card space-y-4 border-t-4 border-t-teal-500">
        {error && (() => {
          const isBlocked = error.startsWith('blocked:')
          const isPending = error.startsWith('pending:')
          const isRejected = error.startsWith('rejected:')
          const msg = error.includes(':') ? error.slice(error.indexOf(':') + 1) : error
          if (isBlocked) return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-4 text-center">
              <p className="font-semibold text-orange-800 text-sm mb-1">Account Access Blocked</p>
              <p className="text-orange-600 text-xs leading-relaxed">{msg}</p>
            </div>
          )
          if (isPending) return (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-amber-700 text-sm">⏳ {msg}</p>
            </div>
          )
          if (isRejected) return (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-600 text-sm">✕ {msg}</p>
            </div>
          )
          return <p className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{msg}</p>
        })()}
        <div>
          <label className="label">Phone / Email</label>
          <input className="input" type="text" placeholder="03001234567 or you@store.com" value={form.email}
            onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••" value={form.password}
            onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
      </form>
    </AuthShell>
  )
}
