<template>
  <div class="client-list">
    <div class="header-actions">
      <div class="flex align-items-center gap-3">
        <h2 class="m-0">Clientes</h2>
        <AiContextBadge context="CLIENTS" contextName="Clientes" />
      </div>
      <div class="header-buttons">
          <button class="btn btn-secondary" @click="showImportModal = true">
            Importar do Google
          </button>
          <button class="btn btn-primary" @click="$emit('new')">
            + Novo Cliente
          </button>
      </div>
    </div>

    <div class="status-legend">
      <span 
        class="legend-item vip" 
        :class="{ selected: selectedStatuses.includes('VIP') }"
        @click="toggleFilter('VIP')"
      >
        VIP / Alta Frequência
      </span>
      <span 
        class="legend-item at_risk"
        :class="{ selected: selectedStatuses.includes('AT_RISK') }"
        @click="toggleFilter('AT_RISK')"
      >
        Em Risco / Ausente
      </span>
      <span 
        class="legend-item new"
        :class="{ selected: selectedStatuses.includes('NEW') }"
        @click="toggleFilter('NEW')"
      >
        Novo Cliente
      </span>
      <span 
        class="legend-item active"
        :class="{ selected: selectedStatuses.includes('ACTIVE') }"
        @click="toggleFilter('ACTIVE')"
      >
        Ativo
      </span>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchClientsAdapter"
      :row-class="getRowClass"
      @row-click="(item) => $emit('edit', item)"
    >
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
import { ref, defineEmits, defineExpose } from 'vue';
import GenericTable from './common/GenericTable.vue';
import GoogleContactsModal from './common/GoogleContactsModal.vue';
import AiContextBadge from './common/AiContextBadge.vue';
import { clientService } from '../services/clientService';
import { formatShortName, formatPhone } from '../utils/formatters';

defineEmits(['new', 'edit', 'delete']);

const tableRef = ref(null);
const showImportModal = ref(false);

const handleImportGoogle = async (clients) => {
    try {
        await clientService.createBatch(clients);
        showImportModal.value = false;
        refresh();
        alert('Contatos importados com sucesso!');
    } catch (e) {
        console.error(e);
        alert('Erro ao importar contatos.');
    }
};

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'email', label: 'Email', sortable: true, filterable: true },
  { key: 'phone', label: 'Telefone', sortable: false, filterable: true },
  { key: 'referredByName', label: 'Indicado Por', sortable: false },
];


const selectedStatuses = ref([]);

const toggleFilter = (status) => {
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
    query.status = selectedStatuses.value.join(',');
  }
  
  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await clientService.getAll(query);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const getRowClass = (item) => {
  if (!item.status) return '';
  // status is likely UpperCase from backend (VIP), css uses lower (vip)
  return `client-row-${item.status.toLowerCase()}`;
};

const getWhatsappLink = (client) => {
    if (!client.phone) return '#';
    const phone = client.phone.replace(/\D/g, '');
    return `https://wa.me/55${phone}`;
};

defineExpose({ refresh });
</script>

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

.status-legend {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  border: 1px solid transparent;
  opacity: 0.7; /* Dimmed by default */
}

.legend-item:hover {
  background-color: var(--color-bg-body);
}

.legend-item.selected {
  opacity: 1;
  border-color: var(--color-border);
  background-color: var(--color-bg-card);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  font-weight: 600;
}

.legend-item::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
}

.legend-item.vip::before {
  background-color: var(--color-status-vip-bg);
  border-color: var(--color-status-vip-text);
}

.legend-item.at_risk::before {
  background-color: var(--color-status-risk-bg);
  border-color: var(--color-status-risk-text);
}

.legend-item.new::before {
  background-color: var(--color-status-new-bg);
  border-color: var(--color-status-new-text);
}

.legend-item.active::before {
  background-color: var(--color-status-active-bg);
  border-color: var(--color-text-muted);
}

.header-buttons {
    display: flex;
    gap: 0.5rem;
}
</style>
