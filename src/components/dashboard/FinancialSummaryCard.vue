<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-5 lg:p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 lg:mb-6">
      <h2 class="text-base lg:text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <span>💰</span> Resumo Financeiro (Mês Atual)
      </h2>
      <router-link to="/financials" class="text-gray-400 hover:text-indigo-500 transition-colors" title="Abrir Módulo Financeiro">
        <i class="fa-solid fa-arrow-right"></i>
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button @click="fetchFinancialSummary" class="text-sm text-red-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!summary" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum dado financeiro disponível para este mês.
    </div>

    <!-- Content: 3-col on mobile, vertical on desktop -->
    <div v-else class="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-0 lg:space-y-5 flex-1">
      <!-- Receitas -->
      <div class="text-center lg:text-left">
        <p class="text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 dark:text-slate-500 mb-1 font-semibold">RECEITAS (PAGAS)</p>
        <div class="text-base lg:text-2xl font-bold text-green-600 dark:text-[#10B981]">{{ formatCurrency(summary.totalIncome || 0) }}</div>
        <div class="text-[10px] lg:text-sm text-gray-400 dark:text-slate-500">Pendentes: {{ formatCurrency(summary.totalPendingIncome || 0) }}</div>
      </div>
      <!-- Divider (desktop only) -->
      <div class="hidden lg:block h-px bg-gray-100 dark:bg-slate-700/50"></div>
      <!-- Despesas -->
      <div class="text-center lg:text-left">
        <p class="text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 dark:text-slate-500 mb-1 font-semibold">DESPESAS (PAGAS)</p>
        <div class="text-base lg:text-2xl font-bold text-red-600 dark:text-[#EF4444]">{{ formatCurrency(summary.totalExpenses || 0) }}</div>
        <div class="text-[10px] lg:text-sm text-gray-400 dark:text-slate-500">Pendentes: {{ formatCurrency(summary.totalPendingExpenses || 0) }}</div>
      </div>
      <!-- Divider (desktop only) -->
      <div class="hidden lg:block h-px bg-gray-100 dark:bg-slate-700/50"></div>
      <!-- Saldo -->
      <div class="text-center lg:text-left">
        <p class="text-[10px] lg:text-xs uppercase tracking-wider text-gray-500 dark:text-slate-500 mb-1 font-semibold">SALDO (RECEBIDO - PAGO)</p>
        <div class="text-base lg:text-2xl font-bold" :class="balanceColor">{{ formatCurrency(summary.balance || 0) }}</div>
        <div class="text-[10px] lg:text-sm text-gray-400 dark:text-slate-500">Margem: {{ calculateMargin(summary.totalIncome, summary.totalExpenses) }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import financialService from '../../services/financialService';
import { formatCurrency } from '../../utils/formatters';

const loading = ref(true);
const error = ref(false);
const summary = ref(null);

const balanceColor = computed(() => {
  if (!summary.value) return 'text-gray-900 dark:text-white';
  if (summary.value.balance > 0) return 'text-purple-600 dark:text-[#8B5CF6]';
  if (summary.value.balance < 0) return 'text-red-600 dark:text-[#EF4444]';
  return 'text-gray-900 dark:text-white';
});

const calculateMargin = (income, expense) => {
  if (!income || income === 0) return '0.0';
  const margin = ((income - (expense || 0)) / income) * 100;
  return margin.toFixed(1);
};

const fetchFinancialSummary = async () => {
  loading.value = true;
  error.value = false;
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const response = await financialService.getSummary(month, year);
    if (response && response.data) {
      summary.value = {
        totalIncome: response.data.totalIncome || 0,
        totalExpenses: response.data.totalExpense || 0,
        balance: response.data.balance || 0,
        totalPendingIncome: response.data.pendingIncome || 0,
        totalPendingExpenses: response.data.pendingExpense || 0
      };
    } else {
      error.value = true;
    }
  } catch (err) {
    console.error('Failed to fetch financial summary:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFinancialSummary();
});
</script>
