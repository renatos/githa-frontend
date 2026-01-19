<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal">
      <div class="modal-header">
        <h3>Importar Contatos do Google</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body">
        <div v-if="loading" class="loading">Carregando contatos...</div>
        <div v-else-if="error" class="error-container">
          <div class="error-message">{{ error }}</div>
          <button v-if="showConnectButton" class="btn btn-google mt-2" @click="connectGoogle">
            Conectar com Google
          </button>
        </div>
        <div v-else class="contacts-list">
          <div v-for="contact in contacts" :key="contact.resourceName" class="contact-item">
            <label>
              <input type="checkbox" v-model="selectedContacts" :value="contact">
              <span class="contact-name">{{ getDisplayName(contact) }}</span>
              <span class="contact-email" v-if="getEmail(contact)">{{ getEmail(contact) }}</span>
            </label>
          </div>
          <div v-if="contacts.length === 0">Nenhum contato encontrado.</div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
        <button class="btn btn-primary" :disabled="selectedContacts.length === 0" @click="importSelected">
          Importar ({{ selectedContacts.length }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import api from '../../services/api';

const props = defineProps(['visible']);
const emit = defineEmits(['close', 'import']);

const contacts = ref([]);
const selectedContacts = ref([]);
const loading = ref(false);
const error = ref('');
const showConnectButton = ref(false);

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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.5rem;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.contacts-list {
  width: 100%;
}

.contact-item {
  padding: 0.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.contact-email {
  color: #64748b;
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

.modal-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.loading, .error-container {
    text-align: center;
    padding: 2rem;
    color: #64748b;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
}

.error-message { 
    color: #ef4444; 
    margin-bottom: 1rem;
}

.btn-google {
  background-color: #4285F4;
  color: white;
  border: 1px solid #4285F4;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-google:hover {
  background-color: #3367d6;
}

.mt-2 {
    margin-top: 0.5rem;
}
</style>
