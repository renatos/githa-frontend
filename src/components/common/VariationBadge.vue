<template>
  <div 
    v-if="isValid" 
    class="relative group cursor-help flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shadow-sm"
    :class="statusClasses"
  >
    <component :is="icon" :size="10" stroke-width="3" />
    <span>{{ Math.abs(percentage).toFixed(1) }}%</span>
    <span class="opacity-70 font-medium uppercase tracking-tight">{{ label }}</span>
    
    <BaseTooltip :text="tooltipText" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ArrowUp, ArrowDown, Minus } from 'lucide-vue-next';
import BaseTooltip from './BaseTooltip.vue';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps({
  current: { type: Number, default: 0 },
  comparison: { type: Number, default: 0 },
  label: { type: String, default: '' }
});

const percentage = computed(() => {
  if (!props.comparison || props.comparison === 0) return 0;
  return ((props.current - props.comparison) / props.comparison) * 100;
});

const isPositive = computed(() => percentage.value > 0);
const isNegative = computed(() => percentage.value < 0);
const isZero = computed(() => Math.abs(percentage.value) < 0.01);

const isValid = computed(() => {
  return props.comparison > 0;
});

const statusClasses = computed(() => {
  if (isPositive.value) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  if (isNegative.value) return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
  return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
});

const icon = computed(() => {
  if (isPositive.value) return ArrowUp;
  if (isNegative.value) return ArrowDown;
  return Minus;
});

const tooltipText = computed(() => {
  const verb = isPositive.value ? 'Aumento' : isNegative.value ? 'Queda' : 'Estável';
  const currentFmt = formatCurrency(props.current);
  const comparisonFmt = formatCurrency(props.comparison);
  return `${verb} de ${Math.abs(percentage.value).toFixed(1)}% (${currentFmt} vs ${comparisonFmt} no período comparado).`;
});
</script>
