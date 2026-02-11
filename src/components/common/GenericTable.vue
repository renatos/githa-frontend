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
          <tr v-for="item in processedItems" :key="item.id || item._uid" :class="rowClass(item)" class="clickable-row" @click="emit('row-click', item)">
            <td 
              v-for="col in columns" 
              :key="col.key"
              :style="{ textAlign: col.align || 'left' }"
            >
              <slot :name="'cell-' + col.key" :value="item[col.key]" :item="item">
                <span :class="{'monospace': col.monospace}">{{ item[col.key] }}</span>
              </slot>
            </td>
            <td v-if="$slots.actions" class="actions-cell" @click.stop>
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
    
    <!-- Mobile Search and Sort Controls -->
    <div class="mobile-controls" v-if="filterableColumns.length > 0 || sortableColumns.length > 0">
      <div class="mobile-search" v-if="filterableColumns.length > 0">
        <div class="mobile-search-row">
          <select v-model="mobileSearchField" class="mobile-select">
            <option v-for="col in filterableColumns" :key="col.key" :value="col.key">
              {{ col.label }}
            </option>
          </select>
          <div class="mobile-search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              class="mobile-search-input"
              placeholder="Pesquisar..."
              v-model="mobileSearchValue"
            >
            <button v-if="mobileSearchValue" class="clear-search" @click="mobileSearchValue = ''">✕</button>
          </div>
        </div>
      </div>
      <div class="mobile-sort" v-if="sortableColumns.length > 0">
        <span class="mobile-sort-label">Ordenar:</span>
        <select v-model="mobileSortKey" class="mobile-select">
          <option value="">—</option>
          <option v-for="col in sortableColumns" :key="col.key" :value="col.key">
            {{ col.label }}
          </option>
        </select>
        <button 
          v-if="mobileSortKey" 
          class="mobile-sort-dir" 
          @click="toggleMobileSortOrder"
        >
          {{ currentSort.order === 'asc' ? '↑ Crescente' : '↓ Decrescente' }}
        </button>
      </div>
    </div>

    <!-- Mobile Card View -->
    <div class="cards-wrapper">
      <div v-for="item in processedItems" :key="item.id || item._uid" class="data-card" @click="emit('row-click', item)">
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
import { systemParameterService } from '../../services/systemParameterService';
import { SystemParams } from '../../constants/SystemParams';

const props = defineProps({
// ... (keep props as is, but I can't reference them easily in replace_file_content if I don't include them or use context. I will assume they are unchanged)
  items: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    required: true,
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

const emit = defineEmits(['row-click']);

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

// Mobile controls
const filterableColumns = computed(() => props.columns.filter(c => c.filterable));
const sortableColumns = computed(() => props.columns.filter(c => c.sortable !== false));

const mobileSearchField = ref('');
const mobileSearchValue = ref('');

const mobileSortKey = computed({
  get: () => currentSort.value.key || '',
  set: (val) => {
    currentSort.value.key = val || null;
    if (val && !currentSort.value.order) {
      currentSort.value.order = 'asc';
    }
  }
});

const toggleMobileSortOrder = () => {
  currentSort.value.order = currentSort.value.order === 'asc' ? 'desc' : 'asc';
};

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

// Mobile search sync
watch(mobileSearchValue, (newVal) => {
  if (mobileSearchField.value) {
    filters.value[mobileSearchField.value] = newVal;
  }
});

watch(mobileSearchField, (newField, oldField) => {
  if (oldField) {
    filters.value[oldField] = '';
  }
  if (newField && mobileSearchValue.value) {
    filters.value[newField] = mobileSearchValue.value;
  }
});



onMounted(async () => {
  try {
    const response = await systemParameterService.getParameterValue(SystemParams.PAGINATION_SIZE);
    if (response.data && response.data.value) {
       const configuredSize = parseInt(response.data.value);
       if (!isNaN(configuredSize) && configuredSize > 0) {
         pageSize.value = configuredSize;
       }
    }
  } catch (e) {
    console.warn('Could not load system parameters', e);
  }

  // Initialize mobile search field to first filterable column
  if (filterableColumns.value.length > 0) {
    mobileSearchField.value = filterableColumns.value[0].key;
  }

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

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover td {
  background-color: var(--color-primary-soft, #f0f4ff);
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
  cursor: pointer;
  transition: all 0.2s;
}

.data-card:active {
  background-color: var(--color-bg-body);
  box-shadow: var(--shadow-sm), 0 0 0 2px var(--color-primary-soft);
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

/* Mobile Controls */
.mobile-controls {
  display: none;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-bg-body);
  border-bottom: 1px solid var(--color-border);
}

.mobile-search-row {
  display: flex;
  gap: var(--spacing-xs);
}

.mobile-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--color-bg-card);
  color: var(--color-text-main);
  min-width: 100px;
  appearance: auto;
}

.mobile-search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.5;
  pointer-events: none;
}

.mobile-search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 1.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.875rem;
  background: var(--color-bg-card);
  color: var(--color-text-main);
  outline: none;
}

.mobile-search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-soft);
}

.clear-search {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  padding: 0.25rem;
  line-height: 1;
}

.clear-search:hover {
  color: var(--color-error, #ef4444);
}

.mobile-sort {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.mobile-sort-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.mobile-sort-dir {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-primary);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.mobile-sort-dir:hover {
  background-color: var(--color-primary-soft);
  border-color: var(--color-primary);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .table-wrapper {
    display: none;
  }
  
  .mobile-controls {
    display: flex;
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
