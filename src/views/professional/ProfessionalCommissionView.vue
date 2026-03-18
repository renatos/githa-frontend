<template>
  <div class="p-4 md:p-6 flex flex-col gap-6 animate-fade-in">
    <!-- Breadcrumb (External to header box for better hierarchy) -->
    <div class="flex items-center gap-2 text-xs font-semibold text-indigo-500/80 uppercase tracking-widest px-1">
      <router-link to="/professionals" class="hover:text-indigo-400 transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">arrow_back</span>
        Profissionais
      </router-link>
      <span class="text-slate-600">/</span>
      <span class="text-slate-500">Extrato de Comissões</span>
    </div>

    <!-- Standard Header Box -->
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white m-0 flex items-center gap-3">
          <span class="material-symbols-outlined text-2xl text-indigo-600">account_balance_wallet</span>
          Extrato: {{ balanceData.professionalName || '...' }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1 italic">Consulte o detalhamento de ganhos e retiradas do profissional.</p>
      </div>

      <MonthYearSelector 
        v-model:month="selectedMonth"
        v-model:year="selectedYear"
      />
    </header>

    <!-- Summary Cards (Glassmorphism) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="card in summaryCards" 
        :key="card.label" 
        class="relative group overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:-translate-y-1"
      >
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative flex flex-col items-start gap-4">
          <div :class="card.iconBg" class="p-3 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20">
            <span class="material-symbols-outlined">{{ card.icon }}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ card.label }}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(card.value) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Section -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Commissions Detail -->
      <section class="xl:col-span-9 space-y-4">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-500">receipt_long</span>
          Detalhamento de Comissões
        </h2>
        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <GenericTable 
            :columns="commissionColumns" 
            :items="balanceData.commissionItems"
          >
            <template #cell-calculatedCommissionAmount="{ value }">
              <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ formatCurrency(value) }}</span>
            </template>
            <template #cell-paymentDate="{ value }">
              <span class="text-slate-500">{{ formatDate(value) }}</span>
            </template>
            <template #cell-itemGrossAmount="{ value }">
              <span class="text-xs text-slate-400">{{ formatCurrency(value) }} (Bruto)</span>
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 italic">event_busy</span>
                <p>Nenhuma comissão registrada neste período.</p>
              </div>
            </template>
          </GenericTable>
        </div>
      </section>

      <!-- Withdrawals Detail -->
      <section class="xl:col-span-3 space-y-4">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-rose-500">payments</span>
          Retiradas Realizadas
        </h2>
        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <GenericTable 
            :columns="withdrawalColumns" 
            :items="balanceData.withdrawalItems"
          >
            <template #cell-withdrawalAmount="{ value }">
              <span class="font-bold text-rose-600 dark:text-rose-400">- {{ formatCurrency(value) }}</span>
            </template>
            <template #cell-paymentDate="{ value }">
              <span class="text-slate-500">{{ formatDate(value) }}</span>
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 italic">money_off</span>
                <p>Nenhuma retirada realizada neste período.</p>
              </div>
            </template>
          </GenericTable>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { professionalService } from '../../services/professionalService';
import GenericTable from '../../components/common/GenericTable.vue';
import MonthYearSelector from '../../components/common/MonthYearSelector.vue';

const route = useRoute();
const professionalId = route.params.id;

// Filter State
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const loading = ref(false);

const balanceData = ref({
  professionalName: '',
  commissionAmount: 0,
  totalSalesAmount: 0,
  totalWithdrawalsAmount: 0,
  netAmountToReceive: 0,
  commissionItems: [],
  withdrawalItems: []
});

// Summary Data for Cards
const summaryCards = computed(() => [
  { 
    label: 'Bruto em Vendas', 
    value: balanceData.value.totalSalesAmount, 
    icon: 'moving', 
    iconBg: 'bg-emerald-500' 
  },
  { 
    label: 'Comissão Bruta', 
    value: balanceData.value.commissionAmount, 
    icon: 'star', 
    iconBg: 'bg-indigo-500' 
  },
  { 
    label: 'Total Retiradas', 
    value: balanceData.value.totalWithdrawalsAmount, 
    icon: 'output', 
    iconBg: 'bg-rose-500' 
  },
  { 
    label: 'Saldo Líquido', 
    value: balanceData.value.netAmountToReceive, 
    icon: 'savings', 
    iconBg: 'bg-amber-500' 
  },
]);

// Table Columns
const commissionColumns = [
  { key: 'paymentDate', label: 'Data', width: '120px' },
  { key: 'clientName', label: 'Cliente' },
  { key: 'itemDescription', label: 'Serviço' },
  { key: 'itemGrossAmount', label: 'Valor', align: 'right', width: '140px' },
  { key: 'calculatedCommissionAmount', label: 'Comissão', align: 'right', width: '120px' },
];

const withdrawalColumns = [
  { key: 'paymentDate', label: 'Data', width: '120px' },
  { key: 'withdrawalAmount', label: 'Valor', align: 'right' },
];

const fetchBalance = async () => {
  loading.value = true;
  try {
    const response = await professionalService.getCommissionBalance(
      professionalId, 
      selectedMonth.value, 
      selectedYear.value
    );
    balanceData.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar extrato:', error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

watch([selectedMonth, selectedYear], fetchBalance);

onMounted(fetchBalance);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}
</style>
