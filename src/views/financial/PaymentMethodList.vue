<template>
  <div class="payment-method-list">
    <div class="header-actions">
      <h2>Formas de Pagamento</h2>
      <button class="btn btn-primary" @click="$router.push('/payment-methods/new')">
        + Nova Forma de Pagamento
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="(item) => $router.push(`/payment-methods/${item.id}`)"
    >
      <template #cell-discountPercentage="{ value }">
        {{ formatPercentage(value) }}
      </template>

      <template #cell-active="{ value }">
        <span :class="['status-badge', value ? 'active' : 'inactive']">
          {{ value ? 'Ativo' : 'Inativo' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="actions-group">
          <button class="btn-icon delete" @click.stop="confirmDelete(item)">✕</button>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import GenericTable from '@/components/common/GenericTable.vue';
import paymentMethodService from '@/services/paymentMethodService';

const router = useRouter();
const tableRef = ref(null);

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'discountPercentage', label: 'Desconto (%)', sortable: true, align: 'right' },
  { key: 'active', label: 'Status', sortable: true, align: 'center', width: '100px' },
  { key: 'actions', label: 'Ações', align: 'center', width: '80px', sortable: false }
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
      item.code.toLowerCase().includes(searchTerm)
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
  const paginatedData = filteredData.slice(start, end);
  
  return {
    content: paginatedData,
    number: params.page,
    size: params.size,
    totalElements: filteredData.length
  };
};

const confirmDelete = async (item) => {
  if (confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
    try {
      await paymentMethodService.delete(item.id);
      tableRef.value?.loadData();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert('Erro ao excluir. Verifique se existem registros vinculados.');
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
</style>
