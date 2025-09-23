<template>
  <div class="max-w-lg mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6 text-yellow-600 flex items-center gap-2">
      <span class="inline-block bg-yellow-100 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.764 7.528A2 2 0 0115 22H9a2 2 0 01-1.789-1.106l-3.764-7.528A2 2 0 013.236 10H8m6 0V6a2 2 0 10-4 0v4m4 0H8" /></svg>
      </span>
      Service Feedback
    </h2>

    <div v-if="loading" class="flex items-center gap-2 text-gray-500">
      <svg class="animate-spin h-5 w-5 text-yellow-400" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/></svg>
      Loading bookings…
    </div>
    <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4">
      {{ error }}
    </div>
    <div v-else-if="done" class="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4 flex items-center gap-2">
      <svg class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      Thank you for your feedback!
    </div>
    <div v-else>
      <div v-if="completedBookings.length === 0" class="bg-gray-50 border border-gray-200 text-gray-500 rounded p-3 mb-4">
        No completed bookings available for feedback.
      </div>
      <div v-else>
        <div class="mb-4">
          <label class="block mb-2 font-semibold text-gray-700" for="booking-select">Select Completed Booking</label>
          <select id="booking-select" v-model="selectedBookingId" class="border rounded px-3 py-2 w-full focus:ring-yellow-400 focus:border-yellow-400">
            <option value="">-- Select Booking --</option>
            <option v-for="b in completedBookings" :key="b.booking_id" :value="b.booking_id">
              {{ b.booking_id }} - {{ b.service_requested }}
            </option>
          </select>
        </div>

        <div v-if="selectedBookingId" class="bg-white border border-yellow-200 rounded-lg shadow p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="bg-yellow-100 rounded-full p-2">
              <svg class="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>
            </div>
            <div>
              <div class="font-bold text-lg text-yellow-700">Booking #{{ selectedBookingId }}</div>
              <div class="text-gray-600 text-sm">
                {{ completedBookings.find(b => b.booking_id === selectedBookingId)?.service_requested }}
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="block mb-2 font-semibold text-gray-700">Rating</label>
            <div class="flex items-center gap-1">
              <template v-for="n in 5" :key="n">
                <button
                  type="button"
                  @click="setRating(n)"
                  @keydown.enter="setRating(n)"
                  :aria-label="`Set rating to ${n}`"
                  class="focus:outline-none"
                >
                  <svg
                    class="h-7 w-7"
                    :class="n <= rating ? 'text-yellow-400' : 'text-gray-300'"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.174 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z"/>
                  </svg>
                </button>
              </template>
              <span class="ml-2 text-gray-600 font-medium">{{ rating }} / 5</span>
            </div>
          </div>

          <div class="mb-3">
            <label class="block mb-2 font-semibold text-gray-700">Comments</label>
            <textarea v-model="comment" class="border rounded w-full p-2 h-24 focus:ring-yellow-400 focus:border-yellow-400" placeholder="Share your experience…"></textarea>
          </div>

          <button :disabled="submitting || rating < 1 || rating > 5"
                  class="px-5 py-2 bg-yellow-400 font-bold rounded shadow hover:bg-yellow-500 transition disabled:opacity-60"
                  @click="submit">
            {{ submitting ? 'Submitting…' : 'Submit Feedback' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
const userId = localStorage.getItem('user_id') || ''

const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const done = ref(false)
const bookings = ref([])
const feedbacks = ref([])
const selectedBookingId = ref('')
const rating = ref(5)
const comment = ref('')

// Ensure rating is always 1-5
function setRating(n) {
  rating.value = Math.max(1, Math.min(5, n))
}

// Fetch completed bookings and feedbacks for this user
onMounted(async () => {
  try {
    // Get bookings
    const res1 = await fetch(`${API}/api/bookings?user_id=${userId}`)
    if (!res1.ok) throw new Error('Failed to load bookings')
    bookings.value = await res1.json()

    // Get feedbacks
    const res2 = await fetch(`${API}/api/feedbacks?user_id=${userId}`)
    feedbacks.value = res2.ok ? await res2.json() : []

  } catch (e) {
    error.value = e.message || 'Unable to load data.'
  } finally {
    loading.value = false
  }
})

// Only bookings that are Completed and have no feedback yet
const completedBookings = computed(() => {
  const fbBookingIds = new Set(feedbacks.value.map(fb => fb.booking_id))
  return bookings.value.filter(b =>
    String(b.book_status).toLowerCase() === 'completed' &&
    !fbBookingIds.has(b.booking_id)
  )
})

async function submit() {
  if (!selectedBookingId.value) return
  submitting.value = true
  error.value = ''
  try {
    const res = await fetch(`${API}/api/feedback/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: selectedBookingId.value,
        user_id: userId,
        rating: rating.value,
        comment: comment.value
      })
    })
    if (!res.ok) throw new Error(await res.text())
    done.value = true
  } catch (e) {
    error.value = e.message || 'Submit failed.'
  } finally {
    submitting.value = false
  }
}
</script>