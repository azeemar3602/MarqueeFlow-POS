import { useState } from 'react'
import { HelpCircle, X, ShoppingCart, Package, CreditCard, Printer, Wifi } from 'lucide-react'

const TOPICS = [
  { icon: ShoppingCart, title: 'Make a sale', body: 'Tap products to add to cart, set payment method, then Complete Sale. Use the camera button to scan barcodes.' },
  { icon: Package, title: 'Add products', body: 'Go to Products → Add Product. Set sale price and stock. Star ⭐ items to show on POS quick tiles.' },
  { icon: CreditCard, title: 'Customer khata (credit)', body: 'Credit page shows who owes you. Customers page manages profiles. Record payments from either screen.' },
  { icon: Printer, title: 'Print receipts', body: 'Settings → Printing: choose Thermal (58/80mm) or A4. On Android, RawBT avoids Bluetooth popups every reload.' },
  { icon: Wifi, title: 'Offline mode', body: 'Sales work offline and sync when internet returns. Watch the top banner for pending bills.' },
]

export default function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} title="Help"
        className="fixed bottom-20 md:bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-teal-600 text-white shadow-lg shadow-teal-600/30 flex items-center justify-center hover:bg-teal-500">
        <HelpCircle size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[90] bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900">Help & tips</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-3">
              {TOPICS.map(t => (
                <div key={t.title} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                  <t.icon size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.body}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-center text-gray-400 pt-2">support@marqueeflow.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
