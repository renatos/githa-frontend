<template>
  <div class="professional-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <ProfessionalList 
      ref="listRef"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteItem"
    />
    
    <ProfessionalForm 
      v-if="showForm" 
      :professional="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProfessionalList from '../components/ProfessionalList.vue';
import ProfessionalForm from '../components/ProfessionalForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { professionalService } from '../services/professionalService';

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
      await professionalService.update(data.id, data);
      showAlert('success', 'Profissional atualizado com sucesso!');
    } else {
      await professionalService.create(data);
      showAlert('success', 'Profissional criado com sucesso!');
    }
    listRef.value?.refresh();
    closeForm();
  } catch (error) {
    console.error('Error saving professional:', error);
    showAlert('error', 'Erro ao salvar profissional.');
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir este profissional?')) {
    try {
      await professionalService.delete(id);
      showAlert('success', 'Profissional excluído com sucesso!');
      listRef.value?.refresh();
    } catch (error) {
      console.error('Error deleting professional:', error);
      showAlert('error', 'Erro ao excluir profissional.');
    }
  }
};
</script>
