<template>
  <div class="p-4 md:p-6 flex flex-col gap-6 animate-in fade-in duration-500">
    <PageHeader
      title="Previsão de Churn"
      subtitle="Identifique clientes em risco e execute ações de retenção proativas."
      icon="analytics"
    />

    <div class="bg-white dark:bg-slate-800 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-wider">Filtro de Risco</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Exibindo clientes com probabilidade de churn baseada em RFM.</p>
        </div>
        <div class="flex items-center gap-3">
          <button 
            class="inline-flex items-center px-4 py-2 rounded-full border text-xs font-bold transition-all"
            :class="onlyHighRisk ? 'border-red-500 bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'"
            @click="toggleHighRisk"
          >
            <span class="w-2 h-2 rounded-full mr-2" :class="onlyHighRisk ? 'bg-red-500 animate-pulse' : 'bg-slate-400'"></span>
            Apenas Alto Risco (≥ {{ churnThreshold }}%)
          </button>
        </div>
      </div>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchChurnRisks"
      @row-click="handleRowClick"
    >
      <template #cell-churnProbabilityScore="{ item }">
        <div class="flex items-center gap-2">
          <div class="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden max-w-[60px] hidden sm:block">
            <div 
              class="h-full rounded-full transition-all duration-1000"
              :class="getScoreColorClass(item.churnProbabilityScore)"
              :style="{ width: `${item.churnProbabilityScore}%` }"
            ></div>
          </div>
          <span 
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
            :class="getScoreBadgeClass(item.churnProbabilityScore)"
          >
            {{ item.churnProbabilityScore }}%
          </span>
        </div>
      </template>

      <template #cell-monetaryValue="{ item }">
        <span class="font-semibold text-slate-700 dark:text-slate-200">
          {{ formatCurrency(item.monetaryValue) }}
        </span>
      </template>

      <template #cell-recencyDays="{ item }">
        <span :class="{'text-red-500 font-medium': item.recencyDays > 60}">
          {{ item.recencyDays }} dias
        </span>
      </template>

      <template #cell-lastRetentionDate="{ item }">
        <span v-if="item.lastRetentionDate" class="text-xs text-slate-500 dark:text-slate-400">
          {{ formatDateTime(item.lastRetentionDate) }}
        </span>
        <span v-else class="text-xs text-slate-400 italic">Nunca</span>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button 
            v-if="item.lastRetentionMessage"
            class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            title="Enviar WhatsApp"
            @click.stop="openRetentionModal(item)"
          >
            <i class="fa-brands fa-whatsapp text-[20px]"></i>
          </button>
          <button 
            class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
            title="Ver Detalhes"
            @click.stop="handleRowClick(item)"
          >
            <span class="material-symbols-outlined text-[20px]">visibility</span>
          </button>
        </div>
      </template>
    </GenericTable>

    <!-- Recruitment Message Modal -->
    <BaseModal
      :show="showRetentionModal"
      title="Enviar Mensagem de Recuperação"
      subtitle="Revise e envie a mensagem personalizada via WhatsApp"
      icon="fa-solid fa-paper-plane"
      @close="showRetentionModal = false"
    >
      <div v-if="selectedRetentionItem" class="flex flex-col gap-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mensagem do Cliente</label>
          <textarea 
            v-model="retentionMessage"
            class="w-full h-32 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 resize-none custom-scrollbar"
            placeholder="Digite a mensagem..."
          ></textarea>
        </div>
        
        <div class="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl">
          <i class="fa-solid fa-circle-info text-amber-500 text-lg"></i>
          <p class="text-xs text-amber-700 dark:text-amber-300 m-0">
            Ao clicar em enviar, você será redirecionado para o WhatsApp com esta mensagem preenchida.
          </p>
        </div>
      </div>
      
      <template #footer>
        <button 
          class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          @click="showRetentionModal = false"
        >
          Cancelar
        </button>
        <button 
          class="flex items-center px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          @click="sendWhatsApp"
        >
          <i class="fa-brands fa-whatsapp mr-2 text-lg"></i>
          Enviar Agora
        </button>
      </template>
    </BaseModal>

    <!-- Client Edit Modal -->
    <ClientForm
      v-if="showClientForm"
      :client="editingClient"
      @close="showClientForm = false"
      @save="onClientSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PageHeader from '../components/common/PageHeader.vue';
import GenericTable from '../components/common/GenericTable.vue';
import ClientForm from '../components/ClientForm.vue';
import BaseModal from '../components/common/BaseModal.vue';
import { churnService } from '../services/churnService';
import { clientService } from '../services/clientService';
import { toastBridge } from '../services/toastBridge';
import { confirmBridge } from '../services/confirmBridge';
import { systemParameterService } from '../services/systemParameterService';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { getWhatsappLink } from '../utils/whatsappHelper';

const tableRef = ref(null);
const onlyHighRisk = ref(true);
const showClientForm = ref(false);
const editingClient = ref(null);
const showRetentionModal = ref(false);
const selectedRetentionItem = ref(null);
const retentionMessage = ref('');
const churnThreshold = ref(50);

const loadParameters = async () => {
  try {
    const params = await systemParameterService.getPublicParams();
    if (params.data && params.data.CHURN_RISK_THRESHOLD) {
      churnThreshold.value = parseInt(params.data.CHURN_RISK_THRESHOLD);
    }
  } catch (error) {
    console.error('Failed to load system parameters', error);
  }
};

import { onMounted } from 'vue';
onMounted(loadParameters);

const columns = [
  { key: 'clientName', label: 'Cliente', sortable: true },
  { key: 'churnProbabilityScore', label: 'Risco Churn', sortable: true, width: '130px' },
  { key: 'recencyDays', label: 'Recência', sortable: true, width: '110px' },
  { key: 'frequencyCount', label: 'Freq.', sortable: true, width: '80px' },
  { key: 'monetaryValue', label: 'Ticket Médio', sortable: true, width: '140px' },
  { key: 'lastRetentionDate', label: 'Última Ação', sortable: true, width: '150px' },
];

const fetchChurnRisks = async (params) => {
  const filters = { ...params.filters };
  if (onlyHighRisk.value) {
    filters.churnProbabilityScore_gte = churnThreshold.value;
  }
  
  const response = await churnService.getChurnRisks(filters, params.page, params.size, params.sort);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const toggleHighRisk = () => {
  onlyHighRisk.value = !onlyHighRisk.value;
  refresh();
};

const handleRowClick = (item) => {
  editingClient.value = { 
    id: item.clientId, 
    name: item.clientName, 
    phone: item.clientPhone 
  };
  showClientForm.value = true;
};

const openRetentionModal = (item) => {
  selectedRetentionItem.value = item;
  retentionMessage.value = item.lastRetentionMessage || '';
  showRetentionModal.value = true;
};

const sendWhatsApp = () => {
  if (!selectedRetentionItem.value) return;
  
  const link = getWhatsappLink(selectedRetentionItem.value.clientPhone, retentionMessage.value);
  window.open(link, '_blank');
  showRetentionModal.value = false;
  toastBridge.success('WhatsApp aberto', 'Mensagem enviada para o navegador.');
};

const onClientSaved = async (data) => {
  try {
    if (data.id) {
      await clientService.update(data.id, data);
      toastBridge.success('Sucesso', 'Cliente atualizado com sucesso.');
    }
    showClientForm.value = false;
    refresh();
  } catch (error) {
    console.error('Failed to save client', error);
    toastBridge.error('Erro', 'Ocorreu um erro ao salvar o cliente.');
  }
};

const getScoreColorClass = (score) => {
  if (score >= 70) return 'bg-red-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const getScoreBadgeClass = (score) => {
  if (score >= 70) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
  if (score >= 40) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-700 rounded-full;
}
</style>
