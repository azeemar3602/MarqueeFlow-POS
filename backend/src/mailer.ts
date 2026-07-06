import nodemailer from 'nodemailer'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@marqueeflow.com'
const APP_URL = (process.env.APP_URL || 'https://pos.marqueeflow.com').replace(/\/$/, '')

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.hostinger.com',
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_PORT !== '587',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
})

const ENV_PREFIX = process.env.NODE_ENV !== 'production' ? '[STAGING] ' : ''

function canSend() {
  return !!(process.env.MAIL_USER && process.env.MAIL_PASS)
}

function send(to: string, subject: string, html: string) {
  if (!canSend()) return
  transporter.sendMail({
    from: `"MarqueeFlow POS" <${process.env.MAIL_USER || ADMIN_EMAIL}>`,
    to,
    subject: ENV_PREFIX + subject,
    html,
  }).catch(e => console.warn('[mailer]', e.message))
}

function sendAdmin(subject: string, html: string) {
  send(ADMIN_EMAIL, subject, html)
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px">${label}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;color:#111827">${value}</td></tr>`
}

function card(title: string, color: string, rows: string, extra = '', ctaUrl = `${APP_URL}/superadmin`, ctaLabel = 'Open Super Admin →') {
  return `
  <div style="font-family:sans-serif;max-width:540px;margin:0 auto;background:#f9fafb;padding:24px">
    <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
      <div style="background:${color};padding:16px 20px">
        <p style="margin:0;font-size:16px;font-weight:700;color:#fff">${title}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;padding:8px">${rows}</table>
      ${extra}
      <div style="padding:12px 20px;background:#f3f4f6;text-align:center">
        <a href="${ctaUrl}" style="background:#4f46e5;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;display:inline-block">${ctaLabel}</a>
      </div>
      <p style="padding:8px 20px 16px;margin:0;font-size:11px;color:#9ca3af;text-align:center">MarqueeFlow POS · support@marqueeflow.com</p>
    </div>
  </div>`
}

function ownerWelcomeHtml(opts: { name: string; plan: string; expires?: string }) {
  const steps = `
    <ol style="margin:12px 0 0;padding-left:20px;color:#374151;font-size:13px;line-height:1.8">
      <li>Complete shop settings (name, phone, receipt language)</li>
      <li>Add your first products</li>
      <li>Add a customer (optional for khata)</li>
      <li>Complete a test sale on POS</li>
    </ol>`
  return card('Your store is ready!', '#059669',
    row('Store', opts.name) +
    row('Plan', opts.plan) +
    (opts.expires ? row('Access until', opts.expires) : row('Access', 'Active')),
    `<div style="padding:12px 20px;border-top:1px solid #f3f4f6"><p style="margin:0;font-size:13px;font-weight:600;color:#374151">Quick start checklist</p>${steps}</div>`,
    `${APP_URL}/login`,
    'Sign in to MarqueeFlow POS →'
  )
}

export function mailNewRegistration(tenant: { name: string; slug: string; plan: string; email: string }) {
  sendAdmin(
    `🆕 New Registration: ${tenant.name}`,
    card('New Company Registration', '#4f46e5',
      row('Company', tenant.name) +
      row('Slug', tenant.slug) +
      row('Owner Email', tenant.email) +
      row('Plan', tenant.plan || 'trial') +
      row('Status', 'Pending approval')
    )
  )
}

export function mailPlanRequest(tenant: { name: string; slug: string }, from: string, to: string, fromSeats: number, toSeats: number) {
  const isUpgrade = toSeats > fromSeats
  sendAdmin(
    `${isUpgrade ? '⬆️ Upgrade' : '⬇️ Downgrade'} Request: ${tenant.name}`,
    card(`Plan ${isUpgrade ? 'Upgrade' : 'Downgrade'} Request`, isUpgrade ? '#059669' : '#d97706',
      row('Company', tenant.name) +
      row('Current Plan', `${from} (${fromSeats} user${fromSeats > 1 ? 's' : ''})`) +
      row('Requested Plan', `${to} (${toSeats} user${toSeats > 1 ? 's' : ''})`) +
      row('Action', 'Approve or reject in the Plans tab')
    )
  )
}

export function mailCompanyApproved(tenant: { name: string; slug: string; plan: string }) {
  sendAdmin(
    `✅ Company Approved: ${tenant.name}`,
    card('Company Approved', '#059669',
      row('Company', tenant.name) +
      row('Slug', tenant.slug) +
      row('Plan', tenant.plan || 'trial')
    )
  )
}

export function mailOwnerApproved(tenant: { name: string; plan: string; email: string; expiresAt?: Date | string | null }) {
  const exp = tenant.expiresAt ? new Date(tenant.expiresAt).toLocaleDateString('en-PK') : undefined
  send(tenant.email, `✅ ${tenant.name} is approved — sign in to MarqueeFlow POS`,
    ownerWelcomeHtml({ name: tenant.name, plan: tenant.plan || 'trial', expires: exp })
  )
}

export function mailCompanyRejected(tenant: { name: string; slug: string; reason?: string }) {
  sendAdmin(
    `❌ Company Rejected: ${tenant.name}`,
    card('Company Rejected', '#dc2626',
      row('Company', tenant.name) +
      row('Slug', tenant.slug) +
      row('Reason', tenant.reason || 'No reason given')
    )
  )
}

export function mailOwnerRejected(tenant: { name: string; email: string; reason?: string }) {
  send(tenant.email, `Registration update for ${tenant.name}`,
    card('Registration Not Approved', '#dc2626',
      row('Store', tenant.name) +
      row('Reason', tenant.reason || 'Please contact support for details.'),
      `<div style="padding:12px 20px;font-size:13px;color:#6b7280">Questions? Email <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></div>`,
      `mailto:${ADMIN_EMAIL}`,
      'Contact Support →'
    )
  )
}

export function mailUserDisabled(tenantName: string, userName: string, userEmail: string, reason: string) {
  sendAdmin(
    `🚫 User Disabled: ${userName} @ ${tenantName}`,
    card('User Disabled', '#d97706',
      row('Company', tenantName) +
      row('User', userName) +
      row('Email', userEmail) +
      row('Reason', reason)
    )
  )
}

export function mailTrialStarted(tenant: { name: string; email: string; plan: string }) {
  sendAdmin(
    `🎯 Trial Started: ${tenant.name}`,
    card('New Trial Started', '#7c3aed',
      row('Company', tenant.name) +
      row('Owner Email', tenant.email) +
      row('Plan', tenant.plan) +
      row('Duration', '7 days')
    )
  )
  send(tenant.email, `Welcome to MarqueeFlow POS — your 7-day trial is active`,
    ownerWelcomeHtml({ name: tenant.name, plan: 'trial', expires: new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-PK') })
  )
}

export function mailOwnerExpiryReminder(tenant: { name: string; email: string; daysLeft: number; expiresAt: string }) {
  send(tenant.email, `⏰ ${tenant.name} access expires in ${tenant.daysLeft} day${tenant.daysLeft === 1 ? '' : 's'}`,
    card('Access Expiring Soon', '#d97706',
      row('Store', tenant.name) +
      row('Expires', new Date(tenant.expiresAt).toLocaleDateString('en-PK')) +
      row('Days left', String(tenant.daysLeft)),
      `<div style="padding:12px 20px;font-size:13px;color:#6b7280">Contact us to renew your plan before access expires.</div>`,
      `mailto:${ADMIN_EMAIL}`,
      'Renew Access →'
    )
  )
}

export function mailOwnerPlanApproved(tenant: { name: string; email: string; plan: string; userLimit: number }) {
  send(tenant.email, `Plan upgraded to ${tenant.plan}`,
    card('Plan Upgrade Approved', '#059669',
      row('Store', tenant.name) +
      row('New plan', tenant.plan) +
      row('User seats', String(tenant.userLimit)),
      '',
      `${APP_URL}/login`,
      'Sign in →'
    )
  )
}
