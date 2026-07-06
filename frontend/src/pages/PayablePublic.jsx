import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const PKR = n => 'PKR ' + Number(n || 0).toLocaleString()

export default function PayablePublic() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/public/payable/' + token)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'This link is invalid or has expired.'))
  }, [token])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔗</p>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Link unavailable</h1>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { supplier, ledger } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white px-4 py-6">
        <p className="text-indigo-200 text-sm">{supplier.shop_name}</p>
        <h1 className="text-xl font-bold mt-1">Payable Statement</h1>
        <p className="text-indigo-100 text-sm mt-2">{supplier.name}{supplier.phone ? ' · ' + supplier.phone : ''}</p>
      </div>
      <div className="p-4 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 text-center">
          <p className="text-sm text-gray-500">Amount payable to you</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-1">{PKR(supplier.balance)}</p>
        </div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent transactions</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {ledger.length === 0 && <p className="p-6 text-center text-gray-400 text-sm">No transactions yet</p>}
          {ledger.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-gray-800 capitalize">{l.type}</p>
                <p className="text-xs text-gray-400">{new Date(l.created_at).toLocaleString('en-PK')}{l.note ? ' · ' + l.note : ''}</p>
              </div>
              <p className={Number(l.amount) > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-600 font-semibold'}>
                {Number(l.amount) > 0 ? '+' : ''}{PKR(Math.abs(l.amount))}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by MarqueeFlow POS</p>
      </div>
    </div>
  )
}
