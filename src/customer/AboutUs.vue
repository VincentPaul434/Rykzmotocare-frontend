<!-- filepath: c:\Users\vince\OneDrive\Documents\GitHub\Rykzmotocare-frontend\src\customer\AboutUs.vue -->
<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <section class="max-w-3xl mx-auto mt-10 bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-4 text-yellow-600">CONTACT US</h2>
      <p class="mb-4 text-gray-700">
        Please shoot us a line for any reason and we will be happy to do our best to meet your needs or help you get the most from our site. You can contact us either by our online form on this page or via phone, email, or chat.
      </p>
      <div class="mb-6">
        <h3 class="font-semibold mb-1">Phone Numbers:</h3>
        <p class="mb-2">Cordova-based customers, please call <span class="font-bold">63+ 091994911803</span></p>
        <h3 class="font-semibold mb-1">Customer Service Hours:</h3>
        <ul class="list-disc list-inside text-gray-600 mb-2">
          <li>Monday through Friday, 8am-6pm</li>
          <li>Saturday, 8am-12pm</li>
          <li>Sunday, No Working Hours</li>
        </ul>
        <p class="text-gray-600">
          For fastest response times during business hours, you can visit us from our Facebook page RykzMotocare.
        </p>
      </div>
      <div class="mb-8">
        <h3 class="text-lg font-bold mb-2 text-yellow-600">We are located</h3>
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div>
            <p class="mb-1">📍 <span class="font-semibold">Located In</span></p>
            <p>Purok Catarman uno<br>
              Barangay Catarman, Cordova, Cebu<br>
              Philippines, 6017</p>
            <p class="mt-2">🕒 <span class="font-semibold">Open Hours:</span><br>
              Monday – Saturday: 8:00 AM – 6:00 PM<br>
              Sunday: Closed (Rest day for us and your bikes 🛠️)
            </p>
            <p class="mt-2">📞 Contact us: <span class="font-semibold">091994911803</span></p>
          </div>
          <img 
            src="../assets/images/catarman.png" 
            alt="Shop Location" 
            class="rounded shadow border"
            style="width:350px;max-width:100%;height:auto;"
          />
        </div>
      </div>
    </section>

    <section class="bg-black text-white py-10 mt-10">
      <div class="max-w-3xl mx-auto px-4">
        <h2 class="text-2xl font-bold mb-2 text-yellow-400">Rykzmotocare Services</h2>
        <p class="mb-4">
          At Rykzmotocare we make servicing your bike easy, so you are ready for your next ride.<br>
          Get easy access to service and maintenance information, request service online when it is convenient for you and trust that your Rykzmotocare has trained technicians to meet your needs.
        </p>
        <router-link to="/services">
          <button class="bg-yellow-400 text-black font-bold px-6 py-2 rounded shadow hover:bg-yellow-500 transition">
            BOOK REPAIR SERVICE
          </button>
        </router-link>
      </div>
    </section>

    <section class="bg-gray-200 py-10">
      <div class="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-4">
        <img src="https://placehold.co/120x120?text=Award" alt="Award" class="h-24 mb-4 md:mb-0" />
        <img src="https://placehold.co/120x120?text=BIR" alt="BIR Registered" class="h-24 mb-4 md:mb-0" />
        <div>
          <h3 class="font-bold mb-1">NEED HELP?</h3>
          <p class="mb-2 text-yellow-600 font-bold">CONTACT US 63+ 09123450941</p>
          <router-link to="/services">
            <button class="bg-yellow-400 text-black font-bold px-4 py-2 rounded shadow hover:bg-yellow-500 transition mb-2">
              BOOK HERE NOW
            </button>
          </router-link>
          <router-link to="/feedback">
            <button class="bg-white text-black font-bold px-4 py-2 rounded shadow border hover:bg-gray-100 transition">
              LEAVE FEEDBACK
            </button>
          </router-link>
        </div>
      </div>
    </section>

    <footer class="bg-gray-900 text-gray-200 py-6 mt-10">
      <div class="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <span class="font-bold text-yellow-400">Rykzmotocare</span>
        <span>©2025 RYKZMOTOCARE ALL RIGHTS RESERVED</span>
        <div class="flex gap-3 mt-2 md:mt-0">
          <a href="#" class="hover:text-yellow-400">PRIVACY POLICY</a>
          <a href="#" class="hover:text-yellow-400">TERMS & CONDITIONS</a>
          <a href="#" class="hover:text-yellow-400">ACCESSIBILITY STATEMENT</a>
        </div>
      </div>
      <div class="flex justify-center gap-4 mt-4">
        <a href="#"><img src="https://placehold.co/32x32?text=FB" alt="Facebook" class="h-6" /></a>
        <a href="#"><img src="https://placehold.co/32x32?text=IG" alt="Instagram" class="h-6" /></a>
        <a href="#"><img src="https://placehold.co/32x32?text=YT" alt="YouTube" class="h-6" /></a>
        <a href="#"><img src="https://placehold.co/32x32?text=TT" alt="TikTok" class="h-6" /></a>
      </div>
    </footer>
  </div>
</template>

<script setup>
// No script needed for static About Us page
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>