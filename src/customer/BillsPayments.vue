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
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
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
                <!-- use paginated rows -->
                <tr v-for="b in pageRows" :key="b.id" class="border-b">
                  <td class="p-2 font-medium">{{ b.booking_id || b.id }}</td>
                  <td class="p-2">
                    {{ b.service_type || '—' }}
                    <span v-if="b.kind==='payment'" class="ml-1 text-xs text-gray-500">(Payment)</span>
                  </td>
                  <td class="p-2">₱{{ Number(b.display_amount || 0).toFixed(2) }}</td>
                  <td class="p-2">
                    <span :class="statusClass(b.status)">
                      {{ b.status }}
                    </span>
                  </td>
                  <td class="p-2 space-x-3">
                    <button class="text-yellow-700 hover:underline" @click="openDetails(b)">View Details</button>
                    <button
                      v-if="canPayRow(b)"
                      class="text-blue-700 hover:underline"
                      @click="openPay(b)"
                    >
                      Pay Now
                    </button>
                    <span v-else class="text-gray-400">Awaiting admin confirmation</span>

                    <!-- use payment_status (pay_status) or receipt_url to show receipt -->
                    <button
                      v-if="b.pay_status === 'Paid' || b.receipt_url"
                      class="text-blue-700 hover:underline"
                      @click="openReceipt(b)"
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
              <!-- Notified amount hint -->
              <div v-if="notifiedAmount !== null" class="text-xs text-gray-600 mt-1">
                Notified amount: ₱{{ Number(notifiedAmount).toFixed(2) }}
                <button class="ml-2 text-blue-700 underline" @click="applyNotifiedAmount">Use</button>
              </div>
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
            <!-- add ref so we can reset input; keep accept to images -->
            <input ref="payFileInput" type="file" accept="image/*" @change="onPayFile" />
            <div class="mt-3 flex gap-2">
              <button class="px-4 py-2 border rounded" @click="payStep='form'">Change details</button>
              <!-- use guard handler and computed disabled -->
              <button
                class="px-4 py-2 bg-yellow-400 rounded font-bold disabled:opacity-60"
                :disabled="isSubmitDisabled"
                @click="handleSubmitReceipt"
              >
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
import { ref, computed, onMounted, watch } from 'vue'

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
const payStep = ref('form')
const startLoading = ref(false)
const submitLoading = ref(false)
const payError = ref('')
const paySuccess = ref(false)
const payInfo = ref({ payment_ref: '', amount: 0 })
const payInstr = ref({})
const payFile = ref(null)
const payFileInput = ref(null)

// ADD: current user id used by load(), fetchNotifications(), submitServiceReceipt()
const currentUserId = ref(String(localStorage.getItem('user_id') || '0'))
if (typeof window !== 'undefined') {
  window.addEventListener('auth:login', () => {
    currentUserId.value = String(localStorage.getItem('user_id') || '0')
  })
  window.addEventListener('auth:logout', () => {
    currentUserId.value = '0'
  })
}

// disable until file chosen or while uploading
const isSubmitDisabled = computed(() => !payFile.value || submitLoading.value)

// pagination
const pageSize = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const pageStart = computed(() => (currentPage.value - 1) * pageSize)
const pageRows = computed(() => filtered.value.slice(pageStart.value, pageStart.value + pageSize))
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }
watch([search, statusFilter, records], () => { currentPage.value = 1 })

// ---- FIX: add filtered computed ----
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (records.value || []).filter(r => {
    const txt = `${r.booking_id ?? r.id ?? ''} ${r.service_type ?? ''}`.toLowerCase()
    const textOk = !q || txt.includes(q)
    const statusOk =
      statusFilter.value === 'all' ||
      String(r.status || '').toLowerCase() === statusFilter.value.toLowerCase()
    return textOk && statusOk
  })
})

// ---- helpers for bills list ----
function resolveUrl(u) {
  if (!u) return ''
  const n = String(u).replace(/\\/g, '/')
  return /^https?:\/\//i.test(n) ? n : `${API}${n.startsWith('/') ? '' : '/'}${n}`
}

// Keep an index of latest payment per booking
const latestPaymentByBooking = ref({})

// Build index: pick the newest payment per booking_id
function buildPaymentIndex(list) {
  const idx = {}
  for (const p of list || []) {
    const bid = p?.booking_id
    if (!bid) continue
    const ts = new Date(p.created_at || 0).getTime()
    if (!idx[bid] || ts > idx[bid].__t) {
      idx[bid] = { ...p, __t: ts }
    }
  }
  return idx
}

// Replace: map to match bookings table and show display_amount with payment fallback
function mapBill(r) {
  const pay = latestPaymentByBooking.value[String(r.booking_id)] || null
  const fallbackAmt = Number(pay?.amount || 0)
  return {
    id: r.booking_id ?? r.id,
    booking_id: r.booking_id ?? r.id,
    service_type: r.service_requested ?? r.service_type ?? '',
    // display_amount shows DB total_amount; if null/0, fallback to latest payment amount
    display_amount: Number(r.total_amount ?? 0) || fallbackAmt,
    total_amount: Number(r.total_amount ?? 0), // keep raw for logic if you need it
    // booking_status shown in UI
    status: r.book_status ?? r.booking_status ?? 'Pending',
    // payment-related fields (fallback to latest payment)
    pay_status: r.payment_status ?? pay?.status ?? '',
    receipt_url: r.receipt_url ?? pay?.receipt_url ?? null,
    created_at: r.created_at ?? r.updated_at ?? pay?.created_at ?? null,
    user_id: r.user_id ?? r.customer_id ?? null,
    kind: 'bill'
  }
}

// status badge color (based on booking_status)
function statusClass(s) {
  const v = String(s || '').toLowerCase()
  if (v === 'pending') return 'text-yellow-600'
  if (v === 'confirmed') return 'text-blue-600'
  if (v === 'completed') return 'text-green-600'
  if (v === 'cancelled' || v === 'canceled') return 'text-gray-500'
  return 'text-gray-600'
}

// Only service bookings for the signed-in user
function belongsToCurrentUser(row) {
  const uid = String(currentUserId.value || '')
  const rowUid = row.user_id != null ? String(row.user_id) : ''
  return uid && rowUid && rowUid === uid
}
function isServiceRecord(row) {
  return !!row.booking_id
}

// Fetch ONLY bookings of current user (no orders/payments merge)
async function getJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : (data.rows || data.bookings || [])
  } catch { return [] }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const uid = encodeURIComponent(currentUserId.value || '')
    // Fetch bookings + service payments (fallback to legacy /api/payments filtered by booking_id)
    const [rows, sp, legacy] = await Promise.all([
      getJson(`${API}/api/bookings?user_id=${uid}`),
      getJson(`${API}/api/service-payments?user_id=${uid}`),
      getJson(`${API}/api/payments?user_id=${uid}`)
    ])

    // Only keep payments that belong to a booking
    const servicePayments = [...(sp || []), ...(legacy || [])].filter(p => p && p.booking_id)

    latestPaymentByBooking.value = buildPaymentIndex(servicePayments)

    records.value = (rows || [])
      .map(mapBill)             // map uses latestPaymentByBooking fallback now
      .filter(isServiceRecord)
      .filter(belongsToCurrentUser)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  } catch (e) {
    error.value = 'Failed to load records.'
    records.value = []
  } finally {
    loading.value = false
  }
}

// notifications (for suggested amount and gating)
const notifications = ref([])
async function fetchNotifications() {
  const uid = String(currentUserId.value || '')
  if (!uid) return
  try {
    const res = await fetch(`${API}/api/notifications/${uid}`)
    if (!res.ok) return
    const data = await res.json()
    notifications.value = Array.isArray(data) ? data : (data.notifications || [])
  } catch { notifications.value = [] }
}
const notifiedAmount = ref(null)
function getAmountFromNote(note) {
  if (note?.amount != null) return Number(note.amount)
  if (note?.data?.amount != null) return Number(note.data.amount)
  const msg = String(note?.message ?? '')
  const t = msg.trim()
  if (t.startsWith('{') && t.endsWith('}')) {
    try { const o = JSON.parse(t); if (o.amount != null) return Number(o.amount) } catch {}
  }
  const m = msg.replace(/,/g, '').match(/(\d+(\.\d{1,2})?)/g)
  return m && m.length ? Number(m[m.length - 1]) : null
}
function findNotifiedAmount(bookingId) {
  const idStr = String(bookingId || '')
  const cand = notifications.value
    .filter(n => {
      const t = String(n.type || '').toLowerCase()
      const msg = String(n.message || '')
      const hasId = idStr && (msg.includes(idStr) || String(n.booking_id || '').includes(idStr))
      const isBill = t.includes('bill') || t.includes('payment') || t.includes('billing')
      return hasId || isBill
    })
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
  for (const n of cand) {
    const v = getAmountFromNote(n)
    if (v && v > 0) return v
  }
  return null
}
function applyNotifiedAmount() {
  if (notifiedAmount.value != null) pay.value.amount = Number(notifiedAmount.value)
}
watch(() => pay.value.booking_id, (val) => {
  notifiedAmount.value = findNotifiedAmount(val)
  if ((!pay.value.amount || pay.value.amount <= 0) && notifiedAmount.value != null) {
    pay.value.amount = Number(notifiedAmount.value)
  }
})

// Normalize
function norm(s) { return String(s ?? '').trim().toLowerCase() }

// Allow Pay Now only if admin confirmed and payment not yet paid (for Bills table)
function canPayRow(row) {
  if (row.kind === 'payment') return false
  const amt = Number(row.total_amount || 0)
  const isConfirmed = norm(row.book_status) === 'confirmed'
  const isPaid = norm(row.pay_status) === 'paid' // use payment_status for "paid"
  return amt > 0 && isConfirmed && !isPaid
}

// Detect a billing/payment notification mentioning the booking
function hasBillingNotification(bookingId) {
  const id = String(bookingId || '').trim()
  if (!id) return false
  return notifications.value.some(n => {
    const t = String(n.type || '').toLowerCase()
    const msg = String(n.message || '')
    const mentions = msg.includes(id) || String(n.booking_id || '').includes(id)
    const isBill = t.includes('bill') || t.includes('billing') || t.includes('payment')
    return mentions && isBill
  })
}

// Relaxed gating for the Pay tab (Continue button)
// - booking must be Confirmed (if we can find it), and not already Paid
// - and (row has total_amount > 0 OR user entered amount > 0 OR there is a billing notification)
const isPayableBookingId = computed(() => {
  const id = String(pay.value.booking_id || '').trim()
  if (!id) return false
  const row = records.value.find(r => String(r.booking_id) === id)
  const entered = Number(pay.value.amount) > 0
  const noted = hasBillingNotification(id) || notifiedAmount.value != null

  if (!row) {
    // If not in list, allow only when user entered an amount and there is a billing note
    return entered && noted
  }

  const confirmed = norm(row.book_status) === 'confirmed'
  const alreadyPaid = norm(row.pay_status) === 'paid'
  const hasDue = Number(row.total_amount || 0) > 0

  return confirmed && !alreadyPaid && (hasDue || entered || noted)
})

// Find booking by ID
const currentBooking = computed(() =>
  records.value.find(r => String(r.booking_id) === String(pay.value.booking_id))
)

// Enable Continue when:
// - booking exists and is Confirmed
// - not already Paid
// - amount > 0 and method selected
const canStart = computed(() => {
  const row = currentBooking.value
  const amtOk = Number(pay.value.amount) > 0
  const methodOk = !!pay.value.method
  if (!row) return false
  const confirmed = String(row.book_status || row.status || '').toLowerCase() === 'confirmed'
  const alreadyPaid = String(row.pay_status || '').toLowerCase() === 'paid'
  return confirmed && !alreadyPaid && amtOk && methodOk
})

// Helpful reason (optional)
const continueDisabledReason = computed(() => {
  const row = currentBooking.value
  if (!pay.value.booking_id) return 'Enter a booking ID.'
  if (!row) return 'Booking not found.'
  if (String(row.book_status).toLowerCase() !== 'confirmed') return 'Booking not confirmed by admin yet.'
  if (String(row.pay_status || '').toLowerCase() === 'paid') return 'Already paid.'
  if (!(Number(pay.value.amount) > 0)) return 'Enter a valid amount.'
  if (!pay.value.method) return 'Select a payment method.'
  return ''
})

// Pretty date for details modal
function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

// Start service payment (calls new endpoint, falls back to legacy)
async function startServicePayment() {
  if (!canStart.value) {
    payError.value = 'Payment is not available yet. Please wait for admin confirmation and enter a valid amount.'
    return
  }
  startLoading.value = true
  payError.value = ''
  paySuccess.value = false
  try {
    const body = {
      booking_id: Number(pay.value.booking_id),
      user_id: Number(currentUserId.value) || 0,
      method: pay.value.method,
      amount: Number(pay.value.amount)
    }
    let res = await fetch(`${API}/api/service-payments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      res = await fetch(`${API}/api/payments/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, kind: 'service' })
      })
    }
    if (!res.ok) throw new Error(await res.text().catch(() => 'Failed to start payment'))

    const data = await res.json().catch(() => ({}))
    const instrObj = typeof data.instructions === 'object' ? data.instructions : {}

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
    payError.value = e?.message || 'Failed to start payment.'
  } finally {
    startLoading.value = false
  }
}

// File selection + validation
function onPayFile(e) {
  const f = e?.target?.files?.[0] || null
  if (!f) { payFile.value = null; payError.value = 'Please select a receipt image.'; return }
  if (!/^image\//.test(f.type)) { payError.value = 'Only image files are allowed.'; return }
  if (f.size > 8 * 1024 * 1024) { payError.value = 'File is too large (max 8MB).'; return }
  payError.value = ''
  payFile.value = f
}

// Guard click then upload
async function handleSubmitReceipt() {
  if (!payFile.value) { payError.value = 'Please select a receipt image first.'; return }
  await submitServiceReceipt()
  if (paySuccess.value && payFileInput.value) {
    payFileInput.value.value = ''
    payFile.value = null
  }
}

// Upload receipt (new endpoint, fallback to legacy)
async function submitServiceReceipt() {
  if (!payFile.value) return
  submitLoading.value = true
  payError.value = ''
  paySuccess.value = false
  try {
    const fd = new FormData()
    fd.append('booking_id', String(pay.value.booking_id))
    fd.append('user_id', String(currentUserId.value || '0'))
    fd.append('amount', String(Number(pay.value.amount || 0))) // <-- send amount
    fd.append('receipt', payFile.value)

    let res = await fetch(`${API}/api/service-payments/upload`, { method: 'POST', body: fd })
    if (!res.ok) res = await fetch(`${API}/api/payments/upload`, { method: 'POST', body: fd })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      throw new Error(t || `Upload failed (${res.status})`)
    }

    await res.json().catch(() => ({}))
    paySuccess.value = true
    await load()
  } catch (e) {
    payError.value = e?.message || 'Failed to submit receipt.'
  } finally {
    submitLoading.value = false
  }
}

// Open/close details modal
function openDetails(row) {
  selected.value = row
  showDetails.value = true
}
function closeDetails() {
  showDetails.value = false
  selected.value = null
}

// Open receipt in a new tab (if available)
function openReceipt(row) {
  const url = row?.receipt_url
  if (url) window.open(resolveUrl(url), '_blank')
  else payError.value = 'No receipt available for this booking.'
}

// Open Pay tab with prefilled info, but don't force 0 over user input
function openPay(row) {
  const bid = String(row.booking_id || row.id || '')
  activeTab.value = 'pay'
  pay.value.booking_id = bid
  const nAmt = findNotifiedAmount(bid)
  const baseAmt = Number(row.total_amount || 0)
  pay.value.amount = nAmt != null ? Number(nAmt) : (baseAmt > 0 ? baseAmt : null)
  pay.value.method = ''
  payStep.value = 'form'
  payError.value = ''
  paySuccess.value = false
  payFile.value = null
}

onMounted(async () => {
  await Promise.all([load(), fetchNotifications()])
})
</script>