import { Router } from 'express'
import { pool } from '../db'
import { auth, requireRole } from '../auth'

const r = Router()
r.use(auth)

export const DEFAULT_SETTINGS = {
  shopName: '',
  phone: '',
  address: '',
  footer: 'Thank you for your business!',
  printFormat: 'thermal',      // 'thermal' | 'a4' | 'a5'
  paperWidth: 80,              // thermal mm (58 or 80)
  showName: true,
  showQty: true,
  showRate: true,
  showTotal: true,
  showCustomer: true,
  requireCustomer: false,
  showCashier: true,
  currency: 'PKR',
  taxPercent: 0,
  language: 'en',
  trackStock: true,
  onboardingComplete: false,
  onboardingProgress: {},
  defaultPaymentMethod: 'cash',
  printMethod: 'rawbt', // rawbt | bluetooth | browser
}

r.get('/', async (req, res) => {
  const { tenantId } = (req as any).user
  const [rows]: any = await pool.query('SELECT data FROM tenant_settings WHERE tenant_id=?', [tenantId])
  const [t]: any = await pool.query('SELECT name FROM tenants WHERE id=?', [tenantId])
  let data: any = {}
  if (rows.length) {
    try { data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data } catch { data = {} }
  }
  const merged = { ...DEFAULT_SETTINGS, shopName: t[0]?.name || 'MarqueeFlow POS', ...data }
  res.json(merged)
})

r.put('/', requireRole('owner', 'manager'), async (req, res) => {
  const { tenantId } = (req as any).user
  const incoming = req.body || {}
  // whitelist only known keys
  const clean: any = { ...DEFAULT_SETTINGS }
  for (const k of Object.keys(DEFAULT_SETTINGS)) {
    if (incoming[k] !== undefined) clean[k] = incoming[k]
  }
  await pool.query(
    'INSERT INTO tenant_settings (tenant_id, data) VALUES (?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)',
    [tenantId, JSON.stringify(clean)]
  )
  res.json(clean)
})

// POST /settings/sample-data — demo products for new stores (owner only)
r.post('/sample-data', requireRole('owner'), async (req, res) => {
  const { tenantId } = (req as any).user
  const [cnt]: any = await pool.query('SELECT COUNT(*) c FROM products WHERE tenant_id=?', [tenantId])
  if (Number(cnt[0].c) > 0) return res.status(400).json({ error: 'Sample data only available on empty inventory' })
  const samples = [
    { name: 'Coca Cola 500ml', barcode: '8901030865123', sale: 120, cost: 95, stock: 48 },
    { name: 'Lay\'s Chips 50g', barcode: '8901491100123', sale: 50, cost: 38, stock: 24 },
    { name: 'Fresh Milk 1L', barcode: '8901000123456', sale: 280, cost: 240, stock: 12 },
    { name: 'Bread Loaf', barcode: '8901000987654', sale: 150, cost: 110, stock: 8 },
  ]
  for (const s of samples) {
    await pool.query(
      'INSERT INTO products (tenant_id, name, barcode, sale_price, cost_price, stock_qty, low_stock_at, is_favorite) VALUES (?,?,?,?,?,?,5,?)',
      [tenantId, s.name, s.barcode, s.sale, s.cost, s.stock, s.name.includes('Coca') ? 1 : 0]
    )
  }
  await pool.query(
    'INSERT INTO customers (tenant_id, name, phone, credit_balance) VALUES (?,?,?,?)',
    [tenantId, 'Walk-in Customer Demo', '03001234567', 0]
  )
  res.json({ ok: true, products: samples.length, message: 'Sample products added' })
})

export default r
