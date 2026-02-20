<template>
  <div class="dashboard-card" :class="{ 'is-loading': loading, 'has-error': error }">
    <div class="card-header">
      <div class="header-title">
        <span v-if="icon" class="card-icon">{{ icon }}</span>
        <h3>{{ title }}</h3>
      </div>
      <div class="header-actions">
        <!-- Optional action buttons passed via slots -->
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="card-body">
      <!-- Loading State -->
      <div v-if="loading" class="card-loading">
        <span class="spinner"></span>
        <p>Carregando...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card-error">
        <p class="error-message">⚠️ {{ errorMessage }}</p>
        <button v-if="showRetry" @click="$emit('retry')" class="btn btn-secondary btn-sm retry-btn">
          Tentar Novamente
        </button>
      </div>

      <!-- Main Content slot -->
      <div v-else class="card-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: 'Erro ao carregar dados.'
  },
  showRetry: {
    type: Boolean,
    default: true
  }
});

defineEmits(['retry']);
</script>

<style scoped>
.dashboard-card {
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
  border-color: var(--color-primary-soft);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-body);
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-main);
}

.card-icon {
  font-size: 1.2rem;
}

.card-body {
  padding: var(--spacing-lg);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* Loading State */
.card-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 150px;
  color: var(--color-text-muted);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-sm);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error State */
.card-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  min-height: 150px;
  background-color: var(--color-status-risk-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.error-message {
  color: var(--color-status-risk-text);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
}

.retry-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.85rem;
}

/* Content */
.card-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Focus on Premium Design Rules */
.dashboard-card {
  position: relative;
}

/* Subtle gradient top bar for premium feel */
.dashboard-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary-soft));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dashboard-card:hover::before {
  opacity: 1;
}
</style>
