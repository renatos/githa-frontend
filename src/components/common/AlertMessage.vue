<template>
  <div v-if="message" :class="['alert', `alert-${type}`]" role="alert">
    <div class="alert-content">
      <span class="icon">{{ icon }}</span>
      <span class="message">{{ message }}</span>
    </div>
    <button v-if="dismissible" @click="$emit('dismiss')" class="close-btn">×</button>
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';

const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  message: {
    type: String,
    required: true,
  },
  dismissible: {
    type: Boolean,
    default: true,
  }
});

const icon = computed(() => {
  switch (props.type) {
    case 'success': return '✓';
    case 'error': return '⚠';
    case 'warning': return '!';
    case 'info': return 'ℹ';
    default: return 'ℹ';
  }
});
</script>

<style scoped>
.alert {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.icon {
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.5;
}

.close-btn:hover {
  opacity: 1;
}

.alert-success {
  background-color: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}

.alert-error {
  background-color: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.alert-warning {
  background-color: #fef9c3;
  border-color: #fde047;
  color: #854d0e;
}

.alert-info {
  background-color: #e0f2fe;
  border-color: #bae6fd;
  color: #075985;
}

@keyframes slideIn {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
