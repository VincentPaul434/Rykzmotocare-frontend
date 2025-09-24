<template>
  <section class="max-w-2xl mx-auto mt-12">
    <button
      class="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
      @click="$router.push('/user-homepage')"
    >
      ← Back to Homepage
    </button>
    <h2 class="text-xl font-bold mb-4">My Bookings</h2>
    <div v-if="bookingsLoading" class="text-gray-500">Loading bookings…</div>
    <div v-else-if="userBookings.length === 0" class="text-gray-500">No bookings yet.</div>
    <div v-else>
      <table class="w-full border rounded shadow text-sm">
        <thead class="bg-gray-50">
          <tr>
            <th class="py-2 px-3 text-left">Service</th>
            <th class="py-2 px-3 text-left">Vehicle</th>
            <th class="py-2 px-3 text-left">Mechanic</th>
            <th class="py-2 px-3 text-left">Status</th>
            <th class="py-2 px-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in userBookings" :key="b.booking_id" class="border-b">
            <td class="py-2 px-3">{{ b.service_requested }}</td>
            <td class="py-2 px-3">{{ b.vehicle_model }}</td>
            <td class="py-2 px-3">{{ b.mechanic_name }}</td>
            <td class="py-2 px-3">{{ b.book_status }}</td>
            <td class="py-2 px-3">
              <button
                v-if="b.book_status !== 'Cancelled' && b.book_status !== 'Completed'"
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                @click="cancelBooking(b.booking_id)"
              >
                Cancel
              </button>
              <span v-else class="text-gray-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const userBookings = ref([])
const bookingsLoading = ref(false)

async function fetchUserBookings() {
  bookingsLoading.value = true
  try {
    const userId = localStorage.getItem('user_id');
    const res = await fetch(`${API}/api/bookings/user/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const bookings = await res.json();
    userBookings.value = Array.isArray(bookings) ? bookings : (bookings.rows || [])
  } catch (e) {
    userBookings.value = []
  } finally {
    bookingsLoading.value = false
  }
}

async function cancelBooking(bookingId) {
  if (!confirm('Are you sure you want to cancel this booking?')) return
  try {
    const res = await fetch(`${API}/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!res.ok) throw new Error('Failed to cancel booking')
    alert('Booking cancelled.')
    fetchUserBookings()
  } catch (e) {
    alert('Could not cancel booking.')
  }
}

onMounted(() => {
  fetchUserBookings()
})
</script>