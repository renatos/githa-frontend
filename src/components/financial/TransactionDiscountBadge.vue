<template>
  <div v-if="discountPreview" class="group relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all duration-300 hover:border-indigo-500/30">
    <!-- Background Decor -->
    <div class="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <i class="fa-solid fa-receipt text-4xl text-indigo-400"></i>
    </div>

    <!-- Header for Split Mode -->
    <div v-if="discountPreview.isSplit" class="flex items-center gap-2 mb-4">
      <div class="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
        <i class="fa-solid fa-percent text-indigo-400 text-xs"></i>
      </div>
      <div>
        <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 block leading-none">Descontos e Taxas Aplicadas</span>
        <span class="text-sm font-semibold text-slate-200 block mt-1">Consolidado (Múltiplas Formas)</span>
      </div>
    </div>

    <!-- Header for Single Mode -->
    <div v-else class="flex items-center gap-2 mb-4">
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

    <!-- Details for Split Mode -->
    <div v-if="discountPreview.isSplit" class="space-y-3">
      <div class="space-y-3 pb-3 mb-3 border-b border-slate-800">
        <div v-for="(item, i) in discountPreview.items" :key="i" class="flex justify-between items-center text-xs">
          <div class="flex flex-col">
            <span class="text-slate-300 font-medium">{{ item.name }}</span>
            <span class="text-[10px] text-slate-500">
              {{ formatCurrency(item.originalAmount) }} 
              <span v-if="item.hasDiscount" class="text-indigo-400">({{ item.percentage }}% desc)</span>
            </span>
          </div>
          <div class="text-right">
            <span class="text-slate-300 font-medium block">{{ formatCurrency(item.finalAmount) }}</span>
            <span v-if="item.hasDiscount" class="text-[10px] text-rose-400 font-bold block">- {{ formatCurrency(item.discountAmount) }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex justify-between items-center text-xs">
          <span class="text-slate-500">Valor Original Total</span>
          <span class="text-slate-300 font-medium">{{ formatCurrency(discountPreview.originalAmount) }}</span>
        </div>
        
        <div class="flex justify-between items-center text-xs">
          <span class="text-slate-500">Total de Descontos</span>
          <span class="text-rose-400 font-bold">- {{ formatCurrency(discountPreview.discountAmount) }}</span>
        </div>

        <div class="pt-2 mt-2 border-t border-slate-800 flex justify-between items-baseline">
          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400">Total Estimado Líquido</span>
          <span class="text-xl font-black text-emerald-400 tracking-tight">
            {{ formatCurrency(discountPreview.finalAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Details for Single Mode -->
    <div v-else class="space-y-2">
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
import { round2 } from '@/utils/formatters';

const props = defineProps({
  amount: { type: Number, required: true },
  paymentMethod: { type: Object, default: null },
  paymentSplits: { type: Array, default: () => [] },
  isSplit: { type: Boolean, default: false }
});

const discountPreview = computed(() => {
  if (props.isSplit && props.paymentSplits && props.paymentSplits.length > 0) {
    let totalOriginalAmount = 0;
    let totalDiscountAmount = 0;
    const itemsBreakdown = [];

    for (const split of props.paymentSplits) {
      const splitAmount = parseFloat(split.amount) || 0;
      totalOriginalAmount += splitAmount;
      
      const pct = parseFloat(split.discountPercentage);
      if (pct && pct > 0) {
        const discountVal = (splitAmount * pct) / 100;
        totalDiscountAmount += discountVal;
        itemsBreakdown.push({
          name: split.paymentMethodName || 'Forma de Pagamento',
          percentage: pct,
          originalAmount: splitAmount,
          discountAmount: round2(discountVal),
          finalAmount: round2(splitAmount - discountVal),
          hasDiscount: true
        });
      } else {
        itemsBreakdown.push({
          name: split.paymentMethodName || 'Forma de Pagamento',
          percentage: 0,
          originalAmount: splitAmount,
          discountAmount: 0,
          finalAmount: splitAmount,
          hasDiscount: false
        });
      }
    }
    
    const hasAnyDiscount = itemsBreakdown.some(item => item.hasDiscount);
    if (!hasAnyDiscount) return null;

    return {
      isSplit: true,
      items: itemsBreakdown,
      originalAmount: totalOriginalAmount,
      discountAmount: round2(totalDiscountAmount),
      finalAmount: round2(totalOriginalAmount - totalDiscountAmount)
    };
  }

  if (!props.paymentMethod) return null;
  const pct = parseFloat(props.paymentMethod.discountPercentage);
  if (!pct || pct <= 0) return null;
  const amountVal = parseFloat(props.amount);
  if (!amountVal || amountVal <= 0) return null;
  
  const discountAmount = (amountVal * pct) / 100;
  return {
    isSplit: false,
    percentage: pct,
    discountAmount: round2(discountAmount),
    finalAmount: round2(amountVal - discountAmount)
  };
});


const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};
</script>

