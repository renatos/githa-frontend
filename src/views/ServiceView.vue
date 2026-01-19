<template>
  <div class="service-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <ServiceList 
      ref="listRef"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteItem"
    />
    
    <ServiceForm 
      v-if="showForm" 
      :service="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ServiceList from '../components/ServiceList.vue';
import ServiceForm from '../components/ServiceForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { serviceService } from '../services/serviceService';

const listRef = ref(null);
const showForm = ref(false);
const editingItem = ref({});
const alert = ref({ type: 'info', message: '' });

const showAlert = (type, message) => {
  alert.value = { type, message };
  setTimeout(() => alert.value.message = '', 3000);
};

const openForm = (item = {}) => {
  editingItem.value = { ...item };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = {};
};

const saveItem = async (data) => {
  try {
    if (data.id) {
      await serviceService.update(data.id, data);
      showAlert('success', 'Serviço atualizado com sucesso!');
    } else {
      await serviceService.create(data);
      showAlert('success', 'Serviço criado com sucesso!');
    }
    listRef.value?.refresh();
    closeForm();
  } catch (error) {
    console.error('Error saving service:', error);
    showAlert('error', 'Erro ao salvar serviço.');
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir este serviço?')) {
    try {
      await serviceService.delete(id);
      showAlert('success', 'Serviço excluído com sucesso!');
      listRef.value?.refresh();
    } catch (error) {
      console.error('Error deleting service:', error);
      showAlert('error', 'Erro ao excluir serviço.');
    }
  }
};
</script>
