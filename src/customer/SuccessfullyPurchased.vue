<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div class="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
      <svg class="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="white"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
      </svg>
      <h2 class="text-2xl font-bold mb-2 text-green-700">Purchase Successful!</h2>
      <p class="mb-4 text-gray-700">Thank you for your purchase. Your order has been received and is being processed.</p>
      <router-link to="bills" class="inline-block px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">
        View My Orders
      </router-link>
      <router-link to="user-homepage" class="block mt-4 text-blue-600 hover:underline">
        Back to Homepage
      </router-link>
    </div>
  </div>
</template>

<script setup>
// No script needed for static success page
</script>