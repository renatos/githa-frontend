<template>
  <div class="appointment-list">
    <div class="header-actions" v-if="!embedded">
      <h2>Agendamentos</h2>
      <button class="btn btn-primary" @click="$emit('new')">
        + Novo Agendamento
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="(item) => $emit('edit', item)"
    >


      <template #cell-startTime="{ value }">
        {{ formatDateTime(value) }}
      </template>

      <template #cell-status="{ value, item }">
        <span :class="['status-badge', value ? value.toLowerCase() : '']">
          {{ item.statusDescription }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <!-- Quick actions -->
          <button v-if="['SCHEDULED', 'MISSED'].includes(item.status)" 
                  class="btn-icon confirm" 
                  title="Confirmar" 
                  @click="$emit('confirm', item)">
            ✓
          </button>
          
          <button v-if="['SCHEDULED', 'CONFIRMED'].includes(item.status)" 
                  class="btn-icon complete" 
                  title="Concluir" 
                  @click="$emit('complete', item)">
            ★
          </button>
          
          <button v-if="['SCHEDULED', 'CONFIRMED'].includes(item.status)" 
                  class="btn-icon cancel" 
                  title="Cancelar" 
                  @click="$emit('cancel', item)">
            ✕
          </button>

          <div class="divider"></div>

          <button class="btn-icon" title="Adicionar Procedimento" @click="$emit('add-procedure', item)">+</button>
          
          <button 
            class="btn-icon delete" 
            :title="getDeleteTitle(item)"
            :disabled="isActionDisabled(item)"
            :class="{ 'disabled': isActionDisabled(item) }"
            @click="!isActionDisabled(item) && $emit('delete', item.id)">
            ✕
          </button>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineExpose, defineProps, watch, onMounted } from 'vue';
import GenericTable from './common/GenericTable.vue';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
import { formatDateTime } from '../utils/formatters';

const props = defineProps({
  embedded: { type: Boolean, default: false },
  clientId: { type: Number, default: null }
});

defineEmits(['new', 'edit', 'delete', 'confirm', 'complete', 'cancel', 'add-procedure']);

const tableRef = ref(null);
const isAdmin = ref(false);

const checkUserRole = () => {
  const user = authService.getCurrentUser();
  isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

const isActionDisabled = (item) => {
  return item.status === 'COMPLETED' && !isAdmin.value;
};

const getEditTitle = (item) => {
  if (isActionDisabled(item)) {
    return 'Atendimento concluído, acesso permitido apenas para ADMIN';
  }
  return 'Editar';
};

const getDeleteTitle = (item) => {
  if (isActionDisabled(item)) {
    return 'Atendimento concluído, acesso permitido apenas para ADMIN';
  }
  return 'Excluir';
};

onMounted(() => {
  checkUserRole();
});



const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'startTime', label: 'Data', sortable: true },
  // Hide Client column if we are filtering by a specific client
  ...(props.clientId ? [] : [{ key: 'clientName', label: 'Cliente', sortable: false }]),
  { key: 'professionalName', label: 'Profissional', sortable: false },
  { key: 'serviceName', label: 'Serviço', sortable: false },
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
    query['client.id'] = props.clientId;
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
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  transition: all 0.2s;
  color: var(--color-text-muted);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-icon:hover {
  background-color: var(--color-bg-body);
  border-color: var(--color-primary);
  color: var(--color-primary);
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

.btn-icon.confirm:hover {
    background-color: #dcfce7;
    border-color: #166534;
    color: #166534;
}

.btn-icon.complete:hover {
    background-color: #e0f2fe;
    border-color: #0369a1;
    color: #0369a1;
}

.btn-icon.cancel:hover {
    background-color: #fee2e2;
    border-color: #991b1b;
    color: #991b1b;
    opacity: 1;
}

.divider {
    width: 1px;
    background-color: var(--color-border);
    margin: 0 4px;
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

.status-badge.completed {
  background-color: #f3f4f6;
  color: #374151;
}

.status-badge.missed {
  background-color: #ffedd5;
  color: #9a3412;
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

:global([data-theme="dark"]) .status-badge.completed {
  background-color: #374151;
  color: #f3f4f6;
}

:global([data-theme="dark"]) .status-badge.missed {
  background-color: #7c2d12;
  color: #ffedd5;
}

.btn-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  /* pointer-events: none; - Removed to allow tooltips */
}
</style>
