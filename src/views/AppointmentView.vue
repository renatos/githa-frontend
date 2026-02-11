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
      @confirm="confirmItem"
      @complete="completeItem"
      @cancel="openCancellationModal"
      @add-procedure="openAddProcedureForm"
    />
    
    <AppointmentForm 
      v-if="showForm" 
      :appointment="editingItem"
      @close="closeForm"
      @save="saveAppointment"
    />

    <AppointmentCancellationModal
        v-if="showCancellationModal"
        :appointment="cancelingItem"
        @close="closeCancellationModal"
        @save="cancelItem"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppointmentList from '../components/AppointmentList.vue';
import AppointmentForm from '../components/AppointmentForm.vue';
import AppointmentCancellationModal from '../components/AppointmentCancellationModal.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { appointmentService } from '../services/appointmentService';
import { useCrudView } from '../composables/useCrudView';

const {
  listRef, showForm, editingItem, alert,
  showAlert, openForm, closeForm, refreshList, deleteItem,
} = useCrudView(appointmentService, { singular: 'Agendamento', plural: 'Agendamentos' });

// --- Cancellation modal ---
const showCancellationModal = ref(false);
const cancelingItem = ref({});

const openCancellationModal = (item) => {
  cancelingItem.value = { ...item };
  showCancellationModal.value = true;
};

const closeCancellationModal = () => {
  showCancellationModal.value = false;
  cancelingItem.value = {};
};

// --- Status updates ---
const updateStatus = async (item, status, successMessage) => {
  try {
    const updated = { ...item, status };
    await appointmentService.update(item.id, updated);
    showAlert('success', successMessage);
    refreshList();
  } catch (error) {
    console.error('Error updating status:', error);
    showAlert('error', 'Erro ao atualizar status.');
  }
};

const confirmItem = (item) => {
  updateStatus(item, 'CONFIRMED', 'Agendamento confirmado!');
};

const completeItem = (item) => {
  updateStatus(item, 'COMPLETED', 'Agendamento concluído e lançamento financeiro gerado!');
};

const cancelItem = async (data) => {
  try {
    const fullData = { ...cancelingItem.value, ...data };
    await appointmentService.update(data.id, fullData);
    showAlert('success', 'Agendamento cancelado com sucesso!');
    refreshList();
    closeCancellationModal();
  } catch (error) {
    console.error('Error canceling appointment:', error);
    showAlert('error', 'Erro ao cancelar agendamento.');
  }
};

// --- Add procedure shortcut ---
const openAddProcedureForm = (sourceItem) => {
  const newItem = {
    clientId: sourceItem.clientId || sourceItem.client?.id,
    clientName: sourceItem.clientName || sourceItem.client?.name,
    professionalId: sourceItem.professionalId || sourceItem.professional?.id,
    professionalName: sourceItem.professionalName || sourceItem.professional?.name,
    startTime: sourceItem.endTime,
  };
  openForm(newItem);
};

// --- Custom save with status-aware messages ---
const saveAppointment = async (data) => {
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
    refreshList();
    closeForm();
  } catch (error) {
    console.error('Error saving appointment:', error);
    showAlert('error', 'Erro ao salvar agendamento.');
  }
};
</script>
