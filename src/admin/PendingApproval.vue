<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4 relative">
    <!-- Background decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-20 w-32 h-32 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
      <div class="absolute bottom-20 right-20 w-24 h-24 bg-orange-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div class="absolute top-1/2 left-10 w-16 h-16 bg-yellow-100 rounded-full opacity-20 animate-pulse delay-500"></div>
    </div>

    <div class="relative z-10 max-w-md w-full">
      <!-- Main Card -->
      <div class="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-sm">
        <!-- Header Icon -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-4">
            <svg class="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Account Pending
          </h1>
          <div class="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto"></div>
        </div>

        <!-- Content -->
        <div class="text-center mb-8">
          <p class="text-gray-600 text-lg leading-relaxed mb-6">
            Thank you for registering with 
            <span class="font-semibold text-gray-800"> Rykzmotocare</span>
          </p>
          
          <div class="bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6 mb-6">
            <div class="flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-blue-500 mr-2 animate-spin" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
              </svg>
              <span class="text-gray-700 font-medium">
                Processing your application{{ dots }}
              </span>
            </div>
            <p class="text-gray-600 text-sm">
              Your account is currently under review by our admin team. 
              This usually takes 24-48 hours.
            </p>
          </div>

          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex items-center justify-center">
              <svg class="w-4 h-4 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Registration completed successfully</span>
            </div>
            <div class="flex items-center justify-center">
              <svg class="w-4 h-4 text-amber-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2" />
              </svg>
              <span>Awaiting admin approval</span>
            </div>
            <div class="flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Notification will be sent via email</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center">
          <div class="bg-gray-50 rounded-2xl p-4 mb-4">
            <p class="text-gray-500 text-sm">
              Need help? Contact our support team
            </p>
          </div>
          
          <button class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Contact Support
          </button>
        </div>
      </div>

      <!-- Bottom Text -->
      <div class="text-center mt-6">
        <p class="text-gray-500 text-sm">
          We appreciate your patience while we review your application
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const dots = ref('')
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '' : dots.value + '.'
  }, 500)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped>
/* Add any component-specific styles here */
</style>