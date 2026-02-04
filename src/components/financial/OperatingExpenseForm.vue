<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ isEditing ? 'Editar Despesa' : 'Nova Despesa' }}</h2>
      <button class="btn btn-secondary" @click="$router.push('/operating-expenses')">
        <i class="bi bi-arrow-left"></i> Voltar
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="save">
          <div class="mb-3">
            <label for="name" class="form-label">Nome</label>
            <input type="text" class="form-control" id="name" v-model="form.name" required>
          </div>

          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="active" v-model="form.active">
            <label class="form-check-label" for="active">Ativo</label>
          </div>

          <button type="submit" class="btn btn-primary">Salvar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import financialService from '@/services/financialService';
import { useEscapeKey } from '@/composables/useEscapeKey';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  expense: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

// Add ESC key support
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  active: true
});

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await financialService.getOperatingExpenses(); 
      // Optimized: Ideally we should have a getById method or filter from list if getById is not strictly necessary for this simple entity
      // For now, let's fetch list and find, or assume we might need a getById endpoint if not available.
      // Based on previous code, getAccounts returned list. Let's assume we can fetch all or need to implement getById in frontend service if backend supports it.
      // Backend controller has getById? Yes: findById(id). Frontend service?
      // Let's check frontend service again.
      // Actually, let's just use what we have in financialService.js.
      // It has updateOperatingExpense(id, data), createOperatingExpense(data).
      // It assumes getOperatingExpenses(params) returns a list.
      // We might need to add getOperatingExpense(id) to service if we want to fetch single.
      // Backend OperatingExpenseController has findById?
      // Yes: public Response update(@PathParam("id") Long id, OperatingExpenseDTO dto) {...}
      // Wait, does it have GET /{id}? 
      // Checking OperatingExpenseGateway: findById(Long id) returns Optional.
      // Checking Controller: 
      // @GET public List<OperatingExpenseDTO> listAll() ...
      // It seems there is NO @GET /{id} endpoint in the controller visible in the snippet I saw earlier! 
      // I saw create, update, delete, listAll. I did NOT see a specific GET method for ID.
      // I should add it to the backend controller if it's missing, or just filter from list if the list is small (which it likely is).
      // Given the list size (manual insert = 14 items), filtering is fine for now. 
      
      const listResponse = await financialService.getOperatingExpenses();
      const expense = listResponse.data.find(e => e.id === Number(route.params.id));
      if (expense) {
        form.value = { ...expense };
      } else {
        alert('Despesa não encontrada.');
        router.push('/operating-expenses');
      }
    } catch (error) {
      console.error('Error loading expense:', error);
    }
  }
});

const save = async () => {
  try {
    if (isEditing.value) {
      await financialService.updateOperatingExpense(route.params.id, form.value);
    } else {
      await financialService.createOperatingExpense(form.value);
    }
    router.push('/operating-expenses');
  } catch (error) {
    console.error('Error saving expense:', error);
    alert('Erro ao salvar despesa.');
  }
};
</script>
