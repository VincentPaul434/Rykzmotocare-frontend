import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './landingpage.vue'
import AdminSignup from './AdminSignup.vue'
import CustomerAdmin from './CustomerAdmin.vue'
import InventoryAdmin from './InventoryAdmin.vue'
import CustomerApproval from './CustomerApproval.vue'
import MechanicAdmin from './MechanicAdmin.vue'
import PendingApproval from './PendingApproval.vue'
import UserHomepage from './UserHomepage.vue'
import Services from './Services.vue'
import BookingList from './BookingList.vue'
import CustomerBills from './CustomerBills.vue'
import Accessories from './Accessories.vue'

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/admin-signup', name: 'AdminSignup', component: AdminSignup },
  { path: '/customer-admin', name: 'CustomerAdmin', component: CustomerAdmin },
  { path: '/inventory-admin', name: 'InventoryAdmin', component: InventoryAdmin },
  { path: '/customer-approval', name: 'CustomerApproval', component: CustomerApproval },
  { path: '/mechanic-admin', name: 'MechanicAdmin', component: MechanicAdmin },
  { path: '/pending-approval', name: 'PendingApproval', component: PendingApproval },
  { path: '/user-homepage', name: 'UserHomepage', component: UserHomepage },
  { path : '/services', name: 'Services', component: Services },
  { path: '/booking-list', name: 'BookingList', component: BookingList },
  { path: '/customer-bills', name: 'CustomerBills', component: CustomerBills },
  { path: '/accessories', name: 'Accessories', component: Accessories }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router