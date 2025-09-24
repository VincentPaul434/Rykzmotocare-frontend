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
</script>