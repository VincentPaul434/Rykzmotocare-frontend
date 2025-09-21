<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-6">
    <div class="max-w-4xl mx-auto bg-white rounded shadow p-5">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold">Track Status</h1>
        <button v-if="booking" class="text-sm underline" @click="clearSelection">Clear</button>
      </div>

      <!-- Search -->
      <div class="flex flex-col md:flex-row gap-2 mb-6">
        <input
          v-model.trim="queryId"
          type="text"
          placeholder="Enter Booking ID"
          class="border rounded px-3 py-2 w-full md:w-80"
          @keyup.enter="track"
        />
        <div class="flex gap-2">
          <button
            class="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
            :disabled="loading || !queryId"
            @click="track"
          >
            {{ loading ? 'Searching…' : 'Track' }}
          </button>
          <button
            v-if="userId"
            class="px-4 py-2 border rounded"
            :disabled="loading"
            @click="loadMine"
          >
            My Bookings
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>
      <div v-if="!booking && !list.length && !loading" class="text-gray-500">Enter a Booking ID or load your bookings.</div>

      <!-- Single booking -->
      <div v-if="booking" class="border rounded p-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-gray-500">Booking ID</div>
            <div class="font-semibold">{{ booking.id }}</div>
          </div>
          <div>
            <span
              class="px-2 py-1 rounded text-sm"
              :class="badgeClass(booking.status)"
            >
              {{ booking.status }}
            </span>
          </div>
        </div>

        <div class="mt-3 text-sm">
          <div><span class="text-gray-500">Service:</span> {{ booking.service_requested || '—' }}</div>
          <div v-if="booking.created_at"><span class="text-gray-500">Created:</span> {{ formatDate(booking.created_at) }}</div>
          <div v-if="booking.updated_at"><span class="text-gray-500">Updated:</span> {{ formatDate(booking.updated_at) }}</div>
          <div v-if="booking.notes" class="mt-2"><span class="text-gray-500">Notes:</span> {{ booking.notes }}</div>
        </div>

        <!-- Progress -->
        <div class="mt-6">
          <div class="flex items-center justify-between text-xs text-gray-600">
            <span v-for="(s, i) in steps" :key="s" class="flex-1 text-center">
              <div
                class="mx-auto w-2 h-2 rounded-full"
                :class="i <= currentStepIndex ? 'bg-green-600' : 'bg-gray-300'"
              ></div>
              <div class="mt-1">{{ s }}</div>
            </span>
          </div>
          <div class="relative h-1 bg-gray-200 rounded mt-3">
            <div
              class="absolute h-1 bg-green-600 rounded"
              :style="{ width: progressWidth }"
            ></div>
          </div>
        </div>

        <div class="mt-4">
          <button class="px-3 py-2 border rounded" @click="refresh">Refresh</button>
        </div>
      </div>

      <!-- My bookings list -->
      <div v-if="!booking && pagedList.length" class="mt-4">
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="border-b bg-gray-100">
                <th class="text-left p-2">Booking ID</th>
                <th class="text-left p-2">Service</th>
                <th class="text-left p-2">Date</th>
                <th class="text-left p-2">Status</th>
                <th class="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="b in pagedList" :key="b.id" class="border-b">
                <td class="p-2 font-medium">{{ b.id }}</td>
                <td class="p-2">{{ b.service || '—' }}</td>
                <td class="p-2">{{ b.created_at ? formatDate(b.created_at) : '—' }}</td>
                <td class="p-2">
                  <span class="px-2 py-1 rounded" :class="badgeClass(b.status)">{{ b.status }}</span>
                </td>
                <td class="p-2">
                  <button class="text-blue-700 underline" @click="select(b)">Track</button>
                </td>
              </tr>
              <tr v-if="!pagedList.length">
                <td colspan="5" class="p-3 text-center text-gray-500">No bookings.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-between mt-3">
          <div class="text-sm text-gray-600">
            Page {{ page }} of {{ totalPages }} · Showing
            {{ startIndex + 1 }}–{{ endIndex }} of {{ list.length }}
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1 border rounded disabled:opacity-60"
                    :disabled="page === 1"
                    @click="prevPage">Prev</button>
            <button class="px-3 py-1 border rounded disabled:opacity-60"
                    :disabled="page === totalPages"
                    @click="nextPage">Next</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const route = useRoute()
const router = useRouter()

const userId = Number(localStorage.getItem('user_id') || 0)
const queryId = ref(String(route.query.bookingId || ''))

const loading = ref(false)
const error = ref('')
const booking = ref(null)
const list = ref([])

// Known status flow
const steps = [
  'Pending',
  'Confirmed',
  'In progress',
  'Waiting for Parts',
  'Completed',
  'Declined'
]

const normalizedStatus = computed(() => (booking.value?.status || '').trim())
const currentStepIndex = computed(() => {
  const idx = steps.findIndex(s => s.toLowerCase() === normalizedStatus.value.toLowerCase())
  if (idx >= 0) return idx
  // Fallbacks for alternate field values
  const val = normalizedStatus.value.toLowerCase()
  if (val === 'waiting for parts' || val === 'waiting_parts') return steps.indexOf('Waiting for Parts')
  if (val === 'in progress' || val === 'in_progress') return steps.indexOf('In progress')
  if (val === 'complete' || val === 'completed') return steps.indexOf('Completed')
  if (val === 'confirm' || val === 'confirmed') return steps.indexOf('Confirmed')
  if (val === 'decline' || val === 'declined') return steps.indexOf('Declined')
  return 0
})
const progressWidth = computed(() => {
  const pct = (currentStepIndex.value / (steps.length - 1)) * 100
  return `${Math.max(0, Math.min(100, pct))}%`
})

function badgeClass(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('complete')) return 'bg-green-100 text-green-700'
  if (s.includes('confirm')) return 'bg-blue-100 text-blue-700'
  if (s.includes('progress')) return 'bg-yellow-100 text-yellow-700'
  if (s.includes('wait')) return 'bg-orange-100 text-orange-700'
  if (s.includes('declin') || s.includes('cancel')) return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const page = ref(1)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(list.value.length / pageSize)))
const startIndex = computed(() => (page.value - 1) * pageSize)
const endIndex = computed(() => Math.min(list.value.length, startIndex.value + pageSize))
const pagedList = computed(() => list.value.slice(startIndex.value, endIndex.value))

function nextPage() { if (page.value < totalPages.value) page.value++ }
function prevPage() { if (page.value > 1) page.value-- }

// Map service_requested -> service
function mapBooking(r) {
  return {
    id: r.booking_id ?? r.id ?? r.appointment_id ?? r.code,
    status: r.book_status ?? r.status ?? r.progress ?? 'Pending',
    service:
      (Array.isArray(r.service_requested) ? r.service_requested.join(', ') : r.service_requested) ??
      r.serviceRequested ?? r.requested_service ?? r.service_type ?? r.service ?? r.title ?? '',
    notes: r.notes ?? r.remark ?? '',
    created_at: r.created_at ?? r.date_created ?? r.createdAt ?? null,
    updated_at: r.updated_at ?? r.date_updated ?? r.updatedAt ?? null
  }
}

// Try a list of endpoints and return the first good JSON
async function fetchFirstOk(paths) {
  for (const p of paths) {
    try {
      const res = await fetch(`${API}${p}`)
      if (res.ok) return await res.json()
    } catch { /* try next */ }
  }
  return null
}

// Fetch ONLY current user's bookings
async function fetchMyBookings() {
  if (!userId) {
    error.value = 'Please sign in to view your bookings.'
    return
  }
  loading.value = true
  error.value = ''
  list.value = []
  try {
    // Prefer server-side filtering
    let data = await fetchFirstOk([
      `/api/bookings?user_id=${userId}`,
      `/api/appointments?user_id=${userId}`
    ])
    // If backend ignores user_id, fallback to fetching all then filter client-side
    if (!data) {
      data = await fetchFirstOk(['/api/bookings', '/api/appointments'])
    }
    const arr = Array.isArray(data) ? data : (data?.bookings || data?.appointments || [])
    const mine = (arr || [])
      .map(mapBookingWithUser)
      .filter(r => Number(r.user_id) === userId)
    list.value = mine.map(mapBooking)
  } catch {
    error.value = 'Failed to load your bookings.'
  } finally {
    loading.value = false
  }
}

// Augment mapping to include user_id for ownership checks
function mapBookingWithUser(r) {
  return {
    ...r,
    user_id: r.user_id ?? r.customer_id ?? r.client_id ?? r.userId ?? null
  }
}

// Fetch a booking by ID but ensure it belongs to the current user
async function fetchBookingById(id) {
  if (!userId) {
    error.value = 'Please sign in to view your bookings.'
    return
  }
  loading.value = true
  error.value = ''
  booking.value = null
  try {
    // Try endpoints that support user scoping first
    let data = await fetchFirstOk([
      `/api/bookings/${encodeURIComponent(id)}?user_id=${userId}`,
      `/api/appointments/${encodeURIComponent(id)}?user_id=${userId}`
    ])
    // If not supported, load my list then find locally
    if (!data) {
      await fetchMyBookings()
      const found = list.value.find(b => String(b.id) === String(id))
      if (!found) {
        error.value = 'Booking not found in your account.'
        return
      }
      booking.value = found
      return
    }
    const rowRaw = Array.isArray(data) ? data[0] : (data.booking || data)
    if (!rowRaw) {
      error.value = 'Booking not found.'
      return
    }
    const rowWithUser = mapBookingWithUser(rowRaw)
    if (Number(rowWithUser.user_id) !== userId) {
      error.value = 'Booking not found in your account.'
      return
    }
    booking.value = mapBooking(rowWithUser)
  } catch (e) {
    error.value = 'Failed to load booking.'
  } finally {
    loading.value = false
  }
}

function select(b) {
  // Only allow selecting from my list (already scoped)
  booking.value = b
  queryId.value = String(b.id || '')
  router.replace({ query: { bookingId: queryId.value } })
}

function clearSelection() {
  booking.value = null
  queryId.value = ''
  router.replace({ query: {} })
}

async function track() {
  if (!queryId.value) return
  await fetchBookingById(queryId.value)
  if (booking.value) {
    router.replace({ query: { bookingId: queryId.value } })
  }
}

async function loadMine() {
  await fetchMyBookings()
}

async function refresh() {
  if (booking.value?.id) await fetchBookingById(booking.value.id)
}

onMounted(async () => {
  if (!userId) {
    error.value = 'Please sign in to view your bookings.'
    return
  }
  // Always scope to current user on load
  if (queryId.value) await fetchBookingById(queryId.value)
  else await fetchMyBookings()
})

watch(() => route.query.bookingId, async (val) => {
  if (!userId) return
  if (val && String(val) !== queryId.value) {
    queryId.value = String(val)
    await fetchBookingById(queryId.value)
  }
})

// After loading lists, reset to page 1
watch(list, () => { if (page.value > totalPages.value) page.value = totalPages.value })
</script>