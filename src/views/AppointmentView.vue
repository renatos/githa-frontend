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

    <AppointmentGroupStatusModal
        :show="showGroupStatusModal"
        :new-status="pendingGroupAction.status"
        :z-index="12500"
        @close="closeGroupStatusModal"
        @choose="handleGroupActionChoice"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import AppointmentList from '../components/AppointmentList.vue';
import AppointmentForm from '../components/AppointmentForm.vue';
import AppointmentCancellationModal from '../components/AppointmentCancellationModal.vue';
import AppointmentGroupStatusModal from '../components/AppointmentGroupStatusModal.vue';
import {toastBridge} from '../services/toastBridge';
import {appointmentService} from '../services/appointmentService';
import {useCrudView} from '../composables/useCrudView';
import { useNotificationWebSocket } from '../composables/useNotificationWebSocket';

const { connectionStatus } = useNotificationWebSocket();

const {
  listRef, showForm, editingItem,
  openForm, closeForm, refreshList, deleteItem,
} = useCrudView(appointmentService, {singular: 'Agendamento', plural: 'Agendamentos'});

let debounceTimer = null;
const handleGlobalNotification = () => {
  console.warn('[AppointmentView] Global notification received, refreshing list...');
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    refreshList();
  }, 300);
};

onMounted(() => {
  window.addEventListener('githa:notification', handleGlobalNotification);
});

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  window.removeEventListener('githa:notification', handleGlobalNotification);
});


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

// --- Group Status Modal for List Quick Actions ---
const showGroupStatusModal = ref(false);
const pendingGroupAction = ref({ item: null, status: '', successMessage: '' });

const closeGroupStatusModal = () => {
  showGroupStatusModal.value = false;
  pendingGroupAction.value = { item: null, status: '', successMessage: '' };
};

const handleGroupActionChoice = async (choice) => {
  const { item, status, successMessage } = pendingGroupAction.value;
  closeGroupStatusModal();

  if (!item) return;

  try {
    if (choice === 'ALL' && item.groupId) {
      await appointmentService.updateGroupStatus(item.groupId, status);
      toastBridge.success('Sucesso', status === 'COMPLETED' ? 'Todos os procedimentos da sessão foram concluídos e faturados!' : 'Status de toda a sessão atualizado com sucesso!');
    } else {
      const updated = { ...item, status };
      await appointmentService.update(item.id, updated);
      toastBridge.success('Sucesso', successMessage);
    }
    refreshList();
  } catch (error) {
    console.error('Error updating status:', error);
    const msg = error.response?.data?.detail || error.response?.data?.message || 'Erro ao atualizar status.';
    toastBridge.error('Erro', msg);
  }
};

// --- Status updates ---
const updateStatus = async (item, status, successMessage) => {
  if (item.groupId && listRef.value?.isGroupSession?.(item)) {
    pendingGroupAction.value = { item, status, successMessage };
    showGroupStatusModal.value = true;
    return;
  }

  try {
    const updated = {...item, status};
    await appointmentService.update(item.id, updated);
    toastBridge.success('Sucesso', successMessage);
    refreshList();
  } catch (error) {
    console.error('Error updating status:', error);
    const msg = error.response?.data?.detail || error.response?.data?.message || 'Erro ao atualizar status.';
    toastBridge.error('Erro', msg);
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
    if (Array.isArray(data)) {
      await appointmentService.createBatch(data);
      toastBridge.success('Sucesso', `${data.length} procedimentos agendados com sucesso!`);
    } else if (data.items) {
      if (data.deletedIds && data.deletedIds.length > 0) {
        for (const delId of data.deletedIds) {
          await appointmentService.delete(delId);
        }
      }

      const existingItems = data.items.filter(item => item.id);
      const newItems = data.items.filter(item => !item.id);

      for (const item of existingItems) {
        const { updateAllInGroup, ...cleanData } = item;
        await appointmentService.update(cleanData.id, cleanData);
      }

      if (newItems.length > 0) {
        if (data.groupId) {
          newItems.forEach(item => item.groupId = data.groupId);
        }
        await appointmentService.createBatch(newItems);
      }

      if (data.updateAllInGroup && data.groupId) {
        const anyStatus = data.items[0]?.status;
        if (anyStatus) {
          await appointmentService.updateGroupStatus(data.groupId, anyStatus);
        }
      }

      toastBridge.success('Sucesso', 'Procedimentos da sessão atualizados com sucesso!');
    } else if (data.id) {
      if (data.updateAllInGroup && data.groupId) {
        // Primeiro salva as alterações específicas do agendamento atual sem disparar faturamento isolado
        const { updateAllInGroup, ...cleanData } = data;
        if (cleanData.status === 'COMPLETED') {
          // Se for transição para COMPLETED de toda a sessão, mantemos o status antes da conclusão
          // na atualização individual para que o updateGroupStatus execute a transição e o faturamento
          // consolidado da sessão inteira em lote.
          const tempStatusData = { ...cleanData, status: editingItem.value?.status || 'SCHEDULED' };
          await appointmentService.update(cleanData.id, tempStatusData);
        } else {
          await appointmentService.update(cleanData.id, cleanData);
        }
        // Em seguida, atualiza o status de todos os procedimentos daquela sessão
        await appointmentService.updateGroupStatus(data.groupId, data.status);
        toastBridge.success('Sucesso', data.status === 'COMPLETED'
          ? 'Todos os procedimentos da sessão foram concluídos e faturados!'
          : 'Status de todos os procedimentos da sessão atualizado com sucesso!');
      } else {
        const { updateAllInGroup, ...cleanData } = data;
        await appointmentService.update(cleanData.id, cleanData);
        if (cleanData.status === 'COMPLETED') {
          toastBridge.success('Sucesso', 'Agendamento concluído e lançamento financeiro gerado!');
        } else {
          toastBridge.success('Sucesso', 'Agendamento atualizado com sucesso!');
        }
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
    const msg = error.response?.data?.detail || error.response?.data?.message || error.response?.data?.title || 'Erro ao salvar agendamento.';
    toastBridge.error('Erro', msg);
  }
};
</script>
