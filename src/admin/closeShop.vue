<template>
  <div class="min-h-screen flex flex-col bg-gray-900 font-sans relative">
    <!-- Backdrop -->
    <div
      class="absolute inset-0 z-0"
      style="background: linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://www.cyclenews.com/wp-content/uploads/2019/10/20-Years-of-the-Suzuki-Hayabusa.jpg') center center/cover no-repeat;">
    </div>
    <!-- Header -->
    <header class="bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 relative z-10">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <router-link
          to="/customer-admin"
          class="inline-flex items-center gap-1 hover:text-yellow-400 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded px-1"
          aria-label="Go to Customer Admin"
        >
          <span class="text-yellow-400">Rykz</span>motocare
        </router-link>
      </div>
      <div class="flex items-center gap-4 mt-2 md:mt-0">
        <button class="md:hidden text-xl"><i class="fa fa-bars"></i> MENU</button>
        <span class="cursor-not-allowed text-gray-400">HOME</span>
        <span class="hidden md:inline cursor-not-allowed text-gray-400">PARTS</span>
        <span class="hidden md:inline cursor-not-allowed text-gray-400">ACCESSORIES</span>
        <span class="hidden md:inline text-yellow-400 font-bold cursor-not-allowed">SERVICES</span>
        <span class="hidden md:inline text-red-500 font-bold cursor-not-allowed">SALE</span>
      </div>
      <div class="flex items-center gap-3 mt-2 md:mt-0">
        <button class="bg-gray-400 text-gray-700 font-bold px-4 py-2 rounded flex items-center gap-2 cursor-not-allowed" disabled>
          <i class="fa fa-shopping-cart"></i> SHOP CLOSED
        </button>
        <input class="rounded-full px-3 py-1 text-gray-500 bg-gray-200" type="text" placeholder="Search..." disabled />
        <i class="fa fa-user-circle text-2xl text-gray-400"></i>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex flex-1 flex-col items-center justify-center bg-transparent relative z-10">
      <div class="text-center">
        <h1 class="text-5xl font-extrabold text-red-600 mb-6">SHOP CLOSED</h1>
        <p class="text-lg text-white mb-8">
          Sorry, Rykzmotocare is closed for today.<br>
          Please come back during our regular business hours.
        </p>
        <button
          @click="reopenShop"
          :disabled="isUpdating"
          class="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Reopen shop">
          <i v-if="!isUpdating" class="fa fa-unlock"></i>
          <i v-else class="fa fa-spinner fa-spin"></i>
          <span>{{ isUpdating ? 'Reopening...' : 'Reopen Shop' }}</span>
        </button>
      </div>
    </main>

    <!-- Toast (centered) -->
    <div v-if="toast.show" class="fixed inset-0 z-[60] flex items-center justify-center">
      <!-- subtle backdrop -->
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      <transition name="toast-pop">
        <div
          v-show="toast.show"
          class="relative w-[90%] max-w-sm mx-auto bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl ring-1 ring-gray-200/70 p-4 md:p-5 text-gray-800 dark:text-gray-100 pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-start gap-3">
            <div
              :class="[
                'shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full text-white',
                toast.type === 'success'
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              ]"
            >
              <i :class="toast.type === 'success' ? 'fa fa-check' : 'fa fa-exclamation'"></i>
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold mb-0.5">
                {{ toast.title || (toast.type === 'success' ? 'Success' : 'Something went wrong') }}
              </div>
              <div class="text-sm opacity-90">
                {{ toast.message }}
              </div>
            </div>
            <button
              @click="hideToast"
              class="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close notification"
            >
              <i class="fa fa-times"></i>
            </button>
          </div>

          <!-- progress bar -->
          <div class="mt-4 h-1 w-full rounded bg-gray-200/70 overflow-hidden">
            <div
              class="h-full transition-all"
              :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
              :style="{ width: progress + '%' }"
            ></div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

const isUpdating = ref(false);

// Toast state
const toast = ref({ show: false, type: 'success', message: '', title: '' });
const progress = ref(100);
let toastTimer = null;
let progressTimer = null;

function hideToast() {
  toast.value.show = false;
  if (toastTimer) clearTimeout(toastTimer);
  if (progressTimer) clearInterval(progressTimer);
  toastTimer = null;
  progressTimer = null;
}

function showToast(message, type = 'success', duration = 2000, title = '') {
  hideToast();
  toast.value = { show: true, type, message, title };
  progress.value = 100;

  // Smooth progress
  const stepMs = 20;
  const step = 100 / (duration / stepMs);
  progressTimer = setInterval(() => {
    progress.value = Math.max(0, +(progress.value - step).toFixed(2));
  }, stepMs);

  toastTimer = setTimeout(() => {
    hideToast();
  }, duration);
}

async function reopenShop() {
  isUpdating.value = true;
  try {
    const res = await fetch('http://localhost:5000/api/shop', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'open' }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success !== true) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }

    // Centered design toast, then redirect
    showToast('Shop reopened successfully.', 'success', 1200, 'Shop Opened');
    setTimeout(() => {
      localStorage.removeItem('shopClosed');
      sessionStorage.removeItem('shopClosed');
      window.location.assign('/customer-admin');
    }, 1200);
  } catch (e) {
    console.error('Failed to update shop state', e);
    showToast('Failed to reopen shop. Please try again.', 'error', 2200, 'Action Failed');
  } finally {
    isUpdating.value = false;
  }
}

onUnmounted(() => hideToast());
</script>

<style scoped src="../assets/landingpage.css"></style>
<style scoped>
/* Center toast pop animation */
.toast-pop-enter-active,
.toast-pop-leave-active {
  transition: all .18s ease-out;
}
.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>