const KEY = 'mf_pos_recent_products'
const MAX = 12

export function getRecentProductIds() {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr.map(Number).filter(Boolean) : []
  } catch { return [] }
}

export function pushRecentProduct(productId) {
  const id = Number(productId)
  if (!id) return
  const ids = getRecentProductIds().filter(x => x !== id)
  ids.unshift(id)
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)))
}

export function resolveRecentProducts(allProducts) {
  const ids = getRecentProductIds()
  const map = new Map(allProducts.map(p => [p.id, p]))
  return ids.map(id => map.get(id)).filter(Boolean)
}
