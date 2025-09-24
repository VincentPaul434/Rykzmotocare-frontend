<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <header class="bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span>
          <span class="text-yellow-400">Rykz</span>
          motocare
        </span>
      </div>
      <div class="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="text-yellow-400 font-bold cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="cursor-pointer">MEET THE MECHANICS</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" v-model="search" placeholder="Search..." />
        <!-- Notification Bell Icon placed beside CartIcon -->
        <button @click="showNotifications = !showNotifications" class="relative focus:outline-none">
          <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">{{ unreadCount }}</span>
        </button>
        <CartIcon />
        <ProfileMenu @logout="showLogoutModal = true" />
      </div>
    </header>

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
          :key="notif.id || idx"
          class="px-4 py-3 border-b last:border-b-0 hover:bg-yellow-50 transition"
        >
          <div class="font-semibold">{{ notif.title || 'Notification' }}</div>
          <div class="text-sm text-gray-700">{{ notif.message }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ formatDate(notif.created_at) }}</div>
        </li>
      </ul>
    </div>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Oil You Need</h2>
      <h3 class="text-lg text-center mb-6">Oil Products Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="oil in filteredOil"
          :key="oil.item_id || oil.id"
          class="bg-white rounded-xl shadow w-full max-w-xs p-4 flex flex-col items-center"
        >
          <img
            :src="getImageUrl(oil.image_url)"
            alt="Oil"
            class="w-full h-40 object-cover rounded-t mb-2"
          />
          <h4 class="font-bold mb-1 text-center">{{ oil.name }}</h4>
          <p class="text-sm text-center mb-1">Brand: {{ oil.brand }}</p>
          <p class="text-sm text-center mb-1">Stock: {{ oil.quantity }}</p>
          <p class="text-sm text-center mb-1">{{ oil.description }}</p>
          <p class="text-yellow-600 font-bold mb-2">PHP{{ oil.price }}</p>
          <!-- Add to Cart -->
          <button
            class="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded"
            @click="openQtyModal(oil)"
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
    <div v-if="showQtyModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold mb-3">Add to Cart</h3>
        <p class="mb-1">{{ selectedItem?.name }}</p>
        <p class="text-sm text-gray-600 mb-4">
          Available stock: {{ selectedItem?.quantity ?? '—' }}
        </p>

        <div class="flex items-center gap-2 mb-6">
          <button class="px-3 py-2 border rounded" @click="decrementQty">-</button>
          <input
            type="number"
            class="border rounded px-3 py-2 w-24 text-center"
            v-model.number="qty"
            :min="1"
            :max="maxQty"
            @input="clampQty"
          />
          <button class="px-3 py-2 border rounded" @click="incrementQty">+</button>
        </div>

        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 border rounded" @click="closeQtyModal">Cancel</button>
          <button class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded font-bold" @click="confirmAddToCart">
            Add {{ qty }} to Cart
          </button>
        </div>
      </div>
    </div>

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue'
import ProfileMenu from '../components/ProfileMenu.vue'
import CartDrawer from '../components/CartDrawer.vue'

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
  try {
    const user_id = localStorage.getItem('user_id')
    const res = await fetch(`${API}/api/notifications/${user_id}`)
    if (res.ok) {
      const data = await res.json()
      notifications.value = Array.isArray(data.notifications) ? data.notifications : []
    }
  } catch {}
})

const router = useRouter()
const search = ref('')
const oilProducts = ref([])
const showLogoutModal = ref(false)
const showQtyModal = ref(false)
const notification = ref(null)
let notificationTimeout = null
const selectedItem = ref(null)
const qty = ref(1)
const maxQty = computed(() => {
  const q = selectedItem.value?.quantity
  return typeof q === 'number' && q > 0 ? q : 9999
})

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/100x100?text=No+Image'
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const normalized = String(url).replace(/\\/g, '/')
  if (normalized.startsWith('/uploads')) return `${base}${normalized}`
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${base}/${normalized.replace(/^\/+/, '')}`
}

async function fetchOil() {
  try {
    const res = await fetch(`${API}/api/inventory?category=oil`) // use API base like Accessories
    if (!res.ok) throw new Error('Failed to fetch oil')
    oilProducts.value = await res.json()
  } catch (err) {
    // Optionally show notification
  }
}

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
  fetchOil()
})

const filteredOil = computed(() =>
  oilProducts.value.filter(oil =>
    oil.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (oil.description || '').toLowerCase().includes(search.value.toLowerCase())
  )
)

function showNotification(message, duration = 2000) {
  notification.value = message
  if (notificationTimeout) clearTimeout(notificationTimeout)
  notificationTimeout = setTimeout(() => (notification.value = null), duration)
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
  // keep badge/drawer in sync
  window.dispatchEvent(new Event('cart:updated'))
}

function addToCart(item, amount = 1) {
  const cart = readCart()
  const id = item.item_id ?? item.id
  const img = getImageUrl(item.image_url)
  const addQty = Math.max(1, Math.min(amount, item.quantity ?? amount))
  const found = cart.find(i => i.id === id)
  if (found) found.qty += addQty
  else cart.push({ id, name: item.name, price: item.price, image_url: img, qty: addQty, category: item.category })
  writeCart(cart)
  showNotification(`Added ${addQty} to cart`)
  // auto-open mini cart drawer
  window.dispatchEvent(new Event('cart:open'))
}

function openQtyModal(item) {
  selectedItem.value = item
  qty.value = 1
  showQtyModal.value = true
}
function closeQtyModal() {
  showQtyModal.value = false
  selectedItem.value = null
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
function confirmAddToCart() {
  if (!selectedItem.value) return
  addToCart(selectedItem.value, qty.value)
  closeQtyModal()
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}
</script>

