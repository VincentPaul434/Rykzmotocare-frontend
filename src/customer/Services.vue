<template>
  <div class="bg-white min-h-screen font-sans">
    <!-- Header -->
    <header class="bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
      <div class="flex items-center gap-4 mt-2 md:mt-0">
        <button class="md:hidden text-xl"><i class="fa fa-bars"></i> MENU</button>
        <router-link to="/user-homepage" class="cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="hidden md:inline cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="hidden md:inline cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="hidden md:inline cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="hidden md:inline cursor-pointer">ACCESSORIES</router-link>
        <span class="hidden md:inline text-yellow-400 font-bold cursor-pointer">SERVICES</span>
        <span class="hidden md:inline text-red-500 font-bold cursor-pointer">SALE</span>
      </div>
      <div class="flex items-center gap-3 mt-2 md:mt-0">
        <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded flex items-center gap-2">
          <i class="fa fa-shopping-cart"></i> SHOP YOUR PARTS
        </button>
        <input class="rounded-full px-3 py-1 text-black" type="text" placeholder="Search..." />
        <i class="fa fa-user-circle text-2xl cursor-pointer" @click="showLogout = true"></i>
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
              <option v-for="mech in availableMechanics" :key="mech.id" :value="mech.id">
                {{ mech.name }}
              </option>
            </select>
            <div v-if="!mechanicLoading && availableMechanics.length === 0" class="text-red-600 mt-2">No mechanics available</div>
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
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
})

const services = [
  {
    title: 'Valve Tuning',
    desc: 'Wiring installation and trouble shooting.',
    img: new URL('../assets/images/sparkplug.webp', import.meta.url).href
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
const mechanicAvailable = ref(null)
const mechanicLoading = ref(false)
const availableMechanics = ref([])
const selectedMechanic = ref('')

async function fetchMechanicAvailability(serviceTitle) {
  mechanicLoading.value = true
  availableMechanics.value = []
  selectedMechanic.value = ''
  try {
    // Send the service as a query parameter!
    const res = await fetch(`http://localhost:5000/api/mechanics`)
    const data = await res.json()
    availableMechanics.value = Array.isArray(data.mechanics) ? data.mechanics : []
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
  if (vehicleModel.value.trim() && selectedMechanic.value) {
    const user_id = localStorage.getItem('user_id')
    const name = localStorage.getItem('name')
    if (!user_id) {
      alert('You must be logged in to book a service.')
      return
    }
    try {
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
</script>