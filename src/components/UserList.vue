<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Usuários</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os usuários e seus acessos ao sistema.</p>
      </div>
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="showInactive" type="checkbox" @change="refresh" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-700">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Exibir Inativos</span>
        </label>
        <button 
          @click="$emit('new')"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Usuário
        </button>
      </div>
    </header>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchDataAdapter"
        @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-active="{ value }">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="value ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'">
          <span class="w-1.5 h-1.5 rounded-full" :class="value ? 'bg-emerald-500' : 'bg-slate-400'"></span>
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
import { confirmBridge } from '../services/confirmBridge';

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
    confirmBridge.alert({
      title: 'Erro ao Reativar',
      message: 'Não foi possível reativar o usuário selecionado.',
      type: 'danger'
    });
  }
};

const refresh = () => {
  tableRef.value?.loadData();
};

defineExpose({refresh});
</script>

<style scoped>
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.btn-icon.reactivate {
  color: #166534;
  border-color: #166534;
}

.btn-icon.reactivate:hover {
  background-color: #dcfce7;
}
</style>
