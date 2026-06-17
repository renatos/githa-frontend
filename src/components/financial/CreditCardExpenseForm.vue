<template>
  <BaseModal
    :show="true"
    title="Lançar Gasto no Cartão"
    icon="fa-solid fa-file-invoice-dollar"
    @close="$emit('close')"
  >
    <form id="creditCardExpenseForm" class="flex flex-col gap-6" @submit.prevent="save">
      <!-- Description -->
      <div class="space-y-2">
        <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Descrição</label>
        <div class="relative group mt-1">
          <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors"></i>
          <input
            v-model="form.description"
            placeholder="Ex: Assinatura Software, Materiais Clínicos..."
            class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 pl-11 pr-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
            type="text"
            required
          />
        </div>
      </div>

      <!-- Account Group -->
      <div class="space-y-2">
        <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Grupo de Contas (Opcional)</label>
        <div class="h-12 w-full mt-1">
          <BaseLookup
            v-model="form.accountGroupId"
            :initial-description="form.accountGroupName"
            :search-service="accountGroupServiceAdapter"
            placeholder="Ex: Custos de Operação, Investimentos (CAPEX)..."
            @select="onAccountGroupSelect"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Cost / Value -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Valor Total</label>
          <div class="relative group mt-1">
            <CurrencyInput
              v-model="form.totalAmount"
              class="font-black"
              required
            />
          </div>
        </div>

        <!-- Installments -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Nº de Parcelas</label>
          <input
            v-model="form.installmentCount"
            class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
            type="number"
            min="1"
            required
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Date -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Data da Compra</label>
          <input
            v-model="form.purchaseDate"
            class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
            type="date"
            required
          />
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Categoria (Opcional)</label>
          <input
            v-model="form.category"
            class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
            type="text"
            placeholder="Ex: Tecnologia"
          />
        </div>
      </div>

      <!-- Hidden submit button to allow "Enter" to submit the form -->
      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="creditCardExpenseForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import creditCardService from '../../services/creditCardService';
import financialService from '../../services/financialService';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';

const props = defineProps({
  cardId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const form = ref({
  description: '',
  totalAmount: null,
  installmentCount: 1,
  purchaseDate: getTodayString(),
  category: '',
  accountGroupId: null,
  accountGroupName: ''
});

// Account group adapter for lookup
const accountGroupServiceAdapter = {
  getAll: async (params) => {
    const response = await financialService.getAccountGroups();
    let data = response.data.filter(group => group.active && group.classification !== 'CREDIT_CARD');
    if (params.name) {
      data = data.filter(g => g.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    return { data: { content: data, totalElements: data.length } };
  },
  getById: async (id) => {
    const response = await financialService.getAccountGroups();
    return { data: response.data.find(g => g.id == id) };
  }
};

const onAccountGroupSelect = (item) => {
  form.value.accountGroupId = item?.id;
  form.value.accountGroupName = item?.name || '';
  if (item && !form.value.description) {
    form.value.description = item.name;
  }
};

const save = async () => {
  try {
    await creditCardService.createExpense(props.cardId, form.value);
    emit('save');
  } catch (error) {
    console.error('Error saving credit card expense:', error);
  }
};
</script>
