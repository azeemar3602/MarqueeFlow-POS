import { Router } from 'express'
import { pool } from '../db'

const r = Router()

// Public supplier payable statement (shareable link, no auth)
r.get('/payable/:token', async (req, res) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT s.id, s.name, s.phone, s.address, s.balance, s.created_at,
              t.name AS shop_name
       FROM suppliers s
       JOIN tenants t ON t.id = s.tenant_id
       WHERE s.public_token = ? LIMIT 1`,
      [req.params.token]
    )
    if (!rows.length) return res.status(404).json({ error: 'Link not found or expired' })
    const supplier = rows[0]
    const [ledger]: any = await pool.query(
      'SELECT type, amount, balance_after, note, created_at FROM supplier_ledger WHERE supplier_id=? ORDER BY created_at DESC LIMIT 50',
      [supplier.id]
    )
    res.json({ supplier, ledger })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

export default r
