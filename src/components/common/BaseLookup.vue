<template>
  <div class="w-full">
    <!-- Combobox Mode (Select) -->
    <div v-if="isComboboxMode" class="w-full">
      <select
          :disabled="disabled"
          :value="modelValue"
          class="form-select flex w-full max-w-full truncate resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-sm font-normal leading-normal transition-colors disabled:opacity-50"
          @change="onSelectChange"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="item in allItems" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Lookup Mode (Inputs) -->
    <div v-else class="flex gap-2 w-full">
      <!-- ID Input (Optional) -->
      <div v-if="!hideId" class="w-16 sm:w-20 shrink-0">
        <input
            :disabled="disabled"
            :value="modelValue"
            class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-2 py-3 text-center text-xs sm:text-sm font-normal leading-normal transition-colors disabled:opacity-50"
            placeholder="ID"
            type="text"
            @input="onIdInput"
        />
      </div>

      <!-- Description Input -->
      <div class="flex-1 relative" ref="inputWrapperRef">
        <div class="flex gap-2">
          <input
              v-model="searchQuery"
              :disabled="disabled"
              :placeholder="placeholder"
              class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-3 py-3 text-xs sm:text-sm font-normal leading-normal transition-colors disabled:opacity-50"
              type="text"
              @blur="onBlur"
              @focus="onFocus"
              @input="onSearchInput"
          />

          <!-- Edit Button -->
          <button
              v-if="modelValue && !disabled && canEdit"
              class="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              title="Editar registro selecionado"
              type="button"
              @click="$emit('edit', modelValue)"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>

        <!-- Dropdown Results -->
        <Teleport to="body">
          <div
              v-if="showResults && results.length > 0"
              ref="dropdownRef"
              :style="dropdownStyle"
              class="fixed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[99999] max-h-48 overflow-y-auto custom-scrollbar"
              @mousedown.stop
          >
          <div
              v-for="item in results"
              :key="item.id"
              class="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors"
              @mousedown.prevent="selectItem(item)"
          >
            <span class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ item.name }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 dark:text-slate-400">#{{ item.id }}</span>
              <span v-if="item.price" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                 {{ formatCurrency(item.price) }}
              </span>
            </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch, defineProps, defineEmits, onMounted, onUnmounted, nextTick, useAttrs, computed} from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  initialDescription: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Pesquisar...'
  },
  // Function returning Promise<Page<T>>
  // (params: { page, size, filters: { name: ... } }) => AxiosResponse
  searchService: {
    type: Object,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hideId: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'auto',
    validator: (val) => ['auto', 'lookup', 'combobox'].includes(val)
  }
});

const emit = defineEmits(['update:modelValue', 'select']);
const attrs = useAttrs();

const canEdit = computed(() => {
  return !!attrs.onEdit;
});

// Mode State
const isComboboxMode = ref(false);
const allItems = ref([]);

// Lookup State
const searchQuery = ref('');
const results = ref([]);
const showResults = ref(false);
let searchTimeout = null;
let idSearchTimeout = null;

// Teleport & Positioning State
const inputWrapperRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({ top: '0px', left: '0px', width: '0px' });

const updateDropdownPosition = () => {
  if (inputWrapperRef.value) {
    const rect = inputWrapperRef.value.getBoundingClientRect();
    let top = rect.bottom + 8;
    // Prevent rendering below screen
    if (top + 192 > window.innerHeight && rect.top - 192 - 8 > 0) {
       top = rect.top - 192 - 8;
    }
    dropdownStyle.value = {
      top: `${top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`
    };
  }
};

const handleScroll = (event) => {
  if (showResults.value) {
    if (dropdownRef.value && dropdownRef.value.contains(event.target)) {
      return;
    }
    showResults.value = false;
  }
};

onMounted(async () => {
  if (props.initialDescription) {
    searchQuery.value = props.initialDescription;
  }

  if (props.mode === 'lookup') {
    isComboboxMode.value = false;
  } else if (props.mode === 'combobox') {
    isComboboxMode.value = true;
    try {
      const response = await props.searchService.getAll({page: 0, size: 10});
      allItems.value = Array.isArray(response.data) ? response.data : (response.data?.content || []);
    } catch (e) { console.error(e); }
  } else {
    // Original auto-detection logic
    try {
      const response = await props.searchService.getAll({page: 0, size: 10});
      
      let totalElements = 0;
      let content = [];
      
      if (Array.isArray(response.data)) {
          totalElements = response.data.length;
          content = response.data;
      } else if (response.data && response.data.content) {
          totalElements = response.data.totalElements;
          content = response.data.content;
      }

      if (totalElements <= 10) {
        isComboboxMode.value = true;
        allItems.value = content;
      } else {
        isComboboxMode.value = false;
      }
    } catch (error) {
      console.error('Error initializing Lookup:', error);
    }
  }

  window.addEventListener('scroll', handleScroll, true);
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll, true);
  window.removeEventListener('resize', updateDropdownPosition);
});

// Watchers
watch(() => props.initialDescription, (newVal) => {
  if (newVal && searchQuery.value !== newVal) {
    searchQuery.value = newVal;
  }
});

watch(() => props.modelValue, (newVal) => {
  if (!newVal && !props.initialDescription) {
    searchQuery.value = '';
  }
});

watch(showResults, (val) => {
  if (val) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
});


// Methods for Combobox Mode
const onSelectChange = (event) => {
  const newId = event.target.value;
  emit('update:modelValue', newId);
  const selectedItem = allItems.value.find(item => String(item.id) === String(newId));
  emit('select', selectedItem || null);
};

// Methods for Lookup Mode
const onIdInput = (event) => {
  const newId = event.target.value;
  emit('update:modelValue', newId);

  if (idSearchTimeout) clearTimeout(idSearchTimeout);

  if (newId) {
    if (props.searchService.getById) {
      idSearchTimeout = setTimeout(async () => {
        try {
          const response = await props.searchService.getById(newId);
          if (response.data) {
            const item = response.data;
            searchQuery.value = item.name;
            emit('select', item);
          }
        } catch (error) {
          console.warn('ID lookup failed', error);
        }
      }, 500);
    }
  } else {
    searchQuery.value = '';
    emit('select', null);
  }
};

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchQuery.value) {
    results.value = [];
    showResults.value = false;
    emit('update:modelValue', '');
    emit('select', null);
    return;
  }

  showResults.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const params = {
        page: 0,
        size: 10,
        ...{name: searchQuery.value}
      };

      const response = await props.searchService.getAll(params);
      
      if (Array.isArray(response.data)) {
         let filtered = response.data;
         if (searchQuery.value) {
           const lower = searchQuery.value.toLowerCase();
           filtered = filtered.filter(item => item.name.toLowerCase().includes(lower));
         }
         // Slice for pagination simulation if needed, but for lookup results usually top 10 is enough
         results.value = filtered.slice(0, 10);
      } else {
         results.value = response.data.content;
      }
    } catch (error) {
      console.error('Search error:', error);
      results.value = [];
    }
  }, 300);
};

const onFocus = () => {
  if (!isComboboxMode.value && searchQuery.value && results.value.length > 0) {
    showResults.value = true;
  }
};

const onBlur = () => {
  // Delay hiding to allow click event to process
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

const selectItem = (item) => {
  searchQuery.value = item.name;
  emit('update:modelValue', item.id);
  emit('select', item);
  showResults.value = false;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
