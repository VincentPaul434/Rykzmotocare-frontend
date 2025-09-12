<template>
  <div class="min-h-screen flex flex-col bg-gray-900 font-sans relative">
    <div
      class="absolute inset-0 z-0"
      style="background: linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url('https://www.cyclenews.com/wp-content/uploads/2019/10/20-Years-of-the-Suzuki-Hayabusa.jpg') center center/cover no-repeat;">
    </div>

    <header class="bg-gray-900 text-white flex items-center justify-between px-4 md:px-6 py-3 relative z-10">
      <div class="flex items-center gap-2 text-2xl font-bold">
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
      </div>
    </header>

    <main class="flex flex-1 flex-col items-center justify-center bg-transparent relative z-10 px-4">
      <div class="text-center max-w-xl">
        <h1 class="text-5xl font-extrabold text-red-600 mb-4">We’re closed right now</h1>
        <p class="text-lg text-white mb-6">
          Redirecting you to the home page in <span class="font-bold">{{ secondsLeft }}</span> seconds...
        </p>
        <button
          @click="goHome"
          class="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-white font-semibold px-6 py-3 rounded shadow focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Back to home now">
          <i class="fa fa-home"></i>
          Go now
        </button>
      </div>
    </main>

    <footer class="bg-gray-800 text-gray-300 py-6 mt-auto relative z-10">
      <div class="flex flex-wrap gap-4 justify-center text-sm mt-2">
        <span>©2025 RYKZMOTOCARE ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const secondsLeft = ref(5);
let countdownTimer = null;

function goHome() {
  router.replace('/');
}

function startCountdown() {
  // Ensure clean start
  if (countdownTimer) clearInterval(countdownTimer);
  secondsLeft.value = 5;

  countdownTimer = setInterval(() => {
    secondsLeft.value -= 1;
    if (secondsLeft.value <= 0) {
      clearInterval(countdownTimer);
      router.replace('/');
    }
  }, 1000);
}

async function init() {
  try {
    const res = await fetch('/api/shop', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'open') {
        // If it reopened, go to login instead
        return router.replace('/login');
      }
    }
  } catch {
    // Ignore errors; still proceed with redirect to home
  }
  startCountdown();
}

onMounted(() => {
  init();
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style scoped src="../assets/landingpage.css"></style>