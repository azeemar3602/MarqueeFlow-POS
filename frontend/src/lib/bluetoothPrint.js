// ESC/POS Bluetooth thermal printer support
// Supports most BLE thermal printers common in Pakistani market (Goojprt, Peripage, generic)

const ESC = 0x1B
const GS  = 0x1D
const LF  = 0x0A

const CMD = {
  init:        [ESC, 0x40],
  alignLeft:   [ESC, 0x61, 0x00],
  alignCenter: [ESC, 0x61, 0x01],
  alignRight:  [ESC, 0x61, 0x02],
  boldOn:      [ESC, 0x45, 0x01],
  boldOff:     [ESC, 0x45, 0x00],
  dblHeightOn: [GS,  0x21, 0x10],
  dblSizeOn:   [GS,  0x21, 0x11],
  normalSize:  [GS,  0x21, 0x00],
  feed3:       [ESC, 0x64, 0x03],
  cut:         [GS,  0x56, 0x42, 0x03],
}

// Known BLE service/characteristic UUIDs for thermal printers
const BLE_PROFILES = [
  // Generic Chinese thermal (most common)
  { service: '000018f0-0000-1000-8000-00805f9b34fb', char: '00002af1-0000-1000-8000-00805f9b34fb' },
  // Peripage / Paperang style
  { service: 'e7810a71-73ae-499d-8c15-faa9aef0c3f2', char: 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f' },
  // Microchip serial
  { service: '49535343-fe7d-4ae5-8fa9-9fafd205e455', char: '49535343-8841-43f4-a8d4-ecbe34729bb3' },
  // Nordic UART
  { service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e', char: '6e400002-b5a3-f393-e0a9-e50e24dcca9e' },
]

function textToBytes(str) {
  return new TextEncoder().encode(str)
}

function buildESCPOS(sale, settings) {
  const s   = settings || {}
  // Char columns at Font A: 58mm printers = 32, 80mm printers = 48 (full width).
  const cols = Number(s.paperWidth) === 58 ? 32 : 48

  // Plain 2-decimal number for the invoice table/totals (currency is implied,
  // matching the reference invoice layout). e.g. 100 -> "100.00", 1200 -> "1,200.00"
  function num(n) {
    return Number(n || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  function divider(ch = '-') { return ch.repeat(cols) + '\n' }
  // Fit a string into a fixed-width column, left or right aligned.
  function fit(str, w, align) {
    str = String(str == null ? '' : str)
    if (str.length > w) str = str.slice(0, w)
    return align === 'r' ? str.padStart(w) : str.padEnd(w)
  }
  // Two-column line: label left, value right, filling the full width.
  function row(left, right, w = cols) {
    left = String(left); right = String(right)
    const gap = w - left.length - right.length
    return left + (gap > 0 ? ' '.repeat(gap) : ' ') + right + '\n'
  }
  // Four-column item line: Item | Qty | Rate | Amount.
  const COLW = cols >= 48 ? [22, 6, 9, 11] : [12, 5, 7, 8]
  function row4(a, b, c, d) {
    return fit(a, COLW[0], 'l') + fit(b, COLW[1], 'r') + fit(c, COLW[2], 'r') + fit(d, COLW[3], 'r') + '\n'
  }

  const chunks = []
  const push = (...args) => { for (const a of args) chunks.push(a) }

  push(CMD.init)

  // ── Header ───────────────────────────────────────────────
  push(CMD.alignCenter, CMD.dblSizeOn, CMD.boldOn)
  push(textToBytes((s.shopName || 'RetailPOS') + '\n'))
  push(CMD.normalSize, CMD.boldOff)
  if (s.tagline) push(textToBytes(s.tagline + '\n'))
  if (s.address) push(textToBytes(s.address + '\n'))
  if (s.phone)   push(textToBytes('Phone: ' + s.phone + '\n'))
  if (s.gstin)   push(textToBytes('GSTIN: ' + s.gstin + '\n'))
  push(CMD.alignLeft)
  push(textToBytes(divider('-')))

  // ── INVOICE title ────────────────────────────────────────
  push(CMD.alignCenter, CMD.boldOn)
  push(textToBytes('INVOICE\n'))
  push(CMD.boldOff, CMD.alignLeft)
  push(textToBytes(divider('-')))

  // ── Meta (Invoice No / Date / Time / Cashier) ────────────
  const d        = new Date(sale.created_at || Date.now())
  const dateStr  = d.toLocaleDateString('en-GB')
  const timeStr  = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const invNo    = 'INV-' + String(sale.id).padStart(6, '0')
  const cashier  = (s.showCashier && sale.cashierName) ? sale.cashierName : ''
  if (cols >= 48) {
    push(textToBytes(row('Invoice No : ' + invNo, 'Date : ' + dateStr)))
    push(textToBytes(row('Time : ' + timeStr, cashier ? 'Cashier : ' + cashier : '')))
  } else {
    push(textToBytes('Invoice No : ' + invNo + '\n'))
    push(textToBytes('Date : ' + dateStr + '   Time : ' + timeStr + '\n'))
    if (cashier) push(textToBytes('Cashier : ' + cashier + '\n'))
  }
  if (s.showCustomer && sale.customerName) push(textToBytes('Customer : ' + sale.customerName + '\n'))
  push(textToBytes(divider('-')))

  // ── Item table ───────────────────────────────────────────
  push(CMD.boldOn)
  push(textToBytes(row4('Item', 'Qty', 'Rate', 'Amount')))
  push(CMD.boldOff)
  push(textToBytes(divider('-')))
  for (const it of (sale.items || [])) {
    const name = s.showName  ? String(it.product_name || '') : ''
    const qty  = s.showQty   ? String(Number(it.qty)) : ''
    const rate = s.showRate  ? num(it.unit_price) : ''
    const amt  = s.showTotal ? num(it.subtotal) : ''
    push(textToBytes(row4(name, qty, rate, amt)))
  }
  push(textToBytes(divider('-')))

  // ── Totals ───────────────────────────────────────────────
  push(textToBytes(row('Subtotal', num(sale.subtotal))))
  const disc = Number(sale.discount)
  if (disc > 0) push(textToBytes(row('Discount', '-' + num(disc))))
  const taxPct = Number(s.taxPercent)
  if (taxPct > 0) push(textToBytes(row('Tax (' + taxPct.toFixed(2) + '%)', num(Number(sale.subtotal) * taxPct / 100))))
  push(textToBytes(divider('-')))

  push(CMD.boldOn, CMD.dblHeightOn)
  push(textToBytes(row('TOTAL', num(sale.total))))
  push(CMD.normalSize, CMD.boldOff)
  push(textToBytes(divider('-')))

  // ── Payment ──────────────────────────────────────────────
  const pm = (sale.payment_method || 'cash')
  push(textToBytes(row('Payment Mode', pm.charAt(0).toUpperCase() + pm.slice(1))))
  push(textToBytes(row('Amount Paid', num(sale.paid))))
  const credit = Number(sale.total) - Number(sale.paid)
  const change = Number(sale.paid) - Number(sale.total)
  if (change > 0) push(textToBytes(row('Change', num(change))))
  if (credit > 0) push(textToBytes(row('Balance/Credit', num(credit))))
  push(textToBytes(divider('-')))

  // ── Footer ───────────────────────────────────────────────
  push(CMD.alignCenter)
  push(textToBytes((s.footer || 'Thank you for your purchase!') + '\n'))
  if (s.footer2) push(textToBytes(s.footer2 + '\n'))
  push(CMD.feed3)
  push(CMD.cut)

  // Merge all into single Uint8Array
  const arrays = chunks.map(c => Array.isArray(c) ? new Uint8Array(c) : c instanceof Uint8Array ? c : new Uint8Array(0))
  const total_len = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total_len)
  let offset = 0
  for (const a of arrays) { out.set(a, offset); offset += a.length }
  return out
}

async function findWriteChar(server) {
  for (const profile of BLE_PROFILES) {
    try {
      const service = await server.getPrimaryService(profile.service)
      const char    = await service.getCharacteristic(profile.char)
      return char
    } catch { /* try next */ }
  }
  // Fallback: scan all services for a writable characteristic
  try {
    const services = await server.getPrimaryServices()
    for (const svc of services) {
      const chars = await svc.getCharacteristics()
      for (const c of chars) {
        if (c.properties.write || c.properties.writeWithoutResponse) return c
      }
    }
  } catch {}
  return null
}

// Remembers the chosen printer so we don't re-show the pairing chooser every
// print. Survives within the session via this var, and across page reloads via
// navigator.bluetooth.getDevices() (permission persists per-origin in Chrome).
let cachedDevice = null

async function resolveDevice(printerNameHint) {
  // 1) Same-session reuse
  if (cachedDevice) return cachedDevice

  // 2) Previously-granted devices (survives reload, no chooser shown)
  if (navigator.bluetooth.getDevices) {
    try {
      const known = await navigator.bluetooth.getDevices()
      if (known && known.length) {
        const match = (printerNameHint && known.find(d => d.name === printerNameHint)) || known[0]
        if (match) {
          cachedDevice = match
          match.addEventListener('gattserverdisconnected', () => {})
          return match
        }
      }
    } catch { /* fall through to chooser */ }
  }
  return null
}

export async function printViaBluetooth(sale, settings, printerNameHint) {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth is not supported on this browser. Please use Chrome on Android.')
  }
  const optionalServices = BLE_PROFILES.map(p => p.service)

  async function chooseDevice() {
    const requestOpts = printerNameHint
      ? { filters: [{ name: printerNameHint }], optionalServices }
      : { acceptAllDevices: true, optionalServices }
    const d = await navigator.bluetooth.requestDevice(requestOpts)
    cachedDevice = d
    d.addEventListener('gattserverdisconnected', () => {})
    return d
  }

  let device = await resolveDevice(printerNameHint)
  let server
  try {
    if (!device) device = await chooseDevice()   // first time only — chooser shows ONCE
    server = device.gatt.connected ? device.gatt : await device.gatt.connect()
  } catch (e) {
    // Remembered printer is gone/off — forget it and ask the user to pick once more
    cachedDevice = null
    device = await chooseDevice()
    server = await device.gatt.connect()
  }
  const char   = await findWriteChar(server)
  if (!char) {
    server.disconnect()
    throw new Error('Could not find a writable characteristic on this printer. Make sure it is a supported thermal printer.')
  }
  const data   = buildESCPOS(sale, settings)
  const MTU    = 512
  const write  = char.properties.writeWithoutResponse ? 'writeValueWithoutResponse' : 'writeValueWithResponse'
  for (let i = 0; i < data.length; i += MTU) {
    await char[write](data.slice(i, i + MTU))
    // Small delay between chunks to avoid buffer overflow
    await new Promise(r => setTimeout(r, 30))
  }
  server.disconnect()
}

export { buildESCPOS as buildESCPOSData }
