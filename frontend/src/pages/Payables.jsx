import { useState, useEffect, useRef } from 'react'
import { Search, Wallet, ArrowUpRight, FileText, AlertTriangle, X, CheckCircle, Plus, Pencil, Trash2, Link2, Copy, MessageCircle } from 'lucide-react'
import api from '../api'
import { useT } from '../context/SettingsContext'
import { whatsAppSupplierStatement } from '../lib/share'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

const PKR = n => 'PKR ' + Number(n || 0).toLocaleString()

export default function Payables() {
  const t = useT()
  const [tab, setTab] = useState('outstanding')
  const [data, setData] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [selected, setSelected] = useState(null)
  const [ledger, setLedger] = useState([])
  const [payAmount, setPayAmount] = useState('')
  const [chargeAmount, setChargeAmount] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', opening_balance: '' })
  const [editId, setEditId] = useState(null)
  const [stmtHtml, setStmtHtml] = useState(null)
  const stmtFrame = useRef(null)
  const [shareLink, setShareLink] = useState('')

  async function loadOutstanding() {
    const { data: d } = await api.get('/reports/supplier-ledger')
    setData(d)
  }
  async function loadSuppliers() {
    const { data: d } = await api.get('/suppliers')
    setSuppliers(d)
  }
  useEffect(() => { loadOutstanding(); loadSuppliers() }, [])

  async function openLedger(s) {
    setSelected(s)
    const { data: d } = await api.get('/suppliers/' + s.id + '/ledger')
    setSelected(d.supplier || s)
    setLedger(d.ledger)
    setShareLink(d.supplier?.public_token ? `${window.location.origin}/payable/${d.supplier.public_token}` : '')
    setModal('ledger')
  }

  function openAdd() {
    setEditId(null)
    setForm({ name: '', phone: '', address: '', opening_balance: '' })
    setModal('add')
  }
  function openEdit(s) {
    setEditId(s.id)
    setForm({ name: s.name, phone: s.phone || '', address: s.address || '', opening_balance: '' })
    setModal('add')
  }

  async function saveSupplier() {
    if (!form.name) return
    setSaving(true)
    try {
      if (editId) await api.put('/suppliers/' + editId, form)
      else await api.post('/suppliers', form)
      await loadOutstanding()
      await loadSuppliers()
      setModal(null)
    } catch (e) { alert(e.response?.data?.error || e.message) }
    setSaving(false)
  }

  async function recordPayment() {
    if (!payAmount || parseFloat(payAmount) <= 0) return
    setSaving(true)
    try {
      const amt = parseFloat(payAmount)
      await api.post('/suppliers/' + selected.id + '/payment', { amount: amt })
      await loadOutstanding()
      await loadSuppliers()
      setPayAmount('')
      setModal(null)
    } catch (e) { alert(e.response?.data?.error || e.message) }
    setSaving(false)
  }

  async function recordCharge() {
    if (!chargeAmount || parseFloat(chargeAmount) === 0) return
    setSaving(true)
    try {
      await api.post('/suppliers/' + selected.id + '/adjust', { amount: parseFloat(chargeAmount), note: 'Manual charge' })
      await loadOutstanding()
      await loadSuppliers()
      setChargeAmount('')
      setModal(null)
    } catch (e) { alert(e.response?.data?.error || e.message) }
    setSaving(false)
  }

  async function deleteSupplier() {
    setSaving(true)
    try {
      await api.delete('/suppliers/' + selected.id)
      await loadOutstanding()
      await loadSuppliers()
      setModal(null)
      setSelected(null)
    } catch (e) { alert(e.response?.data?.error || e.message) }
    setSaving(false)
  }

  async function rotateLink() {
    setSaving(true)
    try {
      const { data: d } = await api.post('/suppliers/' + selected.id + '/rotate-token')
      const link = `${window.location.origin}/payable/${d.public_token}`
      setShareLink(link)
      setSelected(s => ({ ...s, public_token: d.public_token }))
    } catch (e) { alert(e.response?.data?.error || e.message) }
    setSaving(false)
  }

  function copyLink() {
    if (!shareLink) return
    navigator.clipboard.writeText(shareLink).then(() => alert('Link copied!')).catch(() => alert(shareLink))
  }

  function printStatement() {
    const s = selected
    const rows = ledger.map(l => `<tr><td>${new Date(l.created_at).toLocaleString('en-PK')}</td><td style="text-transform:capitalize">${l.type}</td><td>${l.note || ''}</td><td style="text-align:right">${l.amount > 0 ? '+' : ''}${Number(l.amount).toLocaleString()}</td><td style="text-align:right">${Number(l.balance_after).toLocaleString()}</td></tr>`).join('')
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payable - ${s.name}</title>
      <style>body{font-family:Arial;padding:24px;color:#111}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}th,td{border-bottom:1px solid #eee;padding:7px 6px}th{background:#f8fafc}</style></head><body>
      <h1>Supplier Payable Statement</h1><p style="color:#555">${s.name}${s.phone ? ' · ' + s.phone : ''}</p>
      <p>Outstanding: <b>PKR ${Number(s.balance || 0).toLocaleString()}</b></p>
      <table><thead><tr><th>Date</th><th>Type</th><th>Note</th><th style="text-align:right">Amount</th><th style="text-align:right">Balance</th></tr></thead><tbody>${rows || '<tr><td colspan=5>No transactions</td></tr>'}</tbody></table></body></html>`
    setStmtHtml(html)
  }

  if (!data) return <div className="text-center py-16 text-gray-400">Loading…</div>

  const all = data.suppliers || []
  const owing = all.filter(s => Number(s.balance) > 0)
  const list = (showAll ? all : owing).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search))
  const filteredSuppliers = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone || '').includes(search))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">{t('payables')}</h1>
        <button onClick={openAdd} className="btn-primary !py-2 !px-3 text-sm flex items-center gap-1"><Plus size={16} /> {t('addSupplier')}</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('outstanding')} className={'flex-1 py-2 rounded-xl text-sm font-semibold ' + (tab === 'outstanding' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>{t('toPay')}</button>
        <button onClick={() => setTab('suppliers')} className={'flex-1 py-2 rounded-xl text-sm font-semibold ' + (tab === 'suppliers' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600')}>{t('suppliers')}</button>
      </div>

      {tab === 'outstanding' && (
        <>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 mb-4">
            <div className="flex items-center gap-2 text-amber-100 text-sm"><Wallet size={16} /> {t('totalPayable')}</div>
            <p className="text-4xl font-extrabold mt-1">{PKR(data.totals.totalOutstanding)}</p>
            <p className="text-amber-100 text-sm mt-1">{data.totals.withBalance} {t('suppliersOwed')}</p>
          </div>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder={t('searchSupplier')} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowAll(s => !s)} className={'px-4 rounded-xl text-sm font-medium border ' + (showAll ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600')}>
              {showAll ? t('all') : t('owing')}
            </button>
          </div>

          <div className="space-y-2">
            {list.map(s => {
              const bal = Number(s.balance)
              return (
                <div key={s.id} className="card flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openLedger(s)}>
                    <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.phone || t('noPhone')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {bal > 0 ? <p className="font-bold text-sm text-amber-700">{PKR(bal)}</p> : <span className="badge-green">{t('cleared')}</span>}
                  </div>
                  {bal > 0 && (
                    <button onClick={() => { setSelected(s); setPayAmount(''); setModal('payment') }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold hover:bg-amber-100 flex-shrink-0">
                      <ArrowUpRight size={14} /> {t('pay')}
                    </button>
                  )}
                </div>
              )
            })}
            {list.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">{showAll ? t('noSuppliers') : t('noPayables')}</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'suppliers' && (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder={t('searchSupplier')} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filteredSuppliers.map(s => (
              <div key={s.id} className="card flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openLedger(s)}>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.phone || t('noPhone')} · {Number(s.balance) > 0 ? PKR(s.balance) + ' ' + t('owing') : t('cleared')}</p>
                </div>
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-indigo-600"><Pencil size={16} /></button>
              </div>
            ))}
            {filteredSuppliers.length === 0 && <p className="text-center py-12 text-gray-400">{t('noSuppliers')}</p>}
          </div>
        </>
      )}

      {modal === 'add' && (
        <Modal title={editId ? t('editSupplier') : t('addSupplier')} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div><label className="label">{t('name')} *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">{t('phone')}</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="label">{t('address')}</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            {!editId && <div><label className="label">{t('openingPayable')}</label><input type="number" className="input" placeholder="0" value={form.opening_balance} onChange={e => setForm(f => ({ ...f, opening_balance: e.target.value }))} /></div>}
            <button onClick={saveSupplier} disabled={saving || !form.name} className="btn-primary w-full">{saving ? '…' : t('save')}</button>
          </div>
        </Modal>
      )}

      {modal === 'payment' && selected && (
        <Modal title={t('recordPaymentOut')} onClose={() => setModal(null)}>
          <div className="bg-amber-50 rounded-xl p-3 mb-4">
            <p className="text-sm text-gray-600">{t('youOwe')} {selected.name}</p>
            <p className="text-2xl font-bold text-amber-700">{PKR(selected.balance)}</p>
          </div>
          <div><label className="label">{t('paymentAmount')}</label>
            <input type="number" className="input" value={payAmount} onChange={e => setPayAmount(e.target.value)} autoFocus /></div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">{t('cancel')}</button>
            <button onClick={recordPayment} disabled={saving || !payAmount} className="btn-primary flex-1">{saving ? '…' : t('recordPayment')}</button>
          </div>
        </Modal>
      )}

      {modal === 'ledger' && selected && (
        <Modal title={selected.name + ' — ' + t('ledger')} onClose={() => setModal(null)}>
          <button onClick={printStatement} className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mb-2"><FileText size={15} /> {t('printStatement')}</button>
          {shareLink && (
            <div className="flex gap-2 mb-3">
              <button onClick={copyLink} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm"><Copy size={14} /> {t('copyPublicLink')}</button>
              <button onClick={() => whatsAppSupplierStatement(selected, selected.balance, shareLink)} className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm text-green-700"><MessageCircle size={14} /> WhatsApp</button>
              <button onClick={rotateLink} disabled={saving} className="btn-secondary px-3" title="Rotate link"><Link2 size={16} /></button>
            </div>
          )}
          <div className="bg-amber-50 rounded-xl p-3 text-center mb-3">
            <p className="text-xl font-bold text-amber-700">{PKR(selected.balance)}</p>
            <p className="text-xs text-amber-600">{t('outstanding')}</p>
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => { setPayAmount(''); setModal('payment') }} className="btn-primary flex-1 text-sm">{t('recordPaymentOut')}</button>
            <button onClick={() => { setChargeAmount(''); setModal('charge') }} className="btn-secondary flex-1 text-sm">{t('addPurchase')}</button>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {ledger.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
                <div><p className="font-medium capitalize">{l.type}</p><p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleDateString('en-PK')}</p></div>
                <p className={l.amount > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-600 font-semibold'}>{l.amount > 0 ? '+' : ''}{PKR(Math.abs(l.amount))}</p>
              </div>
            ))}
          </div>
          <button onClick={deleteSupplier} disabled={saving} className="mt-4 w-full text-red-600 text-sm flex items-center justify-center gap-1"><Trash2 size={14} /> {t('delete')}</button>
        </Modal>
      )}

      {modal === 'charge' && selected && (
        <Modal title={t('addPurchase')} onClose={() => setModal('ledger')}>
          <div><label className="label">{t('amountCharge')}</label>
            <input type="number" className="input" value={chargeAmount} onChange={e => setChargeAmount(e.target.value)} /></div>
          <button onClick={recordCharge} disabled={saving} className="btn-primary w-full mt-4">{t('apply')}</button>
        </Modal>
      )}

      {stmtHtml && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <button onClick={() => setStmtHtml(null)} className="text-sm font-semibold"><X size={18} className="inline" /> Close</button>
            <button onClick={() => { stmtFrame.current?.contentWindow?.print() }} className="btn-primary text-sm">Print</button>
          </div>
          <iframe ref={stmtFrame} srcDoc={stmtHtml} title="Statement" className="flex-1 w-full border-0" />
        </div>
      )}
    </div>
  )
}
