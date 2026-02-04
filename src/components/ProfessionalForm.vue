<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ professional.id ? 'Editar Profissional' : 'Novo Profissional' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required class="form-control" />
          </div>
          
          <div class="form-group">
            <label>Telefone</label>
            <input v-model="form.phone" type="tel" class="form-control" />
          </div>

          <div class="form-group">
            <label>Comissão (%)</label>
            <input v-model="form.commissionRate" type="number" step="0.01" min="0" max="100" class="form-control" />
          </div>
          
           <div class="form-group check">
            <label>
              <input v-model="form.active" type="checkbox" />
              Ativo
            </label>
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
import { professionalService } from '../services/professionalService';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';

const props = defineProps({
  professional: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  phone: '',
  commissionRate: 0,
  active: true,
});

onMounted(() => {
  if (props.professional.id) {
    form.value = { ...props.professional };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
