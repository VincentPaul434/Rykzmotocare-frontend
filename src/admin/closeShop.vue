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
        <span><span class="text-yellow-400">Rykz</span>motocare</span>
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
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-6 mt-auto relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between px-8 mb-2">
        <div class="flex items-center gap-2 mb-2 md:mb-0">
          <span class="text-xl font-bold text-yellow-400">Rykz</span>
          <span class="text-xl font-bold text-white">motocare</span>
        </div>
        <div class="flex gap-4 text-2xl">
          <i class="fa fa-facebook"></i>
          <i class="fa fa-instagram"></i>
          <i class="fa fa-youtube"></i>
          <i class="fa fa-tiktok"></i>
        </div>
      </div>
      <div class="flex flex-wrap gap-4 justify-center text-sm mt-2">
        <span>©2025 RYKZMOTOCARE ALL RIGHTS RESERVED</span>
        <span>PRIVACY POLICY</span>
        <span>TERMS & CONDITIONS</span>
        <span>ACCESSIBILITY STATEMENT</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
// No logic needed for closed shop page
</script>

<style scoped src="../assets/landingpage.css"></style>