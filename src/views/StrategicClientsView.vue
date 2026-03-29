<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <PageHeader
      title="Clientes Estratégicos"
      subtitle="Gestão de carteira baseada em performance e risco."
    >
      <template #actions>
        <button 
          :disabled="recalculating"
          class="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="recalculate">
          <span class="material-symbols-outlined text-[18px] mr-2" :class="{'animate-spin': recalculating}">sync</span>
          {{ recalculating ? 'Calculando...' : 'Recalcular Todos' }}
        </button>
      </template>
    </PageHeader>

    <div class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Filtros de Status</h3>
      <div class="flex flex-wrap items-center gap-3">
        <button 
          v-for="status in statuses" :key="status.value"
          class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
          :class="getFilterButtonClass(status)"
          @click="toggleFilter(status.value)"
        >
          <span class="w-2 h-2 rounded-full mr-2" :class="status.dotClass"></span>
          {{ status.label }}
        </button>
      </div>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchStatsAdapter"
        @row-click="handleRowClick"
    >
      <template #cell-client.name="{ item }">
        {{ item.client.name }}
      </template>

      <template #cell-client.status="{ item }">
        <span
v-if="item.client.status" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeClass(item.client.status)">
          <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.client.status)"></span>
          {{ getStatusLabel(item.client.status) }}
        </span>
      </template>

      <template #cell-totalSpent="{ item }">
        {{ formatCurrency(item.totalSpent) }}
      </template>

      <template #cell-lastVisitDate="{ item }">
        {{ formatDate(item.lastVisitDate) }}
      </template>

      <template #actions="{ item }">
        <div class="flex justify-center gap-1">
          <a
v-if="item.client.phone" :href="getWhatsappLink(item.client)" class="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:border-green-500 transition-colors text-slate-500 dark:text-slate-400 grayscale hover:grayscale-0" target="_blank"
             title="WhatsApp" @click.stop>
            💬
          </a>
        </div>
      </template>
    </GenericTable>

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
import {ref} from 'vue';
import GenericTable from '../components/common/GenericTable.vue';
import PageHeader from '../components/common/PageHeader.vue';
import ClientForm from '../components/ClientForm.vue';
import api from '../services/api';
import { clientService } from '../services/clientService';
import { confirmBridge } from '../services/confirmBridge';
import {formatCurrency, formatDate} from '../utils/formatters';

const tableRef = ref(null);
const recalculating = ref(false);
const selectedStatuses = ref([]);

const showClientForm = ref(false);
const editingClient = ref(null);

const statuses = [
  { value: 'VIP', label: 'VIP / Alta Frequência', dotClass: 'bg-emerald-500', 
    activeClass: 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/50 dark:border-green-500 dark:text-green-100', 
    inactiveClass: 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50' },
  { value: 'AT_RISK', label: 'Em Risco / Ausente', dotClass: 'bg-red-500', 
    activeClass: 'border-red-500 bg-red-100 text-red-900 dark:bg-red-900/50 dark:border-red-500 dark:text-red-100', 
    inactiveClass: 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50' },
  { value: 'NEW', label: 'Novo Cliente', dotClass: 'bg-blue-500', 
    activeClass: 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-100', 
    inactiveClass: 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50' },
  { value: 'ACTIVE', label: 'Ativo', dotClass: 'bg-slate-500', 
    activeClass: 'border-slate-500 bg-slate-200 text-slate-900 dark:bg-slate-700 dark:border-slate-400 dark:text-white', 
    inactiveClass: 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700' },
  { value: 'INACTIVE', label: 'Inativo', dotClass: 'bg-transparent border border-neutral-400', 
    activeClass: 'border-neutral-500 bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:border-neutral-500 dark:text-white', 
    inactiveClass: 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:bg-background-dark dark:border-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800' }
];

const columns = [
  {key: 'client.name', label: 'Cliente', sortable: true},
  {key: 'client.status', label: 'Status', sortable: true, width: '160px'},
  {key: 'calculatedScore', label: 'Score', sortable: true, width: '100px'},
  {key: 'totalVisits', label: 'Visitas', sortable: true, width: '100px'},
  {key: 'totalSpent', label: 'Total Gasto', sortable: true, width: '150px'},
  {key: 'lastVisitDate', label: 'Última Visita', sortable: true, width: '150px'},
];

const getFilterButtonClass = (status) => {
  return selectedStatuses.value.includes(status.value) ? status.activeClass : status.inactiveClass;
};

const toggleFilter = (statusValue) => {
  if (selectedStatuses.value.includes(statusValue)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== statusValue);
  } else {
    selectedStatuses.value.push(statusValue);
  }
  refresh();
};

const fetchStatsAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort
  };

  if (selectedStatuses.value.length > 0) {
    query['client.status'] = selectedStatuses.value.join(',');
  }

  const response = await api.get('/reports/client-statistics', {params: query});
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const recalculate = async () => {
  try {
    recalculating.value = true;
    await api.post('/reports/client-statistics/recalculate');
    refresh();
  } catch (e) {
    confirmBridge.alert({
      title: 'Erro no Recálculo',
      message: 'Ocorreu um erro ao tentar recalcular as estatísticas.',
      type: 'danger'
    });
  } finally {
    recalculating.value = false;
  }
};

const getWhatsappLink = (client) => {
  const phone = client.phone.replace(/\D/g, '');
  return `https://wa.me/55${phone}`;
};

const handleRowClick = (item) => {
  editingClient.value = { ...item.client };
  showClientForm.value = true;
};

const onClientSaved = async (data) => {
  try {
    if (data.id) {
      await clientService.update(data.id, data);
    } else {
      await clientService.create(data);
    }
    showClientForm.value = false;
    refresh();
  } catch (error) {
    console.error('Failed to save client', error);
  }
};

const getStatusBadgeClass = (status) => {
  const map = {
    VIP: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    AT_RISK: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    NEW: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    ACTIVE: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    INACTIVE: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
  };
  return map[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
};

const getStatusDotClass = (status) => {
  const map = {
    VIP: 'bg-emerald-500',
    AT_RISK: 'bg-red-500',
    NEW: 'bg-sky-500',
    ACTIVE: 'bg-slate-500',
    INACTIVE: 'bg-transparent border border-neutral-400'
  };
  return map[status] || 'bg-slate-400';
};

const getStatusLabel = (status) => {
  const map = {
    VIP: 'VIP',
    AT_RISK: 'Em Risco',
    NEW: 'Novo',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo'
  };
  return map[status] || status;
};

</script>
