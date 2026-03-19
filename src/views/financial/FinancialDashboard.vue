<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <!-- Header Row -->
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Financeiro</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gestão de fluxo de caixa e transações em tempo real.</p>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <!-- Period Navigator (Unified) -->
        <PeriodSelector 
          v-model:view-mode="viewMode"
          v-model:month="selectedMonth"
          v-model:year="selectedYear"
          v-model:day="selectedDay"
          @change="loadAllData"
        />
      </div>
    </header>
    
    <!-- Summary Cards (Monthly Context) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Income Card -->
      <div class="relative group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <i class="fa-solid fa-arrow-trend-up text-5xl text-emerald-500"></i>
        </div>
        <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Receitas ({{ currentMonthLabel }})</h3>
        <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{{ formatCurrency(summary.totalIncome) }}</div>
        <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50">
          <span class="mr-2">Pendente:</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(summary.pendingIncome || 0) }}</span>
        </div>
      </div>
      
      <!-- Expense Card -->
      <div class="relative group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/5">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <i class="fa-solid fa-arrow-trend-down text-5xl text-rose-500"></i>
        </div>
        <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Despesas ({{ currentMonthLabel }})</h3>
        <div class="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">{{ formatCurrency(summary.totalExpense) }}</div>
        <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50">
          <span class="mr-2">Pendente:</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(summary.pendingExpense || 0) }}</span>
        </div>
      </div>
      
      <!-- Balance Card -->
      <div 
        class="relative group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5"
        :class="summary.balance < 0 ? 'hover:border-rose-500/30' : 'hover:border-indigo-500/30'"
      >
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <i class="fa-solid fa-scale-balanced text-5xl" :class="summary.balance < 0 ? 'text-rose-500' : 'text-indigo-500'"></i>
        </div>
        <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Saldo Acumulado</h3>
        <div class="text-3xl font-bold mb-2 transition-colors" :class="summary.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'">
          {{ formatCurrency(summary.balance) }}
        </div>
        <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50">
          <span class="mr-2">Soma Pendentes:</span>
          <span class="font-medium" :class="summary.pendingBalance < 0 ? 'text-rose-600 dark:text-rose-500' : 'text-slate-700 dark:text-slate-300'">
            {{ formatCurrency(summary.pendingBalance || 0) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Daily summary cards (visible only in Day mode) -->
    <div v-show="viewMode === 'DAY'" class="animate-in fade-in slide-in-from-top-4 duration-500">
      <div class="flex items-center gap-2 mb-4">
        <div class="h-px flex-1 bg-slate-800"></div>
        <span class="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Visão do Dia: {{ currentDayLabel }}</span>
        <div class="h-px flex-1 bg-slate-800"></div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between transition-colors hover:border-emerald-500/20">
          <span class="text-slate-500 text-xs font-medium">Receitas Dia</span>
          <span class="text-lg font-bold text-emerald-400/90">{{ formatCurrency(dailySummary.totalIncome) }}</span>
        </div>

        <div class="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between transition-colors hover:border-rose-500/20">
          <span class="text-slate-500 text-xs font-medium">Despesas Dia</span>
          <span class="text-lg font-bold text-rose-400/90">{{ formatCurrency(dailySummary.totalExpense) }}</span>
        </div>

        <div class="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 flex items-center justify-between transition-colors hover:border-indigo-500/20">
          <span class="text-slate-500 text-xs font-medium">Saldo Dia</span>
          <span class="text-lg font-bold" :class="dailySummary.balance < 0 ? 'text-rose-400/90' : 'text-indigo-400/90'">
            {{ formatCurrency(dailySummary.balance) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Transaction List Section -->
    <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      <div class="p-4 md:p-6 min-h-[400px]">
          <TransactionList 
              ref="transactionListRef" 
              :month="selectedMonth" 
              :year="selectedYear" 
              :day="viewMode === 'DAY' ? selectedDay : null"
              @change="loadAllData" 
              @view-appointment="openAppointment" 
          />
      </div>
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
import PeriodSelector from '../../components/common/PeriodSelector.vue';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

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

const currentMonthLabel = computed(() => {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return `${months[selectedMonth.value - 1]} ${selectedYear.value}`;
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
        confirmBridge.alert({
          title: 'Erro de Carregamento',
          message: 'Não foi possível carregar os dados do agendamento.',
          type: 'danger'
        });
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
      toastBridge.getToast().add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento atualizado com sucesso!', life: 3000 });
    } else {
      await appointmentService.create(data);
      toastBridge.getToast().add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento criado com sucesso!', life: 3000 });
    }
    closeAppointmentForm();
    loadAllData();
    transactionListRef.value?.loadData();
  } catch (error) {
    console.error('Error saving appointment:', error);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Ocorreu um erro ao tentar salvar o agendamento.',
      type: 'danger'
    });
  }
};
</script>
