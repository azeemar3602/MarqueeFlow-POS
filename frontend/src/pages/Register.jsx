import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Users } from 'lucide-react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { TIERS, money, BILLING } from '../lib/tiers'
import AuthShell from '../components/AuthShell'
import BrandMark from '../components/BrandMark'

function PendingPage({ storeName }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <BrandMark size="lg" />
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-7 shadow-2xl text-center">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Request Received!</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Thank you for registering <span className="text-teal-300 font-semibold">{storeName}</span> on MarqueeFlow POS.
              Your request has been forwarded to our admin team for review.
            </p>
          </div>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-slate-500 text-xs">🇵🇰</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>
          <div className="mb-7" dir="rtl">
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>درخواست موصول ہو گئی!</h2>
            <p className="text-slate-300 text-sm leading-loose" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="text-teal-300 font-semibold">{storeName}</span> کو MarqueeFlow POS پر رجسٹر کرنے کا شکریہ۔
              ہم جلد ہی آپ کی تفصیلات جانچ کر رسائی فراہم کریں گے۔
            </p>
          </div>
          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 mb-6 text-left space-y-3">
            {[
              { en: 'Admin reviews your registration', ur: 'ایڈمن آپ کی درخواست کا جائزہ لیں گے' },
              { en: 'Your account gets activated', ur: 'آپ کا اکاؤنٹ فعال کیا جائے گا' },
              { en: 'Log in and start billing!', ur: 'لاگ ان کریں اور بلنگ شروع کریں!' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <p className="text-white text-xs font-medium">{s.en}</p>
                  <p className="text-slate-400 text-xs mt-0.5" dir="rtl" style={{ fontFamily: 'Georgia, serif' }}>{s.ur}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/login"
            className="block w-full py-3.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-sm hover:from-teal-600 hover:to-cyan-600 transition-all">
            Login / لاگ ان کریں
          </Link>
        </div>
      </div>
    </div>
  )
}

const PLAN_ACCENT = {
  trial: 'from-emerald-500 to-teal-500',
  basic: 'from-slate-400 to-slate-500',
  standard: 'from-amber-400 to-orange-500',
  pro: 'from-cyan-500 to-blue-500',
  business: 'from-violet-500 to-purple-600',
}

export default function Register() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuth()
  const initialPlan = TIERS.find(t => t.id === params.get('plan')) ? params.get('plan') : 'trial'
  const [plan, setPlan] = useState(initialPlan)
  const initialBilling = BILLING.find(b => b.id === params.get('billing')) ? params.get('billing') : 'oneTime'
  const [billing, setBilling] = useState(initialBilling)
  const [form, setForm] = useState({ tenantName: '', name: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const tier = TIERS.find(t => t.id === plan) || TIERS[0]

  async function submit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/register', { ...form, plan, billing: tier.free ? undefined : billing })
      if (data.token) {
        login(data.token, data.user)
        navigate('/')
        return
      }
      setSubmitted(true)
    } catch (e) { setError(e.response?.data?.error || 'Registration failed') }
    setLoading(false)
  }

  if (submitted) return <PendingPage storeName={form.tenantName} />

  return (
    <AuthShell
      title={tier.free ? 'Start your free trial' : 'Create your store'}
      subtitle={tier.free
        ? 'Full access for 7 days — no payment or card needed.'
        : 'Choose a plan below, fill in your details, and we activate after payment.'}
      footer={
        <p className="text-center text-sm text-slate-500 mt-6">
          Already registered? <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Sign in</Link>
        </p>
      }
    >
      {/* Billing toggle — amber pill style */}
      {!tier.free && (
        <div className="mb-5">
          <p className="label mb-2">Billing cycle</p>
          <div className="inline-flex bg-slate-200/80 rounded-full p-1">
            {BILLING.map(b => (
              <button type="button" key={b.id} onClick={() => setBilling(b.id)}
                className={'px-4 py-1.5 rounded-full text-xs font-bold transition-all ' +
                  (billing === b.id ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900')}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan grid — 2 columns, top accent stripe */}
      <div className="mb-5">
        <p className="label mb-2">Select plan</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {TIERS.map(t => {
            const active = t.id === plan
            return (
              <button type="button" key={t.id} onClick={() => setPlan(t.id)}
                className={'relative text-left rounded-lg border overflow-hidden transition-all ' +
                  (active ? 'border-teal-500 ring-2 ring-teal-500/30 shadow-md scale-[1.02]' : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm')}>
                <div className={`h-1.5 bg-gradient-to-r ${PLAN_ACCENT[t.id] || PLAN_ACCENT.basic}`} />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-slate-900 text-sm leading-tight">{t.name}</span>
                    {active && <Check size={14} className="text-teal-600 flex-shrink-0 mt-0.5" strokeWidth={3} />}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                    <Users size={10} /> {t.users} · {t.tagline.split(' ').slice(0, 2).join(' ')}…
                  </div>
                  <div className="mt-2">
                    {t.free
                      ? <span className="text-sm font-extrabold text-emerald-600">Free 7 days</span>
                      : billing === 'monthly'
                        ? <span className="text-sm font-extrabold text-slate-800">{money(t.monthly)}<span className="text-[10px] font-normal text-slate-400">/mo</span></span>
                        : <><span className="text-sm font-extrabold text-slate-800">{money(t.yearly)}<span className="text-[10px] font-normal text-slate-400">/yr</span></span>
                          <p className="text-[9px] text-slate-400 mt-0.5">+{money(t.oneTime)} setup</p></>}
                  </div>
                  {(t.free || t.popular) && (
                    <span className={'absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded ' +
                      (t.free ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                      {t.free ? 'FREE' : '★ POP'}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <form onSubmit={submit} className="card space-y-4 border-t-4 border-t-teal-500">
        {error && <p className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{error}</p>}
        {[
          { id: 'tenantName', label: 'Store / Company Name', placeholder: 'e.g. Ahmed General Store' },
          { id: 'name',       label: 'Your Name',            placeholder: 'e.g. Ahmed Khan' },
          { id: 'phone',      label: 'Phone Number',         placeholder: 'e.g. 03001234567', type: 'tel' },
          { id: 'password',   label: 'Password',             placeholder: 'Min 6 characters', type: 'password' },
        ].map(f => (
          <div key={f.id}>
            <label className="label">{f.label}</label>
            <input className="input" type={f.type || 'text'} placeholder={f.placeholder} value={form[f.id]}
              onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))} required />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Please wait…' : tier.free ? 'Start Free Trial →' : 'Submit Registration →'}
        </button>
        <p className="text-center text-xs text-slate-400">
          {tier.free ? 'Instant access — no card required.' : 'Activated by our team after payment confirmation.'}
        </p>
      </form>
    </AuthShell>
  )
}
