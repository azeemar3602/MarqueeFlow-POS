import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShoppingCart, Package, Users, Receipt, BarChart2, LogOut, Menu, X, UserCheck, Settings as SettingsIcon, CreditCard, Wallet, Download, Smartphone, Truck } from 'lucide-react'
import { useState } from 'react'
import { useSettings, useT } from '../context/SettingsContext'
import { usePwaInstall } from '../lib/pwa'
import OfflineBanner from './OfflineBanner'
import SetupWizard from './SetupWizard'
import HelpButton from './HelpButton'
import BrandMark from './BrandMark'

function MenuFooter({ user, dark = true }) {
  const { installed, isIos, promptInstall } = usePwaInstall()
  const [hint, setHint] = useState(false)
  const expiry = user?.accessExpiresAt ? new Date(user.accessExpiresAt) : null
  const expStr = expiry ? expiry.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : null
  const daysLeft = expiry ? Math.ceil((expiry - new Date()) / 86400000) : null

  async function onDownload() {
    if (installed || isIos) { setHint(true); return }
    const r = await promptInstall()
    if (r === 'unavailable') setHint(true)
  }

  const box = dark ? 'border-slate-700/80' : 'border-gray-100'
  const planBox = dark ? 'bg-slate-800/80' : 'bg-gray-50'
  const muted = dark ? 'text-slate-500' : 'text-gray-400'
  const accent = dark ? 'text-teal-300' : 'text-teal-700'
  const val = dark ? 'text-slate-300' : 'text-gray-600'

  return (
    <div className={'mt-auto pt-3 border-t space-y-2 ' + box}>
      {user?.plan && (
        <div className={'px-3 py-2 rounded-lg text-xs ' + planBox}>
          <div className="flex items-center justify-between">
            <span className={muted}>Package</span>
            <span className={'font-semibold capitalize ' + accent}>{user.plan}</span>
          </div>
          {user.userLimit != null && (
            <div className="flex items-center justify-between mt-1">
              <span className={muted}>Seats</span>
              <span className={'font-medium ' + val}>{user.userLimit}</span>
            </div>
          )}
          {expStr && (
            <div className="flex items-center justify-between mt-1">
              <span className={muted}>Renewal</span>
              <span className={'font-medium ' + (daysLeft != null && daysLeft <= 3 ? 'text-red-500' : val)}>{expStr}</span>
            </div>
          )}
        </div>
      )}
      {installed ? (
        <div className="w-full flex items-center justify-center gap-2 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-950/50">
          <Smartphone size={15} /> App installed
        </div>
      ) : (
        <button onClick={onDownload} className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-3 py-2.5 rounded-lg transition-colors">
          <Download size={16} /> Download App
        </button>
      )}
      {hint && (
        <p className={'text-xs px-1 leading-relaxed ' + (dark ? 'text-slate-500' : 'text-gray-500')}>
          {isIos
            ? <>Tap <b>Share</b> in Safari, then <b>“Add to Home Screen”</b>.</>
            : <>Open your browser menu (⋮) and choose <b>Install app</b> / <b>Add to Home screen</b>.</>}
        </p>
      )}
    </div>
  )
}

function navClass(isActive) {
  return 'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' +
    (isActive ? 'bg-teal-600/20 text-teal-300 border-l-2 border-teal-400 pl-[10px]' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent pl-[10px]')
}

function mobileNavClass(isActive) {
  return 'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ' +
    (isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50')
}

function bottomNavClass(isActive) {
  return 'flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ' +
    (isActive ? 'text-teal-600' : 'text-gray-400')
}

export default function Layout() {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showWizard, setShowWizard] = useState(true)
  const t = useT()
  const { settings } = useSettings()
  const isRtl = settings?.language === 'ur'

  const NAV = [
    { to: '/',          labelKey: 'pos',       icon: ShoppingCart },
    { to: '/products',  labelKey: 'products',  icon: Package,    permKey: 'products' },
    { to: '/customers', labelKey: 'customers', icon: Users,      permKey: 'customers' },
    { to: '/credit',    labelKey: 'credit',    icon: CreditCard, permKey: 'credit' },
    { to: '/payables',  labelKey: 'payables',  icon: Truck,      permKey: 'payables' },
    { to: '/sales',     labelKey: 'sales',     icon: Receipt,    permKey: 'sales' },
    { to: '/reports',   labelKey: 'reports',   icon: BarChart2,  permKey: 'reports' },
    { to: '/expenses',  labelKey: 'expenses',  icon: Wallet,     permKey: 'expenses' },
    { to: '/team',      labelKey: 'team',      icon: UserCheck,  roles: ['owner', 'manager'] },
    { to: '/settings',  labelKey: 'settings',  icon: SettingsIcon, roles: ['owner', 'manager'] },
  ]

  function doLogout() { logout(); navigate('/login') }

  const links = NAV.filter(n => {
    if (n.roles && !n.roles.includes(user?.role)) return false
    if (n.permKey && user?.role !== 'owner') return hasPermission(n.permKey)
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-slate-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <OfflineBanner />
      {user?.accessExpiresAt && (() => {
        const d = Math.ceil((new Date(user.accessExpiresAt) - new Date()) / 86400000)
        if (d > 0 && d <= 7) return (
          <div className="bg-amber-500 text-white text-sm text-center py-2 px-4 font-medium">
            Your access expires in {d} day{d === 1 ? '' : 's'}. Contact support@marqueeflow.com to renew.
          </div>
        )
        return null
      })()}
      {user?.role === 'owner' && showWizard && !settings?.onboardingComplete && (
        <SetupWizard onComplete={() => setShowWizard(false)} />
      )}
      <HelpButton />
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <BrandMark size="sm" className="!rotate-0" />
            <span className="font-bold text-slate-800 text-base">MarqueeFlow</span>
          </div>
          <span className="text-slate-400 text-sm hidden md:inline font-medium">{user?.tenantName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={doLogout} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="hidden md:flex flex-col w-60 bg-slate-900 p-4 gap-0.5">
          <div className="flex items-center gap-2.5 px-2 mb-5 pb-4 border-b border-slate-700/80">
            <BrandMark size="sm" className="!rotate-0 shadow-none" />
            <div>
              <p className="font-bold text-white text-sm leading-tight">MarqueeFlow</p>
              <p className="text-teal-400/70 text-[10px] font-medium uppercase tracking-wider">POS</p>
            </div>
          </div>
          {links.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => navClass(isActive)}>
              <Icon size={18} /> {t(labelKey)}
            </NavLink>
          ))}
          <MenuFooter user={user} />
        </nav>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <nav className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 flex flex-col gap-1 shadow-xl">
              <div className="flex items-center gap-2 mb-4 px-2">
                <BrandMark size="sm" className="!rotate-0" />
                <span className="font-bold text-slate-800">MarqueeFlow POS</span>
              </div>
              {links.map(({ to, labelKey, icon: Icon }) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}
                  className={({ isActive }) => mobileNavClass(isActive)}>
                  <Icon size={18} /> {t(labelKey)}
                </NavLink>
              ))}
              <div className="mt-auto pt-3 border-t">
                <MenuFooter user={user} dark={false} />
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {links.slice(0, 5).map(({ to, labelKey, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => bottomNavClass(isActive)}>
            <Icon size={20} className="mb-0.5" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
