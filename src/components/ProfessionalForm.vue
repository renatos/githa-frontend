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
            <input v-model="form.name" class="form-control" required type="text"/>
          </div>

          <div class="form-group">
            <label>Telefone</label>
            <input v-model="form.phone" class="form-control" type="tel"/>
          </div>

          <div class="form-group">
            <label>Comissão (%)</label>
            <input v-model="form.commissionRate" class="form-control" max="100" min="0" step="0.01"
                   type="number"/>
          </div>

          <div class="form-group check">
            <label>
              <input v-model="form.active" type="checkbox"/>
              Ativo
            </label>
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
import {professionalService} from '../services/professionalService';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';

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
    form.value = {...props.professional};
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
