<template>
  <div class="financial-dashboard">
    <div class="header-row">
      <h2>Dashboard Financeiro</h2>
      <div class="selectors-container">
        <div class="view-mode-toggle">
            <button 
                class="btn-toggle" 
                :class="{ active: viewMode === 'MONTH' }"
                @click="viewMode = 'MONTH'"
            >
                Mensal
            </button>
            <button 
                class="btn-toggle" 
                :class="{ active: viewMode === 'DAY' }"
                @click="viewMode = 'DAY'"
            >
                Diário
            </button>
        </div>
        <div class="month-selector">
          <button @click="previousMonth" class="btn-icon">❮</button>
          <span class="current-month">{{ currentMonthLabel }}</span>
          <button @click="nextMonth" class="btn-icon">❯</button>
        </div>
        <div class="day-selector">
          <button @click="previousDay" class="btn-icon">❮</button>
          <span class="current-day">{{ currentDayLabel }}</span>
          <button @click="nextDay" class="btn-icon">❯</button>
        </div>
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

    <!-- Daily summary cards -->
    <div class="summary-cards daily-cards">
      <div class="card daily income">
        <h3>Receitas (dia)</h3>
        <div class="amount">{{ formatCurrency(dailySummary.totalIncome) }}</div>
      </div>

      <div class="card daily expense">
        <h3>Despesas (dia)</h3>
        <div class="amount">{{ formatCurrency(dailySummary.totalExpense) }}</div>
      </div>

      <div class="card daily balance" :class="{ negative: dailySummary.balance < 0 }">
        <h3>Saldo (dia)</h3>
        <div class="amount">{{ formatCurrency(dailySummary.balance) }}</div>
      </div>
    </div>

    <!-- Here we embed the transaction list -->
    <div class="recent-transactions">
        <TransactionList 
            ref="transactionListRef" 
            :month="selectedMonth" 
            :year="selectedYear" 
            :day="viewMode === 'DAY' ? selectedDay : null"
            @change="loadAllData" 
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

const viewMode = ref('MONTH'); // 'MONTH' or 'DAY'

const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
});

const dailySummary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
});

const now = new Date();
const selectedMonth = ref(now.getMonth() + 1); // 1-12
const selectedYear = ref(now.getFullYear());
const selectedDay = ref(now.getDate());
const transactionListRef = ref(null);

// Appointment Form State
const showAppointmentForm = ref(false);
const editingAppointment = ref({});

const daysInMonth = computed(() => {
  return new Date(selectedYear.value, selectedMonth.value, 0).getDate();
});

const currentMonthLabel = computed(() => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[selectedMonth.value - 1]} ${selectedYear.value}`;
});

const currentDayLabel = computed(() => {
  const dayStr = String(selectedDay.value).padStart(2, '0');
  const monthStr = String(selectedMonth.value).padStart(2, '0');
  return `${dayStr}/${monthStr}`;
});

onMounted(async () => {
  await loadAllData();
});

watch([selectedMonth, selectedYear], async () => {
  await loadAllData();
});

watch(selectedDay, async () => {
  await loadDailySummary();
});

const loadAllData = async () => {
  await Promise.all([loadSummary(), loadDailySummary()]);
};

const loadSummary = async () => {
  try {
    const response = await financialService.getSummary(selectedMonth.value, selectedYear.value);
    summary.value = response.data;
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

const loadDailySummary = async () => {
  try {
    const response = await financialService.getDailySummary(
      selectedDay.value, selectedMonth.value, selectedYear.value
    );
    dailySummary.value = response.data;
  } catch (error) {
    console.error('Error loading daily summary:', error);
  }
};

const previousMonth = () => {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
  resetDayToDefault();
};

const nextMonth = () => {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
  resetDayToDefault();
};

const resetDayToDefault = () => {
  const today = new Date();
  if (selectedMonth.value === today.getMonth() + 1 && selectedYear.value === today.getFullYear()) {
    selectedDay.value = today.getDate();
  } else {
    selectedDay.value = 1;
  }
};

const previousDay = () => {
  if (selectedDay.value > 1) {
    selectedDay.value--;
  } else {
    // Go to previous month
    if (selectedMonth.value === 1) {
      selectedMonth.value = 12;
      selectedYear.value--;
    } else {
      selectedMonth.value--;
    }
    // Set to last day of new month
    selectedDay.value = new Date(selectedYear.value, selectedMonth.value, 0).getDate();
  }
};

const nextDay = () => {
  if (selectedDay.value < daysInMonth.value) {
    selectedDay.value++;
  } else {
    // Go to next month
    if (selectedMonth.value === 12) {
        selectedMonth.value = 1;
        selectedYear.value++;
    } else {
        selectedMonth.value++;
    }
    selectedDay.value = 1;
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
      await appointmentService.create(data);
      alert('Agendamento criado com sucesso!');
    }
    closeAppointmentForm();
    loadAllData();
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

.selectors-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.view-mode-toggle {
    display: flex;
    background: var(--color-bg-card, #fff);
    border-radius: var(--radius-md);
    padding: 0.25rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 0.25rem;
}

.btn-toggle {
    background: transparent;
    border: none;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-weight: 500;
    transition: all 0.2s;
}

.btn-toggle.active {
    background: var(--color-primary);
    color: white;
}

.month-selector,
.day-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--color-bg-card, #fff);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.day-selector {
  padding: 0.35rem 0.8rem;
}

.current-month {
  font-weight: 600;
  color: var(--color-text-main);
  min-width: 150px;
  text-align: center;
}

.current-day {
  font-weight: 600;
  color: var(--color-text-main);
  min-width: 60px;
  text-align: center;
  font-size: 0.95rem;
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

.btn-icon:hover:not(:disabled) {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.summary-cards.daily-cards {
  margin-bottom: 2rem;
}

.card {
  background: var(--color-bg-card, #fff);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 5px solid transparent;
}

.card.daily {
  padding: 1rem 1.25rem;
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

.card.daily h3 {
  font-size: 0.8rem;
  margin-bottom: 0.35rem;
}

.card .amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.card.daily .amount {
  font-size: 1.3rem;
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
