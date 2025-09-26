<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <!-- Header copied from Accessories (same flow/design) -->
    <header class="bg-gray-900 text-white flex items-center justify-between px-4 md:px-6 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
      <!-- Navigation Links -->
      <nav class="flex gap-4 items-center">
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="text-yellow-400 font-bold cursor-pointer">MEET THE MECHANICS</router-link>
      </nav>
      <!-- Right Side: Search, Notifications, Cart, Profile -->
      <div class="flex items-center gap-3">
          <div class="flex items-center gap-3">
            <input
              class="rounded-full px-3 py-1 w-40"
              type="text"
              v-model="search"
              placeholder="Search..."
              style="background: #fff; color: #222; border: 1px solid #e5e7eb;" 
            />
          </div>
        <!-- Notification Bell Icon placed beside CartIcon -->
        <button @click="showNotifications = !showNotifications" class="relative focus:outline-none">
          <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-1 text-xs">{{ unreadCount }}</span>
        </button>
        <CartIcon />
        <ProfileMenu @logout="showLogoutModal = true" />
      </div>
    </header>

    <!-- Notifications dropdown, scrollable -->
    <div
      v-if="showNotifications"
      class="fixed top-16 right-4 w-80 max-h-[60vh] bg-white rounded-lg shadow-lg z-50 overflow-y-auto border"
      style="transition: box-shadow 0.2s;"
    >
      <div class="p-4 border-b font-bold text-lg text-yellow-700">Notifications</div>
      <div v-if="notifications.length === 0" class="p-4 text-gray-500 text-center">No notifications.</div>
      <ul>
        <li
          v-for="(notif, idx) in notifications"
          :key="notif.notification_id"
          class="px-4 py-3 border-b last:border-b-0 hover:bg-yellow-50 transition flex justify-between items-center"
        >
          <div>
            <div class="font-semibold">{{ notif.type === 'billing' ? 'Billing' : 'Booking' }}</div>
            <div class="text-sm text-gray-700">{{ notif.message }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(notif.created_at) }}</div>
          </div>
          <button
            @click="markAsRead(notif.notification_id)"
            class="ml-2 text-blue-600 underline text-xs"
          >
            Mark as read
          </button>
        </li>
      </ul>
    </div>

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
                  <th class="text-left p-2">Experience (years)</th> <!-- Added column -->
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
                  <td class="p-2">{{ m.experience ?? '—' }}</td> <!-- Added cell -->
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

    <CartDrawer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue'
import CartDrawer from '../components/CartDrawer.vue'
import ProfileMenu from '../components/ProfileMenu.vue' // added

const router = useRouter()

const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(async () => {
  const user_id = localStorage.getItem('user_id')
  const res = await fetch(`${API}/api/read/${user_id}/unread`)
  if (res.ok) {
    const data = await res.json()
    notifications.value = Array.isArray(data.notifications) ? data.notifications : []
    notifications.value.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }
})

async function markAsRead(notificationId) {
  try {
    const res = await fetch(`${API}/api/read/${notificationId}/readone`, {
      method: 'PATCH'
    })
    if (!res.ok) throw new Error('Failed to mark as read')
    notifications.value = notifications.value.filter(n => n.notification_id !== notificationId)
  } catch (e) {
    // Optionally handle error
  }
}

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
  const PLACEHOLDER = 'https://placehold.co/64x64?text=IMG'
  if (!url) return PLACEHOLDER
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return API + url
  return API + '/' + url
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
      experience: m.experience, // <-- add this line
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