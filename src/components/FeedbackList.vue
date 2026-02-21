<template>
  <div class="feedback-list">
    <div class="header-actions">
      <div class="flex align-items-center gap-3">
        <h2 class="m-0">Feedbacks e Suporte</h2>
        <AiContextBadge context="FEEDBACKS" contextName="Feedbacks" />
      </div>
      <div class="header-buttons">
        <button class="btn btn-primary" @click="$emit('new')">
          + Novo Feedback
        </button>
      </div>
    </div>

    <div class="status-legend">
      <span
          :class="{ selected: selectedStatuses.includes('NEW') }"
          class="legend-item new"
          @click="toggleFilter('NEW')"
      >
        Novo
      </span>
      <span
          :class="{ selected: selectedStatuses.includes('ACCEPTED') }"
          class="legend-item accepted"
          @click="toggleFilter('ACCEPTED')"
      >
        Em Análise
      </span>
      <span
          :class="{ selected: selectedStatuses.includes('IMPLEMENTED') }"
          class="legend-item implemented"
          @click="toggleFilter('IMPLEMENTED')"
      >
        Concluído
      </span>
      <span
          :class="{ selected: selectedStatuses.includes('REJECTED') }"
          class="legend-item rejected"
          @click="toggleFilter('REJECTED')"
      >
        Rejeitado
      </span>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchDataAdapter"
        :row-class="getRowClass"
        @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-feedbackType="{ item }">
        <span
            :class="'badge type-' + item.feedbackType.toLowerCase()">{{ formatType(item.feedbackType) }}</span>
      </template>

      <template #cell-feedbackStatus="{ item }">
        <span :class="'badge status-' + item.feedbackStatus.toLowerCase()">{{ formatStatus(item.feedbackStatus) }}</span>
      </template>

      <template #cell-user="{ item }">
        {{ item.user ? item.user.name : '-' }}
      </template>

      <template #cell-reporter="{ item }">
        {{ item.reporter ? item.reporter.name : '-' }}
      </template>

      <template #cell-createdAt="{ item }">
        {{ formatDateTime(item.createdAt) }}
      </template>

    </GenericTable>
  </div>
</template>

<script setup>
import {ref, defineEmits, defineExpose} from 'vue';
import GenericTable from './common/GenericTable.vue';
import AiContextBadge from './common/AiContextBadge.vue';
import {feedbackService} from '../services/feedbackService';
import {formatDateTime} from '../utils/formatters';

defineEmits(['new', 'edit']);

const tableRef = ref(null);
const selectedStatuses = ref([]);

const columns = [
  {key: 'id', label: '#', width: '50px', sortable: true},
  {key: 'title', label: 'Título', sortable: true, filterable: true},
  {key: 'feedbackType', label: 'Tipo', sortable: true, filterable: true},
  {key: 'feedbackStatus', label: 'Status', sortable: true, filterable: true},
  {key: 'reporter', label: 'Relator', sortable: false},
  {key: 'createdAt', label: 'Data', sortable: true},
];

const toggleFilter = (status) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status);
  } else {
    selectedStatuses.value.push(status);
  }
  refresh();
};

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };

  if (selectedStatuses.value.length > 0) {
    query.feedbackStatus = selectedStatuses.value.join(',');
  }

  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await feedbackService.getAll(query);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const getRowClass = (item) => {
  if (!item.feedbackStatus) return '';
  return `feedback-row-${item.feedbackStatus.toLowerCase()}`;
};

const formatType = (type) => {
  const map = {
    'BUG': 'Erro',
    'FEATURE': 'Nova Funcionalidade',
    'IMPROVEMENT': 'Melhoria',
    'SUGGESTION': 'Sugestão da IA'
  };
  return map[type] || type;
};

const formatStatus = (status) => {
  const map = {
    'NEW': 'Novo',
    'ACCEPTED': 'Em Análise',
    'IN_PROGRESS': 'Em Andamento',
    'REJECTED': 'Rejeitado',
    'IMPLEMENTED': 'Concluído'
  };
  return map[status] || status;
};

defineExpose({refresh});
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
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
  opacity: 0.7;
}

.legend-item:hover {
  background-color: var(--color-bg-body);
}

.legend-item.selected {
  opacity: 1;
  border-color: var(--color-border);
  background-color: var(--color-bg-card);
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

/* Status colors - adapt based on status */
.legend-item.new::before, .badge.status-new {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white
}

.legend-item.accepted::before, .badge.status-accepted {
  background-color: #f59e0b;
  border-color: #f59e0b;
  color: white
}

.legend-item.implemented::before, .badge.status-implemented {
  background-color: #10b981;
  border-color: #10b981;
  color: white
}

.legend-item.rejected::before, .badge.status-rejected {
  background-color: #ef4444;
  border-color: #ef4444;
  color: white
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.type-bug {
  background-color: #fee2e2;
  color: #ef4444;
}

.badge.type-feature {
  background-color: #dbeafe;
  color: #3b82f6;
}

.badge.type-improvement {
  background-color: #f3e8ff;
  color: #a855f7;
}

.badge.type-suggestion {
  background-color: #ecfdf5;
  color: #059669;
}

.btn-icon {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  cursor: pointer;
  padding: 4px 8px;
}
</style>
