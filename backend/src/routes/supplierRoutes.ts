import { Router } from 'express'
import crypto from 'crypto'
import { pool } from '../db'
import { auth } from '../auth'

const r = Router()
r.use(auth)

function newToken() {
  return crypto.randomBytes(24).toString('hex')
}

r.get('/', async (req, res) => {
  const { tenantId } = (req as any).user
  const { search } = req.query
  let q = 'SELECT * FROM suppliers WHERE tenant_id=?'
  const params: any[] = [tenantId]
  if (search) { q += ' AND (name LIKE ? OR phone LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
  q += ' ORDER BY name LIMIT 200'
  const [rows]: any = await pool.query(q, params)
  res.json(rows)
})

r.post('/', async (req, res) => {
  const { tenantId } = (req as any).user
  const { name, phone, address, opening_balance } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const ob = Number(opening_balance) || 0
  const token = newToken()
  const [result]: any = await pool.query(
    'INSERT INTO suppliers (tenant_id, name, phone, address, balance, public_token) VALUES (?,?,?,?,?,?)',
    [tenantId, name, phone || null, address || null, ob, token]
  )
  if (ob > 0) {
    await pool.query(
      'INSERT INTO supplier_ledger (tenant_id, supplier_id, type, amount, balance_after, note) VALUES (?,?,?,?,?,?)',
      [tenantId, result.insertId, 'adjustment', ob, ob, 'Opening balance']
    )
  }
  res.json({ id: result.insertId, name, phone, address, balance: ob, public_token: token })
})

r.put('/:id', async (req, res) => {
  const { tenantId } = (req as any).user
  const { name, phone, address } = req.body
  await pool.query(
    'UPDATE suppliers SET name=?, phone=?, address=? WHERE id=? AND tenant_id=?',
    [name, phone || null, address || null, req.params.id, tenantId]
  )
  res.json({ ok: true })
})

r.post('/:id/rotate-token', async (req, res) => {
  const { tenantId } = (req as any).user
  const token = newToken()
  const [r2]: any = await pool.query(
    'UPDATE suppliers SET public_token=? WHERE id=? AND tenant_id=?',
    [token, req.params.id, tenantId]
  )
  if (!r2.affectedRows) return res.status(404).json({ error: 'Not found' })
  res.json({ public_token: token })
})

r.get('/:id/ledger', async (req, res) => {
  const { tenantId } = (req as any).user
  const [supplier]: any = await pool.query('SELECT * FROM suppliers WHERE id=? AND tenant_id=?', [req.params.id, tenantId])
  if (!supplier.length) return res.status(404).json({ error: 'Not found' })
  const [ledger]: any = await pool.query(
    'SELECT * FROM supplier_ledger WHERE supplier_id=? AND tenant_id=? ORDER BY created_at DESC LIMIT 100',
    [req.params.id, tenantId]
  )
  res.json({ supplier: supplier[0], ledger })
})

r.post('/:id/payment', async (req, res) => {
  const { tenantId } = (req as any).user
  const { amount, note } = req.body
  const amt = Number(amount)
  if (!amt || amt <= 0) return res.status(400).json({ error: 'Invalid amount' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows]: any = await conn.query('SELECT balance FROM suppliers WHERE id=? AND tenant_id=? FOR UPDATE', [req.params.id, tenantId])
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ error: 'Not found' }) }
    const newBalance = Number(rows[0].balance || 0) - amt
    await conn.query('UPDATE suppliers SET balance=? WHERE id=?', [newBalance, req.params.id])
    await conn.query(
      'INSERT INTO supplier_ledger (tenant_id, supplier_id, type, amount, balance_after, note) VALUES (?,?,?,?,?,?)',
      [tenantId, req.params.id, 'payment', -amt, newBalance, note || 'Payment made']
    )
    await conn.commit()
    res.json({ ok: true, newBalance })
  } catch (e: any) { await conn.rollback(); res.status(500).json({ error: e.message }) }
  finally { conn.release() }
})

r.post('/:id/adjust', async (req, res) => {
  const { tenantId } = (req as any).user
  const { amount, note } = req.body
  const amt = Number(amount)
  if (!amt) return res.status(400).json({ error: 'Invalid amount' })
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows]: any = await conn.query('SELECT balance FROM suppliers WHERE id=? AND tenant_id=? FOR UPDATE', [req.params.id, tenantId])
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ error: 'Not found' }) }
    const newBalance = Number(rows[0].balance || 0) + amt
    await conn.query('UPDATE suppliers SET balance=? WHERE id=?', [newBalance, req.params.id])
    await conn.query(
      'INSERT INTO supplier_ledger (tenant_id, supplier_id, type, amount, balance_after, note) VALUES (?,?,?,?,?,?)',
      [tenantId, req.params.id, amt > 0 ? 'purchase' : 'adjustment', amt, newBalance, note || (amt > 0 ? 'Purchase / charge' : 'Adjustment')]
    )
    await conn.commit()
    res.json({ ok: true, newBalance })
  } catch (e: any) { await conn.rollback(); res.status(500).json({ error: e.message }) }
  finally { conn.release() }
})

r.delete('/:id', async (req, res) => {
  const { tenantId } = (req as any).user
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const [rows]: any = await conn.query('SELECT balance FROM suppliers WHERE id=? AND tenant_id=? FOR UPDATE', [req.params.id, tenantId])
    if (!rows.length) { await conn.rollback(); return res.status(404).json({ error: 'Not found' }) }
    if (Number(rows[0].balance || 0) !== 0) {
      await conn.rollback()
      return res.status(400).json({ error: 'Clear the payable balance before deleting this supplier.' })
    }
    await conn.query('DELETE FROM supplier_ledger WHERE supplier_id=? AND tenant_id=?', [req.params.id, tenantId])
    await conn.query('DELETE FROM suppliers WHERE id=? AND tenant_id=?', [req.params.id, tenantId])
    await conn.commit()
    res.json({ ok: true })
  } catch (e: any) { await conn.rollback(); res.status(500).json({ error: e.message }) }
  finally { conn.release() }
})

export default r
