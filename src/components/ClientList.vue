<template>
  <div class="client-list p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Clientes</h2>
          <AiContextBadge context="CLIENTS" context-name="Clientes">
            <template #extra-content>
              <div v-if="atRiskCount > 0" class="mt-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-500/30">
                    <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    {{ atRiskCount }} cliente{{ atRiskCount !== 1 ? 's' : '' }} em risco
                  </span>
                </div>
                <div v-if="criticalClient" class="text-sm text-slate-700 dark:text-slate-300">
                  <span class="font-medium">Caso mais crítico:</span> 
                  <span class="text-slate-900 dark:text-white font-semibold ml-1">{{ criticalClient.client.name }}</span>
                  <span v-if="criticalDaysSince" class="text-amber-600 dark:text-amber-400 ml-1 text-xs font-medium">
                    ({{ criticalDaysSince }} dias ausente)
                  </span>
                </div>
              </div>
            </template>
          </AiContextBadge>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie seus clientes de forma eficiente e inteligente.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          class="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="showImportModal = true">
          <span class="material-symbols-outlined text-[18px] mr-2">download</span>
          Importar do Google
        </button>
        <button 
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="$emit('new')">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Cliente
        </button>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('VIP') 
            ? 'border-green-500 bg-green-100 text-green-900 dark:bg-green-900/50 dark:border-green-500 dark:text-green-100'
            : 'border-green-200 bg-green-50 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50'
        ]"
        @click="toggleFilter('VIP')"
      >
        <span class="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        VIP / Alta Frequência
      </button>
      
      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('AT_RISK')
            ? 'border-red-500 bg-red-100 text-red-900 dark:bg-red-900/50 dark:border-red-500 dark:text-red-100'
            : 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
        ]"
        @click="toggleFilter('AT_RISK')"
      >
        <span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        Em Risco / Ausente
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('NEW')
            ? 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-100'
            : 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
        ]"
        @click="toggleFilter('NEW')"
      >
        <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
        Novo Cliente
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('true')
            ? 'border-slate-500 bg-slate-200 text-slate-900 dark:bg-slate-700 dark:border-slate-400 dark:text-white'
            : 'border-slate-200 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
        @click="toggleFilter('true')"
      >
        <span class="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
        Ativo
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('false')
            ? 'border-neutral-500 bg-neutral-200 text-neutral-900 dark:bg-neutral-800 dark:border-neutral-500 dark:text-white'
            : 'border-neutral-200 bg-neutral-50 text-neutral-600 dark:bg-background-dark dark:border-neutral-700 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        ]"
        @click="toggleFilter('false')"
      >
        <span class="w-2 h-2 rounded-full border border-neutral-400 bg-transparent mr-2"></span>
        Inativo
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchClientsAdapter"
      @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-status="{ item }">
        <span
v-if="item.status" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeClass(item.status)">
          <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.status)"></span>
          {{ getStatusLabel(item.status) }}
        </span>
      </template>
      <template #cell-phone="{ item }">
        {{ formatPhone(item.phone) }}
      </template>

      <template #cell-referredByName="{ item }">
        <router-link 
          v-if="item.referredById" 
          :to="{ name: 'client-detail', params: { id: item.referredById }}"
          @click.stop
        >
          {{ formatShortName(item.referredByName) }}
        </router-link>
        <span v-else>{{ formatShortName(item.referredByName) }}</span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <a v-if="item.phone" :href="getWhatsappLink(item)" target="_blank" class="btn-icon whatsapp" title="WhatsApp">
              💬
          </a>
          <button class="btn-icon delete" @click="$emit('delete', item.id)">✕</button>
        </div>
      </template>
    </GenericTable>
    <GoogleContactsModal 
      :visible="showImportModal" 
      @close="showImportModal = false"
      @import="handleImportGoogle"
    />
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose, onMounted } from 'vue';
import GenericTable from './common/GenericTable.vue';
import GoogleContactsModal from './common/GoogleContactsModal.vue';
import AiContextBadge from './common/AiContextBadge.vue';
import { clientService } from '../services/clientService';
import { formatShortName, formatPhone } from '../utils/formatters';
import { confirmBridge } from '../services/confirmBridge';
import api from '../services/api';

defineEmits(['new', 'edit', 'delete']);

const tableRef = ref(null);
const showImportModal = ref(false);

const handleImportGoogle = async (clients) => {
    try {
        await clientService.createBatch(clients);
        showImportModal.value = false;
        refresh();
        confirmBridge.alert({
          title: 'Importação Concluída',
          message: 'Os contatos foram importados com sucesso!',
          type: 'info'
        });
    } catch (e) {
        console.error(e);
        confirmBridge.alert({
          title: 'Erro na Importação',
          message: 'Ocorreu um erro ao tentar importar os contatos do Google.',
          type: 'danger'
        });
    }
};

// --- AI Insights State ---
const atRiskCount = ref(0);
const criticalClient = ref(null);
const criticalDaysSince = ref(null);

const daysSince = (dateStr) => {
  if (!dateStr) return null;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

const loadAtRiskStats = async () => {
  try {
    const statsResp = await api.get('/reports/client-statistics', {
      params: {
        'client.status': 'AT_RISK',
        page: 0,
        size: 1,
        sort: 'lastVisitDate,asc',
      }
    });
    const page = statsResp.data;
    atRiskCount.value = page.totalElements ?? 0;

    if (page.content && page.content.length > 0) {
      const top = page.content[0];
      criticalClient.value = top;
      criticalDaysSince.value = daysSince(top.lastVisitDate);
    }
  } catch (e) {
    console.warn('Could not load AT_RISK stats for AiContextBadge', e);
  }
};

onMounted(() => {
  loadAtRiskStats();
});

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'status', label: 'Status', sortable: true, width: '140px' },
  { key: 'phone', label: 'Telefone', sortable: false, filterable: true },
  { key: 'referredByName', label: 'Indicado Por', sortable: false },
];

const selectedStatuses = ref([]);

const toggleFilter = (status) => {
  if (status === 'true') {
     selectedStatuses.value = selectedStatuses.value.filter(s => s !== 'false');
  } else if (status === 'false') {
     selectedStatuses.value = selectedStatuses.value.filter(s => s !== 'true');
  }

  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status);
  } else {
    selectedStatuses.value.push(status);
  }
  refresh();
};

const fetchClientsAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };
  
  if (selectedStatuses.value.length > 0) {
    // If true or false are in the selectedStatuses array, we use it for 'active'
    const hasTrue = selectedStatuses.value.includes('true');
    const hasFalse = selectedStatuses.value.includes('false');
    
    if (hasTrue) {
      query.active = true;
    } else if (hasFalse) {
       query.active = false;
    }
  
    // the rest goes to status
    const listStatus = selectedStatuses.value.filter(s => s !== 'true' && s !== 'false');
    if(listStatus.length > 0) {
        query.status = listStatus.join(',');
    }
  }
  
  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await clientService.getAll(query);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const getStatusBadgeClass = (status) => {
  const map = {
    VIP: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    AT_RISK: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    NEW: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  };
  return map[status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
};

const getStatusDotClass = (status) => {
  const map = {
    VIP: 'bg-emerald-500',
    AT_RISK: 'bg-red-500',
    NEW: 'bg-sky-500',
  };
  return map[status] || 'bg-slate-400';
};

const getStatusLabel = (status) => {
  const map = {
    VIP: 'VIP',
    AT_RISK: 'Em Risco',
    NEW: 'Novo',
    ACTIVE: 'Ativo',
  };
  return map[status] || status;
};

const getWhatsappLink = (client) => {
    if (!client.phone) return '#';
    const phone = client.phone.replace(/\D/g, '');
    return `https://wa.me/55${phone}`;
};

defineExpose({ refresh });
</script>

<style>
/* No row-level coloring needed — status is shown via badges */
</style>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.actions-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.btn-icon {
  background: var(--color-bg-card); /* White/Card background */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  transition: all 0.2s;
  color: var(--color-text-muted);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  text-decoration: none; /* Ensure link doesn't have underline */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon.whatsapp {
    filter: grayscale(100%);
    transition: filter 0.2s;
}
.btn-icon.whatsapp:hover {
    filter: grayscale(0%);
    background-color: #dcfce7;
    border-color: #22c55e;
}

.btn-icon.delete {
    color: var(--color-error, #ef4444);
    border-color: var(--color-error, #ef4444);
    opacity: 0.8;
}

.btn-icon.delete:hover {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
  opacity: 1;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
}
</style>

<style>
/* Global styles for row coloring, as GenericTable renders tr */
.client-row-vip {
  background-color: var(--color-status-vip-bg);
  color: var(--color-status-vip-text);
}
.client-row-vip:hover {
  background-color: #bbf7d0 !important; /* Slightly darker green on hover */
}

.client-row-at_risk {
  background-color: var(--color-status-risk-bg);
  color: var(--color-status-risk-text);
}
.client-row-at_risk:hover {
  background-color: #fecaca !important;
}

.client-row-new {
  background-color: var(--color-status-new-bg);
  color: var(--color-status-new-text);
}
.client-row-new:hover {
  background-color: #bae6fd !important;
}
</style>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.actions-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.btn-icon {
  background: var(--color-bg-card); /* White/Card background */
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  transition: all 0.2s;
  color: var(--color-text-muted);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  text-decoration: none; /* Ensure link doesn't have underline */
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon.whatsapp {
    filter: grayscale(100%);
    transition: filter 0.2s;
}
.btn-icon.whatsapp:hover {
    filter: grayscale(0%);
    background-color: #dcfce7;
    border-color: #22c55e;
}

.btn-icon.delete {
    color: var(--color-error, #ef4444);
    border-color: var(--color-error, #ef4444);
    opacity: 0.8;
}

.btn-icon.delete:hover {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
  opacity: 1;
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
}
</style>
