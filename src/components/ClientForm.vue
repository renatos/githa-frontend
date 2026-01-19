<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ client.id ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required class="form-control" />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required class="form-control" />
          </div>
          
          <div class="form-group">
            <label>Telefone</label>
            <input v-model="form.phone" type="tel" class="form-control" />
          </div>

           <div class="form-group">
            <label>Data de Nascimento</label>
            <input v-model="form.dateOfBirth" type="date" class="form-control" />
          </div>
           
           <div class="form-group">
            <label>Endereço</label>
            <input v-model="form.address" type="text" class="form-control" />
          </div>
           
           <div class="form-group">
            <label>Indicado Por</label>
            <BaseLookup
              v-model="form.referredById"
              :search-service="clientService"
              placeholder="Selecione o cliente que indicou"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import BaseLookup from './common/BaseLookup.vue';
import { clientService } from '../services/clientService';

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  referredById: null,
});

onMounted(() => {
  if (props.client.id) {
    form.value = { ...props.client };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
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
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: var(--spacing-sm);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-text-main);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-main);
}

.form-control {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-main);
}

.btn-secondary:hover {
  background-color: var(--color-bg-body);
}
</style>
