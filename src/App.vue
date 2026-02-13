<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

import { useTheme } from './composables/useTheme';
import { toastBridge } from './services/toastBridge';
import LoadingOverlay from './components/LoadingOverlay.vue';

const route = useRoute();
const toast = useToast();
const { isDark } = useTheme(); // Initialize theme globally

onMounted(() => {
    toastBridge.setToast(toast);
});

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : MainLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <LoadingOverlay />
  <Toast />
</template>

<style scoped>
</style>
