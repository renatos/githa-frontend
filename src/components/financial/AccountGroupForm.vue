<template>
  <BaseModal
    :show="true"
    :title="accountGroup.id ? 'Editar Grupo' : 'Novo Grupo'"
    icon="fa-solid fa-folder-open"
    @close="$emit('close')"
  >
    <form id="accountGroupForm" class="flex flex-col gap-6" @submit.prevent="save">
      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome</p>
        <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="text" required />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Natureza</p>
        <select v-model="form.nature" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required>
          <option v-for="nature in accountNatures" :key="nature.name" :value="nature.name">
            {{ nature.description }}
          </option>
        </select>
      </label>

      <label v-if="form.nature === 'EXPENSE'" class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Classificação</p>
        <select v-model="form.classification" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required>
          <option value="OPEX">Operacional</option>
          <option value="CAPEX">Investimento</option>
        </select>
      </label>

      <!-- Recurrence Fields for EXPENSE nature -->
      <div v-if="form.nature === 'EXPENSE'" class="flex flex-col gap-4 border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-semibold">Configuração de Recorrência</p>

        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-xs font-medium pb-1">Recorrência</p>
          <select v-model="form.recurrenceType" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-colors">
            <option :value="null">Nenhuma</option>
            <option value="NONE">Nenhuma</option>
            <option value="WEEKLY">Semanal</option>
            <option value="MONTHLY">Mensal</option>
          </select>
        </label>

        <div v-if="form.recurrenceType && form.recurrenceType !== 'NONE'" class="grid grid-cols-2 gap-4">
          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-xs font-medium pb-1">
              {{ form.recurrenceType === 'WEEKLY' ? 'Dia da Semana' : 'Dia do Mês' }}
            </p>
            <select v-if="form.recurrenceType === 'WEEKLY'" v-model="form.recurrenceDay" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-colors" required>
              <option :value="1">Segunda-feira (1)</option>
              <option :value="2">Terça-feira (2)</option>
              <option :value="3">Quarta-feira (3)</option>
              <option :value="4">Quinta-feira (4)</option>
              <option :value="5">Sexta-feira (5)</option>
              <option :value="6">Sábado (6)</option>
              <option :value="7">Domingo (7)</option>
            </select>
            <input v-else v-model.number="form.recurrenceDay" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-colors" type="number" min="1" max="31" required />
          </label>

          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-xs font-medium pb-1">Valor</p>
            <CurrencyInput v-model="form.recurrenceValue" class="h-10 text-sm font-normal" required />
          </label>
        </div>
      </div>

      <div
class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
           :class="form.active ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Ativo</p>
        <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
          <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
          <input v-model="form.active" class="invisible absolute" type="checkbox" />
        </label>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="accountGroupForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import financialService from '../../services/financialService';
import { enumService } from '../../services/enumService';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';

const props = defineProps({
  accountGroup: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

const accountNatures = ref([]);
const form = ref({
  name: '',
  nature: 'EXPENSE',
  active: true,
  classification: 'OPEX',
  recurrenceType: null,
  recurrenceDay: null,
  recurrenceValue: null
});

watch(() => form.value.nature, (newNature) => {
  if (newNature === 'INCOME') {
    form.value.classification = null;
    form.value.recurrenceType = null;
    form.value.recurrenceDay = null;
    form.value.recurrenceValue = null;
  } else if (!form.value.classification) {
    form.value.classification = 'OPEX';
  }
});

watch(() => form.value.recurrenceType, (newType) => {
  if (!newType || newType === 'NONE') {
    form.value.recurrenceDay = null;
    form.value.recurrenceValue = null;
  }
});

const init = async () => {
  try {
    accountNatures.value = await enumService.getOptions('AccountNature');
  } catch (e) {
    console.error("Failed to load account natures", e);
  }
  if (props.accountGroup.id) {
    form.value = { ...props.accountGroup };
    if (form.value.nature === 'EXPENSE' && !form.value.classification) {
      form.value.classification = 'OPEX';
    }
  }
};

onMounted(() => {
  init();
});

const save = async () => {
  try {
    if (props.accountGroup.id) {
      await financialService.updateAccountGroup(props.accountGroup.id, form.value);
    } else {
      await financialService.createAccountGroup(form.value);
    }
    emit('save');
  } catch (error) {
    console.error('Error saving account group:', error);
  }
};
</script>
