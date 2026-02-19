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
            <input v-model="form.name" class="form-control" required type="text"/>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" class="form-control" required type="email"/>
          </div>

          <div class="form-group">
            <label>Senha (Opcional se usar Google)</label>
            <input v-model="form.password" class="form-control" type="password"/>
          </div>

          <div class="form-group check">
            <label>
              <input v-model="form.active" type="checkbox"/>
              Ativo
            </label>
          </div>

          <div class="form-group">
            <label>Perfis de Acesso</label>
            <div class="roles-group">
              <label>
                <input v-model="form.roles" type="checkbox" value="ADMIN"/> Admin
              </label>
              <label>
                <input v-model="form.roles" type="checkbox" value="PROFESSIONAL"/> Profissional
              </label>
              <label>
                <input v-model="form.roles" type="checkbox" value="USER"/> Usuário
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
          <button class="btn btn-primary" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted} from 'vue';
import {useEscapeKey} from '../composables/useEscapeKey';

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  email: '',
  password: '',
  active: true,
  roles: []
});

onMounted(() => {
  if (props.user.id) {
    form.value = {...props.user, password: ''}; // Don't show hash
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
