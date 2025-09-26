<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <header class="bg-gray-900 text-white flex items-center justify-between px-4 md:px-6 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span>
          <span class="text-yellow-400">Rykz</span>
          motocare
        </span>
      </div>
      <!-- Navigation Links -->
      <nav class="flex gap-4 items-center">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="text-yellow-400 font-bold cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="cursor-pointer">MEET THE MECHANICS</router-link>
      </nav>
      <!-- Right Side: Search, Notifications, Cart, Profile -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-3">
          <input
            class="rounded-full px-3 py-1 w-40"
            type="text"
            v-model="search"
            placeholder="Search..."
            style="background: #fff; color: #222; border: 1px solid #e5e7eb;" 
          />
          <button @click="showNotifications = !showNotifications" class="relative focus:outline-none">
            <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">{{ unreadCount }}</span>
          </button>
          <!-- If CartIcon.vue is missing, comment out the next line -->
          <CartIcon />
          <!-- If ProfileMenu.vue is missing, comment out the next line -->
          <ProfileMenu @logout="showLogoutModal = true" />
        </div>
      </div>
    </header>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Parts You Need</h2>
      <h3 class="text-lg text-center mb-6">Parts Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="part in filteredParts"
          :key="part.item_id ?? part.id"
          class="bg-white rounded-xl shadow w-full max-w-xs p-4 flex flex-col items-center"
        >
          <img
            :src="getImageUrl(part.image_url)"
            alt="Part"
            class="w-full h-40 object-cover rounded-t mb-2"
          />
          <h4 class="font-bold mb-1 text-center">{{ part.name }}</h4>
          <p class="text-sm text-center mb-1">Brand: {{ part.brand }}</p>
          <p class="text-sm text-center mb-1">Stock: {{ part.quantity }}</p>
          <p class="text-sm text-center mb-1">{{ part.description }}</p>
          <p class="text-yellow-600 font-bold mb-2">PHP{{ part.price }}</p>
          <button
            class="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded"
            @click="openQtyModal(part)"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>

    <div v-if="showLogoutModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Logout</h2>
        <p class="mb-6">Are you sure you want to logout?</p>
        <div class="flex justify-end gap-2">
          <button @click="handleLogout" class="bg-yellow-400 px-4 py-2 rounded font-bold">Logout</button>
          <button @click="showLogoutModal = false" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
        </div>
      </div>
    </div>

    <div
      v-if="notification"
      class="fixed bottom-4 right-4 bg-yellow-400 text-black px-4 py-2 rounded shadow"
    >
      {{ notification }}
    </div>

    <!-- Quantity Modal -->
    <div v-if="showQtyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Select Quantity</h2>
        <div class="mb-2 font-semibold">{{ selectedItem?.name }}</div>
        <div class="mb-2 text-sm text-gray-600">Available: {{ selectedItem?.quantity }}</div>
        <div class="flex items-center justify-between mb-4">
          <button @click="decrementQty" class="bg-gray-200 px-4 py-2 rounded-l font-bold">-</button>
          <input
            type="number"
            v-model.number="qty"
            class="border text-center rounded-md w-16"
            @blur="clampQty"
          />
          <button @click="incrementQty" class="bg-gray-200 px-4 py-2 rounded-r font-bold">+</button>
        </div>
        <div v-if="qtyError" class="text-sm text-red-600 mb-2">{{ qtyError }}</div>
        <div class="flex justify-end gap-2">
          <button @click="confirmAddToCart" class="bg-yellow-400 px-4 py-2 rounded font-bold">Add to Cart</button>
          <button @click="closeQtyModal" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Notifications dropdown, scrollable -->
    <div
      v-if="showNotifications"
      class="fixed top-16 right-4 w-80 max-h-[60vh] bg-white rounded-lg shadow-lg z-50 overflow-y-auto border"
      style="transition: box-shadow 0.2s;"
    >
      <div class="p-4 border-b font-bold text-lg text-yellow-700">Notifications</div>
      <div v-if="notifications.length === 0" class="p-4 text-gray-500 text-center">No notifications.</div>
      <ul>
        <li
          v-for="(notif, idx) in notifications"
          :key="notif.notification_id"
          class="px-4 py-3 border-b last:border-b-0 hover:bg-yellow-50 transition flex justify-between items-center"
        >
          <div>
            <div class="font-semibold">{{ notif.type === 'billing' ? 'Billing' : 'Booking' }}</div>
            <div class="text-sm text-gray-700">{{ notif.message }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(notif.created_at) }}</div>
          </div>
          <button
            @click="markAsRead(notif.notification_id)"
            class="ml-2 text-blue-600 underline text-xs"
          >
            Mark as read
          </button>
        </li>
      </ul>
    </div>

    <!-- If CartDrawer.vue is missing, comment out the next line -->
    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue'
import CartDrawer from '../components/CartDrawer.vue'
import ProfileMenu from '../components/ProfileMenu.vue'

const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(async () => {
  const user_id = localStorage.getItem('user_id')
  const res = await fetch(`${API}/api/read/${user_id}/unread`)
  if (res.ok) {
    const data = await res.json()
    notifications.value = Array.isArray(data.notifications) ? data.notifications : []
    notifications.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

async function markAsRead(notificationId) {
  try {
    const res = await fetch(`${API}/api/read/${notificationId}/readone`, {
      method: 'PATCH'
    })
    if (!res.ok) throw new Error('Failed to mark as read')
    notifications.value = notifications.value.filter(n => n.notification_id !== notificationId)
  } catch (e) {
    // Optionally handle error
  }
}

const partsProducts = ref([]) // renamed from oilProducts
const router = useRouter()
const showLogoutModal = ref(false)
const showQtyModal = ref(false)
const qty = ref(1)
const selectedItem = ref(null)
const checkingStock = ref(false)
const qtyError = ref('')
const maxQty = computed(() => {
  const q = selectedItem.value?.quantity
  return typeof q === 'number' && q > 0 ? q : 9999
})

const search = ref('')
const notification = ref(null)
const notificationTimeout = ref(null)

function showNotification(message, duration = 3000) {
  notification.value = message
  if (notificationTimeout.value) clearTimeout(notificationTimeout.value)
  notificationTimeout.value = setTimeout(() => {
    notification.value = null
  }, duration)
}

async function fetchParts() {
  try {
    const res = await fetch(`${API}/api/inventory?category=parts`)
    if (!res.ok) throw new Error('Failed to fetch parts')
    partsProducts.value = await res.json()
    showNotification('Parts loaded!')
  } catch (err) {
    showNotification('Error loading parts')
  }
}

onMounted(() => {
  fetchParts()
})

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/300x300?text=No+Image'
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const normalized = String(url).replace(/\\/g, '/')
  if (normalized.startsWith('/uploads')) return `${base}${normalized}`
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${base}/${normalized.replace(/^\/+/, '')}`
}

// added: validate against backend
async function validateCartAPI(items) {
  const res = await fetch(`${API}/api/orders/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
  if (!res.ok) throw new Error(await res.text().catch(() => 'Validate failed'))
  return res.json()
}

function openQtyModal(item) {
  selectedItem.value = item
  qty.value = 1
  qtyError.value = ''
  showQtyModal.value = true
}
function closeQtyModal() {
  showQtyModal.value = false
  selectedItem.value = null
  qtyError.value = ''
}

function clampQty() {
  if (!qty.value || qty.value < 1) qty.value = 1
  if (qty.value > maxQty.value) qty.value = maxQty.value
}
function incrementQty() {
  if (qty.value < maxQty.value) qty.value++
}
function decrementQty() {
  if (qty.value > 1) qty.value--
}

async function confirmAddToCart() {
  if (!selectedItem.value) return
  qtyError.value = ''
  checkingStock.value = true
  try {
    const id = selectedItem.value.item_id ?? selectedItem.value.id
    const res = await validateCartAPI([{ id, qty: qty.value }])
    if (Array.isArray(res.issues) && res.issues.length) {
      qtyError.value = res.issues[0]?.message || 'Item not available in requested quantity.'
      return
    }
    addToCart(selectedItem.value, qty.value)
    closeQtyModal()
  } catch (e) {
    qtyError.value = 'Unable to validate stock. Please try again.'
  } finally {
    checkingStock.value = false
  }
}

function getCartKey() {
  const uid = localStorage.getItem('user_id') || 'guest'
  return `cart:${uid}`
}
function readCart() {
  try { return JSON.parse(localStorage.getItem(getCartKey()) || '[]') } catch { return [] }
}
function writeCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart))
  window.dispatchEvent(new Event('cart:updated'))
}

function addToCart(item, amount = 1) {
  const cart = readCart()
  const id = item.item_id ?? item.id
  const addQty = Math.max(1, Math.min(amount, item.quantity ?? amount))
  const img = getImageUrl(item.image_url)
  const found = cart.find(i => i.id === id)
  if (found) found.qty += addQty
  else cart.push({ id, name: item.name, price: item.price, image_url: img, qty: addQty, category: item.category })
  writeCart(cart)
  showNotification(`Added ${addQty} to cart`)
  window.dispatchEvent(new Event('cart:open'))
}

// FIXED: filteredParts computed property
const filteredParts = computed(() =>
  partsProducts.value.filter(part =>
    (!search.value || part.name?.toLowerCase().includes(search.value.toLowerCase()))
  )
)
</script>

<style>
/* Add any component-specific styles here */
</style>
