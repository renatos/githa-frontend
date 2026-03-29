<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Produtos</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie o catálogo de produtos e seu estoque.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="openForm()">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Produto
        </button>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('true') 
            ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:border-emerald-500 dark:text-emerald-100'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
        ]"
        @click="toggleFilter('true')"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Ativo
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('false') 
            ? 'border-slate-500 bg-slate-100 text-slate-900 dark:bg-slate-700 dark:border-slate-500 dark:text-slate-100'
            : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
        ]"
        @click="toggleFilter('false')"
      >
        <span class="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
        Inativo
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="openForm"
    >
      <template #cell-price="{ value }">
        {{ formatCurrency(value) }}
      </template>

      <template #cell-active="{ value }">
        <span
class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
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

    <ProductForm
      v-if="showForm"
      :product="editingItem"
      @close="closeForm"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GenericTable from '@/components/common/GenericTable.vue';
import ProductForm from '@/components/ProductForm.vue';
import productService from '@/services/productService';
import { confirmBridge } from '@/services/confirmBridge';

const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref({});
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

const refresh = () => {
  tableRef.value?.loadData();
};

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'price', label: 'Preço', sortable: true, align: 'right' },
  { key: 'stockQuantity', label: 'Estoque', sortable: true, align: 'right', width: '100px' },
  { key: 'active', label: 'Status', sortable: true, align: 'center', width: '100px' },
];

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const fetchDataAdapter = async (params) => {
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
  }

  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await productService.getAll(query);
  return response.data;
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
    title: 'Excluir Produto',
    message: `Tem certeza que deseja excluir "${item.name}"?`,
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await productService.delete(item.id);
        tableRef.value?.loadData();
      } catch (error) {
        console.error('Error deleting product:', error);
        confirmBridge.alert({
          title: 'Erro ao Excluir',
          message: 'Erro ao excluir produto. Verifique se existem vendas vinculadas.',
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
