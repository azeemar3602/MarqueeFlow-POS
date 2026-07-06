import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Circle, Sparkles, X, ArrowRight } from 'lucide-react'
import api from '../api'
import { useSettings } from '../context/SettingsContext'

const STEPS = [
  { id: 'settings', label: 'Shop name & receipt settings', path: '/settings', hint: 'Set your shop name, phone, and print format' },
  { id: 'products', label: 'Add products (or load samples)', path: '/products', hint: 'Add inventory or use sample products' },
  { id: 'sale', label: 'Complete a test sale', path: '/', hint: 'Ring up one bill on POS' },
]

export default function SetupWizard({ onComplete }) {
  const navigate = useNavigate()
  const { settings, save } = useSettings()
  const [loadingSamples, setLoadingSamples] = useState(false)
  const [step, setStep] = useState(0)

  async function loadSamples() {
    setLoadingSamples(true)
    try {
      await api.post('/settings/sample-data')
      alert('Sample products added! Open Products to see them.')
    } catch (e) {
      alert(e.response?.data?.error || 'Could not add samples')
    }
    setLoadingSamples(false)
  }

  async function finish() {
    await save({ ...settings, onboardingComplete: true })
    onComplete?.()
  }

  if (settings?.onboardingComplete) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-4 text-white relative">
          <button onClick={finish} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 text-white/80"><X size={18} /></button>
          <div className="flex items-center gap-2 mb-1"><Sparkles size={18} /> <span className="text-sm font-semibold opacity-90">Welcome to MarqueeFlow POS</span></div>
          <h2 className="text-xl font-bold">Let&apos;s set up your shop</h2>
          <p className="text-indigo-100 text-sm mt-1">3 quick steps — about 5 minutes</p>
        </div>
        <div className="p-5 space-y-3">
          {STEPS.map((s, i) => (
            <button key={s.id} type="button" onClick={() => { setStep(i); navigate(s.path) }}
              className={'w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ' +
                (step === i ? 'border-indigo-300 bg-indigo-50' : 'border-gray-100 hover:bg-gray-50')}>
              {step > i ? <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> :
                step === i ? <Circle size={20} className="text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" /> :
                <Circle size={20} className="text-gray-300 flex-shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold text-sm text-gray-900">{i + 1}. {s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.hint}</p>
              </div>
            </button>
          ))}
          <button type="button" onClick={loadSamples} disabled={loadingSamples}
            className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 text-indigo-600 text-sm font-semibold hover:bg-indigo-50">
            {loadingSamples ? 'Adding…' : '+ Load sample products (demo)'}
          </button>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={finish} className="btn-secondary flex-1 text-sm">Skip for now</button>
            <button type="button" onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : finish()}
              className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
              {step < STEPS.length - 1 ? <>Next <ArrowRight size={14} /></> : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
