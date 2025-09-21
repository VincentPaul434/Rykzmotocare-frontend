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
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <router-link to="/customer-payment" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Payment</router-link>
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Feedbacks</a>
          <a href="#" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Customer Approval</a>
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
              <th class="text-left py-2 px-4 font-semibold">Date Applied:</th>
              <th class="text-left py-2 px-4 font-semibold">Status:</th>
              <th class="text-left py-2 px-4 font-semibold">Actions:</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(customer, idx) in customers" :key="idx" :class="idx % 2 === 1 ? 'bg-gray-100' : ''" class="border-b border-black">
              <td class="py-2 px-4">{{ customer.name }}</td>
              <td class="py-2 px-4">{{ customer.email }}</td>
              <td class="py-2 px-4">{{ customer.phone }}</td>
              <td class="py-2 px-4">{{ formatDate(customer.created_at) }}</td>
              <td class="py-2 px-4">{{ customer.status }}</td>
              <td class="py-2 px-4">
                <button class="text-gray-800 hover:text-green-600 text-sm font-semibold mr-2" @click="approveCustomer(customer.user_id)">Approve</button>
                <span>|</span>
                <button class="text-gray-800 hover:text-red-600 text-sm font-semibold ml-2" @click="rejectCustomer(customer.user_id)">Reject</button>
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

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/customers')
    if (!res.ok) throw new Error('Failed to fetch')
    const allCustomers = await res.json()
    console.log(allCustomers) // <-- Add this line
    customers.value = allCustomers.filter(c => c.status === 'pending')
  } catch (e) {
    customers.value = []
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(-2)
  return `${mm}/${dd}/${yy}`
}

async function approveCustomer(user_id) {
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${user_id}/approve`, {
      method: 'PATCH', // <-- PATCH, not PUT
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to approve')
    customers.value = customers.value.filter(c => c.user_id !== user_id)
  } catch (e) {
    alert('Failed to approve customer')
  }
}

async function rejectCustomer(user_id) {
  if (!confirm('Are you sure you want to reject this customer?')) return;
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${user_id}/reject`, {
      method: 'PATCH', // Assuming PATCH for reject
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to reject');
    customers.value = customers.value.filter(c => c.user_id !== user_id);
  } catch (e) {
    alert('Failed to reject customer');
  }
}

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}

</script>