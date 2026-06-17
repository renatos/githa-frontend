<template>
  <div class="notification-log-tab h-full overflow-auto flex flex-col gap-4">
    <div class="mb-2">
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">Logs de Notificações</h2>
      <p class="text-xs text-slate-500">Log de mensagens disparadas pelo sistema.</p>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchLogs"
        initial-sort-key="sentAt"
        initial-sort-order="desc"
        @row-click="openDetails"
    >
      <template #cell-status="{ item }">
        <span
            :class="[
              item.status === 'SENT' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            ]"
            class="px-2 py-0.5 rounded text-xs font-semibold"
        >
          {{ item.status === 'SENT' ? 'Enviado' : 'Falha' }}
        </span>
      </template>
      <template #cell-sentAt="{ item }">
        {{ formatDate(item.sentAt) }}
      </template>
      <template #cell-message="{ item }">
        <span class="cursor-pointer hover:underline text-indigo-600 dark:text-indigo-400 font-medium" :title="item.message">
          {{ truncateMessage(item.message) }}
        </span>
      </template>
      <template #cell-error="{ item }">
        <span v-if="item.error" class="text-xs text-red-600 cursor-help" :title="item.error">
          {{ truncateError(item.error) }}
        </span>
        <span v-else class="text-slate-400">—</span>
      </template>
    </GenericTable>

    <!-- Detail Modal -->
    <BaseModal
        :show="showModal"
        title="Detalhes da Notificação"
        subtitle="Visualização do Log de Mensagem"
        icon="fa-regular fa-envelope"
        maxWidth="max-w-2xl"
        @close="closeModal"
    >
      <div v-if="selectedLog" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Destinatário</label>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
              {{ selectedLog.toPhone }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Canal de Envio</label>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium capitalize">
              {{ selectedLog.channel }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Enviado em</label>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
              {{ formatDate(selectedLog.sentAt) }}
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Enviado por</label>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
              {{ selectedLog.sentBy }}
            </div>
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Status de Entrega</label>
            <div class="flex items-center gap-2">
              <span
                  :class="[
                    selectedLog.status === 'SENT' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  ]"
                  class="px-3 py-1 rounded-full text-xs font-bold"
              >
                {{ selectedLog.status === 'SENT' ? 'Enviado com Sucesso' : 'Falha no Envio' }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Mensagem Enviada</label>
          <div class="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm whitespace-pre-wrap leading-relaxed">
            {{ selectedLog.message }}
          </div>
        </div>

        <div v-if="selectedLog.error">
          <label class="block text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Erro Retornado</label>
          <div class="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-sm text-red-600 dark:text-red-400 font-mono">
            {{ selectedLog.error }}
          </div>
        </div>
      </div>
      <template #footer>
        <button
            type="button"
            class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors"
            @click="closeModal"
        >
          Fechar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GenericTable from '../common/GenericTable.vue';
import BaseModal from '../common/BaseModal.vue';
import { notificationLogService } from '../../services/notificationLogService';

const tableRef = ref(null);
const showModal = ref(false);
const selectedLog = ref(null);

const openDetails = (item) => {
  selectedLog.value = item;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedLog.value = null;
};

const columns = [
  { key: 'toPhone', label: 'Destinatário', sortable: true, filterable: true, width: '160px' },
  { key: 'channel', label: 'Canal', sortable: true, filterable: true, width: '100px' },
  { key: 'message', label: 'Mensagem', sortable: false, nowrap: false },
  { key: 'status', label: 'Status', sortable: true, filterable: true, width: '120px' },
  { key: 'error', label: 'Erro', sortable: false, width: '180px' },
  { key: 'sentBy', label: 'Enviado Por', sortable: true, filterable: true, width: '160px' },
  { key: 'sentAt', label: 'Enviado em', sortable: true, width: '180px' },
];

const fetchLogs = async (params) => {
  // Translate search parameters to API search format
  const queryParams = {
    page: params.page,
    size: params.size,
    sort: params.sort,
  };

  // Convert table filters to api query params
  if (params.filters) {
    if (params.filters.toPhone) queryParams.toPhone = params.filters.toPhone;
    if (params.filters.channel) queryParams.channel = params.filters.channel.toUpperCase();
    if (params.filters.status) {
      // Map Portuguese inputs if user searches by translated values
      const statusInput = params.filters.status.toUpperCase();
      if (statusInput.startsWith('ENV') || statusInput === 'SENT') {
        queryParams.status = 'SENT';
      } else if (statusInput.startsWith('FAL') || statusInput === 'FAILED') {
        queryParams.status = 'FAILED';
      } else {
        queryParams.status = statusInput;
      }
    }
    if (params.filters.sentBy) queryParams.sentBy = params.filters.sentBy;
  }

  const response = await notificationLogService.getAll(queryParams);
  return response.data;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

const truncateMessage = (msg) => {
  if (!msg) return '';
  return msg.length > 60 ? msg.substring(0, 60) + '...' : msg;
};

const truncateError = (err) => {
  if (!err) return '';
  return err.length > 25 ? err.substring(0, 25) + '...' : err;
};
</script>
