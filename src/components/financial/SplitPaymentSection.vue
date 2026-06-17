<template>
  <div class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
    <div class="flex items-center justify-between">
      <label class="text-slate-900 dark:text-slate-100 text-sm font-bold block ml-1">Formas de Pagamento (Divisão de Valores)</label>
      <button
        v-if="canSave"
        type="button"
        class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1"
        @click="$emit('add-split')"
      >
        <i class="fa-solid fa-plus text-[10px]"></i>
        Adicionar Forma
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="(split, index) in paymentSplits"
        :key="index"
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <!-- Method Lookup -->
        <div class="flex-1 min-w-0">
          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Forma</span>
          <div class="h-10 w-full">
            <BaseLookup
              v-model="split.paymentMethodId"
              :disabled="!canSave"
              :initial-description="split.paymentMethodName"
              :search-service="paymentMethodService"
              placeholder="Selecione o método..."
              @select="(item) => handleSelect(index, item)"
            />
          </div>
        </div>

        <!-- Split Amount -->
        <div class="w-full sm:w-36">
          <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Valor</span>
          <div class="h-10 w-full">
            <CurrencyInput
              v-model="split.amount"
              :disabled="!canSave"
              class="h-10 text-sm font-bold"
            />
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex items-end justify-center h-10 pt-4 sm:pt-0">
          <button
            type="button"
            :disabled="!canSave"
            class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg disabled:opacity-30 transition-colors"
            title="Remover"
            @click="$emit('remove-split', index)"
          >
            <i class="fa-solid fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Splits Validation Summary -->
    <div
      class="flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold mt-3"
      :class="isSplitsBalanced && !hasDuplicatePaymentMethods
        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'"
    >
      <i class="fa-solid" :class="isSplitsBalanced && !hasDuplicatePaymentMethods ? 'fa-circle-check text-emerald-500' : 'fa-triangle-exclamation text-amber-500'"></i>
      <div class="flex-1 min-w-0">
        <span v-if="isSplitsBalanced && !hasDuplicatePaymentMethods">
          Valores conciliados com sucesso! Total: {{ formatCurrency(formAmount) }}
        </span>
        <span v-else-if="hasDuplicatePaymentMethods">
          Existem formas de pagamento duplicadas na lista de divisão.
        </span>
        <span v-else>
          A soma das formas de pagamento ({{ formatCurrency(splitsSum) }}) não corresponde ao total da venda ({{ formatCurrency(formAmount) }}). Diferença: {{ formatCurrency(splitsDiff) }}.
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseLookup from '../common/BaseLookup.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  paymentSplits: { type: Array, required: true },
  canSave: { type: Boolean, required: true },
  isSplitsBalanced: { type: Boolean, required: true },
  hasDuplicatePaymentMethods: { type: Boolean, required: true },
  splitsSum: { type: Number, required: true },
  splitsDiff: { type: Number, required: true },
  formAmount: { type: Number, required: true },
  paymentMethodService: { type: Object, required: true }
});

const emit = defineEmits(['add-split', 'remove-split', 'update-split']);

const handleSelect = (index, item) => {
  emit('update-split', index, item);
};
</script>
