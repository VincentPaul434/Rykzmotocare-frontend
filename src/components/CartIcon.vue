<template>
  <div class="relative cursor-pointer" @click="openCart">
    <i class="fa fa-shopping-cart text-2xl"></i>
    <span
      v-if="count > 0"
      class="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
    >
      {{ count }}
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { countItems, migrateGuestCartIfAny } from '../utils/cart'

const count = ref(0)

function syncCount() {
  const uid = localStorage.getItem('user_id') || 'guest'
  count.value = countItems(uid) || 0
}

function onStorage(e) {
  if (!e.key || !e.key.startsWith('cart:')) return
  syncCount()
}

function openCart() {
  // If you have a cart drawer, trigger it here; otherwise navigate.
  window.dispatchEvent(new Event('cart:open'))
}

onMounted(() => {
  migrateGuestCartIfAny()
  syncCount()
  window.addEventListener('cart:updated', syncCount)
  window.addEventListener('storage', onStorage)
  window.addEventListener('auth:login', () => { migrateGuestCartIfAny(); syncCount() })
  window.addEventListener('auth:logout', syncCount)
  window.addEventListener('cart:clear', syncCount)
})

onBeforeUnmount(() => {
  window.removeEventListener('cart:updated', syncCount)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('auth:login', syncCount)
  window.removeEventListener('auth:logout', syncCount)
  window.removeEventListener('cart:clear', syncCount)
})
</script>