<template>
  <div class="bg-white min-h-screen font-sans">
    <!-- Header -->
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
        <router-link to="/services" class="text-yellow-400 font-bold cursor-pointer">SERVICES</router-link>
        <router-link to="/view-mechanic" class="cursor-pointer">MEET THE MECHANICS</router-link>
      </nav>
      <!-- Right Side: Search, Notifications, Cart, Profile -->
      <div class="flex items-center gap-3">
        <input class="rounded-full px-3 py-1 text-black w-40" type="text" v-model="search" placeholder="Search..." />
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

    <!-- Services Section -->
    <section class="py-10">
      <h1 class="text-3xl font-bold text-center mb-2">Maintenance & Repairs</h1>
      <p class="text-xl text-center mb-8">Expert servicing to keep your bike in top shape.</p>
      <div class="flex flex-wrap justify-center gap-8">
        <div
          v-for="service in services"
          :key="service.title"
          class="bg-white border rounded shadow p-0 w-64 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
          @click="selectService(service)"
        >
          <img class="w-full h-40 object-cover rounded-t" :src="service.img" :alt="service.title" />
          <div class="p-3 w-full">
            <h3 class="font-bold text-lg mb-1">{{ service.title }}</h3>
            <p class="text-sm font-semibold">{{ service.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Vehicle Model Modal/Form -->
      <div v-if="selectedService" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Selected: {{ selectedService.title }}</h2>
          <label class="block mb-2 font-semibold">What is your vehicle model?</label>
          <input
            v-model="vehicleModel"
            type="text"
            class="w-full border rounded px-3 py-2 mb-4"
            placeholder="Enter vehicle model"
          />
          <div class="mb-4">
            <span class="font-semibold">Choose Mechanic:</span>
            <div v-if="mechanicLoading" class="ml-2 text-gray-500">Loading mechanics...</div>
            <select
              v-else
              v-model="selectedMechanic"
              class="w-full border rounded px-3 py-2 mt-2"
            >
              <option value="" disabled>Select a mechanic</option>
              <option
                v-for="mech in availableMechanics.filter(m => String(m.status).toLowerCase() === 'available')"
                :key="mech.id"
                :value="mech.id"
              >
                {{ mech.name }} - {{ mech.specialization }}
              </option>
            </select>
            <div v-if="!mechanicLoading && availableMechanics.filter(m => String(m.status).toLowerCase() === 'available').length === 0" class="text-red-600 mt-2">
              No mechanics available
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button @click="submitModel" class="bg-yellow-400 px-4 py-2 rounded font-bold">Submit</button>
            <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Logout Confirmation Modal -->
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

      <!-- Login Required Modal -->
      <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm">
          <h2 class="text-xl font-bold mb-4">Login Required</h2>
          <p class="mb-6">You must be logged in to book a service.</p>
          <div class="flex justify-end gap-2">
            <router-link to="/customer-admin" class="bg-yellow-400 px-4 py-2 rounded font-bold">Login</router-link>
            <button @click="showLoginModal = false" class="bg-gray-300 px-4 py-2 rounded font-bold">Cancel</button>
          </div>
        </div>
      </div>

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
            :key="notif.id || idx"
            class="px-4 py-3 border-b last:border-b-0 hover:bg-yellow-50 transition"
          >
            <div class="font-semibold">{{ notif.title || 'Notification' }}</div>
            <div class="text-sm text-gray-700">{{ notif.message }}</div>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(notif.created_at) }}</div>
          </li>
        </ul>
      </div>
    </section>

    <CartDrawer />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import CartIcon from '../components/CartIcon.vue'
import ProfileMenu from '../components/ProfileMenu.vue' // added
import CartDrawer from '../components/CartDrawer.vue'

const router = useRouter()
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' // added

onMounted(() => {
  // No login check needed for browsing services
})

const services = [
  {
    title: 'Valve Tuning',
    desc: 'Wiring installation and trouble shooting.',
    img: new URL('../assets/images/sparkplug.webp', import.meta.url).href || 'https://placehold.co/256x180?text=No+Image'
  },
  {
    title: 'Change Oil',
    desc: 'Clean oil to keep your engine running smoothly and efficiently.',
    img: new URL('../assets/images/changeoil.jpg', import.meta.url).href
  },
  {
    title: 'Brake Service',
    desc: 'Brake inspections, repairs, & replacements to ensure your safety on the road.',
    img: new URL('../assets/images/brake.png', import.meta.url).href
  },
  {
    title: 'General Maintenance',
    desc: 'Routine maintenance service',
    img: new URL('../assets/images/general.webp', import.meta.url).href
  }
]

const selectedService = ref(null)
const vehicleModel = ref('')
const showLogoutModal = ref(false)
const showLoginModal = ref(false) // added
const mechanicAvailable = ref(null)
const mechanicLoading = ref(false)
const availableMechanics = ref([])
const selectedMechanic = ref('') // not undefined
const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)


function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(async () => {
  try {
    const user_id = localStorage.getItem('user_id')
    const res = await fetch(`${API}/api/notifications/${user_id}`)
    if (res.ok) {
      const data = await res.json()
      notifications.value = Array.isArray(data.notifications) ? data.notifications : []
    }
  } catch {}
})

async function fetchMechanicAvailability() {            // updated
  mechanicLoading.value = true
  availableMechanics.value = []
  selectedMechanic.value = ''
  try {
    const res = await fetch(`${API}/api/mechanics`)
    const data = await res.json()
    availableMechanics.value = Array.isArray(data.mechanics) ? data.mechanics : (Array.isArray(data) ? data : [])
  } catch (e) {
    availableMechanics.value = []
  } finally {
    mechanicLoading.value = false
  }
}

function selectService(service) {
  selectedService.value = service
  vehicleModel.value = ''
  fetchMechanicAvailability()
}

function closeModal() {
  selectedService.value = null
  vehicleModel.value = ''
  mechanicAvailable.value = null
}

async function submitModel() {
  console.log('vehicleModel:', vehicleModel.value, 'selectedMechanic:', selectedMechanic.value)
  if (vehicleModel.value.trim() && selectedMechanic.value !== '' && selectedMechanic.value !== undefined) {
    const user_id = localStorage.getItem('user_id')
    const name = localStorage.getItem('name')
    if (!user_id) {
      showLoginModal.value = true
      return
    }

    // Check for active booking of the same service
    try {
      const res = await fetch(`${API}/api/bookings?user_id=${user_id}&service=${encodeURIComponent(selectedService.value.title)}`)
      const bookings = await res.json()
      const activeStatuses = ['Pending', 'Confirmed', 'In progress', 'Waiting for Parts']
      // Only block if there is an active booking for this service
      const hasActive = Array.isArray(bookings) && bookings.some(b =>
        b.service_requested === selectedService.value.title &&
        b.user_id == user_id &&
        activeStatuses.map(s => s.toLowerCase()).includes(String(b.book_status).toLowerCase())
      )
      if (hasActive) {
        alert('You already have an active booking for this service.')
        return
      }
    } catch (e) {
      // If error, allow booking (fail open)
    }

    // Proceed with booking
    try {
      const response = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(user_id),
          name,
          vehicle_model: vehicleModel.value,
          service_requested: selectedService.value.title,
          mechanic_id: selectedMechanic.value
        })
      })
      if (!response.ok) throw new Error('Failed to submit booking')
      alert('Booking submitted!')
      closeModal()
    } catch (err) {
      alert('Failed to submit booking.')
      console.error(err)
    }
  } else {
    alert('Please enter your vehicle model and select a mechanic.')
  }
}

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}

function getImageUrl(url) {
  if (!url) return 'https://placehold.co/256x180?text=No+Image'
  if (/^https?:\/\//.test(url)) return url
  return API + url
}

watch(selectedMechanic, (val) => {
  console.log('Selected mechanic:', val)
})
</script>