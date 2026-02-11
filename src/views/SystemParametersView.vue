<template>
  <div class="system-parameters-view">
    <div class="page-header">
      <h1>Parâmetros do Sistema</h1>
      <p class="subtitle">Configurações globais da aplicação. Cuidado ao alterar.</p>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchParametersAdapter"
      @row-click="startEdit"
    >
      <template #cell-value="{ item }">
        <div class="value-cell">
           <span v-if="!editingItem || editingItem.id !== item.id">{{ item.value }}</span>
           <div v-else class="edit-mode">
             <input 
                v-model="editValue" 
                class="edit-input" 
                :type="getInputType(item.type)"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
                ref="editInputRef"
             />
             <button class="btn-icon save" @click="saveEdit" title="Salvar">✓</button>
             <button class="btn-icon cancel" @click="cancelEdit" title="Cancelar">✕</button>
           </div>
        </div>
      </template>

    </GenericTable>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import GenericTable from '../components/common/GenericTable.vue';
import { systemParameterService } from '../services/systemParameterService';

const tableRef = ref(null);
const editingItem = ref(null);
const editValue = ref('');
const editInputRef = ref(null);

const columns = [
  { key: 'key', label: 'Chave', sortable: true, width: '250px', monospace: true },
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true, width: '100px' },
  { key: 'value', label: 'Valor', sortable: true, width: '200px' },
];

const fetchParametersAdapter = async () => {
  // Client side pagination for this small list
  const response = await systemParameterService.getAll();
  // Generic adapter expects page structure, but our endpoint returns List
  // We mock a page structure
  return {
    content: response.data,
    totalElements: response.data.length,
    totalPages: 1
  };
};

const getInputType = (type) => {
    switch(type) {
        case 'INTEGER': return 'number';
        case 'DECIMAL': return 'number';
        case 'BOOLEAN': return 'text'; // Handle appropriately (select?)
        default: return 'text';
    }
};

const startEdit = (item) => {
  editingItem.value = item;
  editValue.value = item.value;
  nextTick(() => {
    if (editInputRef.value) editInputRef.value.focus();
  });
};

const cancelEdit = () => {
  editingItem.value = null;
  editValue.value = '';
};

const saveEdit = async () => {
  if (!editingItem.value) return;
  
  try {
    await systemParameterService.update(editingItem.value.id, editValue.value);
    // Update local data simply or refresh? Refresh is safer.
    tableRef.value.loadData();
    cancelEdit();
  } catch (error) {
    console.error("Failed to update parameter", error);
    alert("Erro ao salvar parâmetro.");
  }
};
</script>

<style scoped>
.system-parameters-view {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.value-cell {
    min-height: 2rem;
    display: flex;
    align-items: center;
}

.edit-mode {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
}

.edit-input {
    flex: 1;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--color-primary);
    border-radius: var(--radius-sm);
    outline: none;
}

.btn-icon {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background-color: #f1f5f9;
}

.btn-icon.save {
    background-color: #dcfce7;
    border-color: #16a34a;
    color: #16a34a;
}

.btn-icon.cancel {
    background-color: #fee2e2;
    border-color: #dc2626;
    color: #dc2626;
}
</style>
