<template>
  <div class="flex flex-row min-h-screen bg-gray-100 overflow-x-auto">
    <!-- Sidebar -->
    <aside class="w-56 md:w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4 flex-shrink-0">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/your-logo.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <span class="block py-1 px-2 rounded hover:bg-gray-600 cursor-default">Close Shop</span>
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <span class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold cursor-default">Feedbacks</span>
          <router-link to="/customer-approval" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Approval</router-link>
        </nav>
      </div>
      <button class="flex items-center gap-2 text-white hover:text-yellow-400 mt-8 cursor-default">
        <i class="fa fa-sign-out"></i>
        <span>Logout</span>
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative min-w-[320px]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-xl md:text-2xl font-bold">Admin</span>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-center text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-wide mb-4">
        CUSTOMER FEED BACKS
      </h1>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-0 text-sm md:text-base">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Customer Name:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Booking ID:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">FeedBack Message:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Ratings:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Date Submited:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Admin Reply:</th>
              <th class="text-left py-2 px-2 md:px-4 font-semibold">Actions:</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(fb, idx) in feedbacks"
              :key="fb.id"
              :class="idx % 2 === 1 ? 'bg-gray-100' : ''"
              class="border-b border-black"
            >
              <td class="py-3 px-2 md:px-4 font-semibold">{{ fb.name }}</td>
              <td class="py-3 px-2 md:px-4 font-semibold">{{ fb.bookingId }}</td>
              <td class="py-3 px-2 md:px-4">
                <div class="max-w-[34ch]">{{ fb.message }}</div>
              </td>
              <td class="py-3 px-2 md:px-4">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="i <= fb.rating ? 'text-yellow-400' : 'text-gray-400'"
                >★</span>
              </td>
              <td class="py-3 px-2 md:px-4">{{ fb.date }}</td>
              <td class="py-3 px-2 md:px-4">
                <div class="max-w-[34ch] text-green-700">{{ fb.admin_reply }}</div>
              </td>
              <td class="py-3 px-2 md:px-4 text-right md:text-left">
                <span class="text-gray-800 font-semibold">[View Details]</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Bottom rounded area to match design -->
        <div class="bg-gray-100 rounded-b-2xl h-40 mt-0"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const feedbacks = ref([])

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/feedbacks`)
    if (!res.ok) throw new Error('Failed to fetch feedbacks')
    feedbacks.value = await res.json()
  } catch (err) {
    feedbacks.value = []
    // Optionally show error
  }
})
</script>