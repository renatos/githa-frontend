<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseToast from './components/common/BaseToast.vue';
import ConfirmModal from './components/common/ConfirmModal.vue';
import GlobalTooltip from './components/common/GlobalTooltip.vue';
import MainLayout from './layouts/MainLayout.vue';
import AuthLayout from './layouts/AuthLayout.vue';

import { useTheme } from './composables/useTheme';
import LoadingOverlay from './components/LoadingOverlay.vue';

const route = useRoute();
const { isDark } = useTheme(); // Initialize theme globally

import { useNotificationWebSocket } from './composables/useNotificationWebSocket';
import { toastBridge } from './services/toastBridge';
import { authService } from './services/authService';
import GlobalModalHost from './components/common/GlobalModalHost.vue';

const { connect, onMessage } = useNotificationWebSocket();

const unsubscribeNotifications = onMessage((data) => {
  // Handle WhatsApp messages (both WHATSAPP_STATUS and WHATSAPP_NOTIFICATION payloads)
  if (data.type === 'WHATSAPP_STATUS' || data.type === 'WHATSAPP_NOTIFICATION') {
    const status = data.data?.status;
    const title = data.type === 'WHATSAPP_NOTIFICATION' ? 'Notificação WhatsApp' : 'WhatsApp';
    if (status === 'SENT') {
      toastBridge.success(title, 'Notificação enviada com sucesso!');
    } else {
      toastBridge.error(title, 'Falha ao enviar notificação via WhatsApp.');
    }
  } else {
    // Default handling for CALENDAR_UPDATE or generic updates
    const action = data.data?.action;
    const notes = data.data?.notes;
    
    if (action === 'CANCELLED') {
      toastBridge.info('Atualização', notes || 'Um agendamento foi cancelado via Google Calendar.');
    } else {
      toastBridge.info('Atualização', notes || 'A agenda foi atualizada via Google Calendar.');
    }
  }

  // Dispatch a global event so specific views can react (e.g. refresh lists)
  window.dispatchEvent(new CustomEvent('githa:notification', { detail: data }));
});

onMounted(() => {
  if (authService.isTokenActive()) {
    connect(authService.getToken());
  }
});

onUnmounted(() => {
  unsubscribeNotifications();
});

const layout = computed(() => {
  return route.meta.layout === 'auth' ? AuthLayout : MainLayout;
});
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <GlobalModalHost />
  <LoadingOverlay />
  <BaseToast />
  <ConfirmModal />
  <GlobalTooltip />
</template>

<style scoped>
</style>
