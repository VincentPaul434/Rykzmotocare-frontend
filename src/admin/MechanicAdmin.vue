<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/your-logo.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Close Shop</a>
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <router-link to="/inventory-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Inventory</router-link>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <a href="#" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Available Mechanics</a>
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
    <main class="flex-1 p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative">
      <!-- Top Bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold">Admin</span>
          <button
            class="border border-gray-400 rounded px-3 py-1 text-sm hover:bg-gray-100 transition"
            @click="showAddModal = true"
          >Add New Mechanic</button>
          <input
            type="text"
            placeholder="search person..."
            class="border border-gray-400 rounded px-3 py-1 text-sm focus:outline-yellow-400"
            v-model="search"
          />
        </div>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <div v-if="loading" class="p-4 text-gray-600">Loading mechanics...</div>
        <div v-else-if="loadError" class="p-4 text-red-600">{{ loadError }}</div>

        <table v-else class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="text-left py-2 px-4 font-semibold">Mechanic Name:</th>
              <th class="text-left py-2 px-4 font-semibold">Specialty:</th>
              <th class="text-left py-2 px-4 font-semibold">Status:</th>
              <th class="text-left py-2 px-4 font-semibold">Actions:</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(mechanic, idx) in filteredMechanics"
              :key="mechanic.mechanic_id ?? mechanic.id ?? idx"
              :class="idx % 2 === 1 ? 'bg-gray-100' : ''"
              class="border-b border-black"
            >
              <td class="py-2 px-4 font-semibold">{{ mechanic.name }}</td>
              <td class="py-2 px-4">{{ mechanic.specialization }}</td>
              <td class="py-2 px-4 font-semibold">
                <span :class="(mechanic.status || '').includes('Available') ? 'text-black' : 'text-gray-600'">
                  {{ mechanic.status }}
                </span>
              </td>
              <td class="py-2 px-4">
                <button
                  class="text-gray-800 hover:text-yellow-500 text-sm font-semibold mr-2"
                  @click="openEditModal(mechanic)"
                >Edit</button>
                <span>|</span>
                <button
                  class="text-gray-800 hover:text-red-600 text-sm font-semibold ml-2"
                  @click="removeMechanic(mechanic.mechanic_id ?? mechanic.id)"
                >Remove</button>
              </td>
            </tr>

            <tr v-if="filteredMechanics.length === 0">
              <td colspan="4" class="py-6 px-4 text-center text-gray-600">
                No mechanics found.
              </td>
            </tr>
          </tbody>
        </table>
        <div class="bg-gray-100 rounded-b-2xl h-40"></div>
      </div>
    </main>

    <!-- Add Mechanic Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-white rounded-lg w-full max-w-md p-8 relative">
        <span class="absolute top-4 right-4 text-2xl font-bold text-gray-500 cursor-pointer" @click="showAddModal = false">&times;</span>
        <h2 class="text-xl font-bold mb-4">Add Mechanic</h2>
        <form @submit.prevent="addMechanic">
          <input v-model="form.name" class="w-full mb-3 p-2 border rounded" placeholder="Name" required />
          <input v-model="form.specialization" class="w-full mb-3 p-2 border rounded" placeholder="Specialty" required />
          <div class="flex gap-4 mb-3">
            <label class="flex items-center gap-1">
              <input type="radio" value="MWF" v-model="form.days_available" class="accent-black" required />
              MWF
            </label>
            <label class="flex items-center gap-1">
              <input type="radio" value="TTH" v-model="form.days_available" class="accent-black" required />
              TTH
            </label>
          </div>
          <input v-model="form.time_available" class="w-full mb-3 p-2 border rounded" placeholder="9:00 am - 5:00 pm" required />
          <select v-model="form.status" class="w-full mb-3 p-2 border rounded" required>
            <option value="">Select Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
          </select>
          <input v-model="form.availability" class="w-full mb-3 p-2 border rounded" placeholder="Specialization" required />

          <!-- Photo upload -->
          <label class="block font-semibold mb-1">Photo</label>
          <input type="file" accept="image/*" @change="onPhotoChange" class="w-full mb-3 p-2 border rounded" />
          <div v-if="photoPreview" class="mb-4">
            <img :src="photoPreview" alt="Preview" class="w-24 h-24 object-cover rounded border" />
          </div>

          <button class="w-full bg-black text-white font-bold rounded py-2 mt-2 hover:bg-yellow-400 hover:text-black transition" type="submit">
            Add Mechanic
          </button>
        </form>
      </div>
    </div>

    <!-- Edit Mechanic Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div class="bg-gray-200 rounded-lg w-full max-w-md p-8 relative">
        <span class="absolute top-4 right-4 text-2xl font-bold text-gray-700 cursor-pointer" @click="showEditModal = false">&times;</span>
        <h2 class="text-xl font-bold mb-4 text-center">Edit Mechanic</h2>
        <form @submit.prevent="updateMechanic" class="flex flex-col gap-2">
          <label class="font-semibold">Name
            <input v-model="form.name" class="w-full border border-black rounded px-2 py-1 mt-1 bg-transparent" required />
          </label>
          <label class="font-semibold">Specialty
            <select v-model="form.specialization" class="w-full border border-black rounded px-2 py-1 mt-1 bg-transparent" required>
              <option value="">Select Specialty</option>
              <option value="All-Around">All-Around</option>
              <option value="Engine Overhaul">Engine Overhaul</option>
              <!-- Add more specialties as needed -->
            </select>
          </label>
          <label class="font-semibold">Availability</label>
          <div class="flex gap-4 mb-1">
            <label class="flex items-center gap-1">
              <input type="radio" value="MWF" v-model="form.days_available" class="accent-black" />
              MWF
            </label>
            <label class="flex items-center gap-1">
              <input type="radio" value="TTH" v-model="form.days_available" class="accent-black" />
              TTH
            </label>
          </div>
          <input v-model="form.time_available" class="w-full border border-black rounded px-2 py-1 mb-2 bg-transparent" placeholder="9:00 am - 5:00 pm" />
          <label class="font-semibold">Status
            <select v-model="form.status" class="w-full border border-black rounded px-2 py-1 mt-1 bg-transparent" required>
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </label>
          <label class="font-semibold">Specialization
            <input v-model="form.availability" class="w-full border border-black rounded px-2 py-1 mt-1 bg-transparent" />
          </label>
          <button class="border border-black rounded px-4 py-2 mt-4 mx-auto font-semibold hover:bg-black hover:text-white transition" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const adminId = localStorage.getItem('admin_id')
const token = localStorage.getItem('token')
const isAdmin = !!adminId && !!token

const mechanics = ref([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')

const showAddModal = ref(false)
const showEditModal = ref(false)
const editId = ref(null)

// Photo upload state
const photoFile = ref(null)
const photoPreview = ref(null)

const form = ref({
  name: '',
  specialization: '',
  days_available: '',
  time_available: '',
  status: '',
  availability: '' // keep if your DB expects it; otherwise remove from payload
})

const filteredMechanics = computed(() => {
  const list = Array.isArray(mechanics.value) ? mechanics.value : []
  const q = (search.value || '').toLowerCase()
  return list.filter(m =>
    (m.name || '').toLowerCase().includes(q) ||
    (m.specialization || '').toLowerCase().includes(q)
  )
})

async function fetchMechanics() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetch('http://localhost:5000/api/mechanics')
    const data = await res.json().catch(() => ({}))
    mechanics.value = Array.isArray(data) ? data : (data.mechanics || [])
  } catch (e) {
    loadError.value = 'Failed to load mechanics.'
    mechanics.value = []
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!isAdmin) {
    router.replace('/')
  } else {
    fetchMechanics()
  }
})

function resetForm() {
  form.value = {
    name: '',
    specialization: '',
    days_available: '',
    time_available: '',
    status: '',
    availability: ''
  }
  editId.value = null
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
  photoFile.value = null
  photoPreview.value = null
}

function onPhotoChange(e) {
  const file = e.target?.files?.[0] || null
  photoFile.value = file
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value)
  photoPreview.value = file ? URL.createObjectURL(file) : null
}

async function addMechanic() {
  try {
    const fd = new FormData()
    fd.append('name', form.value.name)
    fd.append('specialization', form.value.specialization)
    fd.append('days_available', form.value.days_available)
    fd.append('time_available', form.value.time_available)
    fd.append('status', form.value.status)
    fd.append('availability', form.value.availability)
    if (photoFile.value) fd.append('photo', photoFile.value) // field name: photo

    const res = await fetch('http://localhost:5000/api/mechanics', {
      method: 'POST',
      body: fd // no Content-Type header for FormData
    })
    if (!res.ok) throw new Error('Add failed')
    showAddModal.value = false
    resetForm()
    await fetchMechanics()
  } catch (e) {
    alert('Failed to add mechanic.')
    console.error(e)
  }
}

function openEditModal(mechanic) {
  form.value = {
    name: mechanic.name || '',
    specialization: mechanic.specialization || '',
    days_available: mechanic.days_available || '',
    time_available: mechanic.time_available || '',
    status: mechanic.status || '',
    availability: mechanic.availability || ''
  }
  editId.value = mechanic.mechanic_id ?? mechanic.id
  showEditModal.value = true
}

async function updateMechanic() {
  try {
    const res = await fetch(`http://localhost:5000/api/mechanics/${editId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    if (!res.ok) throw new Error('Update failed')
    showEditModal.value = false
    resetForm()
    await fetchMechanics()
  } catch (e) {
    alert('Failed to update mechanic.')
    console.error(e)
  }
}

async function removeMechanic(id) {
  if (!id) return
  if (!confirm('Remove this mechanic?')) return
  try {
    const res = await fetch(`http://localhost:5000/api/mechanics/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Delete failed')
    await fetchMechanics()
  } catch (e) {
    alert('Failed to remove mechanic.')
    console.error(e)
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  window.location.href = '/'
}
</script>