<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <header class="bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/accessories" class="text-yellow-400 font-bold cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <button class="bg-yellow-400 text-black font-bold px-3 md:px-4 py-2 rounded flex items-center gap-2 w-full md:w-auto">
          <i class="fa fa-shopping-cart"></i> <span class="hidden sm:inline">SHOP YOUR PARTS</span>
        </button>
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" placeholder="Search..." />
        <i class="fa fa-user-circle text-2xl"></i>
      </div>
    </header>

    <section class="py-6 px-2 md:px-0">
      <h2 class="text-2xl font-bold text-center mb-4">All the Extras You Need</h2>
      <h3 class="text-lg text-center mb-6">Accessories Available In Store Now!</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        <div
          v-for="item in accessories"
          :key="item.item_id"
          class="bg-white rounded-xl shadow w-full max-w-xs p-4 flex flex-col items-center"
        >
          <img :src="item.image_url" alt="Accessory" class="w-28 h-28 object-contain mb-2" />
          <h4 class="font-bold mb-1 text-center">{{ item.name }}</h4>
          <p class="text-sm text-center mb-1">{{ item.brand }}</p>
          <p class="text-sm text-center mb-1">Stock: {{ item.quantity }}</p>
          <p class="text-green-600 font-bold mb-2">PHP{{ item.price }}</p>
          <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded w-full">Add to Cart</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const accessories = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:5000/api/inventory?category=Accessories')
  accessories.value = await res.json()
})
</script>