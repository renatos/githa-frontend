<template>
  <BaseModal
    :show="true"
    :title="professional.id ? 'Editar Profissional' : 'Novo Profissional'"
    icon="material-symbols-outlined:medical_services"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <form id="professionalForm" class="flex flex-col gap-6" @submit.prevent="save">
      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome</p>
        <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required type="text" />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Telefone</p>
        <input v-model="form.phone" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="tel" maxlength="15" placeholder="(DD) 99999-9999" @input="onPhoneInput" />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Comissão (%)</p>
        <input v-model="form.commissionRate" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" max="100" min="0" step="0.01" type="number" />
      </label>

      <div
class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
           :class="form.active ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Ativo</p>
        <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
          <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
          <input v-model="form.active" class="invisible absolute" type="checkbox" />
        </label>
      </div>
      
      <div class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Usuário do Sistema</p>
        <BaseLookup
          v-model="form.userId"
          placeholder="Pesquisar usuário..."
          :search-service="userService"
          :initial-description="form.userName"
          @update:model-value="(val) => !val && (form.userName = '')"
        />
        <p class="text-xs text-slate-500 mt-1">Opcional. Permite que o usuário logado seja identificado como este profissional.</p>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="professionalForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { professionalService } from '../services/professionalService';
import { userService } from '../services/userService';
import BaseModal from './common/BaseModal.vue';
import BaseLookup from './common/BaseLookup.vue';
import { formatPhone } from '../utils/formatters';

const props = defineProps({
  professional: { type: Object, default: () => ({}) },
  zIndex: { type: Number, default: 9999 }
});

const emit = defineEmits(['close', 'save']);
const isFormValid = ref(true);
const saving = ref(false);

const form = ref({
  name: '',
  phone: '',
  commissionRate: 0,
  active: true,
  userId: null,
  userName: '',
});

onMounted(() => {
  if (props.professional.id) {
    form.value = {...props.professional};
  }
});

const save = () => {
  emit('save', form.value);
};

const onPhoneInput = (event) => {
  const formatted = formatPhone(event.target.value);
  form.value.phone = formatted;
  event.target.value = formatted;
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
