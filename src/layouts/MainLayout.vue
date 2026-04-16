<template>
  <div class="font-sans text-gray-800 dark:text-gray-200 h-screen flex overflow-hidden" style="background-color: var(--color-bg-body); font-family: 'Inter', sans-serif;">
    <!-- Mobile Header / Hamburger -->
    <div class="md:hidden flex items-center px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 w-full z-[900] h-[60px]">
      <button class="text-gray-600 dark:text-gray-300 text-2xl p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="toggleSidebar">
        <i class="fa-solid fa-bars"></i>
      </button>
      <img src="@/assets/githa-logo-main.png" alt="Githa" class="ml-4 h-10 w-auto object-contain dark:invert" />
    </div>

    <!-- Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 bg-black/50 z-[950] md:hidden"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside 
      aria-label="Sidebar" 
      class="w-[260px] bg-white dark:bg-gray-800 flex-shrink-0 flex flex-col h-full border-r border-gray-200 dark:border-gray-700 z-[1000] shadow-sm fixed md:relative transition-transform duration-300"
      :class="{ '-translate-x-full md:translate-x-0': !isSidebarOpen, 'translate-x-0': isSidebarOpen }"
    >
      <!-- Logo Section (Fixed Top) -->
      <div class="p-6 flex-shrink-0 flex justify-center items-center border-b border-gray-100 dark:border-gray-700">
        <img src="@/assets/githa-logo-main.png" alt="Githa" class="max-w-full h-auto max-h-[80px] object-contain dark:invert" />
        <button class="md:hidden absolute right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl" @click="closeSidebar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Navigation Menu (Scrollable Body) -->
      <nav class="flex-1 px-3 space-y-1 py-4 overflow-y-auto no-scrollbar">
        <router-link to="/appointments" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-regular fa-calendar w-6 text-lg"></i>
          <span class="ml-2">Agenda</span>
        </router-link>
        <router-link to="/ai-insights" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-globe w-6 text-lg"></i>
          <span class="ml-2">Central Githa AI</span>
        </router-link>
        <router-link to="/clients" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-regular fa-user w-6 text-lg"></i>
          <span class="ml-2">Clientes</span>
        </router-link>
        <router-link to="/strategic-clients" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-user-group w-6 text-lg"></i>
          <span class="ml-2">Clientes Estratégicos</span>
        </router-link>
        <router-link to="/professionals?view=commissions" class="nav-link" :class="{ 'nav-link-active': isCommissionsActive }" active-class="" @click="closeSidebar">
          <i class="fa-solid fa-hand-holding-dollar w-6 text-lg"></i>
          <span class="ml-2">Comissões</span>
        </router-link>
        <router-link to="/" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-table-columns w-6 text-lg"></i>
          <span class="ml-2">Dashboard</span>
        </router-link>
        <router-link to="/feedbacks" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-regular fa-comment-dots w-6 text-lg"></i>
          <span class="ml-2">Feedbacks e Suporte</span>
        </router-link>
        <router-link to="/goals" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-bullseye w-6 text-lg"></i>
          <span class="ml-2">Metas</span>
        </router-link>
        <router-link to="/financials" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-sack-dollar w-6 text-lg"></i>
          <span class="ml-2">Financeiro</span>
        </router-link>
        <router-link to="/payment-methods" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-regular fa-credit-card w-6 text-lg"></i>
          <span class="ml-2">Formas de Pagamento</span>
        </router-link>
        <router-link to="/account-groups" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-users-line w-6 text-lg"></i>
          <span class="ml-2">Grupos de Contas</span>
        </router-link>
        <router-link to="/profile" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-id-badge w-6 text-lg"></i>
          <span class="ml-2">Meu Perfil</span>
        </router-link>
        <router-link v-if="isAdmin" to="/admin/parameters" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-gear w-6 text-lg"></i>
          <span class="ml-2">Parametrização</span>
        </router-link>
        <router-link to="/services" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-list-ul w-6 text-lg"></i>
          <span class="ml-2">Procedimentos</span>
        </router-link>
        <router-link to="/products" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-bag-shopping w-6 text-lg"></i>
          <span class="ml-2">Produtos</span>
        </router-link>
        <router-link to="/professionals" class="nav-link" :class="{ 'nav-link-active': isProfessionalsActive }" active-class="" @click="closeSidebar">
          <i class="fa-regular fa-user w-6 text-lg"></i>
          <span class="ml-2">Profissionais</span>
        </router-link>
        <router-link to="/users" class="nav-link" active-class="nav-link-active" @click="closeSidebar">
          <i class="fa-solid fa-user-gear w-6 text-lg"></i>
          <span class="ml-2">Usuários</span>
        </router-link>
      </nav>

      <!-- Bottom Sidebar Section (Fixed Bottom) -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
        <div class="flex items-center mb-4">
          <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3 text-gray-600 dark:text-gray-400">
            <i class="fa-regular fa-user"></i>
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate w-32">{{ userEmail }}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <!-- Theme Toggle -->
          <button class="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" :title="isDark ? 'Tema Claro' : 'Tema Escuro'" @click="toggleTheme">
            <i :class="isDark ? 'fa-solid fa-sun text-yellow-400' : 'fa-solid fa-moon text-indigo-400'" class="text-lg"></i>
          </button>
          <!-- Logout -->
          <button class="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors" title="Sair" @click="handleLogout">
            <i class="fa-solid fa-right-from-bracket text-[20px]"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 h-full overflow-y-auto no-scrollbar md:ml-0 mt-[60px] md:mt-0 pb-[120px] md:pb-0" style="background-color: var(--color-bg-body)">
      <div class="max-w-[1200px] mx-auto">
        <slot></slot>
      </div>
    </main>

    <!-- Global AI Chat Assistant -->
    <FloatingAIChat />

    <!-- Mobile Bottom Navigation -->
    <BottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from '../composables/useTheme';
import { authService } from '../services/authService';
import FloatingAIChat from '../components/common/FloatingAIChat.vue';
import BottomNav from '../components/common/BottomNav.vue';

const router = useRouter();
const route = useRoute();
const { isDark, toggleTheme } = useTheme();
const userEmail = ref('');
const isAdmin = ref(false);
const isSidebarOpen = ref(false);

const isProfessionalsActive = computed(() => {
  return route.path === '/professionals' && !route.query.view;
});

const isCommissionsActive = computed(() => {
  return (route.path === '/professionals' && route.query.view === 'commissions') || 
         route.path.match(/^\/professionals\/.*\/commissions/);
});

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
    isAdmin.value = user.roles && user.roles.includes('ADMIN');
  }
});
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Nav link base styles */
.nav-link {
  @apply flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors no-underline;
}

.nav-link i {
  @apply text-gray-500 dark:text-gray-500;
}

.nav-link:hover i {
  @apply text-gray-700 dark:text-gray-300;
}

/* Active nav link */
.nav-link-active {
  @apply bg-[#484cb0] text-white shadow-md !important;
}

.nav-link-active i {
  @apply text-white !important;
}
</style>

<style>
[data-theme="dark"] .dark\:invert {
  filter: brightness(0) invert(1);
}
</style>
