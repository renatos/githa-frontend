<template>
  <div class="appointment-list">
    <div class="header-actions">
      <h2>Agendamentos</h2>
      <button class="btn btn-primary" @click="$emit('new')">
        + Novo Agendamento
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
    >
      <template #cell-client="{ value }">
        {{ value?.name }}
      </template>
      
      <template #cell-professional="{ value }">
        {{ value?.name }}
      </template>

      <template #cell-service="{ value }">
        {{ value?.name }}
      </template>

      <template #cell-startTime="{ value }">
        {{ formatDateTime(value) }}
      </template>

      <template #cell-status="{ value }">
        <span :class="['status-badge', value ? value.toLowerCase() : '']">
          {{ value }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <button class="btn-icon" @click="$emit('edit', item)">✎</button>
          <button class="btn-icon delete" @click="$emit('delete', item.id)">✕</button>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose, defineProps, watch } from 'vue';
import GenericTable from './common/GenericTable.vue';
import { appointmentService } from '../services/appointmentService';
import { formatDateTime } from '../utils/formatters';

const props = defineProps({
  embedded: { type: Boolean, default: false },
  clientId: { type: Number, default: null }
});

defineEmits(['new', 'edit', 'delete']);

const tableRef = ref(null);

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'startTime', label: 'Data', sortable: true },
  // Hide Client column if we are filtering by a specific client
  ...(props.clientId ? [] : [{ key: 'client', label: 'Cliente', sortable: false }]),
  { key: 'professional', label: 'Profissional', sortable: false },
  { key: 'service', label: 'Serviço', sortable: false },
  { key: 'status', label: 'Status', sortable: true, align: 'center' },
];

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };
  
  // Enforce client filtter
  if (props.clientId) {
    query.clientId = props.clientId;
  }
  
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await appointmentService.getAll(query);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

// Reload if clientId changes (e.g. route change)
watch(() => props.clientId, () => {
  refresh();
});

defineExpose({ refresh });
</script>

<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.header-actions h2 {
  color: var(--color-text-main);
  margin: 0;
}

.actions-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.btn-icon {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s;
  color: var(--color-text-main);
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
  border-color: var(--color-text-muted);
}

.btn-icon.delete:hover {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.scheduled {
  background-color: #e0f2fe;
  color: #0369a1;
}

.status-badge.confirmed {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.canceled {
  background-color: #fee2e2;
  color: #991b1b;
}

/* Dark theme adjustments for badges if necessary */
:global([data-theme="dark"]) .status-badge.scheduled {
  background-color: #0c4a6e;
  color: #e0f2fe;
}

:global([data-theme="dark"]) .status-badge.confirmed {
  background-color: #14532d;
  color: #dcfce7;
}

:global([data-theme="dark"]) .status-badge.canceled {
  background-color: #7f1d1d;
  color: #fee2e2;
}
</style>
