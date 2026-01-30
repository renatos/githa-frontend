<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

const route = useRoute();
const toast = useToast();

onMounted(() => {
    window.$toast = toast;
});

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : MainLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <Toast />
</template>

<style scoped>
</style>
