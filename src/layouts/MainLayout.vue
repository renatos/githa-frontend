<template>
  <div class="app-layout">
    <!-- Mobile Header / Hamburger -->
    <div class="mobile-header">
      <button @click="toggleSidebar" class="btn-icon hamburger">
        ☰
      </button>
      <img src="@/assets/githa-logo-main.png" alt="Githa" class="mobile-logo-img" />
    </div>

    <!-- Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-backdrop"
      @click="closeSidebar"
    ></div>

    <aside class="sidebar" :class="{ 'open': isSidebarOpen }">
      <div class="sidebar-header">
        <img src="@/assets/githa-logo-main.png" alt="Githa" class="sidebar-logo-img" />
        <button class="btn-icon close-sidebar" @click="closeSidebar">×</button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" active-class="active" @click="closeSidebar">
          Dashboard
        </router-link>
        <router-link to="/clients" class="nav-item" active-class="active" @click="closeSidebar">
          Clientes
        </router-link>
        <router-link to="/professionals" class="nav-item" active-class="active" @click="closeSidebar">
          Profissionais
        </router-link>
        <router-link to="/services" class="nav-item" active-class="active" @click="closeSidebar">
          Serviços
        </router-link>
        <router-link to="/appointments" class="nav-item" @click="closeSidebar">Agenda</router-link>
        <router-link to="/strategic-clients" class="nav-item" @click="closeSidebar">Clientes Estratégicos</router-link>
        <router-link to="/admin/parameters" class="nav-item" v-if="isAdmin" @click="closeSidebar">Parametrização</router-link>
        <router-link to="/users" class="nav-item" active-class="active" @click="closeSidebar">
          Usuários
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active" @click="closeSidebar">
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
const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleLogout = () => {
  authService.logout();
};

onMounted(() => {
  const user = authService.getCurrentUser();
  if (user) {
    userEmail.value = user.email || user.sub; 
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
  }
});
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.mobile-header {
  display: none;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 900;
  height: 60px;
}

.mobile-logo-img {
  margin-left: 1rem;
  height: 40px;
  width: auto;
  object-fit: contain;
}

.sidebar {
  width: 250px;
  background-color: var(--color-bg-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-sidebar {
  display: none; /* Hidden on desktop */
  position: absolute;
  right: 15px;
}

.sidebar-logo-img {
  max-width: 100%;
  height: auto;
  max-height: 80px;
  object-fit: contain;
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
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
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
  color: var(--color-text-main);
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
}

.main-content {
  flex: 1;
  margin-left: 250px;
  background-color: var(--color-bg-body);
  width: calc(100% - 250px);
  transition: margin-left 0.3s ease;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 950;
  display: none;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .mobile-header {
    display: flex;
  }

  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    margin-top: 60px; /* Space for mobile header */
  }

  .sidebar-backdrop {
    display: block;
  }

  .close-sidebar {
    display: block;
  }
}

</style>

<style>
[data-theme="dark"] .mobile-logo-img,
[data-theme="dark"] .sidebar-logo-img {
  filter: brightness(0) invert(1);
}
</style>
