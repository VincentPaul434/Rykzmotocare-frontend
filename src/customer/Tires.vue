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
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="text-yellow-400 font-bold cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <button class="bg-yellow-400 text-black font-bold px-3 md:px-4 py-2 rounded flex items-center gap-2 w-full md:w-auto">
          <i class="fa fa-shopping-cart"></i> <span class="hidden sm:inline">SHOP TIRES</span>
        </button>
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" v-model="search" placeholder="Search..." />
        <!-- Added cart icon -->
        <CartIcon />
        <i class="fa fa-user-circle text-2xl cursor-pointer" @click="showLogoutModal = true"></i>
      </div>
    </header>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Tires You Need</h2>
      <h3 class="text-lg text-center mb-6">Tires Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="tire in filteredTires"
          :key="tire.id"
          class="bg-white rounded-xl shadow w-full max-w-xs p-4 flex flex-col items-center"
        >
          <img :src="getImageUrl(tire.image_url)" alt="Tire" class="w-full h-40 object-cover rounded-t mb-2" />
          <h4 class="font-bold mb-1 text-center">{{ tire.name }}</h4>
          <p class="text-sm text-center mb-1">{{ tire.description }}</p>
          <p class="text-yellow-600 font-bold mb-2">PHP{{ tire.price }}</p>
          <!-- Add to Cart -->
          <button
            class="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded"
            @click="openQtyModal(tire)"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue' // added

const router = useRouter()

const search = ref('')
const tires = ref([])
const showLogoutModal = ref(false)
const showQtyModal = ref(false)
const qty = ref(1)
const selectedItem = ref(null)
const notification = ref(null)        // added
let notificationTimeout = null        // added
const maxQty = computed(() => {
  const q = selectedItem.value?.quantity
  return typeof q === 'number' && q > 0 ? q : 9999
})

function getImageUrl(url) {
  if (!url) return 'https://via.placeholder.com/100x100?text=No+Image'
  return url.startsWith('/uploads')
    ? `http://localhost:5000${url}`
    : url
}

async function fetchTires() {
  try {
    const res = await fetch('http://localhost:5000/api/inventory?category=tires')
    if (!res.ok) throw new Error('Failed to fetch tires')
    tires.value = await res.json()
  } catch (err) {
    // Optionally show notification
  }
}

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
  fetchTires()
})

const filteredTires = computed(() =>
  tires.value.filter(tire =>
    tire.name.toLowerCase().includes(search.value.toLowerCase()) ||
    (tire.description || '').toLowerCase().includes(search.value.toLowerCase())
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