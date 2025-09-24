import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './assets/LandingPage.vue'
import AdminSignup from './admin/AdminSignup.vue'
import CustomerAdmin from './admin/CustomerAdmin.vue'
import InventoryAdmin from './admin/InventoryAdmin.vue'
import CustomerApproval from './admin/CustomerApproval.vue'
import MechanicAdmin from './admin/MechanicAdmin.vue'
import PendingApproval from './admin/PendingApproval.vue'
import UserHomepage from './customer/UserHomepage.vue'
import Services from './customer/Services.vue'
import BookingList from './admin/BookingList.vue'
import CustomerBills from './admin/CustomerBills.vue'
import Accessories from './customer/Accessories.vue'
import CustomerParts from './customer/Parts.vue'
import Oil from './customer/Oil.vue'
import Tires from './customer/Tires.vue'
import closeShop from './admin/closeShop.vue'
import FeedbackAdmin from './admin/FeedbackAdmin.vue'
import customerCloseShop from './customer/customerCloseShop.vue'
import ViewMechanic from './customer/ViewMechanic.vue'
import BillsPayments from './customer/BillsPayments.vue'
import Payment from './customer/Payment.vue'
import CustomerPayment from './admin/CustomerPayment.vue'
import TrackStatus from './customer/TrackStatus.vue'
import Feedback from './customer/Feedback.vue'
import Mybookings from './customer/Mybookings.vue'
import SuccessfullyPurchased from './customer/SuccessfullyPurchased.vue'

const routes = [
  { path: '/', name: 'LandingPage', component: LandingPage },
  { path: '/admin-signup', name: 'AdminSignup', component: AdminSignup },
  { path: '/customer-admin', name: 'CustomerAdmin', component: CustomerAdmin },
  { path: '/inventory-admin', name: 'InventoryAdmin', component: InventoryAdmin },
  { path: '/customer-approval', name: 'CustomerApproval', component: CustomerApproval },
  { path: '/mechanic-admin', name: 'MechanicAdmin', component: MechanicAdmin },
  { path: '/pending-approval', name: 'PendingApproval', component: PendingApproval },
  { path: '/user-homepage', name: 'UserHomepage', component: UserHomepage },
  { path: '/services', name: 'Services', component: Services },
  { path: '/booking-list', name: 'BookingList', component: BookingList },
  { path: '/customer-bills', name: 'CustomerBills', component: CustomerBills },
  { path: '/parts', name: 'CustomerParts', component: CustomerParts },
  { path: '/accessories', name: 'Accessories', component: Accessories },
  { path: '/oil', name: 'Oil', component: Oil },
  { path: '/tires', name: 'Tires', component: Tires },
  { path: '/close-shop', name: 'closeShop', component: closeShop },
  { path: '/feedback-admin', name: 'FeedbackAdmin', component: FeedbackAdmin },
  { path: '/customer-close-shop', name: 'customerCloseShop', component: customerCloseShop },
  { path: '/view-mechanic', name: 'ViewMechanic', component: ViewMechanic },
  { path: '/bills', name: 'BillsPayments', component: BillsPayments },
  { path: '/payment', name: 'Payment', component: Payment },
  { path: '/customer-payment', name: 'CustomerPayment', component: CustomerPayment },
  { path: '/track-status', name: 'TrackStatus', component: TrackStatus },
  { path: '/feedback', name: 'Feedback', component: Feedback },
  { path: '/my-booking', name: 'Mybookings', component: Mybookings },
  { path: '/successfully-purchased', name: 'SuccessfullyPurchased', component: SuccessfullyPurchased }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})


// Navigation guard for token-protected routes
router.beforeEach((to, from, next) => {
  // Customer protected routes
  const protectedRoutes = [
    '/user-homepage',
    '/pending-approval',
    '/view-mechanic',
    '/bills',
    '/payment',
    '/track-status',
    '/feedback',
    '/my-booking',
    '/parts'
  ]
  // Admin protected routes
  const adminRoutes = [
    '/customer-admin',
    '/inventory-admin',
    '/customer-approval',
    '/mechanic-admin',
    '/booking-list',
    '/customer-bills',
    '/feedback-admin',
    '/customer-payment',
  ]

  if (protectedRoutes.some(path => to.path.startsWith(path))) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/')
      return
    }
  }

  if (adminRoutes.some(path => to.path.startsWith(path))) {
    const adminId = localStorage.getItem('admin_id')
    const token = localStorage.getItem('token')
    if (!adminId || !token) {
      next('/')
      return
    }
  }

  next()
})

export default router