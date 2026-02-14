<template>
  <div class="base-lookup lookup-container">
    <!-- Combobox Mode (Select) -->
    <div v-if="isComboboxMode" class="combobox-wrapper">
      <select
          :disabled="disabled"
          :value="modelValue"
          class="form-select"
          @change="onSelectChange"
      >
        <option value="">{{ placeholder }}</option>
        <option v-for="item in allItems" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
    </div>

    <!-- Lookup Mode (Inputs) -->
    <div v-else class="lookup-inputs-wrapper">
      <!-- ID Input -->
      <div class="id-input-wrapper">
        <input
            :disabled="disabled"
            :value="modelValue"
            class="form-control id-input"
            placeholder="ID"
            type="text"
            @input="onIdInput"
        />
      </div>

      <!-- Description Input -->
      <div class="desc-input-wrapper">
        <input
            v-model="searchQuery"
            :disabled="disabled"
            :placeholder="placeholder"
            class="form-control"
            type="text"
            @blur="onBlur"
            @focus="onFocus"
            @input="onSearchInput"
        />

        <!-- Dropdown Results -->
        <div
            v-if="showResults && results.length > 0"
            class="lookup-results"
        >
          <div
              v-for="item in results"
              :key="item.id"
              class="lookup-item"
              @mousedown.prevent="selectItem(item)"
          >
            <span class="item-name">{{ item.name }}</span>
            <span class="item-id">#{{ item.id }}</span>
            <span v-if="item.price" class="item-extra">
               {{ formatCurrency(item.price) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Button -->
    <!-- Edit Button -->
    <button
        v-if="modelValue && !disabled && canEdit"
        class="btn-icon-small edit-btn"
        title="Editar registro selecionado"
        type="button"
        @click="$emit('edit', modelValue)"
    >
      ✏️
    </button>
  </div>
</template>

<script setup>
import {ref, watch, defineProps, defineEmits, onMounted, useAttrs, computed} from 'vue';

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

onMounted(async () => {
  if (props.initialDescription) {
    searchQuery.value = props.initialDescription;
  }

  try {
    // Initial check to decide mode
    const response = await props.searchService.getAll({page: 0, size: 10});
    
    let totalElements = 0;
    let content = [];
    
    if (Array.isArray(response.data)) {
        // Handle simple list response
        totalElements = response.data.length;
        content = response.data;
    } else if (response.data && response.data.content) {
        // Handle Page response
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
.base-lookup {
  width: 100%;
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
}

.lookup-container {
  display: flex;
  gap: var(--spacing-sm);
}

.combobox-wrapper {
  flex: 1;
}

.lookup-inputs-wrapper {
  flex: 1;
  display: flex;
  gap: var(--spacing-sm);
}

.id-input-wrapper {
  flex: 0 0 80px;
}

.desc-input-wrapper {
  flex: 1;
  position: relative;
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  box-sizing: border-box;
  background-color: var(--color-bg-card);
  color: var(--color-text-main);
}

.id-input {
  text-align: center;
  background-color: var(--color-bg-body);
}

.lookup-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.lookup-item {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--color-text-main);
}

.lookup-item:hover {
  background-color: var(--color-bg-body);
}

.item-name {
  font-weight: 500;
}

.item-id {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-left: 0.5rem;
}

.item-extra {
  font-size: 0.75rem;
  color: var(--color-success, #16a34a);
  margin-left: auto;
  padding-left: 0.5rem;
}

.btn-icon-small {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-main);
  transition: all 0.2s;
  background-color: var(--color-bg-card);
}

.btn-icon-small:hover {
  background-color: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.edit-btn {
  flex: 0 0 auto;
}
</style>
