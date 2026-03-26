<template>
  <BaseModal
    :show="true"
    :title="service.id ? 'Editar Procedimento' : 'Novo Procedimento'"
    icon="fa-solid fa-stethoscope"
    :bodyPadding="false"
    @close="$emit('close')"
  >
    <template #sub-header>
      <TabNavigation v-model="activeTab" :tabs="tabs" />
    </template>

    <form @submit.prevent="save" id="serviceForm" class="flex flex-col h-full">
      <div class="p-6 flex-1 bg-transparent dark:bg-slate-900/50">
        <!-- Cadastro Tab -->
        <div v-show="activeTab === 0" class="flex flex-col gap-6">
          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome</p>
            <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required type="text"/>
          </label>

          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Grupo</p>
            <select v-model="form.group" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required>
              <option value="Serviços básicos">Serviços básicos</option>
              <option value="Estética Facial">Estética Facial</option>
              <option value="Consulta">Consulta</option>
            </select>
          </label>

          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Descrição</p>
            <textarea v-model="form.description" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 p-4 text-base transition-colors" rows="3"></textarea>
          </label>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="flex flex-col">
              <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Duração (minutos)</p>
              <input v-model="form.durationMinutes" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" min="1" required type="number"/>
            </label>
            <label class="flex flex-col">
              <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Preço</p>
              <div class="h-11 flex w-full">
                <CurrencyInput v-model="form.price" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 text-base transition-colors" required/>
              </div>
            </label>
          </div>

          <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
               :class="form.active ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Ativo</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
              <input class="invisible absolute" type="checkbox" v-model="form.active" />
            </label>
          </div>
        </div>

        <!-- Retorno Tab -->
        <div v-show="activeTab === 1" class="flex flex-col gap-6">
          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Retorno Ideal (dias)</p>
            <input v-model="form.idealReturnDays" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" min="0" placeholder="Ex: 30" type="number"/>
            <p class="text-slate-500 text-xs mt-1">Número de dias após o procedimento para sugerir um novo agendamento.</p>
          </label>

          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Template da Mensagem</p>
            <textarea v-model="form.rebookingTemplate" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 p-4 text-base transition-colors font-mono" rows="5" placeholder="Olá ${clientName}! ..."></textarea>
            <p class="text-slate-500 text-xs mt-1">Use <code>${clientName}</code> para inserir o nome do cliente automaticamente.</p>
          </label>
        </div>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="serviceForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import BaseModal from './common/BaseModal.vue';
import CurrencyInput from './common/CurrencyInput.vue';
import TabNavigation from './common/TabNavigation.vue';

const props = defineProps({
  service: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);

const activeTab = ref(0);
const tabs = [
  { label: 'Cadastro' },
  { label: 'Retorno' }
];

const form = ref({
  name: '',
  description: '',
  durationMinutes: 30,
  idealReturnDays: null,
  rebookingTemplate: '',
  price: 0,
  active: true,
  group: 'Serviços básicos', // Default
});

onMounted(() => {
  if (props.service.id) {
    form.value = {
        ...props.service,
        idealReturnDays: props.service.idealReturnDays ?? null,
        rebookingTemplate: props.service.rebookingTemplate ?? ''
    };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
