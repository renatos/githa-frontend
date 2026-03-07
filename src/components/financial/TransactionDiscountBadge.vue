<template>
  <div v-if="discountPreview" class="group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all duration-300 hover:border-indigo-500/30">
    <!-- Background Decor -->
    <div class="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <i class="fa-solid fa-receipt text-4xl text-indigo-400"></i>
    </div>

    <!-- Header -->
    <div class="flex items-center gap-2 mb-4">
      <div class="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <i class="fa-solid fa-percent text-indigo-400 text-xs"></i>
      </div>
      <div>
        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 block leading-none">Desconto Aplicado</span>
        <span class="text-sm font-semibold text-slate-200 block mt-1">
          {{ paymentMethod.name }} 
          <span class="text-indigo-400 font-bold ml-1">({{ discountPreview.percentage }}%)</span>
        </span>
      </div>
    </div>

    <!-- Details -->
    <div class="space-y-2">
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-500">Valor Original</span>
        <span class="text-slate-300 font-medium">{{ formatCurrency(amount) }}</span>
      </div>
      
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-500">Desconto Calculado</span>
        <span class="text-rose-400 font-bold">- {{ formatCurrency(discountPreview.discountAmount) }}</span>
      </div>

      <div class="pt-2 mt-2 border-t border-slate-800 flex justify-between items-baseline">
        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Estimado</span>
        <span class="text-xl font-black text-emerald-400 tracking-tight">
          {{ formatCurrency(discountPreview.finalAmount) }}
        </span>
      </div>
    </div>

    <!-- Info Tooltip-like -->
    <div class="mt-3 bg-slate-950/50 rounded-lg p-2 border border-slate-800/50">
      <p class="text-[10px] text-slate-500 flex items-center gap-1.5 leading-tight">
        <i class="fa-solid fa-circle-info text-indigo-400/50"></i>
        Este valor considera as taxas de operação configuradas para esta forma de pagamento.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  amount: { type: Number, required: true },
  paymentMethod: { type: Object, default: null }
});

const discountPreview = computed(() => {
  if (!props.paymentMethod) return null;
  const pct = parseFloat(props.paymentMethod.discountPercentage);
  if (!pct || pct <= 0) return null;
  const amountVal = parseFloat(props.amount);
  if (!amountVal || amountVal <= 0) return null;
  
  const discountAmount = (amountVal * pct) / 100;
  return {
    percentage: pct,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round((amountVal - discountAmount) * 100) / 100
  };
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};
</script>
