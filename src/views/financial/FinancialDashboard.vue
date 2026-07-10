<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <!-- Header Row -->
    <PageHeader
      title="Financeiro"
      subtitle="Gestão de fluxo de caixa e transações em tempo real."
    >
      <template #actions>
        <!-- Period Navigator (Unified) -->
        <PeriodSelector 
          v-if="currentTab === 0"
          v-model:view-mode="viewMode"
          v-model:month="selectedMonth"
          v-model:year="selectedYear"
          v-model:day="selectedDay"
          @change="loadAllData"
        />
      </template>
    </PageHeader>

    <TabNavigation 
      v-model="currentTab"
      :tabs="dashboardTabs"
    />
    
    <div v-show="currentTab === 0" class="flex flex-col gap-6">
      <!-- Summary Cards (Monthly Context) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Income Card -->
      <div class="relative group overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5 h-[160px] flex flex-col justify-between">
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <i class="fa-solid fa-arrow-trend-up text-5xl text-emerald-500"></i>
        </div>
        <div>
          <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Receitas ({{ currentMonthLabel }})</h3>
          <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">{{ formatCurrency(summary.totalIncome) }}</div>
        </div>
        <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50 mt-auto">
          <span class="mr-2">Pendente:</span>
          <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(summary.pendingIncome || 0) }}</span>
        </div>
      </div>
      
      <!-- Expense Card (Flip Card) -->
      <div 
        class="flip-card h-[160px] cursor-pointer"
        @click="isExpenseFlipped = !isExpenseFlipped"
      >
        <div 
          class="flip-card-inner h-full w-full relative transition-transform duration-500 transform-style-3d"
          :class="{ 'rotate-y-180': isExpenseFlipped }"
        >
          <!-- Front Face -->
          <div 
            class="flip-card-front absolute inset-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:border-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/5 backface-hidden flex flex-col justify-between"
          >
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <i class="fa-solid fa-arrow-trend-down text-5xl text-rose-500"></i>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Despesas ({{ currentMonthLabel }})</h3>
                <span class="text-[10px] text-rose-500 dark:text-rose-400 font-bold hover:underline">Ver Tipos</span>
              </div>
              <div class="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-2">{{ formatCurrency(summary.totalExpense) }}</div>
            </div>
            <div class="flex items-center text-xs text-rose-600 dark:text-rose-400 font-bold bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50 mt-auto">
              <span class="mr-2">Pendente:</span>
              <span>{{ formatCurrency(summary.pendingExpense || 0) }}</span>
            </div>
          </div>
          
          <!-- Back Face -->
          <div 
            class="flip-card-back absolute inset-0 bg-white dark:bg-slate-800 border border-rose-500/30 dark:border-rose-500/40 rounded-2xl p-6 backface-hidden rotate-y-180 flex flex-col justify-between"
          >
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <i class="fa-solid fa-chart-pie text-5xl text-rose-500"></i>
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Origem das Despesas</h3>
                <span class="text-[10px] text-rose-500 dark:text-rose-400 font-bold hover:underline">Voltar</span>
              </div>
              <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>Operacional (OPEX):</span>
                  <span class="font-mono">{{ formatCurrency(summary.totalOpex || 0) }}</span>
                </div>
                <div class="flex justify-between text-slate-400 dark:text-slate-500 text-[10px] pl-2">
                  <span>Pendentes OPEX:</span>
                  <span class="font-mono">{{ formatCurrency(summary.pendingOpex || 0) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Investimento (CAPEX):</span>
                  <span class="font-mono">{{ formatCurrency(summary.totalCapex || 0) }}</span>
                </div>
                <div class="flex justify-between text-slate-400 dark:text-slate-500 text-[10px] pl-2">
                  <span>Pendentes CAPEX:</span>
                  <span class="font-mono">{{ formatCurrency(summary.pendingCapex || 0) }}</span>
                </div>
              </div>
            </div>
            
            <div class="border-t border-slate-200 dark:border-slate-700/50 pt-2 flex justify-between items-center text-xs mt-auto">
              <span class="font-semibold text-slate-700 dark:text-slate-300">Total Despesas:</span>
              <span class="font-mono font-black text-rose-600 dark:text-rose-400">{{ formatCurrency(summary.totalExpense) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Balance Card (Flip Card) -->
      <div 
        class="flip-card h-[160px] cursor-pointer"
        @click="isFlipped = !isFlipped"
      >
        <div 
          class="flip-card-inner h-full w-full relative transition-transform duration-500 transform-style-3d"
          :class="{ 'rotate-y-180': isFlipped }"
        >
          <!-- Front Face (Option 2: Compact Equation) -->
          <div 
            class="flip-card-front absolute inset-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 backface-hidden flex flex-col justify-between"
            :class="summary.balance < 0 ? 'hover:border-rose-500/30' : 'hover:border-indigo-500/30'"
          >
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <i class="fa-solid fa-scale-balanced text-5xl" :class="summary.balance < 0 ? 'text-rose-500' : 'text-indigo-500'"></i>
            </div>
            
            <div>
              <div class="flex items-center justify-between">
                <h3 class="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Saldo Acumulado</h3>
                <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline">Ver Fórmula</span>
              </div>
              <div class="text-3xl font-bold mb-2 transition-colors" :class="summary.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'">
                {{ formatCurrency(summary.balance) }}
              </div>
            </div>

            <div class="flex items-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700/50 mt-auto">
              <span class="mr-2">Soma Pendentes:</span>
              <span class="font-medium" :class="summary.pendingBalance < 0 ? 'text-rose-600 dark:text-rose-500' : 'text-slate-700 dark:text-slate-300'">
                {{ formatCurrency(summary.pendingBalance || 0) }}
              </span>
            </div>
          </div>
          
          <!-- Back Face (Option 4: Detailed Breakdown) -->
          <div 
            class="flip-card-back absolute inset-0 bg-white dark:bg-slate-800 border border-indigo-500/30 dark:border-indigo-500/40 rounded-2xl p-6 backface-hidden rotate-y-180 flex flex-col justify-between"
          >
            <div class="absolute top-0 right-0 p-4 opacity-10">
              <i class="fa-solid fa-calculator text-5xl text-indigo-500"></i>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Detalhamento do Cálculo</h3>
                <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline">Voltar</span>
              </div>
              <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex justify-between">
                  <span>Saldo Anterior (Mês Ant.):</span>
                  <span class="font-mono">{{ formatCurrency(previousBalance) }}</span>
                </div>
                <div class="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>(+) Receitas do Mês:</span>
                  <span class="font-mono font-bold">+ {{ formatCurrency(summary.totalIncome) }}</span>
                </div>
                <div class="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>(-) Despesas do Mês:</span>
                  <span class="font-mono font-bold">- {{ formatCurrency(summary.totalExpense) }}</span>
                </div>
              </div>
            </div>
            
            <div class="border-t border-slate-200 dark:border-slate-700/50 pt-2 flex justify-between items-center text-xs mt-auto">
              <span class="font-semibold text-slate-700 dark:text-slate-300">Total Acumulado:</span>
              <span class="font-mono font-black text-indigo-600 dark:text-indigo-400">{{ formatCurrency(summary.balance) }}</span>
            </div>
          </div>
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

    <!-- Credit Cards Tab Content -->
    <div v-show="currentTab === 1" class="flex flex-col gap-6 animate-in fade-in duration-300">
      <CreditCardList ref="creditCardListRef" @save="onCardSaved" />
      <CreditCardBillPanel ref="creditCardBillPanelRef" @bill-paid="onBillPaid" @expense-changed="onExpenseChanged" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import TabNavigation from '../../components/common/TabNavigation.vue';
import CreditCardList from '../../components/financial/CreditCardList.vue';
import CreditCardBillPanel from '../../components/financial/CreditCardBillPanel.vue';
import financialService from '../../services/financialService';
import { appointmentService } from '../../services/appointmentService';
import TransactionList from './TransactionList.vue';
import AppointmentForm from '../../components/AppointmentForm.vue';
import PeriodSelector from '../../components/common/PeriodSelector.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import { confirmBridge } from '../../services/confirmBridge';
import { toastBridge } from '../../services/toastBridge';

const currentTab = ref(0);
const dashboardTabs = [
  { label: 'Fluxo de Caixa', icon: 'payments' },
  { label: 'Cartões de Crédito', icon: 'credit_card' }
];
const viewMode = ref('MONTH'); // 'MONTH' or 'DAY'
const isFlipped = ref(false);
const isExpenseFlipped = ref(false);

const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
});

const previousBalance = computed(() => {
  return (summary.value.balance || 0) - (summary.value.totalIncome || 0) + (summary.value.totalExpense || 0);
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
const creditCardBillPanelRef = ref(null);
const creditCardListRef = ref(null);

const onCardSaved = () => {
  creditCardBillPanelRef.value?.loadCards?.();
  creditCardBillPanelRef.value?.loadData?.();
  creditCardListRef.value?.refreshList?.();
};

const onBillPaid = () => {
  transactionListRef.value?.loadData();
  creditCardListRef.value?.refreshList?.();
  loadAllData();
};

const onExpenseChanged = () => {
  creditCardListRef.value?.refreshList?.();
  loadAllData();
};

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
  creditCardBillPanelRef.value?.loadData?.();
  creditCardBillPanelRef.value?.loadCards?.();
  creditCardListRef.value?.refreshList?.();
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

<style scoped>
.flip-card {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
