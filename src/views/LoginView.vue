<template>
  <div class="login-view">
    <AlertMessage 
      v-if="error" 
      type="error" 
      :message="error" 
      @dismiss="error = ''" 
      class="mb-4"
    />
    
    <GoogleLoginButton />
    
    <div class="divider">
      <span>ou</span>
    </div>

    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email</label>
        <input 
          v-model="email" 
          type="email" 
          required 
          class="form-control" 
          placeholder="seu@email.com"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label>Senha</label>
        <input 
          v-model="password" 
          type="password" 
          required 
          class="form-control" 
          placeholder="••••••"
          :disabled="loading"
        />
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../services/authService';
import AlertMessage from '../components/common/AlertMessage.vue';

import GoogleLoginButton from '../components/common/GoogleLoginButton.vue';


const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await authService.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    if (err.response && err.response.status === 401) {
      error.value = 'Credenciais inválidas. Verifique seu email e senha.';
    } else {
      error.value = 'Erro ao realizar login. Tente novamente mais tarde.';
      console.error(err);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--color-text-main);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box; /* Fix width overflow */
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.w-100 {
  width: 100%;
}

.mb-4 {
  margin-bottom: var(--spacing-lg);
}
</style>
