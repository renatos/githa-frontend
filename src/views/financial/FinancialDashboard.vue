<template>
  <div class="financial-dashboard">
    <div class="header-row">
      <h2>Dashboard Financeiro</h2>
      <div class="month-selector">
        <button @click="previousMonth" class="btn-icon">❮</button>
        <span class="current-month">{{ currentMonthLabel }}</span>
        <button @click="nextMonth" class="btn-icon">❯</button>
      </div>
    </div>
    
    <div class="summary-cards">
      <div class="card income">
        <h3>Receitas</h3>
        <div class="amount">{{ formatCurrency(summary.totalIncome) }}</div>
        <div class="pending">Pendente: {{ formatCurrency(summary.pendingIncome || 0) }}</div>
      </div>
      
      <div class="card expense">
        <h3>Despesas</h3>
        <div class="amount">{{ formatCurrency(summary.totalExpense) }}</div>
        <div class="pending">Pendente: {{ formatCurrency(summary.pendingExpense || 0) }}</div>
      </div>
      
      <div class="card balance" :class="{ negative: summary.balance < 0 }">
        <h3>Saldo (Acumulado)</h3>
        <div class="amount">{{ formatCurrency(summary.balance) }}</div>
        <div class="pending" :class="{ negative: (summary.pendingBalance || 0) < 0 }">
          Pendente: {{ formatCurrency(summary.pendingBalance || 0) }}
        </div>
      </div>
    </div>

    <!-- Here we embed the transaction list -->
    <div class="recent-transactions">
        <TransactionList 
            ref="transactionListRef" 
            :month="selectedMonth" 
            :year="selectedYear" 
            @change="loadSummary" 
            @view-appointment="openAppointment" 
        />
    </div>

    <!-- Embedded Appointment Form -->
    <AppointmentForm 
      v-if="showAppointmentForm" 
      :appointment="editingAppointment"
      @close="closeAppointmentForm"
      @save="saveAppointment"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import financialService from '../../services/financialService';
import { appointmentService } from '../../services/appointmentService';
import TransactionList from './TransactionList.vue';
import AppointmentForm from '../../components/AppointmentForm.vue';

const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
});

const selectedMonth = ref(new Date().getMonth() + 1); // 1-12
const selectedYear = ref(new Date().getFullYear());
const transactionListRef = ref(null);

// Appointment Form State
const showAppointmentForm = ref(false);
const editingAppointment = ref({});

const currentMonthLabel = computed(() => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[selectedMonth.value - 1]} ${selectedYear.value}`;
});

onMounted(async () => {
  await loadSummary();
});

watch([selectedMonth, selectedYear], async () => {
  await loadSummary();
  // Reload transaction list when month changes
  transactionListRef.value?.loadData();
});

const loadSummary = async () => {
  try {
    const response = await financialService.getSummary(selectedMonth.value, selectedYear.value);
    console.log('Financial Summary Response:', response.data);
    summary.value = response.data;
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

const previousMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
};

const nextMonth = () => {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// Appointment Logic (duplicated from AppointmentView for dashboard context)
const openAppointment = async (id) => {
    try {
        const response = await appointmentService.getById(id);
        editingAppointment.value = response.data || response;
        showAppointmentForm.value = true;
    } catch (error) {
        console.error('Error loading appointment:', error);
        alert('Erro ao carregar agendamento');
    }
};

const closeAppointmentForm = () => {
    showAppointmentForm.value = false;
    editingAppointment.value = {};
};

const saveAppointment = async (data) => {
  try {
    if (data.id) {
      await appointmentService.update(data.id, data);
      alert('Agendamento atualizado com sucesso!');
    } else {
       // Should not happen in this context usually, but good to have
      await appointmentService.create(data);
      alert('Agendamento criado com sucesso!');
    }
    closeAppointmentForm();
    // Maybe refresh transactions?
    loadSummary();
    transactionListRef.value?.loadData();
  } catch (error) {
    console.error('Error saving appointment:', error);
    alert('Erro ao salvar agendamento.');
  }
};
</script>

<style scoped>
.financial-dashboard {
  padding: 1rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-bg-card, #fff);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.current-month {
  font-weight: 600;
  color: var(--color-text-main);
  min-width: 150px;
  text-align: center;
}

.btn-icon {
  background: transparent;
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

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--color-bg-card, #fff);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 5px solid transparent;
}

.card.income {
  border-left-color: var(--color-success, #16a34a);
}

.card.expense {
  border-left-color: var(--color-error, #dc2626);
}

.card.balance {
  border-left-color: var(--color-primary, #2563eb);
}
.card.balance.negative {
    border-left-color: var(--color-error, #dc2626);
}

.card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.card .amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.card .pending {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.card .pending.negative {
  color: var(--color-error, #dc2626);
}

.card.income .amount {
    color: var(--color-success, #16a34a);
}

.card.expense .amount {
    color: var(--color-error, #dc2626);
}

.card.balance.negative .amount {
    color: var(--color-error, #dc2626);
}

.recent-transactions {
    background: var(--color-bg-card, #fff);
    border-radius: var(--radius-md);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem;
}
</style>
