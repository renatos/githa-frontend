<template>
  <div class="flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Cartões de Crédito</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os cartões corporativos, limites e fechamento de faturas.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="openForm()"
        >
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Cartão
        </button>
      </div>
    </header>

    <GenericTable
      ref="listRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="openForm"
    >
      <!-- Limit Column -->
      <template #cell-creditLimit="{ value }">
        <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Available Limit Column -->
      <template #cell-availableLimit="{ value }">
        <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Status Column -->
      <template #cell-active="{ value }">
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="value ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'"
        >
          {{ value ? 'Ativo' : 'Inativo' }}
        </span>
      </template>

      <!-- Actions Column -->
      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-2">
          <button 
            v-if="item.active"
            class="p-2 rounded-lg bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-200 flex items-center justify-center" 
            title="Inativar" 
            @click.stop="handleDelete(item.id)"
          >
            <i class="fa-solid fa-trash-can text-[14px]"></i>
          </button>
          <button 
            v-else
            class="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 flex items-center justify-center" 
            title="Reativar" 
            @click.stop="handleReactivate(item.id)"
          >
            <i class="fa-solid fa-rotate-left text-[14px]"></i>
          </button>
        </div>
      </template>
    </GenericTable>

    <!-- Form Modal -->
    <CreditCardForm
      v-if="showForm"
      :credit-card="editingItem"
      @close="closeForm"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import GenericTable from '../common/GenericTable.vue';
import CreditCardForm from './CreditCardForm.vue';
import creditCardService from '../../services/creditCardService';
import { useCrudView } from '../../composables/useCrudView';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

const {
  listRef,
  showForm,
  editingItem,
  alert,
  openForm,
  closeForm,
  refreshList
} = useCrudView(creditCardService, { singular: 'Cartão de Crédito', plural: 'Cartões de Crédito' });

const emit = defineEmits(['save']);

const handleSave = () => {
  refreshList();
  closeForm();
  emit('save');
};

const handleDelete = (id) => {
  confirmBridge.confirm({
    title: 'Inativar Cartão de Crédito',
    message: 'Tem certeza que deseja inativar este cartão de crédito?',
    type: 'danger',
    confirmLabel: 'Inativar',
    onConfirm: async () => {
      try {
        await creditCardService.delete(id);
        toastBridge.getToast().add({ severity: 'success', summary: 'Sucesso', detail: 'Cartão de Crédito inativado com sucesso!', life: 3000 });
        refreshList();
        emit('save');
      } catch (error) {
        console.error('Error deleting card:', error);
        toastBridge.getToast().add({ severity: 'error', summary: 'Erro', detail: 'Erro ao inativar cartão de crédito.', life: 3000 });
      }
    }
  });
};

const handleReactivate = (id) => {
  confirmBridge.confirm({
    title: 'Reativar Cartão de Crédito',
    message: 'Tem certeza que deseja reativar este cartão de crédito?',
    type: 'info',
    confirmLabel: 'Reativar',
    onConfirm: async () => {
      try {
        await creditCardService.reactivate(id);
        toastBridge.getToast().add({ severity: 'success', summary: 'Sucesso', detail: 'Cartão de Crédito reativado com sucesso!', life: 3000 });
        refreshList();
        emit('save');
      } catch (error) {
        console.error('Error reactivating card:', error);
        toastBridge.getToast().add({ severity: 'error', summary: 'Erro', detail: 'Erro ao reativar cartão de crédito.', life: 3000 });
      }
    }
  });
};

const columns = [
  { key: 'name', label: 'Nome do Cartão', sortable: true },
  { key: 'creditLimit', label: 'Limite Total', sortable: true, align: 'right' },
  { key: 'availableLimit', label: 'Limite Disponível', sortable: true, align: 'right' },
  { key: 'closingDay', label: 'Fechamento (Dia)', sortable: true, align: 'center' },
  { key: 'dueDay', label: 'Vencimento (Dia)', sortable: true, align: 'center' },
  { key: 'active', label: 'Status', sortable: true, align: 'center' }
];

const fetchDataAdapter = async () => {
  const response = await creditCardService.getAll();
  return Array.isArray(response.data) ? { content: response.data, totalElements: response.data.length } : response.data;
};

// Formatters
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

defineExpose({ refreshList });
</script>
