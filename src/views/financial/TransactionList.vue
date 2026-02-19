<template>
  <div class="transaction-list-view">
    <div class="header-actions">
      <h2>Financeiro</h2>
      <button class="btn btn-primary" @click="openForm()">
        + Nova Transação
      </button>
    </div>

    <!-- Filters could go here -->

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchDataAdapter"
      :row-class="rowClass"
      @row-click="openForm"
    >
      <template #cell-amount="{ value, item }">
        <span :class="['amount', item.nature.toLowerCase()]">
          {{ formatCurrency(value) }}
        </span>
      </template>
      
      <template #cell-nature="{ value }">
        <span :class="['badge', value.toLowerCase()]">
          {{ value === 'INCOME' ? 'Receita' : 'Despesa' }}
        </span>
      </template>

      <template #cell-status="{ value }">
         <span :class="['badge', 'status', value.toLowerCase()]">
          {{ formatStatus(value) }}
        </span>
      </template>

      <template #cell-dueDate="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #cell-paymentDate="{ value }">
        {{ value ? formatDate(value) : '-' }}
      </template>

      <template #actions="{ item }">
        <div class="actions-group">
          <button 
            v-if="item.nature === 'INCOME'" 
            class="btn-icon" 
            title="Gerar Agendamento"
            @click="openAppointmentModal(item)"
          >
            +
          </button>
          <button 
            class="btn-icon delete" 
            :disabled="isActionDisabled(item)"
            :class="{ 'disabled': isActionDisabled(item) }"
            @click="!isActionDisabled(item) && deleteItem(item.id)" 
            :title="getDeleteTitle(item)">
            ✕
          </button>
        </div>
      </template>
    </GenericTable>

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

const checkUserRole = () => {
    const user = authService.getCurrentUser();
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

onMounted(() => {
    checkUserRole();
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

const getEditTitle = (item) => {
     // User wants to view even if disabled, so title is relevant but action is enabled
     return 'Editar / Visualizar';
};

const columns = [
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'category', label: 'Categoria', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, align: 'right' },
  { key: 'nature', label: 'Natureza', sortable: true, align: 'center' },
  { key: 'paymentDate', label: 'Pagamento', sortable: true },
  { key: 'status', label: 'Status', sortable: true, align: 'center' },
];

const rowClass = (item) => {
    if (route.query.highlight && String(item.id) === String(route.query.highlight)) {
        return 'highlight-row';
    }
    return '';
};

// Clear highlight on click or timeout? 
// Maybe better to verify if GenericTable supports rowClass prop. yes it does.

// Auto-scroll to highlighted item?
watch(() => tableRef.value, (val) => {
    // Need to wait for data load.
    // Logic inside loadData callback or separate watcher on content changes?
});

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };
  
  // Add month/year if provided
  if (props.month) query.month = props.month;
  if (props.year) query.year = props.year;
  if (props.day) query.day = props.day;
  
  // Clean nulls
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await financialService.getTransactions(query);
  return response.data;
};

// Watch for month/year/day changes to reload the table
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

const formatStatus = (value) => {
    const map = {
        'PENDING': 'Pendente',
        'PAID': 'Pago',
        'CANCELLED': 'Cancelado'
    };
    return map[value] || value;
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

const deleteItem = async (id) => {
  const message = 'Tem certeza que deseja excluir esta transação?\n\n' +
    'Se esta transação estiver vinculada a uma venda, a venda e os agendamentos associados também serão removidos permanentemente.';
  if (confirm(message)) {
    try {
      await financialService.deleteTransaction(id);
      tableRef.value?.loadData();
      emit('change');
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  }
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
<style scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.amount.income {
    color: var(--color-success, #16a34a);
    font-weight: bold;
}

.amount.expense {
    color: var(--color-error, #dc2626);
    font-weight: bold;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.income {
    background-color: #dcfce7;
    color: #166534;
}

.badge.expense {
    background-color: #fee2e2;
    color: #991b1b;
}

.badge.status.pending {
    background-color: #fef9c3;
    color: #854d0e;
}
.badge.status.paid {
    background-color: #dcfce7;
    color: #166534;
}
.badge.status.cancelled {
    background-color: #f3f4f6;
    color: #374151;
}

.actions-group {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.btn-icon {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 0.25rem 0.6rem;
  transition: all 0.2s;
  color: var(--color-text-muted);
}

.btn-icon:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
}

.btn-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon.delete {
    color: var(--color-error, #ef4444);
    border-color: var(--color-error, #ef4444);
    opacity: 0.8;
}

.btn-icon.delete:hover {
    color: var(--color-error);
    border-color: var(--color-error);
}


:deep(.highlight-row) td {
    background-color: var(--color-highlight-row) !important;
    transition: background-color 0.5s;
}
</style>
