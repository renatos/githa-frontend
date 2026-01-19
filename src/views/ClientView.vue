<template>
  <div class="client-view">
    <ClientList
      ref="clientList"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteClient"
    />

    <ClientForm
      v-if="showForm"
      :client="editingClient"
      @close="closeForm"
      @save="saveClient"
    />

    <ErrorModal
      :show="errorState.show"
      :title="errorState.title"
      :message="errorState.message"
      :details="errorState.details"
      @close="closeError"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ClientList from '../components/ClientList.vue';
import ClientForm from '../components/ClientForm.vue';
import ErrorModal from '../components/common/ErrorModal.vue';
import { clientService } from '../services/clientService';
import { useErrorHandler } from '../composables/useErrorHandler';

const route = useRoute();
const router = useRouter();
const clientList = ref(null);
const showForm = ref(false);
const editingClient = ref({});
const { errorState, showError, closeError } = useErrorHandler();

const openForm = (client = {}) => {
  editingClient.value = { ...client };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingClient.value = {};
  // If we were on a detail route, go back to list
  if (route.name === 'client-detail') {
    router.push({ name: 'clients' });
  }
};

const loadClientFromRoute = async () => {
  const id = route.params.id;
  if (id) {
    try {
      const response = await clientService.getById(id);
      openForm(response.data);
    } catch (error) {
      console.error('Error loading client:', error);
      showError(error, 'Erro ao carregar cliente');
      router.push({ name: 'clients' });
    }
  } else {
    showForm.value = false;
  }
};

onMounted(() => {
  loadClientFromRoute();
});

watch(() => route.params.id, () => {
  loadClientFromRoute();
});

const saveClient = async (clientData) => {
  try {
    if (clientData.id) {
      await clientService.update(clientData.id, clientData);
    } else {
      await clientService.create(clientData);
    }
    clientList.value?.refresh();
    closeForm();
  } catch (error) {
    console.error('Error saving client:', error);
    showError(error, 'Erro ao Salvar Cliente');
  }
};

const deleteClient = async (id) => {
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    try {
      await clientService.delete(id);
      clientList.value?.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
      showError(error, 'Erro ao Excluir Cliente');
    }
  }
};
</script>
