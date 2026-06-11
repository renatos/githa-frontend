<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Investimentos Estratégicos</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os investimentos e analise o ROI de procedimentos ou campanhas de marketing.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="showForm = true"
        >
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Investimento
        </button>
      </div>
    </header>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      @row-click="openEditForm"
    >
      <!-- Type Column -->
      <template #cell-type="{ value }">
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="value === 'MARKETING' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'"
        >
          {{ value === 'MARKETING' ? 'Marketing' : 'Procedimento' }}
        </span>
      </template>

      <!-- Cost Column -->
      <template #cell-cost="{ value }">
        <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">
          {{ formatCurrency(value) }}
        </span>
      </template>

      <!-- Date Column -->
      <template #cell-date="{ value }">
        {{ formatDate(value) }}
      </template>

      <!-- Services / Details Column -->
      <template #cell-enabledServices="{ value, item }">
        <div v-if="item.type === 'MARKETING'">
          <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Recorrência: {{ item.recurrence === 'MONTHLY' ? 'Mensal' : item.recurrence === 'WEEKLY' ? 'Semanal' : 'Nenhuma' }}
          </span>
        </div>
        <div v-else class="flex flex-wrap gap-1">
          <span 
            v-for="service in value" 
            :key="service.id" 
            class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
          >
            {{ service.name }}
          </span>
          <span v-if="!value || value.length === 0" class="text-xs text-slate-400 italic">Nenhum</span>
        </div>
      </template>

      <!-- Actions Column -->
      <template #actions="{ item }">
        <div class="flex items-center justify-center gap-2">
          <button 
            class="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-xs font-semibold transition-colors"
            title="Ver Métricas de ROI"
            @click.stop="viewMetrics(item)"
          >
            <span class="material-symbols-outlined text-sm mr-1">trending_up</span>
            Métricas (ROI)
          </button>
          <button 
            class="p-2 rounded-lg bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-200 flex items-center justify-center" 
            title="Excluir" 
            @click.stop="deleteItem(item)"
          >
            <i class="fa-solid fa-trash-can text-[14px]"></i>
          </button>
        </div>
      </template>
    </GenericTable>

    <!-- Investment Form Modal -->
    <InvestmentForm
      v-if="showForm"
      :investment="editingItem"
      @close="closeForm"
      @save="onInvestmentSaved"
    />
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { useRouter } from 'vue-router';
import GenericTable from '../common/GenericTable.vue';
import InvestmentForm from './InvestmentForm.vue';
import { investmentService } from '../../services/investmentService';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

const router = useRouter();
const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref(null);

const columns = [
  { key: 'id', label: '#', width: '50px', sortable: true },
  { key: 'name', label: 'Nome', sortable: true, filterable: true },
  { key: 'type', label: 'Tipo', sortable: true, filterable: true },
  { key: 'cost', label: 'Custo', sortable: true, align: 'right' },
  { key: 'date', label: 'Data', sortable: true, align: 'center' },
  { key: 'enabledServices', label: 'Detalhes / Procedimentos', width: '300px' }
];

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };

  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await investmentService.listInvestments();
  return Array.isArray(response.data) ? { content: response.data, totalElements: response.data.length } : response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const openEditForm = (item) => {
  editingItem.value = { ...item };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = null;
};

const onInvestmentSaved = () => {
  closeForm();
  refresh();
};

const deleteItem = (item) => {
  confirmBridge.confirm({
    title: 'Excluir Investimento',
    message: `Tem certeza que deseja excluir o investimento "${item.name}"?`,
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await investmentService.deleteInvestment(item.id);
        toastBridge.getToast().add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Investimento excluído com sucesso!',
          life: 3000
        });
        refresh();
      } catch (err) {
        console.error(err);
        toastBridge.getToast().add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir o investimento.',
          life: 3000
        });
      }
    }
  });
};

const viewMetrics = (item) => {
  if (!item.operatingExpenseId) {
    confirmBridge.confirm({
      title: 'Transação não associada',
      message: `O investimento "${item.name}" não possui uma transação associada. Vincule uma despesa CAPEX antes de visualizar as métricas de ROI.`,
      type: 'warning',
      confirmLabel: 'Vincular Agora',
      cancelLabel: 'Fechar',
      onConfirm: () => {
        openEditForm(item);
      }
    });
    return;
  }
  router.push(`/investments/${item.id}/metrics`);
};

// Formatters
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

const formatDate = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

defineExpose({ refresh });
</script>
