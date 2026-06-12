<template>
  <BaseModal
    :show="true"
    :title="creditCard.id ? 'Editar Cartão de Crédito' : 'Novo Cartão de Crédito'"
    icon="fa-solid fa-credit-card"
    @close="$emit('close')"
  >
    <form id="creditCardForm" class="flex flex-col gap-6" @submit.prevent="save">
      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome do Cartão</p>
        <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="text" placeholder="Ex: Visa Corporate" required />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Limite de Crédito (R$)</p>
        <input v-model="form.creditLimit" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="number" min="0.01" step="0.01" required />
      </label>

      <div class="grid grid-cols-2 gap-4">
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Dia de Fechamento</p>
          <input v-model="form.closingDay" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="number" min="1" max="28" required />
        </label>

        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Dia de Vencimento</p>
          <input v-model="form.dueDay" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="number" min="1" max="28" required />
        </label>
      </div>

      <!-- Hidden submit button to allow "Enter" to submit the form -->
      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="creditCardForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import creditCardService from '../../services/creditCardService';
import BaseModal from '../common/BaseModal.vue';

const props = defineProps({
  creditCard: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  creditLimit: 0,
  closingDay: 10,
  dueDay: 17
});

onMounted(() => {
  if (props.creditCard.id) {
    form.value = { ...props.creditCard };
  }
});

const save = async () => {
  try {
    if (props.creditCard.id) {
      await creditCardService.update(props.creditCard.id, form.value);
    } else {
      await creditCardService.create(form.value);
    }
    emit('save');
  } catch (error) {
    console.error('Error saving credit card:', error);
  }
};
</script>
