<template>
  <div>
    <div class="mb-4">
      <h2>{{ isEditing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento' }}</h2>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="save">
          <div class="mb-3">
            <label for="name" class="form-label">Nome</label>
            <input type="text" class="form-control" id="name" v-model="form.name" required>
          </div>

          <div class="mb-3">
            <label for="discountPercentage" class="form-label">Desconto (%)</label>
            <input type="number" class="form-control" id="discountPercentage" v-model="form.discountPercentage" step="0.01" min="0" max="100">
          </div>

          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="active" v-model="form.active">
            <label class="form-check-label" for="active">Ativo</label>
          </div>

          <div class="d-flex justify-content-end gap-3 pt-4 mt-4" style="border-top: 1px solid #4b5563;">
            <button type="button" class="btn btn-secondary" @click="$router.push('/payment-methods')">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import paymentMethodService from '@/services/paymentMethodService';
import { useEscapeKey } from '@/composables/useEscapeKey';

const route = useRoute();
const router = useRouter();

const emit = defineEmits(['close']);

useEscapeKey(() => router.push('/payment-methods'));

const form = ref({
  name: '',
  code: '',
  discountPercentage: 0,
  active: true
});

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await paymentMethodService.getById(route.params.id);
      form.value = response.data;
    } catch (error) {
      console.error('Error loading payment method:', error);
      alert('Forma de Pagamento não encontrada.');
      router.push('/payment-methods');
    }
  }
});

const save = async () => {
  try {
    if (isEditing.value) {
      await paymentMethodService.update(route.params.id, form.value);
    } else {
      await paymentMethodService.create(form.value);
    }
    router.push('/payment-methods');
  } catch (error) {
    console.error('Error saving payment method:', error);
    // Error handling could be better (displaying toast or message from backend)
    // Assuming interceptor handles 400/500 errors with toasts?
    // Check api.js: yes, errorHandler handles it.
  }
};
</script>

<style scoped>
/* Scoped styles if needed, mostly using global classes */
</style>
