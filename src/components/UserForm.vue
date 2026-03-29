<template>
  <BaseModal
    :show="true"
    :title="user.id ? 'Editar Usuário' : 'Novo Usuário'"
    icon="fa-solid fa-user-gear"
    @close="$emit('close')"
  >
    <form id="userForm" class="flex flex-col gap-6" @submit.prevent="save">
      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome</p>
        <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required type="text" />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Email</p>
        <input v-model="form.email" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required type="email" />
      </label>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Senha (Opcional se usar Google)</p>
        <input v-model="form.password" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" type="password" />
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

      <div class="flex flex-col gap-2">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Perfis de Acesso</p>
        <div class="flex flex-wrap gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.roles" type="checkbox" value="ADMIN" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-700" />
            <span class="text-sm text-slate-700 dark:text-slate-300">Admin</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.roles" type="checkbox" value="PROFESSIONAL" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-700" />
            <span class="text-sm text-slate-700 dark:text-slate-300">Profissional</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.roles" type="checkbox" value="USER" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-700" />
            <span class="text-sm text-slate-700 dark:text-slate-300">Usuário</span>
          </label>
        </div>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="userForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from './common/BaseModal.vue';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  email: '',
  password: '',
  active: true,
  roles: []
});

onMounted(() => {
  if (props.user.id) {
    form.value = {...props.user, password: ''}; // Don't show hash
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
