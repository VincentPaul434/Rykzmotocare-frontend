<template>
  <div
    ref="root"
    class="relative"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <button class="flex items-center gap-2">
      <img v-if="avatar" :src="avatar" alt="" class="w-7 h-7 rounded-full object-cover" />
      <i v-else class="fa fa-user-circle text-2xl"></i>
      <span class="hidden sm:inline text-sm">{{ username }}</span>
      <i class="fa fa-caret-down text-xs"></i>
    </button>

    <div
      v-show="open"
      class="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg z-50"
    >
      <!-- arrow -->
      <div class="absolute -top-2 right-5 w-3 h-3 bg-white rotate-45 shadow-sm"></div>

      <ul class="py-2">
        <li>
          <RouterLink to="/track-status" class="block px-4 py-2 hover:bg-gray-100">Track Status</RouterLink>
        </li>
        <li>
          <RouterLink to="/bills" class="block px-4 py-2 hover:bg-gray-100">Bills & Payments</RouterLink>
        </li>
        <li>
          <button class="w-full text-left px-4 py-2 hover:bg-gray-100" @click="$emit('logout')">
            Logout
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['logout'])

const open = ref(false)
const username = ref(localStorage.getItem('name') || 'Account')
const avatar = ref(localStorage.getItem('avatar_url') || '')
</script>