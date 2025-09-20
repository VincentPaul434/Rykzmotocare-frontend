<template>
  <RouterView />
  <CartIcon />
  <CartDrawer />
</template>

<script setup>
import CartDrawer from './components/CartDrawer.vue';
import CartIcon from './components/CartIcon.vue';
</script>