<template>
  <!-- Overlay -->
  <div
    v-show="open"
    class="fixed inset-0 z-[100] bg-black/40"
    @click="close"
  />

  <!-- Drawer -->
  <aside
    class="fixed top-0 right-0 h-full w-[360px] max-w-[90vw] bg-white z-[101] shadow-xl flex flex-col
           transition-transform duration-300"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
    @click.stop
  >
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <div class="font-bold">
        ({{ itemCount }}) item<span v-if="itemCount !== 1">s</span> in your cart
      </div>
      <button class="text-2xl leading-none" @click="close">×</button>
    </div>

    <!-- Items -->
    <div class="flex-1 overflow-auto">
      <div
        v-for="(item, idx) in items"
        :key="item.id ?? idx"
        class="flex gap-3 p-4 border-b"
      >
        <img
          :src="resolveImage(item.image_url)"
          :alt="item.name"
          class="w-16 h-16 object-cover rounded border"
          @error="e => e.target.src = PLACEHOLDER"
        />
        <div class="flex-1">
          <div class="flex justify-between">
            <span class="font-semibold">{{ item.name }}</span>
            <button class="text-gray-500 hover:text-black" @click="removeItem(idx)">×</button>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <!-- Qty stepper -->
            <div class="flex items-center border rounded">
              <button class="px-2 py-1" @click="decQty(idx)">−</button>
              <input
                class="w-12 text-center outline-none"
                type="number"
                min="1"
                v-model.number="items[idx].qty"
                @change="normalizeQty(idx)"
              />
              <button class="px-2 py-1" @click="incQty(idx)">+</button>
            </div>
            <div class="font-semibold">{{ money(item.price * (item.qty || 1)) }}</div>
          </div>
        </div>
      </div>

      <div v-if="!items.length" class="p-6 text-center text-gray-500">
        Your cart is empty.
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t p-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Subtotal</span>
        <span class="font-bold">{{ money(subtotal) }}</span>
      </div>
      <button
        class="w-full border border-black py-2 rounded font-semibold hover:bg-black hover:text-white disabled:opacity-60"
        :disabled="checkingOut || !items.length"
        @click="proceedToCheckout"
      >
        {{ checkingOut ? 'Starting checkout…' : 'Checkout' }}
      </button>
      <button
        class="w-full text-sm underline text-gray-600 hover:text-black text-left"
        @click="goTo('/cart')"
      >
        See full cart to enter promo codes and gift options.
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const open = ref(false)
const items = ref([])
const checkingOut = ref(false) // added
const PLACEHOLDER = 'https://via.placeholder.com/64?text=Item'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' // added

function getCartKey() {
  const uid = localStorage.getItem('user_id') || 'guest'
  return `cart:${uid}`
}
function readCart() {
  try { return JSON.parse(localStorage.getItem(getCartKey()) || '[]') } catch { return [] }
}
function writeCart(next) {
  localStorage.setItem(getCartKey(), JSON.stringify(next))
  window.dispatchEvent(new Event('cart:updated'))
}
function refresh() { items.value = readCart() }

function resolveImage(url) {
  if (!url) return PLACEHOLDER
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const normalized = String(url).replace(/\\/g, '/')
  if (normalized.startsWith('/uploads')) return `${base}${normalized}`
  if (/^https?:\/\//i.test(normalized)) return normalized
  return `${base}/${normalized.replace(/^\/+/, '')}`
}

const itemCount = computed(() => items.value.reduce((s, i) => s + (Number(i.qty) || 1), 0))
const subtotal = computed(() => items.value.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0))

function money(v) {
  try { return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(v || 0) }
  catch { return `₱${Number(v || 0).toFixed(2)}` }
}
function image(item) { return item.image_url || 'https://via.placeholder.com/64?text=Item' }

function incQty(idx) { const n = [...items.value]; n[idx].qty = Math.max(1, Number(n[idx].qty || 1) + 1); items.value = n; writeCart(n) }
function decQty(idx) { const n = [...items.value]; n[idx].qty = Math.max(1, Number(n[idx].qty || 1) - 1); items.value = n; writeCart(n) }
function normalizeQty(idx) { const n = [...items.value]; n[idx].qty = Math.max(1, Number(n[idx].qty || 1)); items.value = n; writeCart(n) }
function removeItem(idx) { const n = items.value.slice(); n.splice(idx, 1); items.value = n; writeCart(n) }

function goTo(path) { open.value = false; router.push(path) }
function close() { open.value = false }
function onOpen() { open.value = true }

function onAnyChange(e) {
  if (!e || (e.key && !e.key.startsWith('cart:'))) {}
  refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener('cart:open', onOpen)
  window.addEventListener('cart:close', close)
  window.addEventListener('cart:updated', onAnyChange)
  window.addEventListener('storage', onAnyChange)
})
onUnmounted(() => {
  window.removeEventListener('cart:open', onOpen)
  window.removeEventListener('cart:close', close)
  window.removeEventListener('cart:updated', onAnyChange)
  window.removeEventListener('storage', onAnyChange)
})


// Validate cart against backend
async function validateCartAPI(payload) {
  const res = await fetch(`${API}/api/orders/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    let msg = 'Validate failed'
    try { const j = await res.json(); msg = j.message || j.issues?.[0] || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// Create order
async function createOrderAPI(payload) {
  const res = await fetch(`${API}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    let msg = 'Create order failed'
    try { const j = await res.json(); msg = j.message || j.code || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

// Start checkout: validate -> create order -> route to checkout
async function proceedToCheckout() {
  if (!items.value.length) return
  checkingOut.value = true
  try {
    const validatePayload = {
      items: items.value.map(i => ({
        id: i.id ?? i.item_id,
        qty: Math.max(1, Number(i.qty) || 1)
      }))
    }
    const v = await validateCartAPI(validatePayload)
    if (Array.isArray(v.issues) && v.issues.length) {
      alert(String(v.issues[0]) || 'Some items need attention (stock/price).')
      return
    }

    const user_id = Number(localStorage.getItem('user_id') || 0)
    if (!user_id) {
      alert('Please sign in before checkout.')
      router.push('/')
      return
    }

    const orderPayload = {
      user_id,
      items: items.value.map(i => ({
        item_id: i.item_id ?? i.id,
        qty: Math.max(1, Number(i.qty) || 1)
      })),
      // service_type: null // uncomment if your DB requires a value
    }
    const order = await createOrderAPI(orderPayload)

    open.value = false
    router.push({ path: '/payment', query: { orderId: order.order_id } })
  } catch (e) {
    console.error(e)
    alert(e?.message || 'Unable to start checkout. Please try again.')
  } finally {
    checkingOut.value = false
  }
}
</script>