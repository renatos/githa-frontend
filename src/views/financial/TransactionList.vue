<template>
  <div class="space-y-6">
    <!-- Header Actions -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <i class="fa-solid fa-money-bill-transfer text-indigo-500"></i>
        Fluxo Financeiro
      </h2>
      <button 
        class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center gap-2 active:scale-95" 
        @click="openForm()"
      >
        <i class="fa-solid fa-plus text-xs"></i>
        Nova Transação
      </button>
    </div>

    <!-- Table -->
    <div class="relative group">
      <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchDataAdapter"
        :row-class="rowClass"
        @row-click="openForm"
      >
        <template #cell-amount="{ value, item }">
          <span class="font-bold text-base tracking-tight" :class="item.nature === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
            {{ formatCurrency(value) }}
          </span>
        </template>
        
        <template #cell-nature="{ value }">
          <div class="flex">
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors shadow-sm"
              :class="value === 'INCOME' 
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'"
            >
              {{ value === 'INCOME' ? 'Receita' : 'Despesa' }}
            </span>
          </div>
        </template>

        <template #cell-status="{ value }">
          <div class="flex">
            <span 
              class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors shadow-sm"
              :class="value === 'PAID' 
                ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                : value === 'PENDING'
                  ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20'"
            >
              {{ statusMap[value] || value }}
            </span>
          </div>
        </template>

        <template #cell-dueDate="{ value }">
          <span class="text-slate-400 text-xs">{{ formatDate(value) }}</span>
        </template>

        <template #cell-paymentDate="{ value }">
          <span class="text-slate-200 font-medium text-xs">{{ value ? formatDate(value) : '-' }}</span>
        </template>

        <template #actions="{ item }">
          <div class="flex items-center gap-2">
            <button 
              v-if="item.nature === 'INCOME'" 
              class="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all duration-200" 
              title="Gerar Agendamento"
              @click="openAppointmentModal(item)"
            >
              <i class="fa-solid fa-calendar-plus"></i>
            </button>
            <button 
              class="p-2 rounded-lg bg-slate-800 border border-slate-700 transition-all duration-200 flex items-center justify-center group/btn" 
              :disabled="isActionDisabled(item)"
              :class="isActionDisabled(item) 
                ? 'opacity-30 cursor-not-allowed grayscale' 
                : 'text-slate-400 hover:text-rose-400 hover:border-rose-500/30'"
              @click="!isActionDisabled(item) && deleteItem(item)" 
              :title="getDeleteTitle(item)">
              <i class="fa-solid fa-trash-can text-[14px]"></i>
            </button>
          </div>
        </template>
      </GenericTable>
    </div>

    <!-- Modals -->
    <TransactionForm
      v-if="showForm"
      :transaction="editingItem"
      @close="closeForm"
      @save="saveItem"
      @view-appointment="(id) => $emit('view-appointment', id)"
    />

    <CreateAppointmentFromTransactionModal
      v-if="showAppointmentModal"
      :transaction="appointmentTransaction"
      @close="closeAppointmentModal"
      @save="onAppointmentCreated"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GenericTable from '../../components/common/GenericTable.vue';
import TransactionForm from '../../components/financial/TransactionForm.vue';
import CreateAppointmentFromTransactionModal from '../../components/financial/CreateAppointmentFromTransactionModal.vue';
import financialService from '../../services/financialService';
import { authService } from '../../services/authService';
import { enumService } from '../../services/enumService';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

const props = defineProps({
  month: {
    type: Number,
    default: null
  },
  year: {
    type: Number,
    default: null
  },
  day: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['change', 'view-appointment']);

const route = useRoute();
const router = useRouter();

const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref({});
const showAppointmentModal = ref(false);
const appointmentTransaction = ref({});
const isAdmin = ref(false);
const statusMap = ref({});

const checkUserRole = () => {
    const user = authService.getCurrentUser();
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

onMounted(async () => {
    checkUserRole();
    const options = await enumService.getOptions('TransactionStatus');
    options.forEach(opt => {
        statusMap.value[opt.name] = opt.description;
    });
});

const isActionDisabled = (item) => {
    return item.status === 'PAID' && !isAdmin.value;
};

const getDeleteTitle = (item) => {
    if (isActionDisabled(item)) {
        return 'Transação paga, acesso permitido apenas para ADMIN';
    }
    return 'Excluir';
};

const columns = [
  { key: 'description', label: 'Descrição', sortable: true, nowrap: false },
  { key: 'category', label: 'Categoria', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, align: 'right' },
  { key: 'nature', label: 'Natureza', sortable: true, align: 'center' },
  { key: 'paymentDate', label: 'Pagamento', sortable: true },
  { key: 'status', label: 'Status', sortable: true, align: 'center' },
];

const rowClass = (item) => {
    if (route.query.highlight && String(item.id) === String(route.query.highlight)) {
        return 'bg-indigo-500/10 border-indigo-500/50';
    }
    return '';
};

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };
  
  if (props.month) query.month = props.month;
  if (props.year) query.year = props.year;
  if (props.day) query.day = props.day;
  
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await financialService.getTransactions(query);
  return response.data;
};

watch([() => props.month, () => props.year, () => props.day], () => {
  tableRef.value?.loadData();
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const openForm = (item = {}) => {
  editingItem.value = { ...item };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingItem.value = {};
};

const saveItem = async (data) => {
  try {
    if (data.refresh) {
      tableRef.value?.loadData();
      emit('change');
      closeForm();
      return;
    }
    
    if (data.id) {
      await financialService.updateTransaction(data.id, data);
    } else {
      await financialService.createTransaction(data);
    }
    tableRef.value?.loadData();
    emit('change');
    closeForm();
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

const deleteItem = async (item) => {
    confirmBridge.confirm({
        title: 'Excluir Transação',
        message: 'Tem certeza que deseja excluir esta transação?\n\nSe esta transação estiver vinculada a uma venda, a venda também será removida permanentemente.',
        type: 'danger',
        confirmLabel: 'Excluir',
        onConfirm: async () => {
            try {
                await financialService.deleteTransaction(item.id);
                toastBridge.getToast().add({ severity: 'success', summary: 'Sucesso', detail: 'Transação excluída com sucesso!', life: 3000 });
                tableRef.value?.loadData();
                emit('change');
            } catch (error) {
                console.error('Error deleting transaction:', error);
                toastBridge.getToast().add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir transação.', life: 3000 });
            }
        }
    });
};

const openAppointmentModal = (item) => {
    appointmentTransaction.value = item;
    showAppointmentModal.value = true;
};

const closeAppointmentModal = () => {
    showAppointmentModal.value = false;
    appointmentTransaction.value = {};
};

const onAppointmentCreated = () => {
    closeAppointmentModal();
    tableRef.value?.loadData();
    emit('change');
};

const loadData = () => {
    tableRef.value?.loadData();
};

defineExpose({ loadData });
</script>
