<template>
  <div class="min-h-screen bg-black font-sans flex flex-col">
    <!-- Header -->
    <header class="bg-[#222] text-white flex items-center justify-between px-8 py-6 rounded-lg mx-auto mt-8 w-[90%] max-w-5xl shadow-lg border-b-4 border-yellow-400">
      <span class="text-4xl font-extrabold tracking-wide">
        <span class="text-yellow-400">RYKZ</span>MOTOCARE
      </span>
      <button
        class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-2 rounded transition"
        @click="goToLanding"
      >
        LOGIN
      </button>
    </header>

    <!-- Filter/Search Bar -->
    <section class="flex flex-col items-center mt-10">
      <div class="flex flex-col md:flex-row items-center gap-4">
        <label class="text-yellow-400 font-bold text-lg">Filter by Category:</label>
        <select v-model="selectedCategory" class="bg-[#222] text-white px-4 py-2 rounded border border-yellow-400 focus:outline-none">
          <option value="">All</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <input
          v-model="search"
          type="text"
          class="bg-[#222] text-white px-4 py-2 rounded border border-yellow-400 focus:outline-none"
          placeholder="Search by item name..."
        />
        <span class="text-white font-semibold ml-2">Showing {{ filteredItems.length }} of {{ items.length }} items</span>
      </div>
    </section>

    <!-- Product List -->
    <section class="flex justify-center mt-10">
      <div class="bg-[#222] rounded-lg shadow-lg w-full max-w-3xl min-h-[300px] flex items-center justify-center overflow-y-auto border border-yellow-400">
        <div v-if="filteredItems.length === 0" class="w-full text-center text-gray-300 text-2xl">
          No products found for this search or category.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 w-full">
          <div
            v-for="item in filteredItems"
            :key="item.item_id"
            class="bg-black rounded-lg p-4 flex flex-col items-center border border-yellow-400"
          >
            <img :src="getImageUrl(item.image_url)" alt="Product" class="w-24 h-24 object-cover rounded mb-2" />
            <h2 class="text-white font-bold text-lg mb-1">{{ item.name }}</h2>
            <p class="text-gray-400 mb-1">{{ item.category }}</p>
            <p class="text-gray-400 mb-1">stock: {{ item.quantity }}</p>
            <p class="text-yellow-400 font-bold mb-1">₱{{ item.price }}</p>
            <p class="text-gray-400 text-sm mb-2">{{ item.description }}</p>
            <button class="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded font-bold mt-2">Add to Cart</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-auto py-8 text-center text-gray-400">
      © 2025 RykzMotocare. All rights reserved.
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const categories = [
  'Accessories',
  'Parts',
  'Oil',
  'Tires',
]
const selectedCategory = ref('')
const search = ref('')
const items = ref([])

function getImageUrl(url) {
  if (!url) return 'https://placehold.co/120x120?text=IMG'
  if (/^https?:\/\//.test(url)) return url
  return API + url
}

function goToLanding() {
  router.push('/') // Change '/' to your actual landing page route if needed
}

onMounted(async () => {
  try {
    let url = `${API}/api/inventory`
    if (selectedCategory.value) {
      url += `?category=${encodeURIComponent(selectedCategory.value)}`
    }
    const res = await fetch(url)
    items.value = await res.json()
  } catch (err) {
    items.value = []
  }
})

// Refetch when category changes
watch(selectedCategory, async (cat) => {
  try {
    let url = `${API}/api/inventory`
    if (cat) {
      url += `?category=${encodeURIComponent(cat)}`
    }
    const res = await fetch(url)
    items.value = await res.json()
  } catch (err) {
    items.value = []
  }
})

const filteredItems = computed(() => {
  return items.value.filter(item =>
    (!selectedCategory.value || item.category === selectedCategory.value) &&
    (!search.value || item.name?.toLowerCase().includes(search.value.toLowerCase()))
  )
})
</script>

<!-- No custom CSS needed, all styling is Tailwind -->