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
            <!-- CHANGED: empty state uses filtered (paid-only) -->
            <div v-if="!filteredPaid.length" class="text-gray-500">No paid payments found.</div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="border-b bg-gray-100">
                    <th class="p-2 text-left">Ref</th>
                    <th class="p-2 text-left">Type</th>
                    <th class="p-2 text-left">Order/Booking</th>
                    <th class="p-2 text-left">User</th>
                    <th class="p-2 text-left">Method</th>
                    <th class="p-2 text-left">Status</th>
                    <th class="p-2 text-left">Amount</th>
                    <th class="p-2 text-left">Receipt</th>
                    <th class="p-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in pageRows" :key="p.key" class="border-b">
                    <td class="p-2 font-mono">{{ p.payment_ref }}</td>
                    <td class="p-2">{{ p.type }}</td>
                    <td class="p-2">{{ p.target_id }}</td>
                    <td class="p-2">{{ p.user_id }}</td>
                    <td class="p-2 uppercase">{{ p.method }}</td>
                    <td class="p-2">
                      <span :class="p.status === 'Submitted' || p.status === 'Paid' ? 'text-green-600' : 'text-gray-600'">
                        {{ p.status }}
                      </span>
                    </td>
                    <td class="p-2">₱{{ Number(p.amount || 0).toFixed(2) }}</td>
                    <td class="p-2">
                      <a v-if="p.receipt_url" :href="resolveUrl(p.receipt_url)" target="_blank" class="text-blue-700 underline">View</a>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="p-2">{{ formatDate(p.created_at) }}</td>
                  </tr>
                </tbody>
              </table>

              <!-- CHANGED: pagination counts reflect paid-only -->
              <div class="flex items-center justify-between mt-3 text-sm">
                <div>
                  Showing
                  {{ filteredPaid.length ? (pageStart + 1) : 0 }} -
                  {{ Math.min(pageStart + pageSize, filteredPaid.length) }}
                  of {{ filteredPaid.length }}
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-1 border rounded disabled:opacity-50"
                          :disabled="currentPage === 1"
                          @click="prevPage">Prev</button>
                  <span>Page {{ currentPage }} / {{ totalPages }}</span>
                  <button class="px-3 py-1 border rounded disabled:opacity-50"
                          :disabled="currentPage === totalPages"
                          @click="nextPage">Next</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const payments = ref([])
const loading = ref(false)
const error = ref('')

// Helper to normalize status
function norm(s) { return String(s ?? '').trim().toLowerCase() }

// NEW: paid-only list
const filteredPaid = computed(() => payments.value.filter(p => norm(p.status) === 'paid'))

// CHANGED: pagination to use paid-only list
const pageSize = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPaid.value.length / pageSize)))
const pageStart = computed(() => (currentPage.value - 1) * pageSize)
const pageRows = computed(() => filteredPaid.value.slice(pageStart.value, pageStart.value + pageSize))
watch([payments], () => { currentPage.value = 1 })

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

function mapOrder(row) {
  return {
    key: `order-${row.payment_id || row.payment_ref}`,
    type: 'Order',
    payment_ref: row.payment_ref,
    target_id: row.order_id,
    user_id: row.user_id,
    method: row.method,
    status: row.status,
    amount: Number(row.amount ?? row.total_amount ?? 0),
    receipt_url: row.receipt_url,
    created_at: row.created_at
  }
}
function mapService(row) {
  return {
    key: `service-${row.payment_id || row.payment_ref}`,
    type: 'Service',
    payment_ref: row.payment_ref,
    target_id: row.booking_id,
    user_id: row.user_id,
    method: row.method,
    status: row.status,
    amount: Number(row.amount ?? 0),
    receipt_url: row.receipt_url,
    created_at: row.created_at
  }
}

async function safeJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.rows || data.list || [])
  } catch { return [] }
}

async function fetchPayments() {
  loading.value = true
  error.value = ''
  try {
    // Orders + Service payments
    const [orders, services] = await Promise.all([
      safeJson(`${API}/api/payments`),
      safeJson(`${API}/api/service-payments`)
    ])
    const merged = [
      ...orders.map(mapOrder),
      ...services.map(mapService)
    ].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    payments.value = merged
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