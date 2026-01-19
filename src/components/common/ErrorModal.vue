<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="close">
      <div class="modal-container error-modal">
        <div class="modal-header">
          <div class="error-icon">⚠️</div>
          <h3>{{ title }}</h3>
          <button class="btn-close" @click="close">×</button>
        </div>
        
        <div class="modal-body">
          <p class="error-message">{{ message }}</p>
          <p v-if="details" class="error-details">{{ details }}</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-primary" @click="close">OK</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Erro'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(2px);
}

.modal-container {
  background: white;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.error-modal .modal-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-bottom: 1px solid #fee2e2;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
}

.error-icon {
  font-size: 2rem;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.modal-header h3 {
  flex: 1;
  margin: 0;
  color: #dc2626;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #94a3b8;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.modal-body {
  padding: var(--spacing-lg);
}

.error-message {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-main);
  font-size: 1rem;
  line-height: 1.5;
}

.error-details {
  margin: 0;
  padding: var(--spacing-sm);
  background: #f8fafc;
  border-left: 3px solid #ef4444;
  border-radius: var(--radius-sm);
  color: #64748b;
  font-size: 0.875rem;
  font-family: monospace;
}

.modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  background: #fafafa;
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}

.btn {
  padding: 0.5rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}
</style>
