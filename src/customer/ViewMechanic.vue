<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <!-- Header copied from Accessories (same flow/design) -->
    <header class="bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
      <div class="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-0">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="hidden md:inline text-yellow-400 font-bold cursor-pointer">MEET OUR MECHANICS</router-link>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-2 md:gap-3 mt-2 md:mt-0 w-full md:w-auto">
        <button class="bg-yellow-400 text-black font-bold px-3 md:px-4 py-2 rounded flex items-center gap-2 w-full md:w-auto">
          <i class="fa fa-shopping-cart"></i> <span class="hidden sm:inline">MEET OUR MECHANICS</span>
        </button>
        <input class="rounded-full px-3 py-1 text-black w-full md:w-auto" type="text" placeholder="Search..." />
        <CartIcon />
        <i class="fa fa-user-circle text-2xl cursor-pointer" @click="showLogoutModal = true"></i>
      </div>
    </header>

    <!-- Page content -->
    <section class="py-6 px-2 md:px-0">
      <div class="max-w-5xl mx-auto bg-white rounded shadow p-4 md:p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 class="text-xl font-bold">Meet Our Mechanics</h1>
          <div class="flex gap-2">
            <input
              v-model="search"
              type="text"
              placeholder="Search by name or specialty"
              class="border rounded px-3 py-2 w-64"
            />
            <select v-model="statusFilter" class="border rounded px-3 py-2">
              <option value="all">All</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="text-gray-500">Loading mechanics…</div>
        <div v-else-if="loadError" class="text-red-600">{{ loadError }}</div>
        <div v-else>
          <div v-if="!filteredMechanics.length" class="text-gray-500">No mechanics found.</div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm border-collapse">
              <thead>
                <tr class="border-b bg-gray-100">
                  <th class="text-left p-2">Mechanic</th>
                  <th class="text-left p-2">Specialty</th>
                  <th class="text-left p-2">Days</th>
                  <th class="text-left p-2">Time</th>
                  <th class="text-left p-2">Status</th>
                  <th class="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in filteredMechanics" :key="m.id" class="border-b">
                  <td class="p-2 flex items-center gap-2">
                    <img :src="img(m.image_url)" :alt="m.name" class="w-8 h-8 object-cover rounded border" />
                    <span class="font-medium">{{ m.name }}</span>
                  </td>
                  <td class="p-2">{{ m.specialization || m.availability || '—' }}</td>
                  <td class="p-2">{{ m.days_available || '—' }}</td>
                  <td class="p-2">{{ m.time_available || '—' }}</td>
                  <td class="p-2">
                    <span :class="m.status === 'Available' ? 'text-green-600' : 'text-gray-500'">
                      {{ m.status || '—' }}
                    </span>
                  </td>
                  <td class="p-2">
                    <button class="text-yellow-600 hover:underline" @click="openProfile(m)">
                      View profile
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Profile Modal -->
      <div
        v-if="showProfile"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
        @click.self="closeProfile"
      >
        <div class="bg-white rounded-lg shadow w-full max-w-md p-5">
          <div class="flex justify-between items-center mb-3">
            <h2 class="text-lg font-bold">Mechanic Profile</h2>
            <button class="text-2xl leading-none" @click="closeProfile">×</button>
          </div>
          <div class="flex items-start gap-4">
            <img :src="img(selected?.image_url)" :alt="selected?.name" class="w-24 h-24 object-cover rounded border" />
            <div>
              <div class="text-lg font-semibold">{{ selected?.name }}</div>
              <div class="text-sm text-gray-600">{{ selected?.specialization || selected?.availability }}</div>

              <div v-if="detailLoading" class="text-sm text-gray-500 mt-2">Loading details…</div>
              <div v-if="detailError" class="text-sm text-red-600 mt-2">{{ detailError }}</div>

              <div class="text-sm mt-2">
                <div><span class="text-gray-500">Days:</span> {{ selected?.days_available || '—' }}</div>
                <div><span class="text-gray-500">Time:</span> {{ selected?.time_available || '—' }}</div>
                <div><span class="text-gray-500">Status:</span> {{ selected?.status || '—' }}</div>
                <div v-if="selected?.experience"><span class="text-gray-500">Experience:</span> {{ selected.experience }}</div>
                <div v-if="selected?.bio" class="mt-1"><span class="text-gray-500">Bio:</span> {{ selected.bio }}</div>
              </div>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button class="px-4 py-2 border rounded" @click="closeProfile">Close</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
        <h2 class="text-xl font-bold mb-4">Logout</h2>
        <p class="mb-6">Are you sure you want to logout?</p>
        <div class="flex justify-end gap-2">
          <button @click="handleLogout" class="bg-yellow-400 px-4 py-2 rounded font-bold">Logout</button>
          <button @click="showLogoutModal = false" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue'

const router = useRouter()

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const mechanics = ref([])
const loading = ref(false)
const loadError = ref('')
const search = ref('')
const statusFilter = ref('all')

const showProfile = ref(false)
const selected = ref(null)
const detailLoading = ref(false)
const detailError = ref('')

const showLogoutModal = ref(false)

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}

function img(url) {
  const PLACEHOLDER = 'https://via.placeholder.com/64?text=IMG'
  if (!url) return PLACEHOLDER
  const base = API
  const normalized = String(url).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(normalized)) return normalized
  if (normalized.startsWith('/')) return `${base}${normalized}`
  return `${base}/${normalized}`
}

async function fetchMechanics() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await fetch(`${API}/api/mechanics`)
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data.mechanics || [])
    mechanics.value = list.map(m => ({
      id: m.id ?? m.mechanic_id ?? m.user_id,
      name: m.name,
      specialization: m.specialization,
      days_available: m.days_available,
      time_available: m.time_available,
      status: m.status,
      availability: m.availability,
      image_url: m.image_url || m.photo_url || null
    }))
  } catch (e) {
    loadError.value = 'Failed to load mechanics.'
    mechanics.value = []
  } finally {
    loading.value = false
  }
}

const filteredMechanics = computed(() => {
  const q = search.value.trim().toLowerCase()
  return mechanics.value.filter(m => {
    const statusOk =
      statusFilter.value === 'all' ||
      (m.status || '').toLowerCase() === statusFilter.value.toLowerCase()
    const text = `${m.name || ''} ${m.specialization || ''} ${m.availability || ''}`.toLowerCase()
    const textOk = !q || text.includes(q)
    return statusOk && textOk
  })
})

async function fetchMechanicDetails(id) {
  if (!id) return
  detailLoading.value = true
  detailError.value = ''
  try {
    const res = await fetch(`${API}/api/mechanics/${id}`)
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    const mech = data?.mechanic ?? data
    selected.value = { ...(selected.value || {}), ...mech }
  } catch (e) {
    detailError.value = 'Failed to load details.'
  } finally {
    detailLoading.value = false
  }
}

function openProfile(m) {
  selected.value = m
  showProfile.value = true
  fetchMechanicDetails(m.id)
}
function closeProfile() {
  showProfile.value = false
  selected.value = null
}

onMounted(fetchMechanics)
</script>