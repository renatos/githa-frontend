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
    >
      <template #cell-amount="{ value, item }">
        <span :class="['amount', item.type.toLowerCase()]">
          {{ formatCurrency(value) }}
        </span>
      </template>
      
      <template #cell-type="{ value }">
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
          <button class="btn-icon" @click="openForm(item)" title="Editar">✎</button>
          <button class="btn-icon delete" @click="deleteItem(item.id)" title="Excluir">✕</button>
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
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import GenericTable from '../../components/common/GenericTable.vue';
import TransactionForm from '../../components/financial/TransactionForm.vue';
import financialService from '../../services/financialService';

const props = defineProps({
  month: {
    type: Number,
    default: null
  },
  year: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['change', 'view-appointment']);

const tableRef = ref(null);
const showForm = ref(false);
const editingItem = ref({});

const columns = [
  { key: 'description', label: 'Descrição', sortable: true },
  { key: 'category', label: 'Categoria', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, align: 'right' },
  { key: 'type', label: 'Tipo', sortable: true, align: 'center' },
  { key: 'paymentDate', label: 'Pagamento', sortable: true },
  { key: 'status', label: 'Status', sortable: true, align: 'center' },
];

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
  
  // Clean nulls
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await financialService.getTransactions(query);
  return response.data;
};

// Watch for month/year changes to reload the table
watch([() => props.month, () => props.year], () => {
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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
    alert('Erro ao salvar transação');
  }
};

const deleteItem = async (id) => {
  if (confirm('Tem certeza que deseja excluir esta transação?')) {
    try {
      await financialService.deleteTransaction(id);
      tableRef.value?.loadData();
      emit('change');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação');
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

.btn-icon.delete:hover {
    color: var(--color-error);
    border-color: var(--color-error);
}
</style>
