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
          <router-link to="/customer-payment" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Payment</router-link>
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
          <tr v-for="(booking, idx) in pagedBookings" :key="idx">
            <td class="border px-4 py-2">{{ booking.name }}</td>
            <td class="border px-4 py-2">{{ booking.vehicle_model }}</td>
            <td class="border px-4 py-2">{{ booking.service_requested }}</td>
            <td class="border px-4 py-2">{{ booking.book_status }}</td>
            <td class="border px-4 py-2">
              <button
                class="text-blue-600 mr-2 disabled:text-gray-400 disabled:cursor-not-allowed"
                :disabled="isCompletedOrCancelledOrDeclined(booking)"
                @click="openModal(idx + page * pageSize)"
              >
                Update
              </button>|
              <button class="text-green-600 ml-2" @click="openNotifyModal(idx + page * pageSize)">Notify</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="flex justify-end items-center mt-4 gap-2">
        <button
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          :disabled="page === 0"
          @click="prevPage"
        >Previous</button>
        <span class="mx-2">Page {{ page + 1 }}</span>
        <button
          class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          :disabled="(page + 1) * pageSize >= bookings.length"
          @click="nextPage"
        >Next</button>
      </div>
      <!-- Vehicle Progress Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-gray-200 rounded-lg p-6 relative w-80">
          <button @click="closeModal" class="absolute top-2 right-2 text-xl font-bold text-gray-700">&times;</button>
          <h3 class="text-lg font-semibold mb-4 text-center">Vehicle Progress:</h3>
          <!-- Replace the checkboxes with radio buttons for single selection -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <label><input type="radio" name="status" value="confirmed" v-model="selectedStatus" /> Confirmed</label>
            <label><input type="radio" name="status" value="completed" v-model="selectedStatus" /> Completed</label>
            <label><input type="radio" name="status" value="pending" v-model="selectedStatus" /> Pending</label>
            <label><input type="radio" name="status" value="declined" v-model="selectedStatus" /> Declined</label>
            <label><input type="radio" name="status" value="inProgress" v-model="selectedStatus" /> In progress</label>
            <label><input type="radio" name="status" value="waitingParts" v-model="selectedStatus" /> Waiting for Parts</label>
          </div>
          <button @click="saveChanges" class="block mx-auto bg-white border px-4 py-1 rounded hover:bg-gray-300">Save Changes</button>
        </div>
      </div>
      <!-- Notification Modal -->
      <div v-if="showNotifyModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-gray-200 rounded-lg p-6 relative w-80">
          <button @click="closeNotifyModal" class="absolute top-2 right-2 text-xl font-bold text-gray-700">&times;</button>
          <h3 class="text-lg font-semibold mb-4 text-center">Send Notification</h3>
          <div class="mb-4">
            <label class="block mb-2 font-semibold">Message to Customer:</label>
            <textarea v-model="notifyMessage" rows="4" class="w-full border rounded p-2" />
          </div>
          <button @click="sendNotification" class="block mx-auto bg-yellow-400 border px-4 py-1 rounded font-bold hover:bg-yellow-500">Send</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const bookings = ref([])
const page = ref(0)
const pageSize = 10
const showModal = ref(false)
const showNotifyModal = ref(false)
const notifyMessage = ref('')
const notifyBookingIdx = ref(null)
const selectedBookingIdx = ref(null)
const modalStatus = ref({
  confirmed: false,
  completed: false,
  pending: false,
  declined: false,
  inProgress: false,
  waitingParts: false,
})
const selectedStatus = ref('')

const pagedBookings = computed(() =>
  bookings.value.slice(page.value * pageSize, (page.value + 1) * pageSize)
)

function nextPage() {
  if ((page.value + 1) * pageSize < bookings.value.length) page.value++
}
function prevPage() {
  if (page.value > 0) page.value--
}

function isCompletedOrCancelledOrDeclined(b) {
  const status = String(b?.book_status || '').toLowerCase()
  return status === 'completed' || status === 'cancelled' || status === 'declined'
}

function isCompleted(b) {
  return String(b?.book_status || '').toLowerCase() === 'completed'
}

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

function openModal(idx) {
  const b = bookings.value[idx]
  if (isCompletedOrCancelledOrDeclined(b)) {
    alert('This booking is already Completed, Cancelled, or Declined and cannot be updated.')
    return
  }
  selectedBookingIdx.value = idx
  const statusMap = {
    Confirmed: 'confirmed',
    Completed: 'completed',
    Pending: 'pending',
    Declined: 'declined',
    'In progress': 'inProgress',
    'Waiting for Parts': 'waitingParts',
  }
  selectedStatus.value = statusMap[b.book_status] || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function openNotifyModal(idx) {
  notifyBookingIdx.value = idx
  // Default message based on status
  const booking = bookings.value[idx]
  notifyMessage.value = `Your booking status is now: ${booking.book_status}`
  showNotifyModal.value = true
}

function closeNotifyModal() {
  showNotifyModal.value = false
  notifyMessage.value = ''
  notifyBookingIdx.value = null
}

async function saveChanges() {
  const idx = selectedBookingIdx.value
  if (idx == null) return
  const booking = bookings.value[idx]

  // Defensive guard: never update Completed, Cancelled, or Declined bookings
  if (isCompletedOrCancelledOrDeclined(booking)) {
    alert('Completed, Cancelled, or Declined bookings cannot be updated.')
    closeModal()
    return
  }

  const statusMap = {
    confirmed: 'Confirmed',
    completed: 'Completed',
    pending: 'Pending',
    declined: 'Declined',
    inProgress: 'In progress',
    waitingParts: 'Waiting for Parts',
  }

  if (!selectedStatus.value) {
    alert('Please select a status.')
    return
  }

  const newStatus = statusMap[selectedStatus.value]
  try {
    const res = await fetch(`${API}/api/bookings/${booking.booking_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_status: newStatus }),
    })
    if (!res.ok) throw new Error('Failed to update booking status')

    booking.book_status = newStatus
    alert('Booking status updated!')

    // If Completed, create/ensure a feedback request and notify the customer (only once)
    if (newStatus === 'Completed') {
      await triggerFeedbackRequest(booking)
    }
  } catch (err) {
    alert('Could not update booking status.')
    console.error(err)
  }
  closeModal()
}

// Create feedback request (idempotent) and notify the user with the link
async function triggerFeedbackRequest(booking) {
  try {
    const r = await fetch(`${API}/api/feedback/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: booking.booking_id,
        user_id: booking.user_id,
      }),
    })
    if (!r.ok) throw new Error(await r.text())
    const data = await r.json() // { token, url, created, alreadySubmitted }
    // Send notification with link
    await fetch(`${API}/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: booking.user_id,
        type: 'feedback',
        message: `Your service is completed. Please share feedback: ${data.url}`,
        booking_id: booking.booking_id
      }),
    }).catch(() => {})
  } catch (e) {
    console.error('feedback request error', e)
  }
}

async function sendNotification() {
  const idx = notifyBookingIdx.value
  if (idx === null) return
  const booking = bookings.value[idx]
  try {
    // Send notification to the customer (user_id from booking)
    const res = await fetch(`http://localhost:5000/api/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: booking.user_id, 
        message: notifyMessage.value,
        type: 'booking'
      }),
    })
    if (!res.ok) throw new Error('Failed to send notification')
    alert('Customer notified!')
    closeNotifyModal()
  } catch (err) {
    alert('Could not send notification.')
    console.error(err)
  }
}

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}
</script>