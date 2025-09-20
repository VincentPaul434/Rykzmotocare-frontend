<template>
  <button class="relative inline-flex items-center" @click="openDrawer" aria-label="Cart">
    <i class="fa fa-shopping-cart text-2xl"></i>
    <span
      v-if="count > 0"
      class="absolute -top-1 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center"
    >
      {{ count }}
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const count = ref(0)

function getCartKey() {
  const uid = localStorage.getItem('user_id') || 'guest'
  return `cart:${uid}`
}
function readCart() {
  try { return JSON.parse(localStorage.getItem(getCartKey()) || '[]') } catch { return [] }
}
function updateCount() {
  const cart = readCart()
  count.value = cart.reduce((sum, i) => sum + (Number(i.qty) || 1), 0)
}
function onStorage(e) {
  if (!e || (e.key && !e.key.startsWith('cart:'))) return
  updateCount()
}
function openDrawer() {
  window.dispatchEvent(new Event('cart:open'))
}

onMounted(() => {
  updateCount()
  window.addEventListener('storage', onStorage)
  window.addEventListener('cart:updated', onStorage)
})
onUnmounted(() => {
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('cart:updated', onStorage)
})
</script>