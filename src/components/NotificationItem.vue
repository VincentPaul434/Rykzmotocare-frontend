<script setup>
import { ref, onMounted } from 'vue'
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const notifications = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const user_id = localStorage.getItem('user_id')
    const res = await fetch(`${API}/api/notifications?user_id=${user_id}`)
    if (!res.ok) throw new Error('Failed to fetch notifications')
    notifications.value = await res.json()
  } catch (e) {
    error.value = e.message || 'Unable to load notifications.'
  } finally {
    loading.value = false
  }
})

// Mark notification as read
async function markAsRead(notificationId) {
  try {
    const res = await fetch(`${API}/api/notifications/${notificationId}/read`, {
      method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to mark as read')
    // Update local state
    const notif = notifications.value.find(n => n.id === notificationId)
    if (notif) notif.read = true
  } catch (e) {
    error.value = e.message || 'Unable to mark notification as read.'
  }
}
</script>

<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <ul>
      <li v-for="notif in notifications" :key="notif.id" :style="{ opacity: notif.read ? 0.5 : 1 }">
        <span>{{ notif.message }}</span>
        <button v-if="!notif.read" @click="markAsRead(notif.id)" class="ml-2 text-blue-600 underline text-xs">Mark as read</button>
      </li>
    </ul>
  </div>
</template>