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
/* Global modal and form styles are imported in main.js */
</style>
