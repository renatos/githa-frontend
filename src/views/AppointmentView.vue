<template>
  <div class="appointment-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <AppointmentList 
      ref="listRef"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteItem"
    />
    
    <AppointmentForm 
      v-if="showForm" 
      :appointment="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppointmentList from '../components/AppointmentList.vue';
import AppointmentForm from '../components/AppointmentForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { appointmentService } from '../services/appointmentService';

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
      await appointmentService.update(data.id, data);
      if (data.status === 'COMPLETED') {
        showAlert('success', 'Agendamento concluído e lançamento financeiro gerado!');
      } else {
        showAlert('success', 'Agendamento atualizado com sucesso!');
      }
    } else {
      await appointmentService.create(data);
      if (data.status === 'COMPLETED') {
        showAlert('success', 'Agendamento criado e lançamento financeiro gerado!');
      } else {
        showAlert('success', 'Agendamento criado com sucesso!');
      }
    }
    listRef.value?.refresh();
    closeForm();
  } catch (error) {
    console.error('Error saving appointment:', error);
    showAlert('error', 'Erro ao salvar agendamento.');
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    try {
      await appointmentService.delete(id);
      showAlert('success', 'Agendamento excluído com sucesso!');
      listRef.value?.refresh();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      showAlert('error', 'Erro ao excluir agendamento.');
    }
  }
};
</script>
