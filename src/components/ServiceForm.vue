<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ service.id ? 'Editar Procedimento' : 'Novo Procedimento' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label>Nome</label>
            <input v-model="form.name" type="text" required class="form-control" />
          </div>

          <div class="form-group">
            <label>Grupo</label>
            <select v-model="form.group" class="form-control" required>
              <option value="Serviços básicos">Serviços básicos</option>
              <option value="Estética Facial">Estética Facial</option>
              <option value="Consulta">Consulta</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Descrição</label>
            <textarea v-model="form.description" class="form-control" rows="3"></textarea>
          </div>

          <div class="row">
            <div class="form-group col">
                <label>Duração (minutos)</label>
                <input v-model="form.durationMinutes" type="number" required min="1" class="form-control" />
            </div>
             <div class="form-group col">
                <label>Preço</label>
                <CurrencyInput v-model="form.price" required />
            </div>
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
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';
import { serviceService } from '../services/serviceService';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';
import CurrencyInput from './common/CurrencyInput.vue';

const props = defineProps({
  service: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
  active: true,
  group: 'Serviços básicos', // Default
});

onMounted(() => {
  if (props.service.id) {
    form.value = { ...props.service };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
