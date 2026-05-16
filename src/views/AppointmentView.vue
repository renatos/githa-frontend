<template>
  <div class="appointment-view">


    <AppointmentList
        ref="listRef"
        :sync-status="connectionStatus"
        @cancel="openCancellationModal"

        @complete="completeItem"
        @confirm="confirmItem"
        @delete="deleteItem"
        @edit="openForm"
        @new="(payload) => openForm(payload)"
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
import { ref, onMounted, onUnmounted } from 'vue';
import AppointmentList from '../components/AppointmentList.vue';
import AppointmentForm from '../components/AppointmentForm.vue';
import AppointmentCancellationModal from '../components/AppointmentCancellationModal.vue';
import {authService} from '../services/authService';
import {toastBridge} from '../services/toastBridge';
import WsStatusIndicator from '../components/common/WsStatusIndicator.vue';
import {appointmentService} from '../services/appointmentService';
import {useCrudView} from '../composables/useCrudView';
import {useAppointmentWebSocket} from '../composables/useAppointmentWebSocket';

const token = authService.getToken();
const { connectionStatus, onMessage, connect, disconnect } = useAppointmentWebSocket(token);

onMessage((data) => {
  console.log('Real-time update received:', data);
  
  if (data.type === 'WHATSAPP_NOTIFICATION') {
    const status = data.data?.status;
    if (status === 'SENT') {
      toastBridge.success('WhatsApp', 'Notificação enviada com sucesso!');
    } else {
      toastBridge.error('WhatsApp', 'Falha ao enviar notificação via WhatsApp.');
    }
    return;
  }

  // Default handling for CALENDAR_UPDATE or generic updates
  refreshList();
  const action = data.data?.action;
  if (action === 'CANCELLED') {
    toastBridge.info('Atualização', `Um agendamento foi cancelado via Google Calendar.`);
  } else {
    toastBridge.info('Atualização', `A agenda foi atualizada via Google Calendar.`);
  }
});



onMounted(() => {
  if (token) {
    connect();
  }
});

onUnmounted(() => {
  disconnect();
});

const {
  listRef, showForm, editingItem,
  openForm, closeForm, refreshList, deleteItem,
} = useCrudView(appointmentService, {singular: 'Agendamento', plural: 'Agendamentos'});

// --- Cancellation modal ---
const showCancellationModal = ref(false);
const cancelingItem = ref({});

const openCancellationModal = (item) => {
  cancelingItem.value = {...item};
  showCancellationModal.value = true;
};

const closeCancellationModal = () => {
  showCancellationModal.value = false;
  cancelingItem.value = {};
};

// --- Status updates ---
const updateStatus = async (item, status, successMessage) => {
  try {
    const updated = {...item, status};
    await appointmentService.update(item.id, updated);
    toastBridge.success('Sucesso', successMessage);
    refreshList();
  } catch (error) {
    console.error('Error updating status:', error);
    toastBridge.error('Erro', 'Erro ao atualizar status.');
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
    const fullData = {...cancelingItem.value, ...data};
    await appointmentService.update(data.id, fullData);
    toastBridge.success('Sucesso', 'Agendamento cancelado com sucesso!');
    refreshList();
    closeCancellationModal();
  } catch (error) {
    console.error('Error canceling appointment:', error);
    toastBridge.error('Erro', 'Erro ao cancelar agendamento.');
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
        toastBridge.success('Sucesso', 'Agendamento concluído e lançamento financeiro gerado!');
      } else {
        toastBridge.success('Sucesso', 'Agendamento atualizado com sucesso!');
      }
    } else {
      await appointmentService.create(data);
      if (data.status === 'COMPLETED') {
        toastBridge.success('Sucesso', 'Agendamento criado e lançamento financeiro gerado!');
      } else {
        toastBridge.success('Sucesso', 'Agendamento criado com sucesso!');
      }
    }
    refreshList();
    closeForm();
  } catch (error) {
    console.error('Error saving appointment:', error);
    toastBridge.error('Erro', 'Erro ao salvar agendamento.');
  }
};
</script>
