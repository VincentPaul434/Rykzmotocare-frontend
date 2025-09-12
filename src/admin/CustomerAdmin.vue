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
          <a href="#" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Customer</a>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
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
    <main class="flex-1 p-2 md:p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative min-w-[320px]">
      <!-- Top Bar -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 w-full">
          <span class="text-xl md:text-2xl font-bold">Admin</span>
          <input
            v-model="search"
            type="text"
            placeholder="search person..."
            class="border border-gray-400 rounded px-3 py-1 text-sm focus:outline-yellow-400 w-full md:w-auto"
          />
        </div>
        <div class="flex items-center gap-4 md:gap-6">
          <i class="fa fa-bell text-xl md:text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-2xl md:text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-0 text-xs md:text-base">
            <thead>
              <tr class="border-b-2 border-black">
                <th class="text-left py-2 px-2 md:px-4 font-semibold">Name:</th>
                <th class="text-left py-2 px-2 md:px-4 font-semibold">Email:</th>
                <th class="text-left py-2 px-2 md:px-4 font-semibold">Phone:</th>
                <th class="text-left py-2 px-2 md:px-4 font-semibold">Actions:</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(customer, idx) in filteredCustomers"
                :key="customer.user_id"
                :class="idx % 2 === 1 ? 'bg-gray-100' : ''"
                class="border-b border-black"
              >
                <td class="py-2 px-2 md:px-4">{{ customer.name }}</td>
                <td class="py-2 px-2 md:px-4">{{ customer.email }}</td>
                <td class="py-2 px-2 md:px-4">{{ customer.phone }}</td>
                <td class="py-2 px-2 md:px-4 flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                  <button
                    class="text-gray-800 hover:text-yellow-500 text-xs md:text-sm font-semibold"
                    @click="openEdit(customer)"
                  >Edit</button>
                  <span class="hidden md:inline">|</span>
                  <button
                    class="text-gray-800 hover:text-red-500 text-xs md:text-sm font-semibold"
                    @click="deleteCustomer(customer.user_id)"
                  >Delete</button>
                  <span class="ml-0 md:ml-2">
                    <i class="fa fa-bell text-lg md:text-xl"></i>
                  </span>
                </td>
              </tr>
              <tr v-if="filteredCustomers.length === 0">
                <td colspan="4" class="py-4 text-center text-sm text-gray-500">No customers found.</td>
              </tr>
            </tbody>
        </table>
        <div class="bg-gray-100 rounded-b-2xl h-20 md:h-40"></div>
      </div>
    </main>

    <!-- Edit Modal -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4"
    >
      <div class="bg-white w-full max-w-md rounded-lg p-6 relative">
        <button
          class="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-black"
          @click="closeEdit"
        >&times;</button>
        <h2 class="text-xl font-bold mb-4 text-center">Edit Customer</h2>
        <form @submit.prevent="saveEdit" class="flex flex-col gap-3">
          <input
            v-model="editForm.name"
            type="text"
            placeholder="Full Name"
            class="border rounded px-3 py-2"
            required
          />
            <input
              v-model="editForm.email"
              type="email"
              placeholder="Email"
              class="border rounded px-3 py-2"
              required
            />
          <input
            v-model="editForm.phone"
            type="text"
            placeholder="Phone"
            class="border rounded px-3 py-2"
          />
          <div class="flex justify-end gap-2 mt-2">
            <button
              type="button"
              @click="closeEdit"
              class="px-4 py-2 border rounded hover:bg-gray-100"
            >Cancel</button>
            <button
              type="submit"
              class="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 font-semibold rounded"
              :disabled="saving"
            >
              <span v-if="!saving">Save</span>
              <span v-else>Saving...</span>
            </button>
          </div>
          <p v-if="editError" class="text-red-500 text-sm mt-1">{{ editError }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const customers = ref([])
const search = ref('')
const router = useRouter()

// Edit modal state
const showEditModal = ref(false)
const editForm = ref({ name: '', email: '', phone: '' })
const editingId = ref(null)
const editError = ref('')
const saving = ref(false)

async function fetchApprovedCustomers() {
  try {
    const res = await fetch('http://localhost:5000/api/customers')
    const data = await res.json()
    customers.value = Array.isArray(data)
      ? data.filter(c => c.status === 'approved')
      : []
  } catch (e) {
    customers.value = []
  }
}

onMounted(fetchApprovedCustomers)

const filteredCustomers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return customers.value
  return customers.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.email && c.email.toLowerCase().includes(q)) ||
    (c.phone && c.phone.toLowerCase().includes(q))
  )
})

function openEdit(customer) {
  editingId.value = customer.user_id
  editForm.value = {
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || ''
  }
  editError.value = ''
  showEditModal.value = true
}

function closeEdit() {
  showEditModal.value = false
  editingId.value = null
  editForm.value = { name: '', email: '', phone: '' }
  editError.value = ''
}

async function saveEdit() {
  if (!editingId.value) return
  saving.value = true
  editError.value = ''
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${editingId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm.value)
    })
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      editError.value = d.message || 'Update failed'
      saving.value = false
      return
    }
    const idx = customers.value.findIndex(c => c.user_id === editingId.value)
    if (idx !== -1) customers.value[idx] = { ...customers.value[idx], ...editForm.value }
    closeEdit()
  } catch {
    editError.value = 'Network error'
  } finally {
    saving.value = false
  }
}

async function deleteCustomer(id) {
  if (!confirm('Delete this customer?')) return
  try {
    const res = await fetch(`http://localhost:5000/api/customers/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) {
      const t = await res.text().catch(() => '')
      alert(`Delete failed${t ? `: ${t}` : ''}`)
      return
    }
    customers.value = customers.value.filter(c => c.user_id !== id)
  } catch {
    alert('Network error')
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}

// Close shop
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
</script>