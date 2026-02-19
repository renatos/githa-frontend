<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ paymentMethod.id ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label for="name">Nome</label>
            <input id="name" v-model="form.name" class="form-control" type="text" required />
          </div>

          <div class="form-group">
            <label for="discountPercentage">Desconto (%)</label>
            <input
              id="discountPercentage"
              v-model="form.discountPercentage"
              class="form-control"
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          <div class="form-check">
            <input id="active" v-model="form.active" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="active">Ativo</label>
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
import { ref, onMounted } from 'vue';
import paymentMethodService from '@/services/paymentMethodService';
import { useEscapeKey } from '@/composables/useEscapeKey';

const props = defineProps({
  paymentMethod: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  code: '',
  discountPercentage: 0,
  active: true
});

onMounted(() => {
  if (props.paymentMethod.id) {
    form.value = { ...props.paymentMethod };
  }
});

const save = async () => {
  try {
    if (props.paymentMethod.id) {
      await paymentMethodService.update(props.paymentMethod.id, form.value);
    } else {
      await paymentMethodService.create(form.value);
    }
    emit('save');
  } catch (error) {
    console.error('Error saving payment method:', error);
  }
};
</script>
