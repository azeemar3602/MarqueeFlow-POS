import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle, Circle, Sparkles, X, ArrowRight, ArrowLeft,
  Minimize2, BookOpen, Check, Download,
} from 'lucide-react'
import api from '../api'
import { useSettings } from '../context/SettingsContext'
import { usePwaInstall, isStandalone } from '../lib/pwa'
import {
  ONBOARDING_STEPS, countDone, allRequiredDone, emptyProgress,
} from '../lib/onboardingSteps'

function instructionLine(item, standalone) {
  const main = standalone && item.app ? item.app : item.en
  return { main, ur: item.ur }
}

export default function SetupWizard({ onComplete }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { settings, save } = useSettings()
  const { installed, isIos, promptInstall } = usePwaInstall()
  const standalone = isStandalone()

  const [expanded, setExpanded] = useState(() => !settings?.onboardingComplete)
  const [stepIndex, setStepIndex] = useState(0)
  const [loadingSamples, setLoadingSamples] = useState(false)
  const [showUrdu, setShowUrdu] = useState(settings?.language === 'ur')
  const [manualOpen, setManualOpen] = useState(false)
  const autoMarked = useRef(new Set())

  const progress = { ...emptyProgress(), ...(settings?.onboardingProgress || {}) }
  const doneCount = countDone(progress)
  const total = ONBOARDING_STEPS.length
  const step = ONBOARDING_STEPS[stepIndex]
  const hidden = settings?.onboardingComplete && !manualOpen

  useEffect(() => {
    const open = () => { setManualOpen(true); setExpanded(true) }
    window.addEventListener('pos:open-onboarding', open)
    return () => window.removeEventListener('pos:open-onboarding', open)
  }, [])

  // Hide floating help button while guide is open (avoids blocking Next on mobile)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('pos:wizard-visible', { detail: { open: expanded && !hidden } }))
  }, [expanded, hidden])

  const persistProgress = useCallback(async (nextProgress, complete = false) => {
    const payload = {
      ...settings,
      onboardingProgress: nextProgress,
      onboardingComplete: complete ? true : (settings?.onboardingComplete || false),
    }
    await save(payload)
  }, [settings, save])

  const markStep = useCallback(async (id, done = true) => {
    const next = { ...emptyProgress(), ...(settings?.onboardingProgress || {}), [id]: done }
    try {
      await persistProgress(next, allRequiredDone(next))
    } catch { /* non-blocking */ }
  }, [settings?.onboardingProgress, persistProgress])

  // Auto-complete when visiting a step's screen
  useEffect(() => {
    if (hidden) return
    const s = ONBOARDING_STEPS[stepIndex]
    if (!s?.path || progress[s.id] || autoMarked.current.has(s.id)) return
    const match = location.pathname === s.path || (s.path !== '/' && location.pathname.startsWith(s.path))
    if (match) {
      autoMarked.current.add(s.id)
      markStep(s.id, true)
    }
  }, [location.pathname, stepIndex, hidden, progress, markStep])

  useEffect(() => {
    if ((installed || standalone) && !progress.install && !autoMarked.current.has('install')) {
      autoMarked.current.add('install')
      markStep('install', true)
    }
  }, [installed, standalone, progress.install, markStep])

  async function finish() {
    if (!settings?.onboardingComplete) {
      const next = { ...progress }
      for (const s of ONBOARDING_STEPS.filter(x => !x.optional)) next[s.id] = true
      await persistProgress(next, true)
    }
    setManualOpen(false)
    setExpanded(false)
    onComplete?.()
  }

  async function loadSamples() {
    setLoadingSamples(true)
    try {
      await api.post('/settings/sample-data')
      await markStep('products', true)
      navigate('/products')
    } catch (e) {
      alert(e.response?.data?.error || 'Could not add samples — add products manually in Products screen.')
    }
    setLoadingSamples(false)
  }

  async function tryInstall() {
    if (installed || standalone) {
      await markStep('install', true)
      return
    }
    if (isIos) {
      alert('On iPhone: tap Share in Safari, then "Add to Home Screen".')
      return
    }
    const r = await promptInstall()
    if (r === 'accepted') await markStep('install', true)
  }

  function nextStep() {
    if (stepIndex >= total - 1) { finish(); return }
    const next = stepIndex + 1
    setStepIndex(next)
    const s = ONBOARDING_STEPS[next]
    if (s?.path) navigate(s.path)
  }

  function prevStep() {
    if (stepIndex <= 0) return
    const prev = stepIndex - 1
    setStepIndex(prev)
    const s = ONBOARDING_STEPS[prev]
    if (s?.path) navigate(s.path)
  }

  function goToStep(i) {
    const next = Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, i))
    setStepIndex(next)
    const s = ONBOARDING_STEPS[next]
    if (s?.path) navigate(s.path)
  }

  if (hidden) return null

  const pct = Math.round((doneCount / total) * 100)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="fixed bottom-20 md:bottom-6 left-4 z-[95] flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-slate-900 text-white shadow-xl border border-slate-700 hover:bg-slate-800 transition-colors"
      >
        <BookOpen size={16} className="text-teal-400" />
        <span className="text-xs font-bold">Setup guide</span>
        <span className="text-[10px] bg-teal-600 px-2 py-0.5 rounded-full font-bold">{doneCount}/{total}</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-end sm:items-stretch justify-end p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto sm:hidden" onClick={() => setExpanded(false)} />

      <div className="pointer-events-auto w-full sm:w-[420px] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-white sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] sm:my-auto">
        <div className="bg-gradient-to-br from-teal-600 to-cyan-700 px-4 py-3 text-white flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-100">
                <Sparkles size={14} /> Setup guide · Web & App
              </div>
              <h2 className="text-lg font-bold mt-0.5 leading-tight">Learn every feature step by step</h2>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={() => setExpanded(false)} title="Minimize"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90">
                <Minimize2 size={16} />
              </button>
              <button type="button" onClick={finish} title="Close guide"
                className="p-1.5 rounded-lg hover:bg-white/20 text-white/90">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
            </div>
            <span className="text-[11px] font-bold tabular-nums">{doneCount}/{total}</span>
          </div>
        </div>

        <div className="flex-shrink-0 border-b border-slate-100 overflow-x-auto">
          <div className="flex gap-1 p-2 min-w-max">
            {ONBOARDING_STEPS.map((s, i) => {
              const done = progress[s.id]
              const active = i === stepIndex
              return (
                <button key={s.id} type="button" onClick={() => goToStep(i)}
                  title={s.title}
                  className={'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ' +
                    (active ? 'bg-teal-100 text-teal-800' : done ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50')}>
                  {done ? <CheckCircle size={11} /> : <Circle size={11} />}
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
              <step.icon size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide">Step {stepIndex + 1} of {total}</p>
              <h3 className="font-bold text-slate-900 leading-snug">{step.title}</h3>
              {step.optional && <span className="text-[10px] text-slate-400 font-medium">Optional</span>}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{step.summary}</p>

          {showUrdu && step.summaryUr && (
            <p className="text-sm text-slate-500 leading-relaxed border-r-2 border-teal-200 pr-3" dir="rtl">{step.summaryUr}</p>
          )}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">What to do</p>
            {step.instructions.map((item, i) => {
              const { main, ur } = instructionLine(item, standalone)
              return (
                <div key={i} className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <p>{main}</p>
                    {showUrdu && ur && <p className="text-slate-400 mt-1" dir="rtl">{ur}</p>}
                  </div>
                </div>
              )
            })}
          </div>

          {standalone && (
            <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 font-medium">
              ✓ Running as installed app — offline & quick launch enabled
            </p>
          )}

          {step.action === 'samples' && (
            <button type="button" onClick={loadSamples} disabled={loadingSamples}
              className="w-full py-2.5 rounded-lg border border-dashed border-teal-300 text-teal-700 text-sm font-semibold hover:bg-teal-50">
              {loadingSamples ? 'Adding sample products…' : '+ Load sample products (demo)'}
            </button>
          )}
          {step.action === 'install' && !installed && !standalone && (
            <button type="button" onClick={tryInstall}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-800">
              <Download size={16} /> Install app on this device
            </button>
          )}

          <button type="button" onClick={() => setShowUrdu(u => !u)}
            className="text-xs text-teal-600 font-semibold underline">
            {showUrdu ? 'Hide Urdu tips' : 'Show Urdu tips / اردو'}
          </button>
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2 bg-white">
          <div className="flex gap-2">
            {step.path && (
              <button type="button" onClick={() => navigate(step.path)}
                className="btn-secondary flex-1 text-sm py-2.5">
                Open screen →
              </button>
            )}
            <button type="button" onClick={() => markStep(step.id, !progress[step.id])}
              className={'flex-1 text-sm py-2.5 rounded-lg font-semibold border transition-colors ' +
                (progress[step.id] ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>
              <Check size={14} className="inline mr-1" />
              {progress[step.id] ? 'Done ✓' : 'Mark done'}
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" disabled={stepIndex === 0} onClick={prevStep}
              className="btn-secondary flex-1 text-sm py-3 flex items-center justify-center gap-1 disabled:opacity-40">
              <ArrowLeft size={14} /> Back
            </button>
            <button type="button" onClick={nextStep}
              className="btn-primary flex-1 text-sm py-3 flex items-center justify-center gap-1">
              {stepIndex < total - 1 ? <>Next <ArrowRight size={14} /></> : 'Finish setup'}
            </button>
          </div>
          <button type="button" onClick={finish} className="w-full text-xs text-slate-400 hover:text-slate-600 py-1">
            Skip guide for now
          </button>
        </div>
      </div>
    </div>
  )
}

export function openOnboardingGuide() {
  window.dispatchEvent(new Event('pos:open-onboarding'))
}
