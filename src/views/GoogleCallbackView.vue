<template>
  <div class="google-callback-view">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <h2>Conectando sua conta Google...</h2>
      <p>Por favor, aguarde enquanto processamos sua autorização.</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">✖</div>
      <h2>Erro na Conexão</h2>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="goHome">Voltar ao Início</button>
    </div>

    <div v-else class="success-state">
      <div class="success-icon">✓</div>
      <h2>Conta Google Conectada!</h2>
      <p>Suas configurações de sincronização:</p>
      <ul>
        <li v-if="calendarSyncEnabled">✓ Google Calendar ativado</li>
        <li v-if="contactsSyncEnabled">✓ Google Contacts ativado</li>
      </ul>
      <p>Redirecionando...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const route = useRoute();

const loading = ref(true);
const error = ref('');
const calendarSyncEnabled = ref(false);
const contactsSyncEnabled = ref(false);

onMounted(async () => {
  const code = route.query.code;
  
  if (!code) {
    error.value = 'Código de autorização não encontrado.';
    loading.value = false;
    return;
  }

  try {
    const response = await api.get('/auth/google/callback', {
      params: {
        code: code,
        state: route.query.state
      }
    });

    // If token is present, this is a login flow - save credentials
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Create user object with available data
      const user = {
        email: response.data.email,
        calendarSyncEnabled: response.data.calendarSyncEnabled || false,
        contactsSyncEnabled: response.data.contactsSyncEnabled || false
      };
      
      localStorage.setItem('user', JSON.stringify(user));
    }

    calendarSyncEnabled.value = response.data.calendarSyncEnabled || false;
    contactsSyncEnabled.value = response.data.contactsSyncEnabled || false;
    
    loading.value = false;

    // Redirect to home after 2 seconds
    setTimeout(() => {
      router.push('/');
    }, 2000);

  } catch (err) {
    loading.value = false;
    if (err.response && err.response.data && err.response.data.error) {
      error.value = err.response.data.error;
    } else {
      error.value = 'Falha ao processar autorização do Google.';
    }
    console.error('OAuth callback error:', err);
  }
});

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.google-callback-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.loading-state,
.error-state,
.success-state {
  text-align: center;
  max-width: 500px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary, #3498db);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-icon {
  color: #e74c3c;
}

.success-icon {
  color: #27ae60;
}

h2 {
  margin-bottom: 1rem;
  color: var(--color-text-main, #333);
}

p {
  color: var(--color-text-secondary, #666);
  margin-bottom: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
}

ul li {
  padding: 0.5rem;
  font-size: 1.1rem;
  color: var(--color-text-main, #333);
}

.btn {
  margin-top: 1rem;
}
</style>
