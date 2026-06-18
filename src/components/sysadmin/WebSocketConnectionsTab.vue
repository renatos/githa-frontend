<template>
  <div class="websocket-connections-tab h-full overflow-auto flex flex-col gap-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">Conexões WebSocket Ativas</h2>
        <p class="text-xs text-slate-500">Monitoramento em tempo real dos clientes conectados no sistema de mensageria.</p>
      </div>
      <button
          v-if="reports && reports.length > 0"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
          @click="confirmClearConnections"
      >
        <span class="material-symbols-outlined text-[18px]">power_off</span>
        Desconectar Todas Conexões
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12 text-slate-500">
      <span class="animate-spin mr-2">🔄</span> Carregando conexões...
    </div>

    <div v-else-if="!reports || reports.length === 0" class="text-center py-12 text-slate-500">
      Nenhuma conexão ativa encontrada no momento.
    </div>

    <div v-else class="space-y-6">
      <div
          v-for="group in reports"
          :key="group.accountGroupId"
          class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
      >
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <span class="text-sm font-bold text-slate-700 dark:text-slate-300">
            Grupo de Contas ID: {{ group.accountGroupId }}
          </span>
          <span class="text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded font-semibold">
            {{ group.connections?.length || 0 }} {{ (group.connections?.length || 0) === 1 ? 'conexão ativa' : 'conexões ativas' }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead>
              <tr class="text-left text-xs font-bold text-slate-400 uppercase">
                <th class="pb-2">Login / Email</th>
                <th class="pb-2 text-right">Conectado em</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-900">
              <tr
                  v-for="(conn, idx) in (group.connections || [])"
                  :key="idx"
                  class="text-sm text-slate-600 dark:text-slate-300"
              >
                <td class="py-2.5 font-mono">{{ conn.login }}</td>
                <td class="py-2.5 text-right font-medium">{{ formatDate(conn.connectedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { notificationLogService } from '../../services/notificationLogService';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

const reports = ref([]);
const loading = ref(false);

const loadConnections = async () => {
  loading.value = true;
  try {
    const response = await notificationLogService.getConnections();
    reports.value = Array.isArray(response?.data) ? response.data : [];
  } catch (error) {
    console.error('Failed to fetch connections', error);
  } finally {
    loading.value = false;
  }
};

const confirmClearConnections = () => {
  confirmBridge.confirm({
    title: 'Desconectar Clientes',
    message: 'Tem certeza que deseja derrubar todas as conexões ativas? Os clientes tentarão reconectar automaticamente.',
    type: 'danger',
    confirmLabel: 'Desconectar Todos',
    onConfirm: async () => {
      try {
        await notificationLogService.clearConnections();
        toastBridge.getToast().add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Todas as conexões foram desconectadas!',
          life: 3000
        });
        loadConnections();
      } catch (error) {
        console.error('Failed to clear connections', error);
        toastBridge.getToast().add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível desconectar as conexões.',
          life: 3000
        });
      }
    }
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

onMounted(() => {
  loadConnections();
});
</script>
