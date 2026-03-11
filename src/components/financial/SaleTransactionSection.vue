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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import BaseLookup from '../common/BaseLookup.vue';
import SaleItemsTable from './SaleItemsTable.vue';

const saleItemsTableRef = ref(null);

defineProps({
  form: { type: Object, required: true },
  canSave: { type: Boolean, default: true },
  saleItems: { type: Array, default: () => [] },
  saleItemTypes: { type: Array, default: () => [] },
  autoFilledMessage: { type: String, default: '' },
  clientService: { type: Object, required: true },
  productServiceAdapter: { type: Object, required: true },
  serviceService: { type: Object, required: true },
  professionalService: { type: Object, required: true },
});

defineEmits(['client-select', 'add-item', 'remove-item']);

// Expose the internal ref to parent so parent can call setItemData
defineExpose({ saleItemsTableRef });
</script>
