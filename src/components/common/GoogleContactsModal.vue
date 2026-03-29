<template>
  <BaseModal
    :show="visible"
    title="Importar Contatos do Google"
    icon="fa-brands fa-google"
    max-width="max-w-2xl"
    :body-padding="false"
    @close="$emit('close')"
  >
    <template #sub-header>
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
          <input
            v-model="searchQuery"
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            placeholder="Buscar contato por nome ou email..."
            type="text"
          >
        </div>
      </div>
      <div v-if="filteredContacts.length > 0 && !loading && !error" class="px-6 py-2 bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-700">
        <label class="flex items-center gap-3 cursor-pointer group">
          <input v-model="selectAll" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
          <span class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
            Selecionar Todos ({{ filteredContacts.length }})
          </span>
        </label>
      </div>
    </template>

    <div class="min-h-[300px] flex flex-col">
      <div v-if="loading" class="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl mb-4 text-indigo-500"></i>
        <p class="font-medium">Carregando contatos...</p>
      </div>

      <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4">
          <i class="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
        </div>
        <p class="text-slate-900 dark:text-slate-100 font-medium mb-2">{{ error }}</p>
        <button
v-if="showConnectButton" 
                class="mt-4 px-6 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2" 
                @click="connectGoogle">
          <i class="fa-brands fa-google text-lg"></i>
          Conectar com Google
        </button>
      </div>

      <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
        <div
v-for="contact in filteredContacts" :key="contact.resourceName" 
             class="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <label class="flex items-center gap-4 cursor-pointer">
            <input
v-model="selectedContacts" :value="contact" type="checkbox" 
                   class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
            <div class="min-w-0">
              <p class="font-bold text-slate-900 dark:text-slate-100 truncate">{{ getDisplayName(contact) }}</p>
              <p v-if="getEmail(contact)" class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ getEmail(contact) }}</p>
            </div>
          </label>
        </div>
        
        <div v-if="filteredContacts.length === 0" class="p-12 text-center text-slate-400">
          <i class="fa-solid fa-user-slash text-4xl mb-4 opacity-20"></i>
          <p>Nenhum contato encontrado.</p>
        </div>
      </div>
    </div>

    <template #footer>
      <button
class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors" 
              @click="$emit('close')">
        Cancelar
      </button>
      <button
:disabled="selectedContacts.length === 0" 
              class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all shadow-sm shadow-indigo-200 dark:shadow-none" 
              @click="importSelected">
        Importar {{ selectedContacts.length }} contato(s)
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import BaseModal from './BaseModal.vue';
import api from '../../services/api';
import {useModal} from '../../composables/useModal';

const props = defineProps(['visible']);
const emit = defineEmits(['close', 'import']);

useModal(emit);

const contacts = ref([]);
const selectedContacts = ref([]);
const loading = ref(false);
const error = ref('');
const showConnectButton = ref(false);
const searchQuery = ref('');

const fetchContacts = async () => {
  loading.value = true;
  error.value = '';
  showConnectButton.value = false;
  try {
    const response = await api.get('/integrations/google/contacts');
    contacts.value = response.data;
  } catch (e) {
    if (e.response && e.response.status === 401) {
      error.value = 'É necessário autorizar o acesso aos Contatos do Google.';
      showConnectButton.value = true;
    } else {
      error.value = 'Erro ao carregar contatos. Tente novamente.';
    }
    console.error(e);
  } finally {
    loading.value = false;
  }
};

watch(() => props.visible, (newVal) => {
  if (newVal) {
    fetchContacts();
    selectedContacts.value = [];
    searchQuery.value = '';
  }
});

const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value;

  const query = searchQuery.value.toLowerCase();
  return contacts.value.filter(contact => {
    const name = getDisplayName(contact).toLowerCase();
    const email = getEmail(contact).toLowerCase();
    return name.includes(query) || email.includes(query);
  });
});

const selectAll = computed({
  get: () => {
    if (filteredContacts.value.length === 0) return false;
    return filteredContacts.value.every(contact =>
        selectedContacts.value.some(selected => selected.resourceName === contact.resourceName)
    );
  },
  set: (value) => {
    if (value) {
      // Add all filtered contacts that aren't already selected
      const newSelections = filteredContacts.value.filter(contact =>
          !selectedContacts.value.some(selected => selected.resourceName === contact.resourceName)
      );
      selectedContacts.value = [...selectedContacts.value, ...newSelections];
    } else {
      // Remove all filtered contacts from selection
      selectedContacts.value = selectedContacts.value.filter(selected =>
          !filteredContacts.value.some(contact => contact.resourceName === selected.resourceName)
      );
    }
  }
});

const connectGoogle = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin + '/auth/google/callback';
  const scope = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/contacts',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ].join(' ');

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  window.location.href = authUrl;
};

const getDisplayName = (contact) => {
  return contact.names?.[0]?.displayName || 'Sem Nome';
};

const getEmail = (contact) => {
  return contact.emailAddresses?.[0]?.value || '';
};

const getPhone = (contact) => {
  return contact.phoneNumbers?.[0]?.value || '';
};

const importSelected = () => {
  const clients = selectedContacts.value.map(c => ({
    name: getDisplayName(c),
    email: getEmail(c),
    phone: getPhone(c)
  }));
  emit('import', clients);
};
</script>

<style scoped>

</style>
