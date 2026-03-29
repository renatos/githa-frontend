<template>
  <div class="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col w-full">
    <div class="overflow-x-auto hidden md:block">
      <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead class="bg-slate-50 dark:bg-slate-900">
        <tr>
          <th
              v-for="col in columns"
              :key="col.key"
              :class="[col.class, { 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors': col.sortable !== false }]"
              class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider relative group"
              :style="{ width: col.width, textAlign: col.align || 'left' }"
              @click="col.sortable !== false ? toggleSort(col.key) : null"
          >
            <div class="flex flex-col gap-2">
              <div
                  :style="{ justifyContent: col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'space-between' }"
                  class="flex items-center select-none w-full">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable !== false" class="ml-2">
                    <span v-if="currentSort.key === col.key" class="text-indigo-600 dark:text-indigo-400">
                      <span class="material-symbols-outlined text-[16px] font-bold">{{ currentSort.order === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</span>
                    </span>
                    <span v-else class="material-symbols-outlined text-[16px] text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors">swap_vert</span>
                  </span>
              </div>
  
              <div v-if="col.filterable" class="relative w-full" @click.stop>
                <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <span class="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[16px]">search</span>
                </div>
                <input
                    v-model="filters[col.key]"
                    :placeholder="'Filtrar ' + col.label"
                    class="block w-full text-xs rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white pl-8 pr-2 py-1 font-normal normal-case"
                    type="text"
                >
              </div>
            </div>
          </th>
          <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
        </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
        <tr
v-for="item in processedItems" :key="item.id || item._uid" :class="rowClass(item)" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            @click="emit('row-click', item)">
          <td
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
              :class="[col.class, { 'whitespace-nowrap': col.nowrap !== false, 'break-words': col.nowrap === false }]"
              :style="{ textAlign: col.align || 'left' }"
          >
            <slot :item="item" :name="'cell-' + col.key" :value="item[col.key]">
              <span :class="{'font-mono': col.monospace}">{{ item[col.key] }}</span>
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium" @click.stop>
            <slot :item="item" name="actions"></slot>
          </td>
        </tr>
        <tr v-if="processedItems.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
            <slot name="empty">Nenhum registro encontrado.</slot>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Search and Sort Controls -->
    <div v-if="filterableColumns.length > 0 || sortableColumns.length > 0" class="mobile-controls">
      <div v-if="filterableColumns.length > 0" class="mobile-search">
        <div class="mobile-search-row">
          <select v-model="mobileSearchField" class="mobile-select">
            <option v-for="col in filterableColumns" :key="col.key" :value="col.key">
              {{ col.label }}
            </option>
          </select>
          <div class="mobile-search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input
                v-model="mobileSearchValue"
                class="mobile-search-input"
                placeholder="Pesquisar..."
                type="text"
            >
            <button v-if="mobileSearchValue" class="clear-search" @click="mobileSearchValue = ''">✕</button>
          </div>
        </div>
      </div>
      <div v-if="sortableColumns.length > 0" class="mobile-sort">
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
      <div
v-for="item in processedItems" :key="item.id || item._uid" class="data-card"
           @click="emit('row-click', item)">
        <div v-for="col in columns" :key="col.key" class="card-row">
          <span class="card-label">{{ col.label }}</span>
          <span class="card-value">
             <slot :item="item" :name="'cell-' + col.key" :value="item[col.key]">
                <span :class="{'monospace': col.monospace}">{{ item[col.key] }}</span>
             </slot>
          </span>
        </div>
        <div v-if="$slots.actions" class="card-actions">
          <slot :item="item" name="actions"></slot>
        </div>
      </div>
      <div v-if="processedItems.length === 0" class="empty-state">
        <slot name="empty">Nenhum registro encontrado.</slot>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="fetchData" class="bg-white dark:bg-slate-800 px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between mt-auto gap-4">
      <div class="flex-1 flex flex-col sm:flex-row items-center justify-between w-full gap-4">
        <div class="text-center sm:text-left">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Mostrando <span class="font-medium">{{ totalItems === 0 ? 0 : currentPage * pageSize + 1 }}</span> a
            <span class="font-medium">{{ Math.min((currentPage + 1) * pageSize, totalItems) }}</span> de <span class="font-medium">{{ totalItems }}</span> registros
          </p>
        </div>
        <div class="flex justify-center w-full sm:w-auto">
          <nav aria-label="Pagination" class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-x-auto max-w-full">
            <button
                :disabled="currentPage === 0 || loading"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="currentPage--"
            >
              <span class="sr-only">Anterior</span>
              <span class="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            
            <template v-for="(page, index) in visiblePages" :key="index">
              <span v-if="page === '...'" class="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-400 cursor-default">
                ...
              </span>
              <button
v-else :class="[
                  page - 1 === currentPage 
                    ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
                @click="currentPage = page - 1">
                {{ page }}
              </button>
            </template>

            <button
                :disabled="currentPage >= totalPages - 1 || loading"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="currentPage++"
            >
              <span class="sr-only">Próximo</span>
              <span class="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref, defineProps, watch, onMounted, defineExpose} from 'vue';
import {systemParameterService} from '../../services/systemParameterService';
import {SystemParams} from '../../constants/SystemParams';

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
const currentSort = ref({key: null, order: 'asc'});

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

// Load Data logic
const loadData = async () => {
  if (!props.fetchData) return;

  loading.value = true;
  try {
    // Prepare params
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      sort: currentSort.value.key ? `${currentSort.value.key},${currentSort.value.order}` : null,
      filters: {...filters.value},
    };

    const result = await props.fetchData(params);
    serverItems.value = result.content;
    totalItems.value = result.totalElements || 0;
    totalPages.value = result.totalPages !== undefined ? result.totalPages : Math.ceil((result.totalElements || 0) / pageSize.value);
  } catch (error) {
    console.error("Failed to load data", error);
  } finally {
    loading.value = false;
  }
};

const visiblePages = computed(() => {
  const current = currentPage.value + 1; // 1-indexed for display
  const total = totalPages.value;
  const delta = 1;
  const left = current - delta;
  const right = current + delta + 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || i >= left && i < right) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
});

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
}, {deep: true});

let debounceTimeout = null;
watch(filters, () => {
  if (props.fetchData) {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentPage.value = 0;
      loadData();
    }, 500);
  }
}, {deep: true});

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

defineExpose({loadData});
</script>

<style scoped>
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

  .card-actions {
    justify-content: space-around;
  }

  .card-actions :deep(.p-button),
  .card-actions .btn {
    flex: 1;
    text-align: center;
    justify-content: center;
  }

  .pagination-footer {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
