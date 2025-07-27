<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/your-logo.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Close Shop</a>
          <a href="#" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Customer</a>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
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
    <main class="flex-1 p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative">
      <!-- Top Bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold">Admin</span>
          <button class="border border-gray-400 rounded px-3 py-1 text-sm hover:bg-gray-100 transition">Create Customer Account</button>
          <input
            type="text"
            placeholder="search person..."
            class="border border-gray-400 rounded px-3 py-1 text-sm focus:outline-yellow-400"
          />
        </div>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="text-left py-2 px-4 font-semibold">Name:</th>
              <th class="text-left py-2 px-4 font-semibold">Email:</th>
              <th class="text-left py-2 px-4 font-semibold">Phone:</th>
              <th class="text-left py-2 px-4 font-semibold">Actions:</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, idx) in customers" :key="customer.user_id" :class="idx % 2 === 1 ? 'bg-gray-100' : ''" class="border-b border-black">
              <td class="py-2 px-4">{{ customer.name }}</td>
              <td class="py-2 px-4">{{ customer.email }}</td>
              <td class="py-2 px-4">{{ customer.phone }}</td>
              <td class="py-2 px-4 flex items-center gap-2">
                <button class="text-gray-800 hover:text-yellow-500 text-sm font-semibold">Edit</button>
                <span>|</span>
                <button class="text-gray-800 hover:text-red-500 text-sm font-semibold">Delete</button>
                <span class="ml-2">
                  <i class="fa fa-bell text-xl"></i>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="bg-gray-100 rounded-b-2xl h-40"></div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const customers = ref([])

async function fetchApprovedCustomers() {
  try {
    const res = await fetch('http://localhost:5000/api/users/customers')
    const data = await res.json()
    // Only include customers with status 'approved'
    customers.value = data.filter(c => c.status === 'approved')
  } catch (e) {
    customers.value = []
  }
}

onMounted(fetchApprovedCustomers)

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}
</script>