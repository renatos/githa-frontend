<template>
  <BaseModal
    :title="`Processo em Massa #${processId}`"
    max-width="max-w-4xl"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="space-y-6 max-h-[75vh] overflow-y-auto p-1">
      <div v-if="loading" class="py-12 text-center text-slate-500">
        <i class="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-600 mb-2"></i>
        <p class="text-sm">Carregando detalhes do processo...</p>
      </div>

      <div v-else-if="processData" class="space-y-6">
        <!-- Process Header Info -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase text-slate-500">Status:</span>
              <span
                class="px-2.5 py-1 text-xs font-bold rounded-full"
                :class="statusBadgeClass(processData.status)"
              >
                {{ statusLabel(processData.status) }}
              </span>
            </div>
            <p class="text-xs text-slate-500">
              Criado em: {{ formatDateTime(processData.createdAt) }}
            </p>
          </div>

          <!-- Actions: Cancel and Clone -->
          <div class="flex items-center gap-2">
            <button
              v-if="processData.status === 'IN_PROGRESS'"
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors"
              :disabled="cancelling"
              @click="handleCancel"
            >
              <i v-if="cancelling" class="fa-solid fa-circle-notch fa-spin"></i>
              <span class="material-symbols-outlined text-[16px] text-rose-600">cancel</span>
              Cancelar Processo
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-100 transition-colors"
              @click="$emit('clone', processData)"
            >
              <span class="material-symbols-outlined text-[16px]">content_copy</span>
              Clonar para Novo Disparo
            </button>
          </div>
        </div>

        <!-- Progress Summary Counters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div class="text-xs text-slate-500">Total de Destinatários</div>
            <div class="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{{ processData.totalLeads || 0 }}</div>
          </div>
          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div class="text-xs text-amber-600 dark:text-amber-400 font-medium">Pendentes</div>
            <div class="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{{ processData.pendingCount || 0 }}</div>
          </div>
          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Enviados</div>
            <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{{ processData.sentCount || 0 }}</div>
          </div>
          <div class="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <div class="text-xs text-rose-600 dark:text-rose-400 font-medium">Falhas / Cancelados</div>
            <div class="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{{ (processData.failedCount || 0) + (processData.cancelledCount || 0) }}</div>
          </div>
        </div>

        <!-- Message Preview Box -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300">Template da Mensagem Enviada:</div>
          <div class="text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            {{ processData.message }}
          </div>
        </div>

        <!-- Items Table -->
        <div class="space-y-2">
          <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">Destinatários e Status dos Envios ({{ processData.items?.length || 0 }})</h4>
          <div class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div class="overflow-x-auto max-h-64">
              <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
                <thead class="bg-slate-50 dark:bg-slate-900 font-medium text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th class="px-4 py-2.5 text-left">Lead</th>
                    <th class="px-4 py-2.5 text-left">Telefone</th>
                    <th class="px-4 py-2.5 text-left">Agendado Para</th>
                    <th class="px-4 py-2.5 text-left">Enviado Em</th>
                    <th class="px-4 py-2.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                  <tr v-for="item in processData.items" :key="item.id">
                    <td class="px-4 py-2 text-slate-900 dark:text-slate-100 font-medium">
                      {{ item.leadName || `Lead #${item.leadId}` }}
                    </td>
                    <td class="px-4 py-2 text-slate-600 dark:text-slate-300">
                      {{ formatPhone(item.leadPhone) }}
                    </td>
                    <td class="px-4 py-2 text-slate-500">
                      {{ formatDateTime(item.scheduledAt) }}
                    </td>
                    <td class="px-4 py-2 text-slate-500">
                      {{ item.sentAt ? formatDateTime(item.sentAt) : '-' }}
                    </td>
                    <td class="px-4 py-2">
                      <span
                        class="px-2 py-0.5 rounded-full font-semibold text-[11px]"
                        :class="itemStatusBadgeClass(item.status)"
                      >
                        {{ itemStatusLabel(item.status) }}
                      </span>
                      <span v-if="item.errorMessage" class="block text-[10px] text-rose-500 truncate max-w-xs mt-0.5" :title="item.errorMessage">
                        {{ item.errorMessage }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!processData.items || processData.items.length === 0">
                    <td colspan="5" class="px-4 py-6 text-center text-slate-400">
                      Nenhum item encontrado neste processo.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="$emit('close')"
        >
          Fechar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import { leadService } from '../../services/leadService';
import { toastBridge } from '../../services/toastBridge';
import { confirmBridge } from '../../services/confirmBridge';

const props = defineProps({
  processId: {
    type: Number,
    required: true
  },
  zIndex: {
    type: Number,
    default: 11000
  }
});

const emit = defineEmits(['close', 'clone', 'cancelled']);

const loading = ref(true);
const processData = ref(null);
const cancelling = ref(false);

const loadProcess = async () => {
  loading.value = true;
  try {
    const res = await leadService.getBulkProcess(props.processId);
    processData.value = res.data;
  } catch (err) {
    console.error('Error loading bulk process:', err);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar os detalhes do processo.',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProcess();
});

const handleCancel = () => {
  confirmBridge.confirm({
    title: 'Cancelar Processo em Massa',
    message: 'Tem certeza que deseja cancelar os envios pendentes deste processo? Disparos já enviados não serão revertidos.',
    type: 'danger',
    confirmLabel: 'Cancelar Processo',
    onConfirm: async () => {
      cancelling.value = true;
      try {
        await leadService.cancelBulkProcess(props.processId);
        toastBridge.getToast().add({
          severity: 'info',
          summary: 'Processo Cancelado',
          detail: 'Os disparos pendentes foram cancelados.',
          life: 3000
        });
        await loadProcess();
        emit('cancelled', props.processId);
      } catch (err) {
        console.error('Failed to cancel process:', err);
        toastBridge.getToast().add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível cancelar o processo.',
          life: 3000
        });
      } finally {
        cancelling.value = false;
      }
    }
  });
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'IN_PROGRESS':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'CANCELLED':
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
};

const statusLabel = (status) => {
  switch (status) {
    case 'IN_PROGRESS': return 'Em Andamento';
    case 'COMPLETED': return 'Concluído';
    case 'CANCELLED': return 'Cancelado';
    default: return status || '-';
  }
};

const itemStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'SENT':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'FAILED':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    case 'CANCELLED':
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const itemStatusLabel = (status) => {
  switch (status) {
    case 'PENDING': return 'Pendente';
    case 'SENT': return 'Enviado';
    case 'FAILED': return 'Falhou';
    case 'CANCELLED': return 'Cancelado';
    default: return status || '-';
  }
};

const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return '-';
  try {
    return new Date(isoStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoStr;
  }
};
</script>
