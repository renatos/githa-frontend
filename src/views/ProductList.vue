<template>
  <div class="product-list">
    <div class="header-actions">
      <h2>Produtos</h2>
      <button class="btn btn-primary" @click="openForm()">
        + Novo Produto
      </button>
    </div>

    <div class="status-legend">
      <span 
        class="legend-item active"
        :class="{ selected: selectedStatuses.includes('true') }"
        @click="toggleFilter('true')"
      >
        Ativo
      </span>
      <span 
        class="legend-item inactive"
        :class="{ selected: selectedStatuses.includes('false') }"
        @click="toggleFilter('false')"
      >
        Inativo
      </span>
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
        <span :class="['status-badge', value ? 'active' : 'inactive']">
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
  if (confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
    try {
      await productService.delete(item.id);
      tableRef.value?.loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto. Verifique se existem vendas vinculadas.');
    }
  }
};
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

.legend-item.active::before {
  background-color: var(--color-status-active-bg, #dcfce7);
  border-color: var(--color-text-muted);
}

.legend-item.inactive::before {
  background-color: var(--color-bg-body, #f1f5f9);
  border-color: var(--color-text-muted);
}
</style>
