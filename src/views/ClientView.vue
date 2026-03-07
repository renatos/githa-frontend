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
import { enumService } from '../services/enumService';
import { toastBridge } from '../services/toastBridge';
import { confirmBridge } from '../services/confirmBridge';
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

const deleteClient = (id) => {
  confirmBridge.confirm({
    title: 'Excluir Cliente',
    message: 'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await clientService.delete(id);
        toastBridge.getToast().add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cliente excluído com sucesso!',
          life: 3000
        });
        clientList.value?.refresh(); // Refresh the list after deletion
        // If the deleted client was the one being edited, close the form
        if (editingClient.value.id === id) {
          closeForm();
        }
      } catch (err) {
        console.error('Error deleting client:', err);
        toastBridge.getToast().add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir o cliente.',
          life: 3000
        });
        showError(err, 'Erro ao Excluir Cliente'); // Also show error in modal
      }
    }
  });
};
</script>
