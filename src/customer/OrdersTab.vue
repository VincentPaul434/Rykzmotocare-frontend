<template>
  <div class="bg-gray-100 min-h-screen font-sans p-4 md:p-6">
    <div class="max-w-6xl mx-auto bg-white rounded shadow p-4 md:p-6">
      <!-- Back to Homepage button -->
      <button
        class="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        @click="$router.push('/user-homepage')"
      >
        ← Back to Homepage
      </button>

      <h2 class="text-lg font-bold mb-2">Paid Orders History</h2>

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div></div>
        <div class="flex gap-2">
          <input
            v-model="search"
            type="text"
            placeholder="Search order"
            class="border rounded px-3 py-2 w-64"
          />
          <select v-model="statusFilter" class="border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-gray-500">Loading…</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else>
        <div v-if="!filtered.length" class="text-gray-500">No records found.</div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b bg-gray-100">
                <th class="text-left p-2">Order ID</th>
                <th class="text-left p-2">Status</th>
                <th class="text-left p-2">Amount</th>
                <th class="text-left p-2">Payment Method</th>
                <th class="text-left p-2">Payment Ref</th>
                <th class="text-left p-2">Paid At</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in pageRows" :key="order.order_id" class="border-b">
                <td class="p-2 font-medium">{{ order.order_id }}</td>
                <td class="p-2">
                  <span :class="statusClass(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-2">₱{{ Number(order.amount || 0).toFixed(2) }}</td>
                <td class="p-2">{{ order.method }}</td>
                <td class="p-2">{{ order.payment_ref }}</td>
                <td class="p-2">{{ formatDate(order.created_at) }}</td>
                <td class="p-2 space-x-3">
                  <button
                    class="text-yellow-700 hover:underline"
                    @click="openDetails(order)"
                  >
                    View Details
                  </button>
                  <button
                    v-if="order.receipt_url"
                    class="text-blue-700 hover:underline"
                    @click="openReceipt(order)"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- pagination -->
          <div class="flex items-center justify-between mt-3 text-sm">
            <div>
              Showing
              {{ filtered.length ? (pageStart + 1) : 0 }} -
              {{ Math.min(pageStart + pageSize, filtered.length) }}
              of {{ filtered.length }}
            </div>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1 border rounded disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="prevPage"
              >
                Prev
              </button>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
              <button
                class="px-3 py-1 border rounded disabled:opacity-50"
                :disabled="currentPage === totalPages"
                @click="nextPage"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Details Modal -->
      <div
        v-if="showDetails"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        @click.self="closeDetails"
      >
        <div class="bg-white rounded-lg shadow w-full max-w-lg p-5">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold">Order Details</h2>
            <button class="text-2xl leading-none" @click="closeDetails">×</button>
          </div>
          <div class="space-y-1 text-sm">
            <div>
              <span class="text-gray-500">Order ID:</span>
              {{ selected?.order_id }}
            </div>
            <div>
              <span class="text-gray-500">Amount:</span>
              ₱{{ Number(selected?.amount || 0).toFixed(2) }}
            </div>
            <div>
              <span class="text-gray-500">Status:</span>
              {{ selected?.status }}
            </div>
            <div>
              <span class="text-gray-500">Payment Method:</span>
              {{ selected?.method }}
            </div>
            <div>
              <span class="text-gray-500">Payment Ref:</span>
              {{ selected?.payment_ref }}
            </div>
            <div v-if="selected?.created_at">
              <span class="text-gray-500">Created:</span>
              {{ formatDate(selected.created_at) }}
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button class="px-4 py-2 border rounded" @click="closeDetails">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const orders = ref([])
const loading = ref(false)
const error = ref('')
const search = ref('')
const statusFilter = ref('all')
const showDetails = ref(false)
const selected = ref(null)

// Pagination
const pageSize = 10
const currentPage = ref(1)
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (orders.value || []).filter(order => {
    const txt = `${order.order_id ?? ''}`.toLowerCase()
    const textOk = !q || txt.includes(q)
    const statusOk =
      statusFilter.value === 'all' ||
      String(order.status || '').toLowerCase() === statusFilter.value.toLowerCase()
    return textOk && statusOk
  })
})
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageStart = computed(() => (currentPage.value - 1) * pageSize)
const pageRows = computed(() => filtered.value.slice(pageStart.value, pageStart.value + pageSize))
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

// Status badge color
function statusClass(s) {
  const v = String(s || '').toLowerCase()
  if (v === 'paid') return 'text-green-600'
  if (v === 'pending') return 'text-yellow-600'
  if (v === 'completed') return 'text-blue-600'
  if (v === 'cancelled' || v === 'canceled') return 'text-gray-500'
  return 'text-gray-600'
}

function getUserId() {
  return String(localStorage.getItem('user_id') || '0')
}

async function fetchOrders() {
  loading.value = true
  error.value = ''
  const uid = getUserId()
  try {
    // Only fetch paid orders for the user
    const resp = await fetch(`${API}/api/payments/user?user_id=${uid}&status=Paid`)
    const data = await resp.json()
    orders.value = Array.isArray(data) ? data : []
  } catch {
    error.value = 'Failed to load orders.'
    orders.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function openDetails(order) {
  selected.value = order
  showDetails.value = true
}
function closeDetails() {
  showDetails.value = false
  selected.value = null
}
function openReceipt(order) {
  const url = order?.receipt_url
  if (url) window.open(url, '_blank')
  else error.value = 'No receipt available for this order.'
}

onMounted(fetchOrders)
</script>