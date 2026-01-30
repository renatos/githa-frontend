<template>
  <div class="generic-table-container">
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key"
              :class="{ 'sortable': col.sortable !== false }"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              @click="col.sortable !== false ? toggleSort(col.key) : null"
            >
              <div class="header-content">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable !== false" class="sort-icon">
                  <span v-if="currentSort.key === col.key">
                    {{ currentSort.order === 'asc' ? '↑' : '↓' }}
                  </span>
                  <span v-else class="sort-neutral">↕</span>
                </span>
              </div>
              
              <div v-if="col.filterable" class="filter-container" @click.stop>
                <input 
                  type="text" 
                  class="filter-input"
                  :placeholder="'Filtrar ' + col.label"
                  v-model="filters[col.key]"
                >
              </div>
            </th>
            <th v-if="$slots.actions" class="actions-header">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in processedItems" :key="item.id || item._uid" :class="rowClass(item)">
            <td 
              v-for="col in columns" 
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="'cell-' + col.key" :value="item[col.key]" :item="item">
                <span :class="{'monospace': col.monospace}">{{ item[col.key] }}</span>
              </slot>
            </td>
            <td v-if="$slots.actions" class="actions-cell">
              <slot name="actions" :item="item"></slot>
            </td>
          </tr>
          <tr v-if="processedItems.length === 0">
            <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-cell">
              <slot name="empty">Nenhum registro encontrado.</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Mobile Card View -->
    <div class="cards-wrapper">
      <div v-for="item in processedItems" :key="item.id || item._uid" class="data-card">
        <div v-for="col in columns" :key="col.key" class="card-row">
          <span class="card-label">{{ col.label }}</span>
          <span class="card-value">
             <slot :name="'cell-' + col.key" :value="item[col.key]" :item="item">
                <span :class="{'monospace': col.monospace}">{{ item[col.key] }}</span>
             </slot>
          </span>
        </div>
        <div v-if="$slots.actions" class="card-actions">
           <slot name="actions" :item="item"></slot>
        </div>
      </div>
      <div v-if="processedItems.length === 0" class="empty-state">
         <slot name="empty">Nenhum registro encontrado.</slot>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="fetchData" class="pagination-footer">
      <div class="pagination-info">
        Mostrando {{ totalItems === 0 ? 0 : currentPage * pageSize + 1 }} a 
        {{ Math.min((currentPage + 1) * pageSize, totalItems) }} de {{ totalItems }} registros
      </div>
      <div class="pagination-controls">
        <button 
          class="btn-pagination" 
          :disabled="currentPage === 0 || loading"
          @click="currentPage--"
        >
          ❮ Anterior
        </button>
        <span class="pagination-current">
          Página {{ currentPage + 1 }} de {{ totalPages }}
        </span>
        <button 
          class="btn-pagination" 
          :disabled="currentPage >= totalPages - 1 || loading"
          @click="currentPage++"
        >
          Próximo ❯
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineProps, watch, onMounted, defineExpose } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
    // { key, label, sortable, filterable, width, align, monospace }
  },
  fetchData: {
    type: Function,
    default: null,
  },
  rowClass: {
    type: Function,
    default: () => '',
  },
});

// State
const serverItems = ref([]);
const loading = ref(false);
const totalItems = ref(0);
const currentPage = ref(0); // 0-indexed for API
const pageSize = ref(10);
const totalPages = ref(0);

// Sorting
const currentSort = ref({ key: null, order: 'asc' });

const toggleSort = (key) => {
  if (currentSort.value.key === key) {
    currentSort.value.order = currentSort.value.order === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.value.key = key;
    currentSort.value.order = 'asc';
  }
};

// Filtering
const filters = ref({});

// Data Loading
const loadData = async () => {
  if (!props.fetchData) return;

  loading.value = true;
  try {
    // Prepare params
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      sort: currentSort.value.key ? `${currentSort.value.key},${currentSort.value.order}` : null,
      filters: { ...filters.value },
    };
    
    const result = await props.fetchData(params);
    serverItems.value = result.content;
    totalItems.value = result.totalElements;
    totalPages.value = result.totalPages;
  } catch (error) {
    console.error("Failed to load data", error);
  } finally {
    loading.value = false;
  }
};

// Processing
const processedItems = computed(() => {
  if (props.fetchData) {
    return serverItems.value;
  }

  let result = [...props.items];

  // Client-side filtering
  Object.keys(filters.value).forEach(key => {
    const filterValue = filters.value[key]?.toLowerCase();
    if (filterValue) {
      result = result.filter(item => {
        const itemValue = String(item[key] || '').toLowerCase();
        return itemValue.includes(filterValue);
      });
    }
  });

  // Client-side sorting
  if (currentSort.value.key) {
    result.sort((a, b) => {
      let valA = a[currentSort.value.key];
      let valB = b[currentSort.value.key];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return currentSort.value.order === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();

      if (valA < valB) return currentSort.value.order === 'asc' ? -1 : 1;
      if (valA > valB) return currentSort.value.order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return result;
});

// Watchers
watch([currentPage, pageSize, currentSort], () => {
  if (props.fetchData) loadData();
}, { deep: true });

let debounceTimeout = null;
watch(filters, () => {
  if (props.fetchData) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentPage.value = 0;
      loadData();
    }, 500);
  }
}, { deep: true });

onMounted(() => {
  if (props.fetchData) {
    loadData();
  }
});

defineExpose({ loadData });
</script>

<style scoped>
.generic-table-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

th {
  background-color: var(--color-bg-body);
  color: var(--color-text-muted);
  font-weight: 600;
  font-size: 0.875rem;
  vertical-align: top;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.sortable {
  cursor: pointer;
}

.sortable:hover {
  background-color: var(--color-primary-soft);
}

.sort-neutral {
  opacity: 0.3;
}

.filter-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  outline: none;
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
}

.filter-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

tr:hover td {
  background-color: var(--color-bg-body);
}

.monospace {
  font-family: monospace;
}

.actions-header, .actions-cell, .empty-cell {
  text-align: center;
}

.empty-cell {
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
}

/* Pagination */
.pagination-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-pagination {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--color-text-main);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-pagination:not(:disabled):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-current {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* Base styles for Cards */
.cards-wrapper {
  display: none;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
  flex-direction: column;
}

.data-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.card-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.card-value {
  color: var(--color-text-main);
  text-align: right;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-muted);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .table-wrapper {
    display: none;
  }
  
  .cards-wrapper {
    display: flex;
  }
  
  .pagination-footer {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
