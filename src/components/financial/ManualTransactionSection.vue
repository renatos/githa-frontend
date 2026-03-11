<!--
  ManualTransactionSection.vue — Form fields for a manual income/expense transaction.
  Uses v-model implicitly via the parent's `form` reactive object passed as a prop.
-->
<template>
  <div class="space-y-6">
    <!-- Description -->
    <div class="space-y-2">
      <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Descrição</label>
      <div class="relative group mt-1">
        <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors"></i>
        <input
          v-model="form.description"
          :disabled="!canSave"
          placeholder="Ex: Aluguel mensal, Compra de suprimentos..."
          class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 pl-11 pr-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors disabled:opacity-50 text-base font-normal"
        />
      </div>
    </div>

    <!-- Account Group -->
    <div v-if="!isAppointmentTransaction" class="space-y-2">
      <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Grupo de Contas</label>
      <div class="h-12 w-full mt-1">
        <BaseLookup
          v-model="form.accountGroupId"
          :disabled="!canSave"
          :initial-description="form.accountGroupName"
          :search-service="accountGroupServiceAdapter"
          placeholder="Ex: Custos de Operação, Investimentos..."
          @select="$emit('account-group-select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseLookup from '../common/BaseLookup.vue';

defineProps({
  form: { type: Object, required: true },
  canSave: { type: Boolean, default: true },
  isAppointmentTransaction: { type: Boolean, default: false },
  accountGroupServiceAdapter: { type: Object, required: true },
});

defineEmits(['account-group-select']);
</script>
