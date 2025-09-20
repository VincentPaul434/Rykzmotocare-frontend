<template>
  <div class="bg-gray-100 min-h-screen font-sans p-4 md:p-6">
    <div class="max-w-6xl mx-auto bg-white rounded shadow p-4 md:p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 class="text-xl font-bold">Bills & Payments</h1>
        <div class="flex gap-2">
          <input v-model="search" type="text" placeholder="Search booking or service" class="border rounded px-3 py-2 w-64" />
          <select v-model="statusFilter" class="border rounded px-3 py-2">
            <option value="all">All</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
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
                <th class="text-left p-2">Booking ID</th>
                <th class="text-left p-2">Service</th>
                <th class="text-left p-2">Total Amount</th>
                <th class="text-left p-2">Status</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in filtered" :key="b.id" class="border-b">
                <td class="p-2 font-medium">{{ b.booking_id || b.id }}</td>
                <td class="p-2">{{ b.service_type || '—' }}</td>
                <td class="p-2">₱{{ Number(b.total_amount || 0).toFixed(2) }}</td>
                <td class="p-2">
                  <span :class="b.status === 'Paid' ? 'text-green-600' : b.status === 'Pending' ? 'text-yellow-600' : 'text-gray-600'">
                    {{ b.status }}
                  </span>
                </td>
                <td class="p-2 space-x-3">
                  <button class="text-yellow-700 hover:underline" @click="openDetails(b)">View Details</button>
                  <button
                    v-if="b.status === 'Paid'"
                    class="text-blue-700 hover:underline"
                    @click="openReceipt(b)"
                  >
                    View Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetails" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" @click.self="closeDetails">
      <div class="bg-white rounded-lg shadow w-full max-w-lg p-5">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-bold">Booking Details</h2>
          <button class="text-2xl leading-none" @click="closeDetails">×</button>
        </div>
        <div class="space-y-1 text-sm">
          <div><span class="text-gray-500">Booking ID:</span> {{ selected?.booking_id || selected?.id }}</div>
          <div><span class="text-gray-500">Service:</span> {{ selected?.service_type || '—' }}</div>
          <div><span class="text-gray-500">Amount:</span> ₱{{ Number(selected?.total_amount || 0).toFixed(2) }}</div>
          <div><span class="text-gray-500">Status:</span> {{ selected?.status }}</div>
          <div v-if="selected?.created_at"><span class="text-gray-500">Created:</span> {{ formatDate(selected.created_at) }}</div>
          <div v-if="selected?.items?.length" class="mt-2">
            <div class="font-semibold mb-1">Items</div>
            <ul class="list-disc pl-6">
              <li v-for="(it, i) in selected.items" :key="i">
                {{ it.name }} × {{ it.qty }} — ₱{{ Number(it.price || 0).toFixed(2) }}
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button class="px-4 py-2 border rounded" @click="closeDetails">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const loading = ref(false)
const error = ref('')
const records = ref([])
const search = ref('')
const statusFilter = ref('all')

const showDetails = ref(false)
const selected = ref(null)

function resolveUrl(u) {
  if (!u) return ''
  const n = String(u).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(n)) return n
  if (n.startsWith('/')) return `${API}${n}`
  return `${API}/${n}`
}

function mapBill(r) {
  return {
    id: r.id ?? r.booking_id ?? r.order_id,
    booking_id: r.booking_id ?? r.order_code ?? r.id,
    service_type: r.service_type ?? r.service ?? r.title ?? '',
    total_amount: r.total_amount ?? r.total ?? r.amount ?? 0,
    status: r.status ?? r.payment_status ?? 'Pending',
    receipt_url: r.receipt_url ?? r.receipt ?? null,
    items: r.items || []
  }
}

async function fetchFirstOk(paths) {
  for (const p of paths) {
    try {
      const res = await fetch(`${API}${p}`)
      if (res.ok) return res.json()
    } catch { /* next */ }
  }
  return null
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await fetchFirstOk(['/api/bills', '/api/purchases', '/api/orders'])
    const list = Array.isArray(data) ? data : (data?.bills || data?.purchases || data?.orders || [])
    records.value = list.map(mapBill)
  } catch {
    error.value = 'Failed to load records.'
    records.value = []
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return records.value.filter(r => {
    const t = `${r.booking_id} ${r.service_type}`.toLowerCase()
    const textOk = !q || t.includes(q)
    const statusOk = statusFilter.value === 'all' || (r.status || '').toLowerCase() === statusFilter.value.toLowerCase()
    return textOk && statusOk
  })
})

function openDetails(row) {
  selected.value = row
  showDetails.value = true
}
function closeDetails() {
  showDetails.value = false
  selected.value = null
}
function openReceipt(row) {
  if (row.receipt_url) {
    window.open(resolveUrl(row.receipt_url), '_blank')
  } else {
    openDetails(row)
  }
}
function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

onMounted(load)
</script>