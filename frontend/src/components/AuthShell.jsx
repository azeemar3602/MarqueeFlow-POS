import { Link } from 'react-router-dom'
import BrandMark from './BrandMark'
import { Zap, Shield, Smartphone } from 'lucide-react'

const PERKS = [
  { icon: Zap, text: 'Bill in seconds with barcode scan' },
  { icon: Shield, text: 'Credit khata & daily reports built-in' },
  { icon: Smartphone, text: 'Works offline on any phone or PC' },
]

/** Split-panel auth layout — dark brand column + light form column. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100">
      {/* Brand panel */}
      <aside className="lg:w-[42%] xl:w-[38%] bg-slate-900 text-white relative overflow-hidden flex flex-col justify-between p-8 lg:p-12">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-500/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-600/20 blur-3xl" />
        </div>
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <BrandMark size="md" className="group-hover:rotate-6 transition-transform" />
            <div>
              <p className="font-bold text-lg tracking-tight">MarqueeFlow</p>
              <p className="text-teal-300/80 text-xs font-medium uppercase tracking-widest">Point of Sale</p>
            </div>
          </Link>
        </div>
        <div className="relative hidden lg:block space-y-6 my-10">
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight">
            Retail billing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-200">made simple.</span>
          </h2>
          <ul className="space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-teal-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-slate-500 text-xs hidden lg:block">
          Trusted by shops across Pakistan · support@marqueeflow.com
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <BrandMark size="sm" />
            <span className="font-bold text-slate-800">MarqueeFlow POS</span>
          </div>
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>}
              {subtitle && <p className="text-slate-500 text-sm mt-2 leading-relaxed">{subtitle}</p>}
            </div>
          )}
          {children}
          {footer}
        </div>
      </main>
    </div>
  )
}
