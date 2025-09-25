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
  const guestCart = JSON.parse(localStorage.getItem('cart:guest') || '[]')
  const user_id = localStorage.getItem('user_id')
  if (user_id && guestCart.length > 0) {
    localStorage.setItem(`cart:${user_id}`, JSON.stringify(guestCart))
    localStorage.removeItem('cart:guest') // Clear guest cart after migration
    window.dispatchEvent(new Event('cart:updated'))
  }
}