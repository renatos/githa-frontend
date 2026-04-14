<template>
  <div v-if="status !== 'disconnected'" class="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300"
       :class="statusClasses">
    <div class="w-2 h-2 rounded-full" :class="dotClasses"></div>
    <span>{{ statusText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['connecting', 'connected', 'disconnected', 'failed'].includes(value)
  }
});

const statusClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'connecting':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return '';
  }
});

const dotClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-green-500';
    case 'connecting':
      return 'bg-yellow-500 animate-pulse';
    case 'failed':
      return 'bg-red-500';
    default:
      return '';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'Sincronização em tempo real ativa';
    case 'connecting':
      return 'Conectando sincronização...';
    case 'failed':
      return 'Sincronização offline. Recarregue a página.';
    default:
      return '';
  }
});
</script>
