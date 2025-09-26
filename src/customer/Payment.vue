<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-6">
    <div class="max-w-2xl mx-auto bg-white rounded shadow p-5">
      <h1 class="text-xl font-bold mb-4">
        Pay for {{ mode === 'service' ? `Booking #${bookingId || '-'}` : `Order #${orderId || '-'}` }}
      </h1>

      <!-- Step 1: choose method -->
      <div v-if="step === 'choose'">
        <p class="mb-3 text-gray-600">Choose a payment method:</p>
        <div class="grid gap-2">
          <label class="flex items-center gap-2">
            <input type="radio" value="gcash" v-model="method" /> GCash
          </label>
        </div>
        <div class="mt-4 flex gap-2">
          <button class="px-4 py-2 border rounded" @click="router.back()">Back</button>
          <button
            class="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
            :disabled="!method || loading"
            @click="startPayment"
          >
            {{ loading ? 'Starting…' : 'Continue' }}
          </button>
        </div>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      </div>

      <!-- Step 2: show instructions and upload -->
      <div v-else-if="step === 'instructions'">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">Reference</div>
          <div class="font-mono">{{ payment.payment_ref }}</div>
          <div class="text-sm text-gray-500 mt-2">Amount</div>
          <div class="font-semibold">₱{{ Number(payment.amount || 0).toFixed(2) }}</div>
        </div>
        <p class="mt-3">{{ payment.instructions?.note || 'Send payment using the details below, then upload the receipt.' }}</p>

        <!-- GCash ONLY -->
        <div v-if="payment.method === 'gcash'" class="mt-3 text-sm">
          <div>Number: <span class="font-semibold">{{ payment.instructions.number }}</span></div>
          <div>Name: <span class="font-semibold">{{ payment.instructions.name }}</span></div>
          <img
            src="../assets/images/gcash-qr.png"
            alt="GCash QR"
            class="w-48 h-48 object-contain mt-2 border rounded"
          />
        </div>

        <div class="mt-6">
          <label class="block font-semibold mb-1">Upload payment receipt</label>
          <input type="file" accept="image/*" @change="onFileChange" />
          <div class="mt-3 flex gap-2">
            <button class="px-4 py-2 border rounded" @click="step='choose'">Change method</button>
            <button
              class="px-4 py-2 bg-yellow-400 rounded font-bold disabled:opacity-60"
              :disabled="!file || submitting"
              @click="submitReceipt"
            >
              {{ submitting ? 'Uploading…' : 'Submit Receipt' }}
            </button>
          </div>
          <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
          <p v-if="success" class="text-green-700 mt-3">Receipt submitted. Thank you!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearCart } from '../utils/cart'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const route = useRoute()
const router = useRouter()

const mode = ref(route.query.type === 'service' ? 'service' : 'order') // 'order' | 'service'
const orderId = ref(String(route.query.orderId || ''))
const bookingId = ref(String(route.query.bookingId || ''))
const currentUserId = ref(String(localStorage.getItem('user_id') || '0'))

const method = ref('')
const step = ref('choose')
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const success = ref(false)
const file = ref(null)

const payment = ref({
  method: '',
  payment_ref: '',
  amount: 0,
  instructions: {},
  order_id: '',
  booking_id: ''
})

function resolve(u) {
  if (!u) return ''
  const n = String(u).replace(/\\/g, '/')
  return /^https?:\/\//i.test(n) ? n : `${API}${n.startsWith('/') ? '' : '/'}${n}`
}

function onFileChange(e) {
  file.value = e.target?.files?.[0] || null
}

async function startPayment() {
  loading.value = true
  error.value = ''
  success.value = false
  try {
    const body = {
      method: method.value,
      user_id: Number(currentUserId.value) || 0,
      ...(mode.value === 'service'
        ? { booking_id: Number(bookingId.value), kind: 'service' }
        : { order_id: Number(orderId.value), kind: 'order' })
    }
    const res = await fetch(`${API}/api/payments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()

    // NEW: handle nested instructions object or flat fields
    const instrData = (data && typeof data.instructions === 'object' && data.instructions) ? data.instructions : {}
    const m = method.value || data.method || ''
    const instr =
      m === 'gcash'
        ? {
            number: instrData.number ?? data.gcash_number ?? data.number ?? '',
            name: instrData.name ?? data.gcash_name ?? data.name ?? '',
            qr_url: instrData.qr_url ?? data.qr_url ?? ''
          }
        : m === 'bdo'
        ? {
            account_name: instrData.account_name ?? data.bdo_account_name ?? data.account_name ?? '',
            account_number: instrData.account_number ?? data.bdo_account_number ?? data.account_number ?? '',
            branch: instrData.branch ?? data.bdo_branch ?? data.branch ?? ''
          }
        : {
            number: instrData.number ?? data.maya_number ?? data.number ?? '',
            name: instrData.name ?? data.maya_name ?? data.name ?? ''
          }

    const noteValue = typeof data.instructions === 'string'
      ? data.instructions
      : (instrData.note ?? instrData.message ?? '')

    payment.value = {
      method: m,
      payment_ref: data.payment_ref || '',
      amount: Number(data.amount ?? data.total_amount ?? 0),
      instructions: { ...instr, note: noteValue },
      order_id: mode.value === 'order' ? (data.order_id ?? orderId.value) : '',
      booking_id: mode.value === 'service' ? (data.booking_id ?? bookingId.value) : ''
    }

    step.value = 'instructions'
  } catch (e) {
    error.value = 'Failed to start payment.'
  } finally {
    loading.value = false
  }
}

async function submitReceipt() {
  if (!file.value) return
  submitting.value = true
  error.value = ''
  success.value = false
  try {
    const fd = new FormData()
    if (mode.value === 'order') fd.append('order_id', String(payment.value.order_id || orderId.value))
    else fd.append('booking_id', String(payment.value.booking_id || bookingId.value))
    fd.append('user_id', String(currentUserId.value || '0'))
    fd.append('receipt', file.value)

    const res = await fetch(`${API}/api/payments/upload`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await res.text())
    await res.json()

    // Clear the user's cart and notify listeners
    clearCart(currentUserId.value)
    window.dispatchEvent(new Event('cart:clear'))

    success.value = true
    setTimeout(() => {
      router.push(mode.value === 'order' ? '/successfully-purchased' : '/customer-bills')
    }, 600)
  } catch (e) {
    console.error(e)
    error.value = 'Failed to submit receipt'
  } finally {
    submitting.value = false
  }
}
</script>