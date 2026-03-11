<template>
  <span
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
    :class="badgeClass"
  >
    <span class="w-1.5 h-1.5 rounded-full" :class="dotClass"></span>
    {{ label }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  /**
   * Defines the mapping of status values to styles and labels.
   * Each key should be a status string, mapped to { label, badge, dot }.
   * Example:
   * {
   *   VIP: { label: 'VIP', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', dot: 'bg-emerald-500' },
   *   AT_RISK: { label: 'Em Risco', badge: '...', dot: '...' }
   * }
   */
  statusMap: {
    type: Object,
    default: () => ({}),
  },
  fallbackLabel: {
    type: String,
    default: '',
  },
});

import { computed } from 'vue';

const badgeClass = computed(() => {
  return props.statusMap[props.status]?.badge
    || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
});

const dotClass = computed(() => {
  return props.statusMap[props.status]?.dot || 'bg-slate-400';
});

const label = computed(() => {
  return props.statusMap[props.status]?.label || props.fallbackLabel || props.status;
});
</script>
