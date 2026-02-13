<script setup>
import { loadingState } from '../services/loadingState';
import ProgressSpinner from 'primevue/progressspinner';
</script>

<template>
  <div v-if="loadingState.isLoading" class="loading-overlay">
    <ProgressSpinner />
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
}
</style>
