<template>
  <div class="bg-gray-100 min-h-screen font-sans p-4 md:p-6">
    <div class="max-w-6xl mx-auto bg-white rounded shadow p-4 md:p-6">
      <!-- Tabs -->
      <div class="flex items-center gap-3 mb-5 border-b">
        <button
          class="px-3 py-2 -mb-px border-b-2"
          :class="activeTab==='bills' ? 'border-yellow-500 text-yellow-600 font-semibold' : 'border-transparent text-gray-500'"
          @click="activeTab='bills'"
        >
          Bills
        </button>
        <button
          class="px-3 py-2 -mb-px border-b-2"
          :class="activeTab==='pay' ? 'border-yellow-500 text-yellow-600 font-semibold' : 'border-transparent text-gray-500'"
          @click="activeTab='pay'"
        >
          Pay Service
        </button>
      </div>

      <!-- Bills tab -->
      <div v-if="activeTab==='bills'">
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
                      v-if="b.status !== 'Paid' && Number(b.total_amount) > 0"
                      class="text-blue-700 hover:underline"
                      @click="openPay(b)"
                    >
                      Pay Now
                    </button>
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

      <!-- Pay Service tab -->
      <div v-else>
        <h2 class="text-lg font-bold mb-3">Pay Service Bill</h2>

        <!-- Step: enter info -->
        <div v-if="payStep==='form'" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Booking ID</label>
              <input v-model="pay.booking_id" type="text" class="border rounded px-3 py-2 w-full" placeholder="e.g. 1234" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Amount to pay</label>
              <input v-model.number="pay.amount" type="number" min="1" step="0.01" class="border rounded px-3 py-2 w-full" placeholder="e.g. 500.00" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Method</label>
              <select v-model="pay.method" class="border rounded px-3 py-2 w-full">
                <option value="">Select</option>
                <option value="gcash">GCash</option>
                <option value="bdo">BDO</option>
                <option value="paymaya">Maya</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="px-4 py-2 bg-black text-white rounded disabled:opacity-60" :disabled="startLoading || !canStart" @click="startServicePayment">
              {{ startLoading ? 'Starting…' : 'Continue' }}
            </button>
            <p v-if="payError" class="text-red-600 self-center">{{ payError }}</p>
          </div>
          <p class="text-xs text-gray-500">
            Note: This supports partial payments if your backend accepts an amount override.
          </p>
        </div>

        <!-- Step: instructions + upload -->
        <div v-else-if="payStep==='instructions'">
          <div class="space-y-1">
            <div class="text-sm text-gray-500">Reference</div>
            <div class="font-mono">{{ payInfo.payment_ref }}</div>
            <div class="text-sm text-gray-500 mt-2">Amount</div>
            <div class="font-semibold">₱{{ Number(payInfo.amount || pay.amount || 0).toFixed(2) }}</div>
          </div>
          <p class="mt-3">{{ payInfo.note || 'Send payment using the details below, then upload the receipt.' }}</p>

          <!-- GCash -->
          <div v-if="pay.method==='gcash'" class="mt-3 text-sm">
            <div>Number: <span class="font-semibold">{{ payInstr.number }}</span></div>
            <div>Name: <span class="font-semibold">{{ payInstr.name }}</span></div>
            <img v-if="payInstr.qr_url" :src="resolveUrl(payInstr.qr_url)" alt="GCash QR" class="w-40 border rounded mt-2" />
          </div>
          <!-- BDO -->
          <div v-else-if="pay.method==='bdo'" class="mt-3 text-sm">
            <div>Account: <span class="font-semibold">{{ payInstr.account_name }}</span></div>
            <div>Number: <span class="font-semibold">{{ payInstr.account_number }}</span></div>
            <div>Branch: <span class="font-semibold">{{ payInstr.branch }}</span></div>
          </div>
          <!-- Maya -->
          <div v-else-if="pay.method==='paymaya'" class="mt-3 text-sm">
            <div>Number: <span class="font-semibold">{{ payInstr.number }}</span></div>
            <div>Name: <span class="font-semibold">{{ payInstr.name }}</span></div>
          </div>

          <div class="mt-6">
            <label class="block font-semibold mb-1">Upload payment receipt</label>
            <input type="file" accept="image/*" @change="onPayFile" />
            <div class="mt-3 flex gap-2">
              <button class="px-4 py-2 border rounded" @click="payStep='form'">Change details</button>
              <button class="px-4 py-2 bg-yellow-400 rounded font-bold disabled:opacity-60" :disabled="!payFile || submitLoading" @click="submitServiceReceipt">
                {{ submitLoading ? 'Uploading…' : 'Submit Receipt' }}
              </button>
            </div>
            <p v-if="payError" class="text-red-600 mt-3">{{ payError }}</p>
            <p v-if="paySuccess" class="text-green-700 mt-3">Receipt submitted. Thank you!</p>
          </div>
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

const activeTab = ref('bills')

// Payment (service) tab state
const pay = ref({ booking_id: '', amount: null, method: '' })
const payStep = ref('form') // 'form' | 'instructions'
const startLoading = ref(false)
const submitLoading = ref(false)
const payError = ref('')
const paySuccess = ref(false)
const payInfo = ref({ payment_ref: '', amount: 0 })
const payInstr = ref({})
const payFile = ref(null)
const currentUserId = ref(String(localStorage.getItem('user_id') || '0'))

const canStart = computed(() => !!pay.value.booking_id && Number(pay.value.amount) > 0 && !!pay.value.method)

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

// Prefill Pay tab from a row
function openPay(row) {
  activeTab.value = 'pay'
  pay.value.booking_id = String(row.booking_id || row.id || '')
  pay.value.amount = Number(row.total_amount || 0)
  pay.value.method = ''
  payStep.value = 'form'
  payError.value = ''
  paySuccess.value = false
  payFile.value = null
}

async function startServicePayment() {
  if (!canStart.value) return
  startLoading.value = true
  payError.value = ''
  paySuccess.value = false
  try {
    const res = await fetch(`${API}/api/payments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'service',
        booking_id: Number(pay.value.booking_id),
        user_id: Number(currentUserId.value) || 0,
        method: pay.value.method,
        amount: Number(pay.value.amount) // optional: server may accept override/partial
      })
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()

    // Normalize instructions (supports nested instructions or flat fields)
    const instrObj = (data && typeof data.instructions === 'object') ? data.instructions : {}
    if (pay.value.method === 'gcash') {
      payInstr.value = {
        number: instrObj.number ?? data.gcash_number ?? data.number ?? '',
        name: instrObj.name ?? data.gcash_name ?? data.name ?? '',
        qr_url: instrObj.qr_url ?? data.qr_url ?? ''
      }
    } else if (pay.value.method === 'bdo') {
      payInstr.value = {
        account_name: instrObj.account_name ?? data.bdo_account_name ?? data.account_name ?? '',
        account_number: instrObj.account_number ?? data.bdo_account_number ?? data.account_number ?? '',
        branch: instrObj.branch ?? data.bdo_branch ?? data.branch ?? ''
      }
    } else {
      payInstr.value = {
        number: instrObj.number ?? data.maya_number ?? data.number ?? '',
        name: instrObj.name ?? data.maya_name ?? data.name ?? ''
      }
    }

    payInfo.value = {
      payment_ref: data.payment_ref || '',
      amount: Number(data.amount ?? pay.value.amount ?? 0),
      note: typeof data.instructions === 'string' ? data.instructions : (instrObj.note || '')
    }
    payStep.value = 'instructions'
  } catch (e) {
    payError.value = 'Failed to start payment.'
  } finally {
    startLoading.value = false
  }
}

function onPayFile(e) {
  payFile.value = e.target?.files?.[0] || null
}

async function submitServiceReceipt() {
  if (!payFile.value) return
  submitLoading.value = true
  payError.value = ''
  paySuccess.value = false
  try {
    const fd = new FormData()
    fd.append('booking_id', String(pay.value.booking_id))
    fd.append('user_id', String(currentUserId.value || '0'))
    fd.append('receipt', payFile.value)
    const res = await fetch(`${API}/api/payments/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await res.text())
    await res.json()
    paySuccess.value = true
    // refresh bills
    load()
  } catch (e) {
    payError.value = 'Failed to submit receipt.'
  } finally {
    submitLoading.value = false
  }
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

onMounted(load)
</script>