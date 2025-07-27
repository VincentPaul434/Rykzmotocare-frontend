<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <header class="bg-gray-900 text-white flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
      <div class="flex items-center gap-4">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/accessories" class="text-yellow-400 font-bold cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-3">
        <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded flex items-center gap-2">
          <i class="fa fa-shopping-cart"></i> SHOP YOUR PARTS
        </button>
        <input class="rounded-full px-3 py-1 text-black" type="text" placeholder="Search..." />
        <i class="fa fa-user-circle text-2xl"></i>
      </div>
    </header>

    <section class="py-10">
      <h2 class="text-2xl font-bold text-center mb-6">All the Extras You Need</h2>
      <h3 class="text-lg text-center mb-8">Accessories Available In Store Now!</h3>
      <div class="flex flex-wrap justify-center gap-8">
        <div v-for="item in accessories" :key="item.item_id" class="bg-white rounded-xl shadow w-64 p-4 flex flex-col items-center">
          <img :src="item.image_url" alt="Accessory" class="w-32 h-32 object-contain mb-2" />
          <h4 class="font-bold mb-1">{{ item.name }}</h4>
          <p class="text-sm text-center mb-2">{{ item.brand }}</p>
          <p class="text-sm text-center mb-2">Stock: {{ item.quantity }}</p>
          <p class="text-green-600 font-bold mb-2">PHP{{ item.price }}</p>
          <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded">Add to Cart</button>
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