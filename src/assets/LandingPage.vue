<template>
  <div class="landing-page">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <span class="logo"><span class="logo-bold ">Rykz</span>motocare</span>
      </div>
      <div class="header-right">
        <i class="fa fa-user-circle" @click="showLogin = true" style="cursor:pointer;"></i>
      </div>
    </header>
    <!-- Navigation -->
    <!-- Hero Section -->
    <section
      class="hero"
      style="
        background:
          linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)),
          url('https://www.cyclenews.com/wp-content/uploads/2019/10/20-Years-of-the-Suzuki-Hayabusa.jpg') center center/cover no-repeat,
          #000;
        position: relative;
      "
    >
     <div class="hero-content">
        <h1>High-Performance <br /><span class="highlight">Motor Parts</span></h1>
        <p>Everything you need for your ride. Engineered to perform.</p>
        <!-- Browse Button moved here -->
        <button class="shop-btn mt-4" @click="goToBrowseParts">
          BROWSE YOUR PARTS
        </button>
      </div>
      <img class="hero-bike" src="../assets/images/motorcycle.png" alt="Motorbike" />
    </section>
    <!-- Top Selling Parts -->
    <section class="top-selling">
      <h2>TOP SELLING PARTS</h2>
      <div class="parts-grid">
        <img src="../assets/images/sparkplug.webp" alt="Part 1" />
        <img src="../assets/images/minishocks.png" alt="Part 2" />
        <img src="../assets/images/cvt-pullry-kit.png" alt="Part 3" />
        <img src="../assets/images/carb.png" alt="Part 4" />
      </div>
    </section>
   
    <!-- Service Offers -->
    <section class="services">
      <h2>OUR SERVICE OFFERS</h2>
      <div class="services-grid">
        <div class="service-item">
          <img src="../assets/images/general.webp" alt="General Maintenance" />
          <h3>General Maintenance</h3>
          <p>Routine maintenance services to keep your motorcycle in peak condition.</p>
        </div>
        <div class="service-item">
          <img src="../assets/images/changeoil.jpg" alt="Change Oil" />
          <h3>Change Oil</h3>
          <p>Quick and efficient oil changes to keep your engine running smoothly.</p>
        </div>
        <div class="service-item">
          <img src="../assets/images/brake.png" alt="Brake Service" />
          <h3>Brake Service</h3>
          <p>Comprehensive brake inspection and maintenance to ensure your safety.</p>
        </div>
        <div class="service-item">
          <img src="../assets/images/cvtcleaning.png" alt="CVT Pulley Cleaning" />
          <h3>CVT Pulley Cleaning</h3>
          <p>Service removes dirt, grime, and old lubricants from the pulleys.</p>
        </div>
      
        <div class="service-item">
          <img src="../assets/images/wiring.webp" alt="Wiring" />
          <h3>Wiring</h3>
          <p>Professional motorcycle wiring installation and troubleshooting.</p>
        </div>
      </div>
       

    </section>
    <!-- Services Info -->
    <section class="services-info">
      <h2><span class="logo-bold">Rykz</span>motocare <span class="services-title">Services</span></h2>
      <p>
        At Rykzmotocare we make servicing your bike easy, so you are ready for your next ride.<br>
        Get easy access to service and maintenance information, request service online when it is convenient for you and trust that your Rykzmotocare has trained technicians to meet your needs.
      </p>
      <button
        class="repair-btn"
        @click="requireLogin('/services')"  
      >
        BOOK REPAIR SERVICE
      </button>
    </section>
    <!-- Footer -->
    <footer class="footer">
      <div class="footer-top">
        <div class="footer-logo">
          <span class="logo"><span class="logo-bold">Rykz</span>motocare</span>
        </div>
        <div class="footer-socials">
          <i class="fa fa-facebook"></i>
          <i class="fa fa-instagram"></i>
          <i class="fa fa-youtube"></i>
          <i class="fa fa-tiktok"></i>
        </div>
      </div>
      <div class="footer-bottom">
        <span>©2025 RYKZMOTOCARE ALL RIGHTS RESERVED</span>
        <span>PRIVACY POLICY</span>
        <span>TERMS & CONDITIONS</span>
        <span>ACCESSIBILITY STATEMENT</span>
        <router-link to="/about-us" style="cursor:pointer;text-decoration:underline;">ABOUT US</router-link>
      </div>
    </footer>

      <!-- Login Modal -->
      <div v-if="showLogin" class="modal-overlay">
        <div class="modal-content">
          <span class="modal-close" @click="showLogin = false">&times;</span>
          <h2>Log In</h2>
          <form @submit.prevent="handleLogin">
            <input
              v-if="!idNumber"
              v-model="email"
              type="email"
              placeholder="Email Address*"
              class="modal-input"
              autocomplete="username"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <input
              v-if="!email"
              v-model="idNumber"
              type="text"
              placeholder="ID Number*"
              class="modal-input"
              autocomplete="username"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <!-- Login Modal Password Input -->
            <div style="position:relative;">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password*"
                required
                class="modal-input"
                autocomplete="current-password"
                style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
              />
              <span
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#bbb;cursor:pointer;"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
              </span>
            </div>
            <div v-if="error" style="color:#e53e3e;font-size:0.95rem;margin-bottom:0.5rem;">{{ error }}</div>
            <div style="margin-bottom:1rem;text-align:left;">
              <a href="#" style="font-size:0.95rem;text-decoration:underline;color:#222;" @click.prevent="showReset = true; showLogin = false;">Forgot your password?</a>
            </div>
            <button type="submit" style="font-family:inherit;font-size:1.1rem;font-weight:bold;letter-spacing:1px;">LOG IN</button>
          </form>
          <div style="text-align:center;font-size:1rem;margin-top:2rem;border-top:1px solid #eee;padding-top:1.2rem;">
            Dont have an account yet?
            <a href="#" class="modal-link" style="color:#ffc107;font-weight:bold;" @click.prevent="showLogin = false; showCreate = true">Create Account</a>
          </div>
        </div>
      </div>

      <!-- Create Account Modal -->
      <div v-if="showCreate" class="modal-overlay">
        <div class="modal-content">
          <span class="modal-close" @click="showCreate = false">&times;</span>
          <h2>Create Account</h2>
          <p style="margin-bottom:1rem;font-size:0.95rem;color:#444;">
            Stay connected with RykzMotocare!<br>
            Submit your account request and our admin will review it.<br>
            Once approved, you'll be able to access your account and enjoy updates on repairs, services, and more.
          </p>
          <form @submit.prevent="handleRegister">
            <input
              v-model="registerName"
              type="text"
              placeholder="Full Name*"
              required
              class="modal-input"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <input
              v-model="registerPhone"
              type="text"
              placeholder="Phone Number*"
              required
              class="modal-input"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <input
              v-model="registerEmail"
              type="email"
              placeholder="Email Address*"
              required
              class="modal-input"
              autocomplete="username"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <div style="position:relative;">
              <input
                v-model="registerPassword"
                type="password"
                placeholder="Password*"
                required
                class="modal-input"
                autocomplete="new-password"
                style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
              />
              <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#bbb;cursor:pointer;">
                <i class="fa fa-eye-slash"></i>
              </span>
            </div>
            <div style="position:relative;">
              <input
                v-model="registerConfirm"
                type="password"
                placeholder="Confirm Password*"
                required
                class="modal-input"
                autocomplete="new-password"
                style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
              />
              <span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#bbb;cursor:pointer;">
                <i class="fa fa-eye-slash"></i>
              </span>
            </div>
            <div v-if="registerError" style="color:#e53e3e;font-size:0.95rem;margin-bottom:0.5rem;">{{ registerError }}</div>
            <button type="submit" style="font-family:inherit;font-size:1.1rem;font-weight:bold;letter-spacing:1px;">CREATE ACCOUNT</button>
          </form>
          <div style="font-size:0.85rem;margin-top:0.5rem;color:#666;">
            By creating an account you're agreeing to our
            <a href="#" style="text-decoration:underline;">Terms and Conditions</a>
            and
            <a href="#" style="text-decoration:underline;">Privacy and Policy</a>.
          </div>
          <div style="text-align:center;font-size:1rem;margin-top:2rem;border-top:1px solid #eee;padding-top:1.2rem;">
            Already have an account?
            <a href="#" class="modal-link" style="color:#ffc107;font-weight:bold;" @click.prevent="showCreate = false; showLogin = true">Log in</a>
          </div>
        </div>
      </div>

      <!-- Reset Password Modal -->
      <div v-if="showReset" class="modal-overlay">
        <div class="modal-content">
          <span class="modal-close" @click="showReset = false">&times;</span>
          <h2>Reset Password</h2>
          <form @submit.prevent="handleResetPassword">
            <input
              v-model="resetEmail"
              type="email"
              placeholder="Email Address*"
              required
              class="modal-input"
              style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
            />
            <div style="position:relative;">
              <input
                v-model="resetNewPassword"
                :type="showResetPassword ? 'text' : 'password'"
                placeholder="New Password*"
                required
                class="modal-input"
                style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
              />
              <span
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#bbb;cursor:pointer;"
                @click="showResetPassword = !showResetPassword"
                :title="showResetPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showResetPassword ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
              </span>
            </div>
            <div style="position:relative;">
              <input
                v-model="resetConfirm"
                :type="showResetConfirm ? 'text' : 'password'"
                placeholder="Confirm New Password*"
                required
                class="modal-input"
                style="font-family:inherit;font-size:1.05rem;font-weight:500;background:#fafbfc;color:#222;"
              />
              <span
                style="position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#bbb;cursor:pointer;"
                @click="showResetConfirm = !showResetConfirm"
                :title="showResetConfirm ? 'Hide password' : 'Show password'"
              >
                <i :class="showResetConfirm ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
              </span>
            </div>
            <div v-if="resetError" style="color:#e53e3e;font-size:0.95rem;margin-bottom:0.5rem;">{{ resetError }}</div>
            <button type="submit" style="font-family:inherit;font-size:1.1rem;font-weight:bold;letter-spacing:1px;">RESET PASSWORD</button>
          </form>
        </div>
      </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" class="fixed inset-0 z-[60] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
      <transition name="toast-pop">
        <div
          v-show="toast.show"
          class="relative w-[90%] max-w-sm mx-auto bg-white rounded-2xl shadow-2xl ring-1 ring-green-200 p-5 text-green-800 pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div class="flex items-center gap-3">
            <div class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <i class="fa fa-check"></i>
            </div>
            <div>
              <div class="text-base font-semibold mb-1">{{ toast.message || 'Registration Successful' }}</div>
              <div class="text-sm opacity-90">{{ toast.detail || 'Account created successfully.' }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- About Us Modal -->
    <div v-if="showAboutUs" class="modal-overlay">
      <div class="modal-content">
        <span class="modal-close" @click="showAboutUs = false">&times;</span>
        <h2>About Us</h2>
        <p>
          Rykzmotocare is dedicated to providing high-quality motorcycle parts, expert maintenance, and reliable service. 
          Our team of skilled technicians and passionate riders ensures your bike is always ready for the road. 
          We value customer satisfaction, safety, and innovation in every aspect of our business.
        </p>
      </div>
    </div>

      </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'


const showLogin = ref(false)
const showCreate = ref(false)
const showReset = ref(false)
const showAboutUs = ref(false)
const showPassword = ref(false) // for login modal
const showResetPassword = ref(false) // for reset password modal
const showResetConfirm = ref(false) // for reset confirm password
const email = ref('')
const idNumber = ref('')
const password = ref('')
const error = ref('')
const registerName = ref('')
const registerPhone = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirm = ref('')
const registerError = ref('')
const router = useRouter()

const resetEmail = ref('')
const resetNewPassword = ref('')
const resetConfirm = ref('')
const resetError = ref('')

const shopClosed = ref(false)
const toast = ref({ show: false, message: '', detail: '' })
let toastTimer = null
function showToast(message = 'created account successfully.', detail = '', duration = 1800) {
  toast.value = { show: true, message, detail }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value.show = false), duration)
}

async function checkShop() {
  try {
    const res = await fetch('http://localhost:5000/api/shop', {
      headers: { 'Accept': 'application/json' }
    })
    const data = await res.json().catch(() => ({}))
    shopClosed.value = data.status === 'closed'
  } catch {
    shopClosed.value = false
  }
}

async function requireLogin(targetRoute = null) {
  await checkShop()
  if (shopClosed.value) {
    router.push('/customer-close-shop')
    return
  }
  if (!localStorage.getItem('token')) {
    showLogin.value = true
    return
  }
  if (targetRoute) {
    router.push(targetRoute)
  }
}

const handleLogin = async () => {
  error.value = ''
  try {
    const isEmail = email.value.trim() !== ''
    const payload = {
      identifier: isEmail ? email.value : idNumber.value,
      password: password.value,
      loginAs: isEmail ? 'customer' : 'admin'
    }

    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.message || 'Login failed'
      return
    }

    if (!isEmail) {
      // Admin login
      localStorage.setItem('admin_id', data.admin_id)
      localStorage.setItem('token', data.token)
      localStorage.removeItem('user_id')
      localStorage.removeItem('name')
      showLogin.value = false
      router.push('/customer-admin')
    } else {
      // User login
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('name', data.name)
      localStorage.removeItem('admin_id')
      showLogin.value = false

      try {
        const shopRes = await fetch('http://localhost:5000/api/shop')
        const shopData = await shopRes.json()
        if (shopData.status === 'closed') {
          router.push('/customer-close-shop')
          return
        }
      } catch (e) {}

      // Use backend redirect if present
      if (data.redirect) {
        router.push(data.redirect)
      } else if (String(data.status).toLowerCase() === 'pending') {
        router.push('/pending-approval')
      } else if (String(data.status).toLowerCase() === 'approved') {
        router.push('/user-homepage')
      } else {
        error.value = 'Unknown account status'
      }
    }
  } catch (e) {
    error.value = 'Network error'
  }
}

const handleRegister = async () => {
  registerError.value = ''
  try {
    // Basic validation
    if (!registerName.value || !registerPhone.value || !registerEmail.value || !registerPassword.value || !registerConfirm.value) {
      registerError.value = 'Please fill out all fields.'
      return
    }
    if (registerPassword.value !== registerConfirm.value) {
      registerError.value = 'Passwords do not match.'
      return
    }

    const res = await fetch('http://localhost:5000/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: registerName.value,
        phone: registerPhone.value,
        email: registerEmail.value,
        password: registerPassword.value
      })
    })
    const data = await res.json()
    if (!res.ok) {
      registerError.value = data.message || 'Registration failed'
      return
    }
    // Show designed toast, then route
    showToast()
    setTimeout(() => {
      showCreate.value = false
      router.push('/pending-approval')
    }, 1800)
  } catch (e) {
    registerError.value = 'Network error'
  }
}

const handleResetPassword = async () => {
  resetError.value = ''
  if (!resetEmail.value || !resetNewPassword.value || !resetConfirm.value) {
    resetError.value = 'Please fill out all fields.'
    return
  }
  if (resetNewPassword.value !== resetConfirm.value) {
    resetError.value = 'Passwords do not match.'
    return
  }
  try {
    const res = await fetch('http://localhost:5000/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: resetEmail.value,
        newPassword: resetNewPassword.value
      })
    })
    const data = await res.json()
    if (!res.ok) {
      resetError.value = data.message || 'Reset failed'
      return
    }
    showToast('Password Reset Successful', 'Your password has been updated.', 2000)
    setTimeout(() => {
      showReset.value = false
      showLogin.value = true
      resetEmail.value = ''
      resetNewPassword.value = ''
      resetConfirm.value = ''
    }, 2000)
  } catch (e) {
    resetError.value = 'Network error'
  }
}

function goToBrowseParts() {
  router.push('/browse-parts') // Make sure this matches your route for BrowseParts.vue
}
</script>

<style scoped src="./landingpage.css"></style>
