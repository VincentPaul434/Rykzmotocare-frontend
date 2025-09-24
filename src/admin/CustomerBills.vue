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
          <router-link to="/customer-bills" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Customer Bills</router-link>
          <router-link to="/customer-payment" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Payments</router-link>
          <router-link to="/feedback-admin" class="block py-1 px-2 rounded hover: bg-gray=600">Feedback</router-link>
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
        <h2 class="text-3xl font-bold text-yellow-600 tracking-wide">CUSTOMER BILLS</h2>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-500"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>
      <div class="flex justify-center mt-8">
        <div class="bg-gray-100 rounded-xl shadow p-8 flex flex-col md:flex-row gap-8 w-full max-w-4xl">
          <!-- Form -->
          <form class="flex-1 space-y-4" @submit.prevent="sendNotification">
            <h3 class="text-xl font-bold mb-4">Notify Customer Payments</h3>
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1 space-y-3">
                <!-- Select Booking Dropdown -->
                <div>
                  <label class="block text-gray-700">Select Booking:</label>
                  <select @change="selectBooking(bookings[$event.target.selectedIndex - 1])" class="w-full border rounded px-2 py-1">
                    <option disabled selected>Select Booking</option>
                    <option v-for="b in bookings" :key="b.booking_id">
                      {{ b.booking_id }} - {{ b.name }} - {{ b.service_requested }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-gray-700">Total Amount Due:</label>
                  <input v-model="amountDue" type="number" class="w-full border rounded px-2 py-1" placeholder="Input Amount" />
                </div>
                <div>
                  <label class="block text-gray-700">Due Date:</label>
                  <input v-model="dueDate" type="date" class="w-full border rounded px-2 py-1" />
                </div>
                <div>
                  <label class="block text-gray-700">Payment Status:</label>
                  <select v-model="paymentStatus" class="w-full border rounded px-2 py-1">
                    <option>Unpaid</option>
                    <option>Paid</option>
                  </select>
                </div>
                <div>
                  <label class="block text-gray-700">Attach Invoice (Optional)</label>
                  <input type="file" @change="handleFileUpload" class="w-full" />
                </div>
              </div>
              <!-- Message to Customer -->
              <div class="flex-1 flex flex-col">
                <label class="block text-gray-700 mb-2">Message to the Customer:</label>
                <textarea v-model="message" class="w-full border rounded px-2 py-1 h-32 mb-4" />
                <div class="flex gap-4 justify-end">
                  <button type="button" class="border px-4 py-2 rounded" @click="resetForm">Cancel</button>
                  <button type="submit" class="bg-yellow-400 px-4 py-2 rounded font-bold">Send Notification</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const customerId = ref('')
const customerName = ref('')
const bookingId = ref('')
const serviceAvailed = ref('')
const amountDue = ref('')
const dueDate = ref('')
const paymentStatus = ref('Unpaid')
const message = ref('Your payment of 4,249.00 is now due.\nKindly pay before the service is completed.')
const invoiceFile = ref(null)
const bookings = ref([])

onMounted(async () => {
  // Fetch bookings from your backend
  const res = await fetch('http://localhost:5000/api/bookings')
  bookings.value = await res.json()
})

function handleFileUpload(event) {
  invoiceFile.value = event.target.files[0]
}

function resetForm() {
  customerId.value = ''
  customerName.value = ''
  bookingId.value = ''
  serviceAvailed.value = ''
  amountDue.value = ''
  dueDate.value = ''
  paymentStatus.value = 'Unpaid'
  message.value = ''
  invoiceFile.value = null
}

async function sendNotification() {
  try {
    const res = await fetch('http://localhost:5000/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: customerId.value,
        message: message.value,
        type: 'billing'
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Notification sent!')
      resetForm()
    } else {
      alert(data.message || 'Failed to send notification.')
    }
  } catch (err) {
    alert('Error sending notification.')
  }
}

function formatAmount(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// Keep message in sync with amountDue
function updateMessageFromAmount() {
  if (!amountDue.value && amountDue.value !== 0) return
  const amt = formatAmount(amountDue.value)
  message.value = `Your payment of ${amt} is now due.\nKindly pay before the service is completed.`
}

// Update message whenever amount changes (typed or set from booking)
watch(amountDue, () => updateMessageFromAmount())

// When selecting a booking, also refresh the message based on the amount
function selectBooking(booking) {
  if (booking) {
    customerId.value = booking.user_id
    customerName.value = booking.name
    bookingId.value = booking.booking_id
    serviceAvailed.value = booking.service_requested
    amountDue.value = booking.amount_due || ''
    dueDate.value = booking.due_date || ''
    paymentStatus.value = booking.book_status === 'Paid' ? 'Paid' : 'Unpaid'
    updateMessageFromAmount()
  } else {
    resetForm()
  }
}

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}

</script>