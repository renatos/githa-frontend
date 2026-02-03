<template>
  <div class="auth-layout">
    <div class="auth-card">
      <div class="auth-header">
        <!-- <h1 class="logo">Githa</h1> -->
        <img src="@/assets/githa-logo-login.png" alt="Githa Logo" class="logo-img" />
        <p class="subtitle">Gestão Integrada</p>
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

.logo-img {
  max-width: 250px;
  width: 100%;
  height: auto;
  margin-bottom: var(--spacing-sm);
  object-fit: contain;
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  margin: 0;
}
</style>

<style>
[data-theme="dark"] .logo-img {
  filter: brightness(0) invert(1);
}
</style>
