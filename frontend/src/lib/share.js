/** Build WhatsApp share URL (works on mobile + desktop web.whatsapp.com) */
export function whatsAppShare(text) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(text)
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function whatsAppCustomerStatement(customer, balance) {
  const lines = [
    `*Customer Statement*`,
    customer.name,
    customer.phone ? `Phone: ${customer.phone}` : '',
    `Outstanding: PKR ${Number(balance || 0).toLocaleString()}`,
    '',
    'Powered by MarqueeFlow POS',
  ].filter(Boolean)
  whatsAppShare(lines.join('\n'))
}

export function whatsAppSupplierStatement(supplier, balance, publicLink) {
  const lines = [
    `*Payable Statement*`,
    supplier.name,
    supplier.phone ? `Phone: ${supplier.phone}` : '',
    `Amount payable: PKR ${Number(balance || 0).toLocaleString()}`,
    publicLink ? `\nView details: ${publicLink}` : '',
    '',
    'MarqueeFlow POS',
  ].filter(Boolean)
  whatsAppShare(lines.join('\n'))
}
