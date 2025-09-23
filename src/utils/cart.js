export function getCartKey(userId = (localStorage.getItem('user_id') || 'guest')) {
  const uid = String(userId || 'guest')
  return `cart:${uid}`
}

export function readCart(userId) {
  try {
    const raw = localStorage.getItem(getCartKey(userId))
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeCart(cart, userId) {
  localStorage.setItem(getCartKey(userId), JSON.stringify(cart || []))
  window.dispatchEvent(new Event('cart:updated'))
}

export function clearCart(userId) {
  localStorage.removeItem(getCartKey(userId))
  window.dispatchEvent(new Event('cart:updated'))
}

export function countItems(userId) {
  const cart = readCart(userId)
  return cart.reduce((sum, it) => sum + Number(it.qty || 0), 0)
}

// Migrate guest cart to user cart once after login
export function migrateGuestCartIfAny() {
  const userId = localStorage.getItem('user_id')
  if (!userId) return
  const guestKey = getCartKey('guest')
  const userKey = getCartKey(userId)
  try {
    const guest = JSON.parse(localStorage.getItem(guestKey) || '[]')
    const user = JSON.parse(localStorage.getItem(userKey) || '[]')
    if (Array.isArray(guest) && guest.length && (!Array.isArray(user) || !user.length)) {
      localStorage.setItem(userKey, JSON.stringify(guest))
      localStorage.removeItem(guestKey)
      window.dispatchEvent(new Event('cart:updated'))
    }
  } catch { /* ignore */ }
}