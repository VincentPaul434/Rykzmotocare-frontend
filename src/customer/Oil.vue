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
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <button class="bg-yellow-400 text-black font-bold px-3 md:px-4 py-2 rounded flex items-center gap-2 w-full md:w-auto">
          <i class="fa fa-shopping-cart"></i> <span class="hidden sm:inline">SHOP YOUR OIL</span>
        </button>
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" v-model="search" placeholder="Search..." />
        <i class="fa fa-user-circle text-2xl cursor-pointer" @click="showLogoutModal = true"></i>
      </div>
    </header>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Oil You Need</h2>
      <h3 class="text-lg text-center mb-6">Oil Products Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="oil in filteredOil"
          :key="oil.id"
          class="bg-white rounded-xl shadow w-full max-w-xs p-4 flex flex-col items-center"
        >
          <img :src="oil.image" alt="Oil" class="w-28 h-28 object-contain mb-2" />
          <h4 class="font-bold mb-1 text-center">{{ oil.name }}</h4>
          <p class="text-sm text-center mb-1">{{ oil.description }}</p>
          <p class="text-yellow-600 font-bold mb-2">${{ oil.price }}</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
})

const search = ref('')
const oilProducts = ref([
  {
    id: 1,
    name: 'Synthetic Motor Oil',
    description: 'High-performance synthetic oil for all engines.',
    price: 29.99,
    image: 'https://placehold.co/100x100?text=Oil+1'
  },
  {
    id: 2,
    name: 'Mineral Motor Oil',
    description: 'Reliable mineral oil for daily use.',
    price: 19.99,
    image: 'https://placehold.co/100x100?text=Oil+2'
  },
  {
    id: 3,
    name: 'Semi-Synthetic Oil',
    description: 'Balanced protection and performance.',
    price: 24.99,
    image: 'https://placehold.co/100x100?text=Oil+3'
  },
  {
    id: 4,
    name: 'Racing Oil',
    description: 'Ultimate protection for high-performance engines.',
    price: 39.99,
    image: 'https://placehold.co/100x100?text=Oil+4'
  }
])

const filteredOil = computed(() =>
  oilProducts.value.filter(oil =>
    oil.name.toLowerCase().includes(search.value.toLowerCase()) ||
    oil.description.toLowerCase().includes(search.value.toLowerCase())
  )
)

const showLogoutModal = ref(false)

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}
</script>

