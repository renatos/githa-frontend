<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ user.id ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
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
            <label>Senha (Opcional se usar Google)</label>
            <input v-model="form.password" type="password" class="form-control" />
          </div>
          
          <div class="form-group check">
            <label>
              <input v-model="form.active" type="checkbox" />
              Ativo
            </label>
          </div>

          <div class="form-group">
            <label>Perfis de Acesso</label>
            <div class="roles-group">
               <label>
                 <input type="checkbox" value="ADMIN" v-model="form.roles" /> Admin
               </label>
               <label>
                 <input type="checkbox" value="PROFESSIONAL" v-model="form.roles" /> Profissional
               </label>
               <label>
                 <input type="checkbox" value="USER" v-model="form.roles" /> Usuário
               </label>
            </div>
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

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  name: '',
  email: '',
  password: '',
  active: true,
  roles: []
});

onMounted(() => {
  if (props.user.id) {
    form.value = { ...props.user, password: '' }; // Don't show hash
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
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  width: 100%;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.modal-header h3 {
  margin: 0;
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

.form-group.check {
  flex-direction: row;
  align-items: center;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-main);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-control {
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid #cbd5e1;
  color: var(--color-text-main);
}
</style>
