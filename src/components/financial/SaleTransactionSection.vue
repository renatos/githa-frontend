<!--
  SaleTransactionSection.vue — Client lookup, unbilled appointment check,
  and items table for sale-based transactions.
-->
<template>
  <div class="space-y-6">
    <!-- Client Selection -->
    <div class="space-y-2">
      <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Cliente</label>
      <div class="h-12 w-full mt-1">
        <BaseLookup
          v-model="form.clientId"
          :disabled="!canSave"
          :initial-description="form.clientName"
          :search-service="clientService"
          mode="lookup"
          placeholder="Pesquisar cliente..."
          @select="$emit('client-select', $event)"
        />
      </div>
    </div>

    <!-- Items Table -->
    <SaleItemsTable
      ref="saleItemsTableRef"
      :items="saleItems"
      :can-save="canSave"
      :sale-item-types="saleItemTypes"
      :product-service-adapter="productServiceAdapter"
      :service-service="serviceService"
      :professional-service="professionalService"
      :auto-filled-message="autoFilledMessage"
      @add-item="$emit('add-item', $event)"
      @remove-item="$emit('remove-item', $event)"
    />

    <!-- Discount Action / Applied Card (Only when items exist) -->
    <div v-if="saleItems.length > 0" class="pt-1">
      <!-- State 1: No discount applied -->
      <div v-if="!discountSummary || discountSummary.totalDiscountAmount <= 0" class="flex justify-end">
        <button
          v-if="canSave"
          type="button"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
          @click="$emit('open-discount-modal')"
        >
          <i class="fa-solid fa-tag text-[11px]"></i>
          Aplicar Desconto
        </button>
      </div>

      <!-- State 2: Discount is applied -->
      <div v-else class="p-3.5 bg-indigo-50/70 dark:bg-slate-900/60 border border-indigo-200/80 dark:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
        <div class="flex items-center gap-3 min-w-0">
          <div class="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <i class="fa-solid fa-tag text-sm"></i>
          </div>
          <div class="min-w-0">
            <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 block leading-tight">
              Desconto Concedido
            </span>
            <span class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 truncate block mt-0.5">
              - {{ formatCurrency(discountSummary.totalDiscountAmount) }}
              <span v-if="discountSummary.totalDiscountPercentage > 0" class="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                ({{ discountSummary.totalDiscountPercentage.toFixed(2) }}% • {{ discountSummary.mode === 'ITEM' ? 'Por Item' : 'No Total' }})
              </span>
            </span>
          </div>
        </div>
        <div v-if="canSave" class="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            class="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer"
            @click="$emit('open-discount-modal')"
          >
            <i class="fa-solid fa-pen-to-square mr-1"></i>
            Editar
          </button>
          <button
            type="button"
            class="p-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
            title="Remover Desconto"
            @click="$emit('remove-discount')"
          >
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseLookup from '../common/BaseLookup.vue';
import SaleItemsTable from './SaleItemsTable.vue';
import { formatCurrency } from '@/utils/formatters';

const saleItemsTableRef = ref(null);

defineProps({
  form: { type: Object, required: true },
  canSave: { type: Boolean, default: true },
  saleItems: { type: Array, default: () => [] },
  saleItemTypes: { type: Array, default: () => [] },
  autoFilledMessage: { type: String, default: '' },
  discountSummary: { type: Object, default: null },
  clientService: { type: Object, required: true },
  productServiceAdapter: { type: Object, required: true },
  serviceService: { type: Object, required: true },
  professionalService: { type: Object, required: true },
});

defineEmits(['client-select', 'add-item', 'remove-item', 'open-discount-modal', 'remove-discount']);

// Expose the internal ref to parent so parent can call setItemData
defineExpose({ saleItemsTableRef });
</script>
