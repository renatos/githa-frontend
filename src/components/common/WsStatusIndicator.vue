<template>
  <div
    class="flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 shadow-sm"
    :class="statusClasses"
    :title="statusText"
  >
    <div class="w-2 h-2 rounded-full" :class="dotClasses"></div>
    <span v-if="!compact">{{ statusText }}</span>
  </div>
</template>


<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['connecting', 'connected', 'disconnected', 'failed'].includes(value)
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const statusClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50';
    case 'connecting':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50';
    case 'failed':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50';
    case 'disconnected':
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  }
});

const dotClasses = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    case 'connecting':
      return 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    case 'failed':
      return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    case 'disconnected':
    default:
      return 'bg-slate-400';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'connected':
      return 'Sincronização em tempo real ativa';
    case 'connecting':
      return 'Conectando sincronização...';
    case 'failed':
      return 'Sincronização offline';
    case 'disconnected':
    default:
      return 'Desconectado';
  }
});
</script>
