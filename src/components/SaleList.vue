<template>
  <div class="sale-list">
    <div class="header-actions" v-if="!embedded">
      <h2>Vendas</h2>
      <button class="btn btn-primary" @click="$emit('new')">
        + Nova Venda
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-createdAt="{ value }">
        {{ formatDateTime(value) }}
      </template>

      <template #cell-items="{ value }">
        <ul class="items-list">
          <li v-for="item in value" :key="item.id">
            {{ getItemDisplayName(item) }}
          </li>
        </ul>
      </template>

      <template #cell-total="{ value }">
        {{ formatCurrency(value) }}
      </template>

      <template #actions="{ item }" v-if="!embedded">
        <div class="actions-group">
          <button class="btn-icon delete" title="Excluir" @click.stop="$emit('delete', item.id)">✕</button>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref, defineEmits, defineProps, watch, computed } from 'vue';
import GenericTable from './common/GenericTable.vue';
import { saleService } from '../services/saleService';
import { formatDateTime, formatCurrency } from '../utils/formatters';

const props = defineProps({
  embedded: { type: Boolean, default: false },
  clientId: { type: Number, default: null }
});

defineEmits(['new', 'edit', 'delete']);

const tableRef = ref(null);

const columns = computed(() => {
  const cols = [];
  if (!props.embedded) {
    cols.push({ key: 'id', label: '#', width: '50px', sortable: true });
  }
  cols.push({ key: 'createdAt', label: 'Data', sortable: true });
  
  if (!props.clientId) {
    cols.push({ key: 'clientName', label: 'Cliente', sortable: false });
  }

  cols.push(
    { key: 'items', label: 'Itens', sortable: false },
    { key: 'total', label: 'Valor Total', sortable: true, align: 'right' }
  );
  
  return cols;
});

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };
  
  if (props.clientId) {
    query['clientId'] = props.clientId;
  }
  
  const response = await saleService.getAll(query);
  return response.data;
};

const getItemDisplayName = (item) => {
  if (item.type === 'SERVICE') return `[S] ${item.serviceName}`;
  if (item.type === 'PRODUCT') return `[P] ${item.productName}`;
  return item.serviceName || item.productName || 'Item';
};

const refresh = () => {
  tableRef.value?.loadData();
};

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

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.85rem;
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
}

.btn-icon.delete {
    color: #ef4444;
    border-color: #ef4444;
}

.btn-icon.delete:hover {
  background-color: #fee2e2;
}
</style>
