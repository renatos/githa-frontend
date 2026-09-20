<template>
  <BaseModal
    :show="true"
    title="Histórico de Processos de Disparo em Massa"
    max-width="max-w-5xl"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <template #sub-header>
      <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <p class="text-xs text-slate-500 dark:text-slate-400 m-0">
          Acompanhe o andamento dos lotes de disparo e gerencie cancelamentos ou novos envios.
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          @click="$emit('new-bulk')"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          Novo Disparo
        </button>
      </div>
    </template>

    <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
      <div v-if="loading" class="py-12 text-center text-slate-500">
        <i class="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-600 mb-2"></i>
        <p class="text-sm">Carregando histórico de processos...</p>
      </div>

      <div v-else-if="processes.length === 0" class="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">history</span>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Nenhum processo de notificação em massa encontrado.</p>
        <p class="text-xs text-slate-500 mt-1">Clique em "Novo Disparo" para iniciar uma campanha.</p>
      </div>

      <div v-else class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-xs">
          <thead class="bg-slate-50 dark:bg-slate-900 font-medium text-slate-500 uppercase tracking-wider">
            <tr>
              <th class="px-4 py-3 text-left">#ID</th>
              <th class="px-4 py-3 text-left">Critério / Alvo</th>
              <th class="px-4 py-3 text-center">Total</th>
              <th class="px-4 py-3 text-center">Pendentes</th>
              <th class="px-4 py-3 text-center">Enviados</th>
              <th class="px-4 py-3 text-center">Falhas</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-left">Data de Criação</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
            <tr
              v-for="proc in processes"
              :key="proc.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              @click="viewDetail(proc.id)"
            >
              <td class="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                #{{ proc.id }}
              </td>
              <td class="px-4 py-3 text-slate-700 dark:text-slate-300">
                <span class="font-medium">{{ formatCriteria(proc.searchCriteria) }}</span>
              </td>
              <td class="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                {{ proc.totalLeads }}
              </td>
              <td class="px-4 py-3 text-center text-amber-600 dark:text-amber-400 font-semibold">
                {{ proc.pendingCount || 0 }}
              </td>
              <td class="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ proc.sentCount || 0 }}
              </td>
              <td class="px-4 py-3 text-center text-rose-600 dark:text-rose-400 font-semibold">
                {{ proc.failedCount || 0 }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-2.5 py-1 text-[11px] font-bold rounded-full"
                  :class="statusBadgeClass(proc.status)"
                >
                  {{ statusLabel(proc.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-500">
                {{ formatDateTime(proc.createdAt) }}
              </td>
              <td class="px-4 py-3 text-right space-x-1" @click.stop>
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Ver Detalhes"
                  @click="viewDetail(proc.id)"
                >
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>

                <button
                  type="button"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Clonar Mensagem e Critérios"
                  @click="$emit('clone', proc)"
                >
                  <span class="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

  <!-- Detail Submodal -->
  <LeadBulkProcessDetail
    v-if="selectedProcessId"
    :process-id="selectedProcessId"
    @close="selectedProcessId = null"
    @clone="(proc) => { selectedProcessId = null; $emit('clone', proc); }"
    @cancelled="loadProcesses"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import LeadBulkProcessDetail from './LeadBulkProcessDetail.vue';
import { leadService } from '../../services/leadService';
import { toastBridge } from '../../services/toastBridge';

const props = defineProps({
  zIndex: {
    type: Number,
    default: 10000
  }
});

const emit = defineEmits(['close', 'clone', 'new-bulk']);

const loading = ref(true);
const processes = ref([]);
const selectedProcessId = ref(null);

const loadProcesses = async () => {
  loading.value = true;
  try {
    const res = await leadService.getBulkProcesses({ page: 0, size: 50 });
    processes.value = res.data?.content || res.data || [];
  } catch (err) {
    console.error('Failed to load bulk processes:', err);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar o histórico de processos.',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProcesses();
});

const viewDetail = (id) => {
  selectedProcessId.value = id;
};

const formatCriteria = (criteria) => {
  if (!criteria || Object.keys(criteria).length === 0) return 'Todos os Leads Ativos';
  if (criteria.service) return `Serviço: ${criteria.service}`;
  if (criteria.createdMonth) return `Mês: ${criteria.createdMonth}`;
  if (criteria.type === 'ALL') return 'Todos os Leads Ativos';
  return 'Critério Personalizado';
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

const formatDateTime = (isoStr) => {
  if (!isoStr) return '-';
  try {
    return new Date(isoStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoStr;
  }
};
</script>
