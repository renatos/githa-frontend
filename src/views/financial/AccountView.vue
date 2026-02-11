<template>
  <div class="account-view">
    <div class="header-actions">
      <h2>Contas Bancárias / Caixas</h2>
      <button class="btn btn-primary" @click="openForm()">
        + Nova Conta
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="openForm"
    >
      <template #cell-active="{ value }">
        <span class="badge" :class="value ? 'active' : 'inactive'">
          {{ value ? 'Ativa' : 'Inativa' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
           <button class="btn-icon delete" @click="deleteItem(item.id)">✕</button>
        </div>
      </template>
    </GenericTable>

    <!-- Modal Form -->
    <div v-if="showForm" class="modal-backdrop">
      <div class="modal-content">
        <h3>{{ editingItem.id ? 'Editar Conta' : 'Nova Conta' }}</h3>
        <form @submit.prevent="saveItem">
          <div class="form-group">
            <label>Nome da Conta</label>
            <input v-model="editingItem.name" required placeholder="Ex: Nubank, Caixa Pequeno" />
          </div>
           <div class="form-group">
            <label>
                <input type="checkbox" v-model="editingItem.active" style="width:auto; margin-right: 0.5rem;" />
                Ativa
            </label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
            <button type="submit" class="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GenericTable from '../../components/common/GenericTable.vue';
import financialService from '../../services/financialService';

const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref({ active: true });

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true },
  { key: 'active', label: 'Status', sortable: false, align: 'center' },
];

const fetchDataAdapter = async () => {
  const response = await financialService.getAccounts();
  return response.data;
};

const openForm = (item = {}) => {
  editingItem.value = { active: true, ...item };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = { active: true };
};

const saveItem = async () => {
  try {
    if (editingItem.value.id) {
      await financialService.updateAccount(editingItem.value.id, editingItem.value);
    } else {
      await financialService.createAccount(editingItem.value);
    }
    tableRef.value?.loadData();
    closeForm();
  } catch (error) {
    console.error('Error saving account:', error);
    alert('Erro ao salvar conta.');
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta conta?')) {
    try {
      await financialService.deleteAccount(id);
      tableRef.value?.loadData();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Erro ao excluir conta.');
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

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-card, #fff);
  padding: 2rem;
  border-radius: var(--radius-md);
  width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input[type="text"], input:not([type="checkbox"]) {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}

.badge.active { background-color: #dcfce7; color: #166534; }
.badge.inactive { background-color: #f3f4f6; color: #374151; }

.actions-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.btn-icon {
    background: none;
    border: 1px solid var(--color-border);
    padding: 0.25rem 0.6rem;
    cursor: pointer;
    border-radius: var(--radius-sm);
}
.btn-icon.delete { color: red; border-color: red;}
</style>
