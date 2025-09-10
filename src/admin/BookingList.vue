<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/part1.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Close Shop</a>
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Feedbacks</a>
          <router-link to="/customer-approval" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Approval</router-link>
        </nav>
      </div>
      <button @click="handleLogout" class="flex items-center gap-2 text-white hover:text-yellow-400 mt-8">
        <i class="fa fa-sign-out"></i>
        <span>Logout</span>
      </button>
    </aside>
    <!-- Main Content -->
    <main class="flex-1 bg-white p-8">
      <h2 class="text-2xl font-bold mb-6">Admin</h2>
      <table class="w-full border text-left">
        <thead>
          <tr>
            <th class="border px-4 py-2">Name:</th>
            <th class="border px-4 py-2">Vehicle Model:</th>
            <th class="border px-4 py-2">Service Requested:</th>
            <th class="border px-4 py-2">Book Status:</th>
            <th class="border px-4 py-2">Actions:</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(booking, idx) in bookings" :key="idx">
            <td class="border px-4 py-2">{{ booking.name }}</td>
            <td class="border px-4 py-2">{{ booking.vehicle_model }}</td>
            <td class="border px-4 py-2">{{ booking.service_requested }}</td>
            <td class="border px-4 py-2">{{ booking.book_status }}</td>
            <td class="border px-4 py-2">
              <button class="text-blue-600 mr-2" @click="updateBooking(idx)">Update</button>|
              <button class="text-green-600 ml-2" @click="notifyBooking(idx)">Notify</button>
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const bookings = ref([])

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/bookings')
    if (!response.ok) throw new Error('Failed to fetch bookings')
    bookings.value = await response.json()
  } catch (err) {
    alert('Could not load bookings.')
    console.error(err)
  }
})

function updateBooking(idx) {
  alert('Update booking feature not implemented.')
}

function notifyBooking(idx) {
  alert('Notify feature not implemented.')
}

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}
</script>