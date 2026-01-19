<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">Githa</h1>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="active">
          Dashboard
        </router-link>
        <router-link to="/clients" class="nav-item" active-class="active">
          Clientes
        </router-link>
        <router-link to="/professionals" class="nav-item" active-class="active">
          Profissionais
        </router-link>
        <router-link to="/services" class="nav-item" active-class="active">
          Serviços
        </router-link>
        <router-link to="/appointments" class="nav-item">Agenda</router-link>
        <router-link to="/clients" class="nav-item">Clientes</router-link>
        <router-link to="/strategic-clients" class="nav-item">Clientes Estratégicos</router-link>
        <router-link to="/admin/parameters" class="nav-item" v-if="isAdmin">Configurações</router-link>
        <router-link to="/users" class="nav-item" active-class="active">
          Usuários
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          Meu Perfil
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <span>{{ userEmail }}</span>
        </div>
        <div class="footer-actions">
          <button @click="toggleTheme" class="btn-icon" :title="isDark ? 'Tema Claro' : 'Tema Escuro'">
            {{ isDark ? '🌞' : '🌙' }}
          </button>
          <button @click="handleLogout" class="btn-icon" title="Sair">
            🚪
          </button>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <div class="content-wrapper">
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { authService } from '../services/authService';

const router = useRouter();
const { isDark, toggleTheme } = useTheme();
const userEmail = ref('');
const isAdmin = ref(false);

const handleLogout = () => {
  authService.logout();
};

onMounted(() => {
  const user = authService.getCurrentUser();
  if (user) {
    userEmail.value = user.email || user.sub; 
    // Check role - assuming authService stores roles or we decode token
    // For MVP/Simplicity if email is admin@githa.com make it admin
    // Or check authService.hasRole('ADMIN') if implemented
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
  }
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md) 0;
  overflow-y: auto;
}

.nav-item {
  display: block;
  padding: var(--spacing-sm) var(--spacing-lg);
  color: var(--color-text-main);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: var(--color-bg-body);
  color: var(--color-primary);
}

.nav-item.active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  font-weight: 600;
  color: var(--color-text-muted);
}

.footer-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
}

.main-content {
  flex: 1;
  margin-left: 250px; /* Sidebar width */
  background-color: var(--color-bg-body);
  width: calc(100% - 250px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}
</style>
