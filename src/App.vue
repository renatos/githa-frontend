<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseToast from './components/common/BaseToast.vue';
import ConfirmModal from './components/common/ConfirmModal.vue';
import GlobalTooltip from './components/common/GlobalTooltip.vue';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

import { useTheme } from './composables/useTheme';
import LoadingOverlay from './components/LoadingOverlay.vue';

const route = useRoute();
const { isDark } = useTheme(); // Initialize theme globally

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : MainLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <LoadingOverlay />
  <BaseToast />
  <ConfirmModal />
  <GlobalTooltip />
</template>

<style scoped>
</style>
