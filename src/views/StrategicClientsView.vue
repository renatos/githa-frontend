<template>
  <div class="strategic-clients-view">
    <div class="page-header">
      <div class="header-left">
        <h1>Clientes Estratégicos</h1>
        <p class="subtitle">Gestão de carteira baseada em performance e risco.</p>
      </div>
      <div class="header-actions">
        <button :disabled="recalculating" class="btn btn-secondary" @click="recalculate">
          {{ recalculating ? 'Calculando...' : '🔄 Recalcular Todos' }}
        </button>
      </div>
    </div>

    <div class="filters-card">
      <h3>Filtros de Status</h3>
      <div class="status-filters">
        <label v-for="status in statuses" :key="status.value" class="checkbox-label">
          <input v-model="selectedStatuses" :value="status.value" type="checkbox" @change="refresh">
          <span :class="['badge', status.class]">{{ status.label }}</span>
        </label>
      </div>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchStatsAdapter"
        :row-class="rowClass"
        @row-click="handleRowClick"
    >
      <template #cell-client.name="{ item }">
        {{ item.client.name }}
      </template>

      <template #cell-client.status="{ item }">
        <span :class="['status-badge', item.client.status ? item.client.status.toLowerCase() : '']">
          {{ item.client.status }}
        </span>
      </template>

      <template #cell-totalSpent="{ item }">
        {{ formatCurrency(item.totalSpent) }}
      </template>

      <template #cell-lastVisitDate="{ item }">
        {{ formatDate(item.lastVisitDate) }}
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <a v-if="item.client.phone" :href="getWhatsappLink(item.client)" class="btn-icon whatsapp" target="_blank"
             title="WhatsApp">
            💬
          </a>
          <router-link
              :to="{ name: 'client-detail', params: { id: item.client.id }, query: { from: 'strategic-clients' }}"
              class="btn-icon" title="Ver Detalhes">
            👤
          </router-link>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import GenericTable from '../components/common/GenericTable.vue';
import api from '../services/api';
import {formatCurrency, formatDate} from '../utils/formatters';

const tableRef = ref(null);
const recalculating = ref(false);
const selectedStatuses = ref([]);
const route = useRoute();
const router = useRouter();

const statuses = [
  {value: 'VIP', label: 'VIP', class: 'vip'},
  {value: 'AT_RISK', label: 'Em Risco', class: 'at_risk'},
  {value: 'NEW', label: 'Novo', class: 'new'},
  {value: 'ACTIVE', label: 'Ativo', class: 'active'},
  {value: 'INACTIVE', label: 'Inativo', class: 'inactive'}
];

const columns = [
  {key: 'client.name', label: 'Cliente', sortable: true},
  {key: 'client.status', label: 'Status', sortable: true, width: '120px'},
  {key: 'calculatedScore', label: 'Score', sortable: true, width: '100px'},
  {key: 'totalVisits', label: 'Visitas', sortable: true, width: '100px'},
  {key: 'totalSpent', label: 'Total Gasto', sortable: true, width: '150px'},
  {key: 'lastVisitDate', label: 'Última Visita', sortable: true, width: '150px'},
];

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
  tableRef.value.loadData();
};

const recalculate = async () => {
  try {
    recalculating.value = true;
    await api.post('/reports/client-statistics/recalculate');
    refresh();
  } catch (e) {
    alert('Erro ao recalcular');
  } finally {
    recalculating.value = false;
  }
};

const getWhatsappLink = (client) => {
  const phone = client.phone.replace(/\D/g, '');
  return `https://wa.me/55${phone}`;
};

const rowClass = (item) => {
  if (route.query.highlight && String(item.client.id) === String(route.query.highlight)) {
    return 'highlight-row';
  }
  return '';
};

const handleRowClick = (item) => {
  // Navigate to client detail
  // We maintain the 'from' query param to allow back navigation logic to work
  router.push({
    name: 'client-detail',
    params: {id: item.client.id},
    query: {from: 'strategic-clients'}
  });
};
</script>

<style scoped>
.strategic-clients-view {
  padding: var(--spacing-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.filters-card {
  background-color: var(--color-bg-card);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-md);
}

.status-filters {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.vip {
  background-color: var(--color-status-vip-bg);
  color: var(--color-status-vip-text);
}

.badge.at_risk {
  background-color: var(--color-status-risk-bg);
  color: var(--color-status-risk-text);
}

.badge.new {
  background-color: var(--color-status-new-bg);
  color: var(--color-status-new-text);
}

.badge.active {
  background-color: var(--color-status-active-bg);
  color: var(--color-text-muted);
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.vip {
  background-color: var(--color-status-vip-bg);
  color: var(--color-status-vip-text);
}

.status-badge.at_risk {
  background-color: var(--color-status-risk-bg);
  color: var(--color-status-risk-text);
}

.status-badge.new {
  background-color: var(--color-status-new-bg);
  color: var(--color-status-new-text);
}

.status-badge.active {
  background-color: var(--color-status-active-bg);
  color: var(--color-text-muted);
}

.btn-icon.whatsapp {
  filter: grayscale(100%);
  transition: filter 0.2s;
}

.btn-icon.whatsapp:hover {
  filter: grayscale(0%);
  background-color: #dcfce7;
}

:deep(.highlight-row) td {
  background-color: var(--color-highlight-row, #fffbeb) !important;
  transition: background-color 0.5s;
}
</style>
