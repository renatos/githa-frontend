<template>
  <div class="user-list">
    <div class="header-actions">
      <h2>Usuários</h2>
      <div class="actions-right">
        <label class="checkbox-container">
          <input v-model="showInactive" type="checkbox" @change="refresh">
          Exibir Inativos
        </label>
        <button class="btn btn-primary" @click="$emit('new')">
          + Novo Usuário
        </button>
      </div>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchDataAdapter"
        @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-active="{ value }">
        <span :class="['status-badge', value ? 'active' : 'inactive']">
          {{ value ? 'Ativo' : 'Inativo' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <button v-if="!showInactive" class="btn-icon delete" @click="$emit('delete', item.id)">✕</button>
          <button v-if="showInactive" class="btn-icon reactivate" title="Reativar" @click="reactivateUser(item.id)">♻
          </button>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import {ref, defineEmits, defineExpose} from 'vue';
import GenericTable from './common/GenericTable.vue';
import {userService} from '../services/userService';

defineEmits(['new', 'edit', 'delete']);

const tableRef = ref(null);
const showInactive = ref(false);

const columns = [
  {key: 'id', label: '#', width: '50px', sortable: true},
  {key: 'name', label: 'Nome', sortable: true, filterable: true},
  {key: 'email', label: 'Email', sortable: true, filterable: true},
  {key: 'active', label: 'Status', sortable: true, align: 'center'},
];

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };

  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  if (showInactive.value) {
    // Inactive endpoint returns a list, not a page structure yet (based on backend implementation)
    // So we wrap it to match the expected structure if needed, or component handles list
    const response = await userService.getInactive();
    // Mock page response structure for the table
    return {
      content: response.data,
      totalElements: response.data.length,
      size: response.data.length,
      number: 0
    };
  } else {
    const response = await userService.getAll(query);
    return response.data;
  }
};

const reactivateUser = async (id) => {
  try {
    await userService.reactivate(id);
    refresh();
  } catch (e) {
    console.error("Failed to reactivate", e);
    alert("Erro ao reativar usuário");
  }
};

const refresh = () => {
  tableRef.value?.loadData();
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background-color: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background-color: #f1f5f9;
  color: #64748b;
}

.actions-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-icon.reactivate {
  color: #166534;
  border-color: #166534;
}

.btn-icon.reactivate:hover {
  background-color: #dcfce7;
}
</style>
