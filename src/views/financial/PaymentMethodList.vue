<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Formas de Pagamento</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os métodos de pagamento e descontos aplicáveis.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="openForm()"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Nova Forma de Pagamento
        </button>
      </div>
    </header>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="openForm"
    >
      <template #cell-discountPercentage="{ value }">
        {{ formatPercentage(value) }}
      </template>

      <template #cell-active="{ value }">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="value ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'">
          <span class="w-1.5 h-1.5 rounded-full" :class="value ? 'bg-emerald-500' : 'bg-slate-400'"></span>
          {{ value ? 'Ativo' : 'Inativo' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <button class="btn-icon delete" @click.stop="confirmDelete(item)">✕</button>
        </div>
      </template>
    </GenericTable>

    <PaymentMethodForm
      v-if="showForm"
      :payment-method="editingItem"
      @close="closeForm"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GenericTable from '@/components/common/GenericTable.vue';
import PaymentMethodForm from '@/components/financial/PaymentMethodForm.vue';
import paymentMethodService from '@/services/paymentMethodService';
import { confirmBridge } from '@/services/confirmBridge';

const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref({});

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'discountPercentage', label: 'Desconto (%)', sortable: true, align: 'right' },
  { key: 'active', label: 'Status', sortable: true, align: 'center', width: '100px' },
];

const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%';
  return `${value}%`;
};

const fetchDataAdapter = async (params) => {
  const response = await paymentMethodService.getAll();
  const allData = response.data;

  let filteredData = allData;
  if (params.filters && params.filters.name) {
    const searchTerm = params.filters.name.toLowerCase();
    filteredData = allData.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      item.code?.toLowerCase().includes(searchTerm)
    );
  }

  if (params.sort) {
    const [field, direction] = params.sort.split(',');
    filteredData.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return direction === 'desc' ? -comparison : comparison;
    });
  }

  const start = params.page * params.size;
  const end = start + params.size;
  return {
    content: filteredData.slice(start, end),
    number: params.page,
    size: params.size,
    totalElements: filteredData.length
  };
};

const openForm = (item = {}) => {
  editingItem.value = { ...item };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = {};
};

const onSave = () => {
  closeForm();
  tableRef.value?.loadData();
};

const confirmDelete = async (item) => {
  confirmBridge.confirm({
    title: 'Excluir Forma de Pagamento',
    message: `Tem certeza que deseja excluir "${item.name}"?`,
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await paymentMethodService.delete(item.id);
        tableRef.value?.loadData();
      } catch (error) {
        console.error('Error deleting payment method:', error);
        confirmBridge.alert({
          title: 'Erro ao Excluir',
          message: 'Erro ao excluir. Verifique se existem registros vinculados.',
          type: 'danger'
        });
      }
    }
  });
};
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
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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
</style>
