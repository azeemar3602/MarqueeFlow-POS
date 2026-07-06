import {
  Sparkles, Smartphone, Settings, Package, ShoppingCart, Users,
  CreditCard, Receipt, BarChart2, Printer, Wifi, Truck, UserCheck,
} from 'lucide-react'

/** Guided setup steps — covers main app flows for web browser & installed PWA. */
export const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    path: null,
    icon: Sparkles,
    title: 'Welcome — how MarqueeFlow POS works',
    titleUr: 'خوش آمدید — MarqueeFlow POS کیسے کام کرتا ہے',
    summary: 'Your shop runs from one app: bill on POS, track stock, manage customer credit (khata), and see daily reports.',
    summaryUr: 'آپ ki دکان ایک app سے چلے گی: POS پر بل، stock، customer khata، اور daily reports۔',
    instructions: [
      { en: 'Use the dark sidebar (web) or bottom tabs (phone) to move between screens.', app: 'On phone, use the 5 icons at the bottom — POS, Products, Customers, Credit, Sales.', ur: 'فون پر نیچے 5 icons سے screens بدلیں۔' },
      { en: 'Everything works offline — bills sync when internet returns.', ur: 'Internet نہ ہو تو بھی billing چلتی ہے — connection آنے پر sync ہو جاتی ہے۔' },
      { en: 'Complete each step below — you can return to this guide anytime from the ? help button.', ur: 'ہر step مکمل کریں — بعد میں ? help سے دوبارہ کھول سکتے ہیں۔' },
    ],
  },
  {
    id: 'install',
    path: null,
    icon: Smartphone,
    title: 'Install the app on your phone',
    titleUr: 'فون پر app انسٹال کریں',
    summary: 'Install MarqueeFlow POS like a native app — faster access, works offline, no browser bar.',
    summaryUr: 'MarqueeFlow POS کو native app کی طرح install کریں — تیز، offline، بغیر browser bar۔',
    instructions: [
      { en: 'On Android Chrome: tap menu (⋮) → “Install app” or “Add to Home screen”.', app: 'If you see “Download App” in the sidebar footer, tap it to install.', ur: 'Android Chrome: menu (⋮) → Install app یا Add to Home screen۔' },
      { en: 'On iPhone Safari: tap Share → “Add to Home Screen”.', app: 'Open in Safari (not Chrome) for Add to Home Screen on iOS.', ur: 'iPhone Safari: Share → Add to Home Screen۔' },
      { en: 'Already installed? Mark this step done — you’re good to go.', ur: 'پہلے سے install ہے؟ Done دبائیں۔' },
    ],
    action: 'install',
  },
  {
    id: 'settings',
    path: '/settings',
    icon: Settings,
    title: 'Set up your shop & receipt',
    titleUr: 'Shop name اور receipt سیٹ کریں',
    summary: 'Add your shop name, phone, address, and choose how receipts print.',
    summaryUr: 'Shop name، phone، address اور receipt format سیٹ کریں۔',
    instructions: [
      { en: 'Go to Settings → fill Shop Name, Phone, and Address.', app: 'Menu → Settings → shop details at the top.', ur: 'Settings → Shop Name، Phone، Address بھریں۔' },
      { en: 'Pick Print Format: Thermal (58/80mm) for receipt printer, or A4 for office printer.', ur: 'Thermal (58/80mm) receipt printer کے لیے، A4 office printer کے لیے۔' },
      { en: 'On Android with thermal printer: set Print Method to RawBT to avoid Bluetooth popups.', ur: 'Android thermal: Print Method = RawBT بہتر ہے۔' },
      { en: 'Scroll down to preview how your receipt will look.', ur: 'نیچے receipt preview دیکھیں۔' },
    ],
  },
  {
    id: 'products',
    path: '/products',
    icon: Package,
    title: 'Add your products',
    titleUr: 'Products شامل کریں',
    summary: 'Your inventory powers POS — add items with sale price, cost, and stock quantity.',
    summaryUr: 'Inventory POS چلاتی ہے — sale price، cost، stock شامل کریں۔',
    instructions: [
      { en: 'Go to Products → tap “+ Add Product”.', app: 'Bottom menu may not show Products — open ☰ sidebar → Products.', ur: 'Products → + Add Product۔' },
      { en: 'Enter name, sale price, and stock qty. Add barcode if you scan items.', ur: 'Name، sale price، stock — barcode scan کے لیے optional۔' },
      { en: 'Tap the ⭐ star on a product to show it on POS quick tiles.', ur: '⭐ star دبائیں تو POS پر quick tile بن جائے گا۔' },
      { en: 'New shop? Use “Load sample products” in this guide for a quick demo.', ur: 'Demo کے لیے guide میں sample products load کریں۔' },
    ],
    action: 'samples',
  },
  {
    id: 'pos',
    path: '/',
    icon: ShoppingCart,
    title: 'Make your first sale (POS)',
    titleUr: 'پہلا sale (POS)',
    summary: 'The POS screen is your billing counter — tap products, take payment, print receipt.',
    summaryUr: 'POS آپ کا billing counter ہے — product tap، payment، receipt۔',
    instructions: [
      { en: 'Open POS (home screen). Search or tap a product to add to cart.', app: 'POS is the first bottom tab on mobile.', ur: 'POS کھولیں — product tap کریں cart میں۔' },
      { en: 'Adjust quantity with + / −. Set discount if needed.', ur: 'Quantity + / − سے، discount optional۔' },
      { en: 'Choose payment: Cash, Card, or Credit (udhaar/khata).', ur: 'Cash، Card، یا Credit (udhaar)۔' },
      { en: 'Tap Complete Sale → print or share receipt.', ur: 'Complete Sale → receipt print یا share۔' },
      { en: 'Camera button scans barcodes — great for packaged goods.', ur: 'Camera button barcode scan کرتا ہے۔' },
    ],
  },
  {
    id: 'customers',
    path: '/customers',
    icon: Users,
    title: 'Add customers',
    titleUr: 'Customers شامل کریں',
    summary: 'Customer profiles let you track credit, phone numbers, and sale history.',
    summaryUr: 'Customer profiles سے credit اور history track ہوتی ہے۔',
    instructions: [
      { en: 'Go to Customers → Add Customer with name and phone.', ur: 'Customers → name اور phone شامل کریں۔' },
      { en: 'On POS you can pick a customer before completing sale for credit bills.', ur: 'POS پر sale سے پہلے customer select کریں credit bill کے لیے۔' },
      { en: 'Optional at checkout — walk-in sales work without a customer.', ur: 'Walk-in sale بغیر customer کے بھی ہو سکتی ہے۔' },
    ],
  },
  {
    id: 'credit',
    path: '/credit',
    icon: CreditCard,
    title: 'Track credit (Khata / Udhaar)',
    titleUr: 'Credit (کھاتہ / udhaar)',
    summary: 'See who owes you money, record payments, and share statements on WhatsApp.',
    summaryUr: 'دیکھیں کس پر کتna udhaar ہے، payment record کریں، WhatsApp share کریں۔',
    instructions: [
      { en: 'Credit page lists customers with outstanding balance.', ur: 'Credit page پر balance والے customers۔' },
      { en: 'Tap a customer → Record Payment when they pay you back.', ur: 'Customer tap → Record Payment جب پیسے واپس آئیں۔' },
      { en: 'Use “Share on WhatsApp” to send their statement.', ur: 'WhatsApp share سے statement بھیجیں۔' },
      { en: 'Credit sales are made from POS by choosing Credit as payment method.', ur: 'POS پر payment = Credit سے udhaar sale بنتی ہے۔' },
    ],
  },
  {
    id: 'payables',
    path: '/payables',
    icon: Truck,
    title: 'Supplier payables (optional)',
    titleUr: 'Supplier payables (optional)',
    summary: 'Track money you owe suppliers — useful for wholesale and inventory purchases.',
    summaryUr: 'Suppliers کو دینے والے پیسے track کریں۔',
    instructions: [
      { en: 'Go to Payables → add suppliers you buy stock from.', ur: 'Payables → suppliers شامل کریں۔' },
      { en: 'Record purchases and payments to keep supplier balance accurate.', ur: 'Purchase اور payment record کریں balance کے لیے۔' },
      { en: 'Share a public link so supplier can view their statement.', ur: 'Public link share کریں supplier statement کے لیے۔' },
    ],
    optional: true,
  },
  {
    id: 'sales',
    path: '/sales',
    icon: Receipt,
    title: 'Sales history & receipts',
    titleUr: 'Sales history',
    summary: 'Review past bills, reprint receipts, or edit a sale if you made a mistake.',
    summaryUr: 'پurani bills، reprint، یا edit۔',
    instructions: [
      { en: 'Sales page shows all completed invoices.', ur: 'Sales page پر تمام bills۔' },
      { en: 'Tap a bill to view details, reprint, or edit (if allowed).', ur: 'Bill tap → details، reprint، edit۔' },
      { en: 'POS also has “Recent Bills” for quick access to today’s sales.', ur: 'POS پر Recent Bills آج ki sales کے لیے۔' },
    ],
  },
  {
    id: 'reports',
    path: '/reports',
    icon: BarChart2,
    title: 'Daily reports',
    titleUr: 'Daily reports',
    summary: 'End-of-day numbers — total sales, cash vs credit, top products.',
    summaryUr: 'دن کا حساب — total sales، cash vs credit، top products۔',
    instructions: [
      { en: 'Open Reports → pick Today or a date range.', ur: 'Reports → Today یا date range۔' },
      { en: 'Check cash vs credit split before closing the shop.', ur: 'Shop band کرنے سے پہلے cash vs credit دیکھیں۔' },
      { en: 'Top products helps you reorder stock.', ur: 'Top products سے stock reorder کریں۔' },
    ],
  },
  {
    id: 'team',
    path: '/team',
    icon: UserCheck,
    title: 'Add staff (Team)',
    titleUr: 'Staff (Team)',
    summary: 'Create cashier or manager logins with limited permissions.',
    summaryUr: 'Cashier/manager login limited permissions کے ساتھ۔',
    instructions: [
      { en: 'Team → Add User with name, phone, password, and role.', ur: 'Team → Add User — role select کریں۔' },
      { en: 'Cashiers can bill but may not see reports or change settings.', ur: 'Cashier bill کر سکta ہے، settings نہیں۔' },
      { en: 'Your plan limits how many users you can add.', ur: 'Plan کے مطابق users limit ہے۔' },
    ],
  },
  {
    id: 'offline',
    path: null,
    icon: Wifi,
    title: 'Offline mode',
    titleUr: 'Offline mode',
    summary: 'No internet? Keep selling — bills queue locally and sync automatically.',
    summaryUr: 'Internet نہیں؟ billing جاری — bills local save، بعد میں sync۔',
    instructions: [
      { en: 'Red banner at top = offline. Sales still work normally.', ur: 'Red banner = offline — sales چلتی رہیں گی۔' },
      { en: 'Amber banner shows pending bills waiting to sync — tap to sync now.', ur: 'Amber banner = pending sync — tap کریں sync کے لیے۔' },
      { en: 'Best on installed app — opens faster and caches products locally.', ur: 'Installed app بہتر — products cache ہوتے ہیں۔' },
    ],
  },
  {
    id: 'printing',
    path: '/settings',
    icon: Printer,
    title: 'Printing tips',
    titleUr: 'Printing tips',
    summary: 'Thermal receipts, Urdu text, Bluetooth vs RawBT on Android.',
    summaryUr: 'Thermal receipt، Urdu، Android Bluetooth/RawBT۔',
    instructions: [
      { en: 'Settings → Printing: choose 58mm or 80mm paper width.', ur: 'Settings → 58mm یا 80mm paper۔' },
      { en: 'Urdu shop name on receipt works on thermal printers.', ur: 'Urdu shop name thermal پر print ہوتا ہے۔' },
      { en: 'Android: RawBT app + Print Method “RawBT” avoids pairing every reload.', ur: 'Android: RawBT app install کریں settings میں select کریں۔' },
      { en: 'Test print from any completed sale → Print button on receipt.', ur: 'Test: sale complete → Print۔' },
    ],
  },
]

export const STEP_IDS = ONBOARDING_STEPS.map(s => s.id)

export function emptyProgress() {
  return Object.fromEntries(STEP_IDS.map(id => [id, false]))
}

export function countDone(progress) {
  if (!progress) return 0
  return STEP_IDS.filter(id => progress[id]).length
}

export function allRequiredDone(progress) {
  const required = ONBOARDING_STEPS.filter(s => !s.optional)
  return required.every(s => progress?.[s.id])
}

export function pathForStep(stepId) {
  return ONBOARDING_STEPS.find(s => s.id === stepId)?.path ?? null
}
