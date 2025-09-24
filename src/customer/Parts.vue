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
        <router-link to="/parts" class="text-yellow-400 font-bold cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="cursor-pointer">MEET THE MECHANICS</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" v-model="search" placeholder="Search..." />
        <CartIcon />
        <ProfileMenu @logout="showLogoutModal = true" />
      </div>
    </header>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Parts You Need</h2>
      <h3 class="text-lg text-center mb-6">Parts Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="part in filteredParts"
          :key="part.id"
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
          <!-- Add to Cart -->
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
        <div class="flex items-center justify-between mb-4">
          <button @click="decrementQty" class="bg-gray-200 px-4 py-2 rounded-l font-bold">-</button>
          <input
            type="number"
            v-model.number="qty"  <!-- changed to .number -->
            class="border text-center rounded-md w-16"
            @blur="clampQty"
          />
          <button @click="incrementQty" class="bg-gray-200 px-4 py-2 rounded-r font-bold">+</button>
        </div>
        <div class="flex justify-end gap-2">
          <button @click="confirmAddToCart" class="bg-yellow-400 px-4 py-2 rounded font-bold">Add to Cart</button>
          <button @click="closeQtyModal" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
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
import CartDrawer from '../components/CartDrawer.vue'
import ProfileMenu from '../components/ProfileMenu.vue' // added

const router = useRouter()
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' // added

const search = ref('')
const parts = ref([])
const showLogoutModal = ref(false)
const notification = ref(null)
const showQtyModal = ref(false)
const qty = ref(1)
const selectedItem = ref(null)
let notificationTimeout = null

// Added: used by your qty modal handlers
const maxQty = computed(() => {
  const q = selectedItem.value?.quantity
  return typeof q === 'number' && q > 0 ? q : 9999
})

function getImageUrl(url) {                          // updated
  if (!url) return 'https://via.placeholder.com/100x100?text=No+Image'
  const n = String(url).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(n)) return n
  return `${API}${n.startsWith('/') ? '' : '/'}${n}`
}

async function fetchParts() {                         // updated
  try {
    const res = await fetch(`${API}/api/inventory?category=parts`)
    if (!res.ok) throw new Error('Failed to fetch parts')
    parts.value = await res.json()
  } catch (err) {
    // optional notify
  }
}

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
  fetchParts()
})

const filteredParts = computed(() =>
  parts.value.filter(part =>
    part.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (part.description || '').toLowerCase().includes(search.value.toLowerCase())
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

// Replace addToCart with amount support
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
  window.dispatchEvent(new Event('cart:open'))
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}
</script>

