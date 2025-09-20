<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-6">
    <div class="max-w-2xl mx-auto bg-white rounded shadow p-5">
      <h1 class="text-xl font-bold mb-4">Pay for Order #{{ orderId }}</h1>

      <div v-if="step === 'choose'">
        <p class="mb-3 text-gray-600">Choose a payment method:</p>
        <div class="grid gap-2">
          <label class="flex items-center gap-2">
            <input type="radio" value="gcash" v-model="method" /> GCash
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" value="bdo" v-model="method" /> BDO Bank Transfer
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" value="paymaya" v-model="method" /> Maya
          </label>
        </div>
        <div class="mt-4 flex gap-2">
          <button class="px-4 py-2 border rounded" @click="goBack">Back</button>
          <button class="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
                  :disabled="!method || loading"
                  @click="startPayment">
            {{ loading ? 'Starting…' : 'Continue' }}
          </button>
        </div>
        <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
      </div>

      <div v-else-if="step === 'instructions'">
        <div class="space-y-1">
          <div class="text-sm text-gray-500">Reference</div>
          <div class="font-mono">{{ info.payment_ref }}</div>
        </div>
        <p class="mt-3">{{ info.instructions }}</p>

        <div v-if="info.method === 'gcash'" class="mt-3 text-sm">
          <div>Account: <span class="font-semibold">{{ info.gcash_name }}</span></div>
          <div>Number: <span class="font-semibold">{{ info.gcash_number }}</span></div>
          <img v-if="info.qr_url" :src="resolve(info.qr_url)" alt="GCash QR" class="mt-2 w-40 border rounded" />
        </div>

        <div v-else-if="info.method === 'bdo'" class="mt-3 text-sm">
          <div>Name: <span class="font-semibold">{{ info.bdo_account_name }}</span></div>
          <div>Account #: <span class="font-semibold">{{ info.bdo_account_number }}</span></div>
          <div>Branch: <span class="font-semibold">{{ info.bdo_branch }}</span></div>
        </div>

        <div v-else-if="info.method === 'paymaya'" class="mt-3 text-sm">
          <div>Name: <span class="font-semibold">{{ info.maya_name }}</span></div>
          <div>Number: <span class="font-semibold">{{ info.maya_number }}</span></div>
        </div>

        <div class="mt-6">
          <label class="block font-semibold mb-1">Upload payment receipt</label>
          <input type="file" accept="image/*" @change="onFile" />
          <div class="mt-3 flex gap-2">
            <button class="px-4 py-2 border rounded" @click="step='choose'">Change method</button>
            <button class="px-4 py-2 bg-yellow-400 rounded font-bold disabled:opacity-60"
                    :disabled="!file || loading"
                    @click="uploadReceipt">
              {{ loading ? 'Uploading…' : 'Submit Receipt' }}
            </button>
          </div>
          <p v-if="error" class="text-red-600 mt-3">{{ error }}</p>
          <p v-if="success" class="text-green-700 mt-3">Receipt submitted. Order marked Paid.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.query.orderId || '')
const userId = ref(localStorage.getItem('user_id') || '')
const method = ref('')
const step = ref('choose')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const info = ref({})
const file = ref(null)

function resolve(u) {
  if (!u) return ''
  const n = String(u).replace(/\\/g, '/')
  if (/^https?:\/\//i.test(n)) return n
  return `${API}${n.startsWith('/') ? '' : '/'}${n}`
}
function goBack() { router.back() }
function onFile(e) { file.value = e.target?.files?.[0] || null }

async function startPayment() {
  loading.value = true; error.value = ''; success.value = false
  try {
    const res = await fetch(`${API}/api/payments/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: Number(orderId.value), user_id: Number(userId.value), method: method.value })
    })
    if (!res.ok) throw new Error(await res.text())
    info.value = await res.json()
    step.value = 'instructions'
  } catch (e) {
    error.value = 'Failed to start payment.'
  } finally {
    loading.value = false
  }
}

async function uploadReceipt() {
  if (!file.value) return
  loading.value = true; error.value = ''; success.value = false
  try {
    const fd = new FormData()
    fd.append('order_id', orderId.value)
    fd.append('user_id', userId.value)
    fd.append('receipt', file.value)
    const res = await fetch(`${API}/api/payments/receipt`, { method: 'POST', body: fd })
    if (!res.ok) throw new Error(await res.text())
    await res.json()
    success.value = true
    // Redirect to Bills after a moment
    setTimeout(() => router.push('/purchases'), 1000)
  } catch (e) {
    error.value = 'Failed to upload receipt.'
  } finally {
    loading.value = false
  }
}
</script>