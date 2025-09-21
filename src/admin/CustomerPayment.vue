<template>
  <div class="flex min-h-screen bg-gray-100">
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
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <router-link to="/customer-payment" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Customer Payments</router-link>
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-3xl font-bold text-yellow-600 tracking-wide">CUSTOMER PAYMENTS</h2>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-500"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>
      <div class="flex justify-center mt-8">
        <div class="bg-gray-100 rounded-xl shadow p-8 w-full max-w-5xl">
          <div v-if="loading" class="text-gray-500">Loading payments…</div>
          <div v-else-if="error" class="text-red-600">{{ error }}</div>
          <div v-else>
            <div v-if="!payments.length" class="text-gray-500">No payments found.</div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b bg-gray-100">
                    <th class="p-2">Ref</th>
                    <th class="p-2">Order</th>
                    <th class="p-2">User</th>
                    <th class="p-2">Method</th>
                    <th class="p-2">Status</th>
                    <th class="p-2">Amount</th>
                    <th class="p-2">Receipt</th>
                    <th class="p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in payments" :key="p.payment_id" class="border-b">
                    <td class="p-2 font-mono">{{ p.payment_ref }}</td>
                    <td class="p-2">{{ p.order_id }}</td>
                    <td class="p-2">{{ p.user_id }}</td>
                    <td class="p-2">{{ p.method }}</td>
                    <td class="p-2">
                      <span :class="p.status === 'Submitted' ? 'text-green-600' : 'text-gray-600'">{{ p.status }}</span>
                    </td>
                    <td class="p-2">₱{{ Number(p.amount || p.total_amount || 0).toFixed(2) }}</td>
                    <td class="p-2">
                      <a v-if="p.receipt_url" :href="resolveUrl(p.receipt_url)" target="_blank" class="text-blue-700 underline">View</a>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="p-2">{{ formatDate(p.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const payments = ref([])
const loading = ref(false)
const error = ref('')

function resolveUrl(u) {
  if (!u) return ''
  const n = String(u).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(n)) return n
  return `${API}${n.startsWith('/') ? '' : '/'}${n}`
}
function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function fetchPayments() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/payments`)
    if (!res.ok) throw new Error('Failed to fetch payments')
    const data = await res.json()
    payments.value = Array.isArray(data) ? data : []
  } catch (e) {
    error.value = 'Unable to load payments.'
    payments.value = []
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}

onMounted(fetchPayments)
</script>