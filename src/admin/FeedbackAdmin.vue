<template>
  <div class="flex flex-row min-h-screen bg-gray-100 overflow-x-auto">
    <!-- Sidebar -->
    <aside class="w-56 md:w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4 flex-shrink-0">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/your-logo.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <a href="#" @click.prevent="handleCloseShop" class="block py-1 px-2 rounded hover:bg-gray-600">Close Shop</a>
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <router-link to="/customer-payment" class="block py-1 px-2 rounded hover:bg-gray-600"> Customer Payment</router-link>
          <span class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold cursor-default">Feedbacks</span>
          <router-link to="/customer-approval" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Approval</router-link>
        </nav>
      </div>
      <button class="flex items-center gap-2 text-white hover:text-yellow-400 mt-8 cursor-default">
        <i class="fa fa-sign-out"></i>
        <span>Logout</span>
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative min-w-[320px]">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-xl md:text-2xl font-bold">Admin</span>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-center text-2xl md:text-3xl font-extrabold text-yellow-400 tracking-wide mb-4">
        CUSTOMER FEED BACKS
      </h1>

      <!-- Table -->
      <div class="max-w-4xl mx-auto p-6">
        <div v-if="loading" class="text-gray-500">Loading feedbacks…</div>
        <div v-else-if="error" class="text-red-600">{{ error }}</div>
        <div v-else>
          <table class="w-full border rounded shadow text-sm">
            <thead class="bg-yellow-50">
              <tr>
                <th class="py-2 px-3 text-left">Booking ID</th>
                <th class="py-2 px-3 text-left">Customer</th>
                <th class="py-2 px-3 text-left">Rating</th>
                <th class="py-2 px-3 text-left">Message</th>
                <th class="py-2 px-3 text-left">Admin Reply</th>
                <th class="py-2 px-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fb in feedbacks" :key="fb.feedback_id" class="border-b">
                <td class="py-2 px-3 font-mono">{{ fb.booking_id }}</td>
                <td class="py-2 px-3">
                  {{ fb.name }}<br />
                  <span class="text-xs text-gray-500">{{ fb.email }}</span>
                </td>
                <td class="py-2 px-3">
                  <span class="font-bold text-yellow-600">{{ fb.rating }}</span> / 5
                </td>
                <td class="py-2 px-3">{{ fb.message }}</td>
                <td class="py-2 px-3 text-green-700">
                  <div v-if="fb.admin_reply">{{ fb.admin_reply }}</div>
                  <div v-else>
                    <input
                      v-model="replyInputs[fb.feedback_id]"
                      type="text"
                      placeholder="Type reply..."
                      class="border rounded px-2 py-1 text-sm w-32"
                    />
                    <button
                      class="ml-2 px-2 py-1 bg-yellow-400 text-black rounded text-xs font-bold"
                      @click="sendReply(fb.feedback_id, fb.user_id)"
                    >
                      Send
                    </button>
                  </div>
                </td>
                <td class="py-2 px-3 text-gray-500">{{ formatDate(fb.created_at) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!feedbacks.length" class="text-gray-500 mt-6">No feedbacks found.</div>
        </div>
      </div>

      <!-- Bottom rounded area to match design -->
      <div class="bg-gray-100 rounded-b-2xl h-40 mt-0"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const feedbacks = ref([])
const loading = ref(true)
const error = ref('')
const replyInputs = ref({})

function formatDate(s) {
  if (!s) return ''
  const d = new Date(s)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function handleCloseShop() {
  try {
    const res = await fetch('http://localhost:5000/api/shop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed' })
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.success !== true) {
      alert(data.error || 'Failed to close shop.')
      return
    }
    router.push('/close-shop')
  } catch {
    alert('Error closing shop.')
  }
}

async function sendReply(feedback_id, user_id) {
  const reply = replyInputs.value[feedback_id]
  if (!reply) return alert('Reply cannot be empty.')
  try {
    const res = await fetch(`${API}/api/feedback/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback_id, user_id, reply })
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      alert(data.error || 'Failed to send reply.')
      return
    }
    // Update the feedback row with the reply
    const fb = feedbacks.value.find(f => f.feedback_id === feedback_id)
    if (fb) fb.admin_reply = reply
    replyInputs.value[feedback_id] = ''
    alert('Reply sent!')
  } catch {
    alert('Error sending reply.')
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`${API}/api/feedback`);
    if (!res.ok) throw new Error('Failed to fetch feedbacks');
    feedbacks.value = await res.json();
  } catch (e) {
    error.value = e.message || 'Unable to load feedbacks.';
  } finally {
    loading.value = false;
  }
})
</script>