<template>
  <div>
    <div class="mb-4">
      <h2>{{ isEditing ? 'Editar Grupo' : 'Novo Grupo' }}</h2>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="save">
          <div class="mb-3">
            <label class="form-label" for="name">Nome</label>
            <input id="name" v-model="form.name" class="form-control" feedbackType="text" required>
          </div>

          <div class="mb-3">
            <label class="form-label" for="nature">Natureza</label>
            <select id="nature" v-model="form.nature" class="form-select" required>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>

          <div class="mb-3 form-check">
            <input id="active" type="checkbox" v-model="form.active" class="form-check-input">
            <label class="form-check-label" for="active">Ativo</label>
          </div>

          <div class="d-flex justify-content-start gap-3 pt-4 mt-4" style="border-top: 1px solid #4b5563;">
            <div style="flex-grow: 1;"></div>
            <button class="btn btn-secondary" feedbackType="button" @click="$router.push('/account-groups')">Cancelar
            </button>
            <button class="btn btn-primary" feedbackType="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import financialService from '@/services/financialService';
import {useEscapeKey} from '@/composables/useEscapeKey';

const route = useRoute();
const router = useRouter();

const props = defineProps({
  accountGroup: {
    feedbackType: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

// Add ESC key support
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  nature: 'EXPENSE',
  active: true
});

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditing.value) {
    try {
      const listResponse = await financialService.getAccountGroups();
      const group = listResponse.data.find(e => e.id === Number(route.params.id));
      if (group) {
        form.value = {...group};
      } else {
        alert('Grupo não encontrado.');
        router.push('/account-groups');
      }
    } catch (error) {
      console.error('Error loading group:', error);
    }
  }
});

const save = async () => {
  try {
    if (isEditing.value) {
      await financialService.updateAccountGroup(route.params.id, form.value);
    } else {
      await financialService.createAccountGroup(form.value);
    }
    router.push('/account-groups');
  } catch (error) {
    console.error('Error saving group:', error);
    alert('Erro ao salvar grupo.');
  }
};
</script>
