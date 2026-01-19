<template>
  <div class="profile-view">
    <h1>Meu Perfil</h1>

    <div class="profile-card">
      <div class="user-info" v-if="user">
        <div class="avatar-circle">{{ userInitials }}</div>
        <div class="details">
          <h2>{{ user.name || 'Usuário' }}</h2>
          <p>{{ user.email }}</p>
        </div>
      </div>
    </div>

    <div class="integrations-section">
      <h2>Integrações</h2>
      
      <div class="integration-card google-card">
        <div class="integration-header">
          <div class="icon-google">G</div>
          <div class="integration-info">
            <h3>Google Agenda e Contatos</h3>
            <p>Sincronize seus agendamentos e importe contatos.</p>
          </div>
          <div class="integration-status" :class="{ connected: isGoogleConnected }">
            {{ isGoogleConnected ? 'Conectado' : 'Desconectado' }}
          </div>
        </div>

        <div class="integration-actions">
          <button v-if="!isGoogleConnected" class="btn btn-google" @click="connectGoogle">
            Conectar conta Google
          </button>
          <div v-else class="connected-actions">
             <div class="toggles">
               <label class="toggle-row">
                 <input type="checkbox" v-model="syncSettings.calendar" disabled checked />
                 <span>Sincronizar Agenda</span>
               </label>
               <label class="toggle-row">
                 <input type="checkbox" v-model="syncSettings.contacts" disabled checked />
                 <span>Sincronizar Contatos</span>
               </label>
             </div>
             <!-- Future: Disconnect button -->
             <!-- <button class="btn btn-outline-danger">Desconectar</button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { authService } from '../services/authService';

const user = ref(null);
const syncSettings = ref({
  calendar: false,
  contacts: false
});

const isGoogleConnected = computed(() => {
  return syncSettings.value.calendar || syncSettings.value.contacts;
});

const userInitials = computed(() => {
  if (!user.value || !user.value.name) return 'U';
  return user.value.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
});

onMounted(() => {
  const currentUser = authService.getCurrentUser();
  if (currentUser) {
    user.value = currentUser;
    // In a real app, we would fetch fresh profile data from backend to get sync status
    // For now assuming we might have it in token or need an endpoint
    // Assuming authService.getCurrentUser() returns what was stored from login/callback
    
    // Check if we have sync flags in user object (from login response or local storage)
    if (currentUser.calendarSyncEnabled) syncSettings.value.calendar = true;
    if (currentUser.contactsSyncEnabled) syncSettings.value.contacts = true;
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
</script>

<style scoped>
.profile-view {
  padding: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: var(--color-bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.avatar-circle {
  width: 64px;
  height: 64px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.details h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-main);
}

.details p {
  margin: 0;
  color: var(--color-text-muted);
}

.integrations-section h2 {
  font-size: 1.25rem;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-main);
}

.integration-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.integration-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.icon-google {
  width: 48px;
  height: 48px;
  background-color: #f1f1f1;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #4285F4;
}

.integration-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.integration-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.integration-status {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: var(--color-bg-body);
  color: var(--color-text-muted);
}

.integration-status.connected {
  background-color: #e6f4ea;
  color: #1e8e3e;
}

.integration-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-google {
  background-color: #4285F4;
  color: white;
  border: none;
  font-weight: 500;
}

.btn-google:hover {
  background-color: #3367d6;
}

.toggles {
  display: flex;
  gap: var(--spacing-lg);
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-main);
  cursor: default;
}

input[type="checkbox"] {
  accent-color: var(--color-primary);
  width: 1.2em;
  height: 1.2em;
}
</style>
