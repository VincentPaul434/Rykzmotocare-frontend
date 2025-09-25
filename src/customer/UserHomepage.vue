<script setup lang="ts">
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from 'vue';
import ProfileMenu from '../components/ProfileMenu.vue'
import CartIcon from '../components/CartIcon.vue'
import CartDrawer from '../components/CartDrawer.vue'

const router = useRouter();
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000' // added

const showLogoutModal = ref(false)
const showNotifications = ref(false)
const notifications = ref([])
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(async () => {
  if (!localStorage.getItem('token')) {
    router.push('/')
  }
  try {
    const user_id = localStorage.getItem('user_id')
    const res = await fetch(`${API}/api/notifications/${user_id}`)
    if (res.ok) {
      const data = await res.json()
      notifications.value = Array.isArray(data.notifications) ? data.notifications : []
    }
  } catch {}
})

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('name')
  router.push('/')
}
</script>

<template>
  <div class="bg-gray-100 min-h-screen font-sans">
    <!-- Header -->
    <header class="bg-gray-900 text-white flex items-center justify-between px-4 md:px-6 py-3">
      <!-- Logo -->
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span>
          <span class="text-yellow-400">Rykz</span>
          motocare
        </span>
      </div>
      <!-- Navigation Links -->
      <nav class="flex gap-4 items-center">
        <router-link to="/user-homepage" class="text-yellow-400 font-bold cursor-pointer">HOME</router-link>
        <router-link to="/parts" class="cursor-pointer">PARTS</router-link>
        <router-link to="/oil" class="cursor-pointer">OIL</router-link>
        <router-link to="/tires" class="cursor-pointer">TIRES</router-link>
        <router-link to="/accessories" class="cursor-pointer">ACCESSORIES</router-link>
        <router-link to="/services" class="cursor-pointer">SERVICES</router-link>
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

    <!-- Hero Section -->
    <section class="relative bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-6 py-8">
      <div class="flex-1">
        <h1 class="text-4xl md:text-5xl font-bold leading-tight">
          High-Performance <br /><span class="text-yellow-400">Motor Parts</span>
        </h1>
        <p class="mt-4 text-lg">Everything you need for your ride. Engineered to perform.</p>
      </div>
      <img class="w-full md:w-1/2 max-w-lg mt-8 md:mt-0" src="https://i.ibb.co/7Q8Q8Q8/bike.png" alt="Motorbike" />
    </section>

    <!-- Top Selling Parts -->
    <section class="bg-gray-200 py-10">
      <h2 class="text-2xl font-bold text-center mb-6">TOP SELLING PARTS</h2>
      <div class="flex flex-wrap justify-center gap-8">
        <img class="bg-white rounded-xl shadow w-32 h-32 object-contain" src="https://i.ibb.co/6b7Q8Q8/part1.png" alt="Part 1" />
        <img class="bg-white rounded-xl shadow w-32 h-32 object-contain" src="https://i.ibb.co/6b7Q8Q8/part2.png" alt="Part 2" />
        <img class="bg-white rounded-xl shadow w-32 h-32 object-contain" src="https://i.ibb.co/6b7Q8Q8/part3.png" alt="Part 3" />
        <img class="bg-white rounded-xl shadow w-32 h-32 object-contain" src="https://i.ibb.co/6b7Q8Q8/part4.png" alt="Part 4" />
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="py-10">
      <h2 class="text-2xl font-bold text-center mb-6">FEATURED CATEGORIES</h2>
      <div class="flex flex-wrap justify-center gap-10">
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/helmet.png" alt="Helmet" />
          <span class="font-semibold">HELMETS</span>
        </div>
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/gear.png" alt="Riding Gear" />
          <span class="font-semibold">RIDING GEAR</span>
        </div>
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/parts.png" alt="Parts" />
          <span class="font-semibold">PARTS</span>
        </div>
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/tires.png" alt="Tires" />
          <span class="font-semibold">TIRES</span>
        </div>
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/accessories.png" alt="Accessories" />
          <span class="font-semibold">ACCESSORIES</span>
        </div>
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mb-2" src="https://i.ibb.co/6b7Q8Q8/bluetooth.png" alt="Bluetooth Units" />
          <span class="font-semibold text-center">BLUETOOTH<br />UNITS</span>
        </div>
      </div>
    </section>

    <!-- Service Offers -->
    <section class="bg-white py-10">
      <h2 class="text-2xl font-bold text-center mb-6">OUR SERVICE OFFERS</h2>
      <div class="flex flex-wrap justify-center gap-8">
        <div class="bg-gray-100 rounded-xl shadow p-4 w-64 flex flex-col items-center cursor-pointer"
             @click="router.push('/services')">
          <img class="w-full h-28 object-cover rounded mb-2" src="../assets/images/general.webp" alt="General Maintenance" />
          <h3 class="font-bold mb-1">General Maintenance</h3>
          <p class="text-sm text-center">Routine maintenance services to keep your motorcycle in peak condition.</p>
        </div>

        <div class="bg-gray-100 rounded-xl shadow p-4 w-64 flex flex-col items-center cursor-pointer"
             @click="router.push('/services')">
          <img class="w-full h-28 object-cover rounded mb-2" src="../assets/images/changeoil.jpg" alt="Change Oil" />
          <h3 class="font-bold mb-1">Change Oil</h3>
          <p class="text-sm text-center">Quick and efficient oil changes to keep your engine running smoothly.</p>
        </div>

        <div class="bg-gray-100 rounded-xl shadow p-4 w-64 flex flex-col items-center cursor-pointer"
             @click="router.push('/services')">
          <img class="w-full h-28 object-cover rounded mb-2" src="../assets/images/brake.png" alt="Brake Service" />
          <h3 class="font-bold mb-1">Brake Service</h3>
          <p class="text-sm text-center">Comprehensive brake inspection and maintenance to ensure your safety.</p>
        </div>

        <div class="bg-gray-100 rounded-xl shadow p-4 w-64 flex flex-col items-center cursor-pointer"
             @click="router.push('/services')">
          <img class="w-full h-28 object-cover rounded mb-2" src="../assets/images/cvtcleaning.png" alt="CVT Pulley Cleaning" />
          <h3 class="font-bold mb-1">CVT Pulley Cleaning</h3>
          <p class="text-sm text-center">Removes dirt, grime, and old lubricants from the pulleys.</p>
        </div>

        <div class="bg-gray-100 rounded-xl shadow p-4 w-64 flex flex-col items-center cursor-pointer"
             @click="router.push('/services')">
          <img class="w-full h-28 object-cover rounded mb-2" src="../assets/images/wiring.webp" alt="Wiring" />
          <h3 class="font-bold mb-1">Wiring</h3>
          <p class="text-sm text-center">Professional motorcycle wiring installation and troubleshooting.</p>
        </div>
      </div>
    </section>

    <!-- Services Info -->
    <section class="flex flex-col md:flex-row items-center justify-center bg-gray-900 text-white py-10 px-4">
      <div class="max-w-lg md:mr-10">
        <h2 class="text-2xl font-bold mb-3"><span class="text-yellow-400">Rykz</span>motocare<br />Services</h2>
        <p>
          At Rykzmotocare we make servicing your bike easy, so you are ready for your next ride.<br>
          Get easy access to service and maintenance information, request service online when it is convenient for you and trust that your Rykzmotocare has trained technicians to meet your needs.
        </p>
        <button class="bg-yellow-400 text-black font-bold px-6 py-2 rounded mt-5">BOOK REPAIR SERVICE</button> 
      </div>
      <img class="w-80 mt-8 md:mt-0" src="https://i.ibb.co/6b7Q8Q8/bike.png" alt="Service Bike" />
    </section>

    <!-- Awards and Contact -->
    <footer class="bg-gray-800 text-white pt-8">
      <div class="flex flex-col md:flex-row items-center justify-between px-8">
        <div class="flex gap-8 mb-6 md:mb-0">
          <img class="h-20 bg-white rounded p-2" src="https://i.ibb.co/6b7Q8Q8/award.png" alt="Award" />
          <img class="h-20 bg-white rounded p-2" src="https://i.ibb.co/6b7Q8Q8/dti-bir.png" alt="DTI BIR Registered" />
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="font-bold text-lg">NEED HELP?</h3>
          <p>CONTACT US <span class="text-yellow-400 font-bold">09123456789</span></p>
          <p>BOOK YOUR REPAIRS NOW</p>
          <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded">CONTACT US NOW</button>
          <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded mt-2">LEAVE FEEDBACK</button>
        </div>
      </div>
      <div class="flex flex-col md:flex-row items-center justify-between bg-gray-900 py-4 px-8 mt-8">
        <span class="text-2xl font-bold"><span class="text-yellow-400">Rykz</span>motocare</span>
        <div class="flex gap-4 text-yellow-400 text-2xl">
          <i class="fa fa-facebook"></i>
          <i class="fa fa-instagram"></i>
          <i class="fa fa-youtube"></i>
          <i class="fa fa-tiktok"></i>
        </div>
      </div>
      <div class="text-center text-gray-400 text-sm py-4 border-t border-gray-700">
        ©2023 RYKZMOTOCARE ALL RIGHTS RESERVED &nbsp; | &nbsp;
        <a href="/about-us" class="hover:text-yellow-400">ABOUT US</a> &nbsp; | &nbsp;
        PRIVACY POLICY &nbsp; | &nbsp; TERMS & CONDITIONS &nbsp; | &nbsp; ACCESSIBILITY
      </div>
    </footer>
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