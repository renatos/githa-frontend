<template>
  <div class="system-parameter-tab h-full overflow-auto flex flex-col gap-4">
    <div class="mb-2">
      <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">Parâmetros Globais</h2>
      <p class="text-xs text-slate-500">Atenção ao editar parâmetros de infraestrutura.</p>
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
                ref="editInputRef"
                v-model="editValue"
                :type="getInputType(item.type)"
                class="edit-input"
                @keyup.enter="saveEdit"
                @keyup.esc="cancelEdit"
            />
            <button class="btn-icon save" title="Salvar" @click="saveEdit">✓</button>
            <button class="btn-icon cancel" title="Cancelar" @click="cancelEdit">✕</button>
          </div>
        </div>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue';
import GenericTable from '../common/GenericTable.vue';
import { systemParameterService } from '../../services/systemParameterService';
import { confirmBridge } from '../../services/confirmBridge';

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
  const response = await systemParameterService.getAll();
  return {
    content: response.data,
    totalElements: response.data.length,
    totalPages: 1
  };
};

const getInputType = (type) => {
  switch (type) {
    case 'INTEGER':
    case 'DECIMAL':
      return 'number';
    case 'BOOLEAN':
      return 'text';
    default:
      return 'text';
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
    tableRef.value.loadData();
    cancelEdit();
  } catch (error) {
    console.error("Failed to update parameter", error);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Não foi possível salvar as alterações no parâmetro.',
      type: 'danger'
    });
  }
};
</script>

<style scoped>
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
  border: 1px solid var(--color-primary, #6366f1);
  border-radius: var(--radius-sm, 4px);
  outline: none;
  background-color: var(--color-background, #fff);
  color: var(--color-text, #1e293b);
}

.btn-icon {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm, 4px);
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
