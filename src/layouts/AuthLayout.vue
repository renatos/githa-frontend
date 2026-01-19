<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="logo">Githa</h1>
        <p class="subtitle">Gestão Integrada de Terapias Holísticas & Agendamento</p>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-body);
  background-image: radial-gradient(#e0efff 1px, transparent 1px);
  background-size: 20px 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.logo {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0;
}
</style>
