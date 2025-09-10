<template>
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-60 bg-gray-700 text-white flex flex-col justify-between py-6 px-4">
      <div>
        <div class="flex items-center mb-8">
          <img src="https://i.ibb.co/6b7Q8Q8/your-logo.png" alt="Logo" class="w-12 h-12 mr-2" />
          <span class="text-2xl font-bold leading-tight">
            Rykz <span class="text-yellow-400">motocare</span>
          </span>
        </div>
        <nav class="space-y-2">
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Close Shop</a>
          <router-link to="/customer-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Customer</router-link>
          <a href="#" class="block py-1 px-2 rounded text-yellow-400 bg-gray-600 font-semibold">Inventory</a>
          <router-link to="/booking-list" class="block py-1 px-2 rounded hover:bg-gray-600">Booking List</router-link>
          <router-link to="/mechanic-admin" class="block py-1 px-2 rounded hover:bg-gray-600">Available Mechanics</router-link>
          <router-link to="/customer-bills" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Bills</router-link>
          <a href="#" class="block py-1 px-2 rounded hover:bg-gray-600">Feedbacks</a>
          <router-link to="/customer-approval" class="block py-1 px-2 rounded hover:bg-gray-600">Customer Approval</router-link>
        </nav>
      </div>
      <button @click="handleLogout" class="flex items-center gap-2 text-white hover:text-yellow-400 mt-8">
        <i class="fa fa-sign-out"></i>
        <span>Logout</span>
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 bg-white rounded-tr-3xl rounded-br-3xl shadow relative">
      <!-- Top Bar -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
          <span class="text-2xl font-bold">Admin</span>
          <button
            class="border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 bg-white hover:bg-yellow-100"
            @click="showSellModal = true"
          >SELL ITEM</button>
          <button
            class="border border-gray-400 rounded px-3 py-1 text-sm text-gray-700 bg-white hover:bg-yellow-100"
            @click="showAddModal = true"
          >ADD ITEM</button>
          <input
            type="text"
            v-model="search"
            placeholder="search item..."
            class="border border-gray-400 rounded px-3 py-1 text-sm focus:outline-yellow-400"
          />
        </div>
        <div class="flex items-center gap-6">
          <i class="fa fa-bell text-2xl text-gray-700"></i>
          <i class="fa fa-user-circle text-3xl text-gray-700"></i>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full border-separate border-spacing-0">
          <thead>
            <tr class="border-b-2 border-black">
              <th class="text-left py-2 px-4 font-semibold">Name:</th>
              <th class="text-left py-2 px-4 font-semibold">Brand:</th>
              <th class="text-left py-2 px-4 font-semibold">Category:</th>
              <th class="text-left py-2 px-4 font-semibold">Item Code:</th>
              <th class="text-left py-2 px-4 font-semibold">Date:</th>
              <th class="text-left py-2 px-4 font-semibold">Quantity:</th>
              <th class="text-left py-2 px-4 font-semibold">Price:</th>
              <th class="text-left py-2 px-4 font-semibold">Actions:</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in filteredItems" :key="item.id" :class="idx % 2 === 1 ? 'bg-gray-100' : ''" class="border-b border-black">
              <td class="py-2 px-4">{{ item.name }}</td>
              <td class="py-2 px-4">{{ item.brand }}</td>
              <td class="py-2 px-4">{{ item.category }}</td>
              <td class="py-2 px-4">{{ item.item_code }}</td>
              <td class="py-2 px-4">
                {{ item.date_added ? item.date_added.slice(0, 10) : '' }}
              </td>
              <td class="py-2 px-4">{{ item.quantity }}</td>
              <td class="py-2 px-4">{{ item.price }}</td>
              <td class="py-2 px-4">
                <!-- Sell button removed -->
                <button
                  class="text-gray-800 hover:text-yellow-500 text-sm font-semibold ml-2"
                  @click="openEditModal(item)"
                >Edit</button>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="8" class="text-center py-4 text-gray-400">No items found.</td>
            </tr>
          </tbody>
        </table>
        <div class="bg-gray-100 rounded-b-2xl h-40"></div>
      </div>

      <!-- Add Item Modal -->
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg w-full max-w-md p-8 relative">
          <span class="absolute top-4 right-4 text-2xl font-bold text-gray-500 cursor-pointer" @click="showAddModal = false">&times;</span>
          <h2 class="text-xl font-bold mb-4 text-center">Add Inventory Item</h2>
          <form @submit.prevent="addItem" class="flex flex-col gap-3">
            <input v-model="form.name" class="border rounded px-3 py-2" placeholder="Item Name" required />
            <input v-model="form.brand" class="border rounded px-3 py-2" placeholder="Brand" required />
            <input v-model="form.category" class="border rounded px-3 py-2" placeholder="Category" required />
            <input v-model="form.code" class="border rounded px-3 py-2" placeholder="Item Code" required />
            <input v-model="form.date" type="date" class="border rounded px-3 py-2" required />
            <input v-model.number="form.qty" type="number" min="0" class="border rounded px-3 py-2" placeholder="Quantity" required />
            <input v-model="form.price" class="border rounded px-3 py-2" placeholder="Price (e.g. PHP250)" required />
            <!-- Optional: Image upload can be added here -->
            <button class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded py-2 mt-2" type="submit">
              Add Item
            </button>
          </form>
        </div>
      </div>

      <!-- Sell Item Modal (top button version) -->
      <div v-if="showSellModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-gray-200 rounded-lg w-full max-w-xs p-8 relative">
          <span class="absolute top-4 right-4 text-2xl font-bold text-gray-500 cursor-pointer" @click="closeSellModal">&times;</span>
          <div class="mb-4">
            <div class="mb-2">
              <span class="font-semibold">SELECT ITEM:</span>
              <select v-model="selectedItemId" class="w-full border rounded px-2 py-1 mt-1">
                <option disabled value="">-- Select Item --</option>
                <option v-for="item in items" :key="item.item_id" :value="item.item_id">
                  {{ item.name }} ({{ item.item_code }})
                </option>
              </select>
            </div>
            <div v-if="selectedItem">
              <div class="flex justify-between mb-2">
                <span class="font-semibold">ITEM CODE:</span>
                <span>{{ selectedItem.item_code }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="font-semibold">ITEM NAME:</span>
                <span>{{ selectedItem.name }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="font-semibold">QUANTITY SOLD:</span>
                <span>
                  <input
                    v-model.number="sellQty"
                    type="number"
                    min="1"
                    :max="selectedItem.quantity"
                    class="w-12 text-center border rounded"
                    style="background:#eee;"
                  />
                </span>
              </div>
              <div class="flex justify-between mb-6">
                <span class="font-semibold">PRICE</span>
                <span>PHP{{ selectedItem.price }}</span>
              </div>
            </div>
          </div>
          <button
            class="block mx-auto bg-white border border-gray-600 rounded px-4 py-1 font-semibold hover:bg-yellow-400"
            :disabled="!selectedItem"
            @click="confirmSale"
          >Confirm Sale</button>
        </div>
      </div>

      <!-- Edit Item Modal -->
      <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div class="bg-white rounded-lg w-full max-w-md p-8 relative">
          <span class="absolute top-4 right-4 text-2xl font-bold text-gray-500 cursor-pointer" @click="showEditModal = false">&times;</span>
          <h2 class="text-xl font-bold mb-4 text-center">Edit Inventory Item</h2>
          <form @submit.prevent="editItem" class="flex flex-col gap-3">
            <input v-model="form.name" class="border rounded px-3 py-2" placeholder="Item Name" required />
            <input v-model="form.brand" class="border rounded px-3 py-2" placeholder="Brand" required />
            <input v-model="form.category" class="border rounded px-3 py-2" placeholder="Category" required />
            <input v-model="form.code" class="border rounded px-3 py-2" placeholder="Item Code" required />
            <input v-model="form.date" type="date" class="border rounded px-3 py-2" required />
            <input v-model.number="form.qty" type="number" min="0" class="border rounded px-3 py-2" placeholder="Quantity" required />
            <input v-model="form.price" class="border rounded px-3 py-2" placeholder="Price (e.g. PHP250)" required />
            <button class="bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded py-2 mt-2" type="submit">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const showAddModal = ref(false)
const showSellModal = ref(false)
const showEditModal = ref(false)
const search = ref('')
const items = ref([])
const selectedItemId = ref(null)
const sellQty = ref(1)

const form = ref({
  name: '',
  brand: '',
  category: '',
  code: '',
  date: '',
  qty: '',
  price: ''
})

const filteredItems = computed(() =>
  items.value.filter(item =>
    item.name?.toLowerCase().includes(search.value.toLowerCase()) ||
    item.brand?.toLowerCase().includes(search.value.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.value.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(search.value.toLowerCase())
  )
)

const selectedItem = computed(() =>
  items.value.find(item => item.item_id === selectedItemId.value)
)

const isLoggedIn = !!localStorage.getItem('token')
const router = useRouter()

async function fetchItems() {
  try {
    const res = await fetch('http://localhost:5000/api/inventory')
    const data = await res.json()
    items.value = data
  } catch (e) {
    items.value = []
  }
}

onMounted(() => {
  if (!isLoggedIn) {
    router.replace('/')
  } else {
    fetchItems()
  }
})

async function addItem() {
  try {
    await fetch('http://localhost:5000/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        brand: form.value.brand,
        category: form.value.category,
        item_code: form.value.code,
        price: form.value.price,
        quantity: form.value.qty,
        date_added: form.value.date,
        image_url: '' // or handle image upload if needed
      })
    })
    showAddModal.value = false
    form.value = { name: '', brand: '', category: '', code: '', date: '', qty: '', price: '' }
    await fetchItems() // Refresh the list from the database
  } catch (e) {
    alert('Failed to add item')
  }
}

function openSellModal(item) {
  selectedItem.value = item
  sellQty.value = 1
  showSellModal.value = true
}

function closeSellModal() {
  showSellModal.value = false
  selectedItem.value = null
  sellQty.value = 1
}

async function confirmSale() {
  if (!selectedItem.value || sellQty.value < 1 || sellQty.value > selectedItem.value.quantity) {
    alert('Invalid quantity')
    return
  }
  try {
    await fetch(`http://localhost:5000/api/inventory/${selectedItem.value.item_id}/sell`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity_sold: sellQty.value })
    })
    closeSellModal()
    await fetchItems()
  } catch (e) { 
    alert('Failed to confirm sale')
  }
}

function openEditModal(item) {
  editId.value = item.item_id
  form.value = {
    name: item.name,
    brand: item.brand,
    category: item.category,
    code: item.item_code,
    date: item.date_added ? item.date_added.slice(0, 10) : '',
    qty: item.quantity,
    price: item.price
  }
  showEditModal.value = true
}

const editId = ref(null)

async function editItem() {
  try {
    await fetch(`http://localhost:5000/api/inventory/${editId.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name,
        brand: form.value.brand,
        category: form.value.category,
        item_code: form.value.code,
        price: form.value.price,
        quantity: form.value.qty,
        date_added: form.value.date
      })
    })
    showEditModal.value = false
    editId.value = null
    form.value = { name: '', brand: '', category: '', code: '', date: '', qty: '', price: '' }
    await fetchItems()
  } catch (e) {
    alert('Failed to edit item')
  }
}

function handleLogout() {
  localStorage.removeItem('token'); 
  window.location.href = '/';  
}

</script>