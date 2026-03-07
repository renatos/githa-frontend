<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" active-class="active" exact>
      <Home :size="20" />
      <span>Home</span>
    </router-link>
    <router-link to="/appointments" class="nav-item" active-class="active">
      <Calendar :size="20" />
      <span>Agenda</span>
    </router-link>
    <router-link to="/clients" class="nav-item" active-class="active">
      <User :size="20" />
      <span>Clientes</span>
    </router-link>
    <router-link to="/financials" class="nav-item" active-class="active" :class="{ 'active': $route.path.startsWith('/financials') || $route.path.startsWith('/accounts') || $route.path.startsWith('/payment-methods') || $route.path.startsWith('/account-groups') }">
      <Wallet :size="20" />
      <span>Financeiro</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { Home, Calendar, User, Wallet } from 'lucide-vue-next';

const $route = useRoute();
</script>

<style scoped>
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: 0.75rem;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.nav-item i {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.nav-item.active {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>
