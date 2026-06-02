<template>
  <div class="space-y-6 animate-fadeIn">
    <!-- Header -->
    <PageHeader
      title="Métricas de Retorno (ROI)"
      subtitle="Analise o desempenho financeiro dos procedimentos atrelados a este investimento"
      icon="trending_up"
    >
      <template #actions>
        <button
          class="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 active:scale-95 text-sm"
          @click="goBack"
        >
          <span class="material-symbols-outlined text-sm">arrow_back</span>
          Voltar para Investimentos
        </button>
      </template>
    </PageHeader>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <i class="fa-solid fa-spinner animate-spin text-4xl text-indigo-600"></i>
      <p class="mt-4 text-slate-500 dark:text-slate-400">Carregando métricas...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-700 dark:text-rose-400 flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-2xl">error</span>
        <span class="font-bold">Erro ao buscar métricas</span>
      </div>
      <p class="text-sm">{{ error }}</p>
      <button
        class="self-start px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm transition-colors"
        @click="fetchMetrics"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left column: Investment details & Period selector -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Period Selector Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-500">date_range</span>
            Período de Análise
          </h3>
          
          <div class="space-y-4">
            <label class="flex flex-col">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Data Inicial</span>
              <input
                v-model="filters.startDate"
                type="date"
                class="form-input rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white h-10 px-3 text-sm focus:border-indigo-600"
              />
            </label>
            <label class="flex flex-col">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Data Final</span>
              <input
                v-model="filters.endDate"
                type="date"
                class="form-input rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white h-10 px-3 text-sm focus:border-indigo-600"
              />
            </label>
            
            <button
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              :disabled="loadingMetrics"
              @click="fetchMetrics"
            >
              <i v-if="loadingMetrics" class="fa-solid fa-spinner animate-spin"></i>
              <span>Atualizar ROI</span>
            </button>
          </div>
        </div>

        <!-- Details Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <span class="material-symbols-outlined text-indigo-500">info</span>
            Sobre o Investimento
          </h3>
          
          <div class="space-y-4 text-sm">
            <div>
              <p class="text-xs text-slate-400">Nome</p>
              <p class="font-semibold text-slate-900 dark:text-slate-100">{{ metrics.investment?.name }}</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-slate-400">Custo</p>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ formatCurrency(metrics.investment?.cost) }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400">Data de Registro</p>
                <p class="font-semibold text-slate-900 dark:text-slate-100">{{ formatDate(metrics.investment?.date) }}</p>
              </div>
            </div>
            
            <!-- Linked Services -->
            <div>
              <p class="text-xs text-slate-400 mb-2">Procedimentos Habilitados</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="service in enabledServices"
                  :key="service.id"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
                >
                  {{ service.name }}
                </span>
                <span v-if="enabledServices.length === 0" class="text-xs text-slate-500 italic">
                  Nenhum procedimento vinculado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column: Metrics Dashboard & Cards -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Scorecards row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Revenue Card -->
          <div class="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-40">
            <div class="absolute right-4 top-4 text-emerald-500 opacity-20">
              <span class="material-symbols-outlined text-6xl">payments</span>
            </div>
            <div>
              <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Faturamento Habilitado</span>
              <p class="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-mono">
                {{ formatCurrency(metrics.totalRevenue) }}
              </p>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Soma das consultas concluídas dos procedimentos associados no período.
            </p>
          </div>

          <!-- ROI Card (Flip Card) -->
          <div 
            class="flip-card h-40 cursor-pointer"
            @click="isFlipped = !isFlipped"
          >
            <div 
              class="flip-card-inner h-full w-full relative transition-transform duration-500 transform-style-3d"
              :class="{ 'rotate-y-180': isFlipped }"
            >
              <!-- Front Face -->
              <div 
                class="flip-card-front absolute inset-0 bg-gradient-to-br border rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-full backface-hidden"
                :class="roiClass"
              >
                <div class="absolute right-4 top-4 opacity-20" :class="roiTextColor">
                  <span class="material-symbols-outlined text-6xl">insights</span>
                </div>
                <div>
                  <div class="flex items-center justify-between">
                    <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Retorno sobre Investimento (ROI)</span>
                    <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline">Ver Fórmula</span>
                  </div>
                  <p class="text-3xl font-extrabold mt-2 font-mono" :class="roiTextColor">
                    {{ formatRoi(metrics.roi) }}
                  </p>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  ROI = ((Faturamento - Custo) / Custo) * 100
                </p>
              </div>
              
              <!-- Back Face (Detailed Breakdown) -->
              <div 
                class="flip-card-back absolute inset-0 bg-white dark:bg-slate-800 border rounded-2xl p-6 backface-hidden rotate-y-180 flex flex-col justify-between h-full"
                :class="metrics.roi < 0 ? 'border-rose-500/20' : 'border-emerald-500/20'"
              >
                <div class="absolute right-4 top-4 opacity-10">
                  <span class="material-symbols-outlined text-6xl text-indigo-500">calculate</span>
                </div>
                
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Memória de Cálculo</h3>
                    <span class="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold hover:underline">Voltar</span>
                  </div>
                  <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div class="flex justify-between">
                      <span>Faturamento (F):</span>
                      <span class="font-mono">{{ formatCurrency(metrics.totalRevenue) }}</span>
                    </div>
                    <div class="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>(-) Custo (C):</span>
                      <span class="font-mono font-bold">- {{ formatCurrency(metrics.investment?.cost) }}</span>
                    </div>
                    <div class="flex justify-between border-t border-slate-100 dark:border-slate-700/50 pt-1 text-indigo-600 dark:text-indigo-400">
                      <span>Lucro Bruto:</span>
                      <span class="font-mono font-bold">{{ formatCurrency((metrics.totalRevenue || 0) - (metrics.investment?.cost || 0)) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="border-t border-slate-200 dark:border-slate-700/50 pt-2 flex justify-between items-center text-xs mt-auto">
                  <span class="font-semibold text-slate-700 dark:text-slate-300">Total ROI:</span>
                  <span class="font-mono font-black" :class="roiTextColor">{{ formatRoi(metrics.roi) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ROI Indicator Chart / Box -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center">
          <div class="relative w-48 h-48 flex items-center justify-center rounded-full border-8" :class="roiCircleBorder">
            <div class="text-center">
              <p class="text-4xl font-extrabold" :class="roiTextColor">{{ formatRoi(metrics.roi) }}</p>
              <p class="text-xs text-slate-400 uppercase tracking-widest mt-1">Status do ROI</p>
            </div>
          </div>

          <div class="mt-6 max-w-md">
            <h4 class="text-base font-bold text-slate-900 dark:text-white mb-2">{{ roiStatusTitle }}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ roiStatusMessage }}
            </p>
          </div>
        </div>

        <!-- Histórico de Fechamentos Mensais -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-indigo-500">history</span>
              Histórico de Fechamentos Mensais
            </h3>
            <button
              @click="fetchHistory"
              class="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-semibold flex items-center gap-1"
              :disabled="loadingHistory"
            >
              <span class="material-symbols-outlined text-sm" :class="{ 'animate-spin': loadingHistory }">refresh</span>
              Atualizar Histórico
            </button>
          </div>

          <div v-if="loadingHistory && history.length === 0" class="flex justify-center py-6">
            <span class="material-symbols-outlined animate-spin text-2xl text-indigo-600">progress_activity</span>
          </div>

          <div v-else-if="history.length === 0" class="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            Nenhum histórico de fechamento disponível.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-500 dark:text-slate-400">
              <thead class="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" class="px-4 py-3">Período</th>
                  <th scope="col" class="px-4 py-3 text-right">Investido</th>
                  <th scope="col" class="px-4 py-3 text-right">Faturamento</th>
                  <th scope="col" class="px-4 py-3 text-right">Lucro Bruto</th>
                  <th scope="col" class="px-4 py-3 text-right">ROI</th>
                  <th scope="col" class="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                <tr v-for="item in history" :key="item.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {{ formatPeriod(item.year, item.month) }}
                  </td>
                  <td class="px-4 py-3 text-right font-mono text-slate-900 dark:text-white">
                    {{ formatCurrency(item.investedAmount) }}
                  </td>
                  <td class="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(item.revenueAmount) }}
                  </td>
                  <td class="px-4 py-3 text-right font-mono" :class="item.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ formatCurrency(item.netProfit) }}
                  </td>
                  <td class="px-4 py-3 text-right font-mono font-bold" :class="item.roi >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                    {{ formatRoi(item.roi) }}
                  </td>
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="viewTransactions(item)"
                        :disabled="item.revenueAmount <= 0"
                        title="Ver Transações"
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold p-1.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <span class="material-symbols-outlined text-sm flex items-center justify-center">list_alt</span>
                      </button>
                      <button
                        @click="recalculatePeriod(item.year, item.month)"
                        class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold text-[11px] flex items-center justify-center gap-1 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50 hover:scale-105 active:scale-95 transition-all"
                        :disabled="recalculating"
                      >
                        <span class="material-symbols-outlined text-xs">sync</span>
                        Recalcular
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- BaseModal to display monthly transactions -->
      <BaseModal
        :show="showTransactionsModal"
        :title="'Receitas de ' + selectedPeriodLabel"
        subtitle="Transações financeiras vinculadas a este investimento no período"
        icon="fa-solid fa-file-invoice-dollar"
        maxWidth="max-w-3xl"
        @close="showTransactionsModal = false"
      >
        <div v-if="loadingModalTransactions" class="flex flex-col items-center justify-center py-10">
          <span class="material-symbols-outlined animate-spin text-3xl text-indigo-600">progress_activity</span>
          <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Carregando transações...</p>
        </div>
        <div v-else-if="modalTransactions.length === 0" class="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
          Nenhuma transação financeira encontrada para este período.
        </div>
        <div v-else class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-500 dark:text-slate-400">
              <thead class="text-[10px] text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" class="px-4 py-2.5">Data de Pagamento</th>
                  <th scope="col" class="px-4 py-2.5">Descrição</th>
                  <th scope="col" class="px-4 py-2.5">Cliente</th>
                  <th scope="col" class="px-4 py-2.5">Forma</th>
                  <th scope="col" class="px-4 py-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700/50">
                <tr v-for="t in modalTransactions" :key="t.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/10">
                  <td class="px-4 py-2.5 font-mono text-slate-900 dark:text-white">
                    {{ formatDateTime(t.paymentDate) }}
                  </td>
                  <td class="px-4 py-2.5 text-slate-900 dark:text-white font-medium">
                    {{ t.description }}
                  </td>
                  <td class="px-4 py-2.5 text-slate-700 dark:text-slate-300">
                    {{ t.clientName || 'N/A' }}
                  </td>
                  <td class="px-4 py-2.5 whitespace-nowrap">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {{ t.paymentMethodName || 'N/A' }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(t.amount) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <template #footer>
          <button
            @click="showTransactionsModal = false"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
          >
            Fechar
          </button>
        </template>
      </BaseModal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../components/common/PageHeader.vue';
import BaseModal from '../components/common/BaseModal.vue';
import { investmentService } from '../services/investmentService';

const route = useRoute();
const router = useRouter();

const investmentId = route.params.id;
const isFlipped = ref(false);

// Date defaults: start of current month, end of current month
const getStartOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().substring(0, 10);
};

const getEndOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().substring(0, 10);
};

const filters = ref({
  startDate: getStartOfCurrentMonth(),
  endDate: getEndOfCurrentMonth()
});

const loading = ref(true);
const loadingMetrics = ref(false);
const error = ref('');
const metrics = ref({});
const enabledServices = ref([]);

const history = ref([]);
const loadingHistory = ref(false);
const recalculating = ref(false);

const showTransactionsModal = ref(false);
const modalTransactions = ref([]);
const loadingModalTransactions = ref(false);
const selectedPeriodLabel = ref('');

const viewTransactions = async (item) => {
  showTransactionsModal.value = true;
  loadingModalTransactions.value = true;
  selectedPeriodLabel.value = formatPeriod(item.year, item.month);
  modalTransactions.value = [];
  try {
    const res = await investmentService.getInvestmentMetricsTransactions(investmentId, item.year, item.month);
    modalTransactions.value = res.data;
  } catch (err) {
    console.error('Failed to fetch transactions for metrics:', err);
  } finally {
    loadingModalTransactions.value = false;
  }
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const fetchHistory = async () => {
  loadingHistory.value = true;
  try {
    const res = await investmentService.getInvestmentMetricsHistory(investmentId);
    history.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingHistory.value = false;
  }
};

const recalculatePeriod = async (year, month) => {
  recalculating.value = true;
  try {
    await investmentService.recalculateInvestmentMetrics(investmentId, year, month);
    await Promise.all([fetchHistory(), fetchMetrics()]);
  } catch (err) {
    console.error(err);
  } finally {
    recalculating.value = false;
  }
};

const formatPeriod = (year, month) => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());
};

const fetchMetrics = async () => {
  if (!filters.value.startDate || !filters.value.endDate) {
    error.value = 'Ambas as datas inicial e final são obrigatórias.';
    return;
  }

  loadingMetrics.value = true;
  error.value = '';
  try {
    const res = await investmentService.getInvestmentMetrics(
      investmentId,
      filters.value.startDate,
      filters.value.endDate
    );
    metrics.value = res.data;
    if (res.data.investment && res.data.investment.enabledServices) {
      enabledServices.value = res.data.investment.enabledServices;
    } else {
      // Fallback: fetch investment details if not fully nested in metrics
      const fullRes = await investmentService.listInvestments();
      const match = fullRes.data.find(inv => String(inv.id) === String(investmentId));
      if (match) {
        metrics.value.investment = match;
        enabledServices.value = match.enabledServices || [];
      }
    }
  } catch (err) {
    console.error(err);
    error.value = err.response?.data?.message || 'Falha ao recuperar as métricas do investimento.';
  } finally {
    loading.value = false;
    loadingMetrics.value = false;
  }
};

onMounted(async () => {
  try {
    const fullRes = await investmentService.listInvestments();
    const match = fullRes.data.find(inv => String(inv.id) === String(investmentId));
    if (match && match.date) {
      filters.value.startDate = match.date;
    }
  } catch (err) {
    console.error('Failed to get investment registration date:', err);
  }
  fetchMetrics();
  fetchHistory();
});

// UI Class Computeds
const roiClass = computed(() => {
  const r = metrics.value.roi || 0;
  if (r > 0) return 'from-emerald-500/10 to-indigo-500/10 dark:from-emerald-500/5 dark:to-indigo-500/5 border-emerald-500/20';
  if (r < 0) return 'from-rose-500/10 to-orange-500/10 dark:from-rose-500/5 dark:to-orange-500/5 border-rose-500/20';
  return 'from-slate-500/10 to-slate-600/10 dark:from-slate-500/5 dark:to-slate-600/5 border-slate-500/20';
});

const roiTextColor = computed(() => {
  const r = metrics.value.roi || 0;
  if (r > 0) return 'text-emerald-600 dark:text-emerald-400';
  if (r < 0) return 'text-rose-600 dark:text-rose-400';
  return 'text-slate-600 dark:text-slate-400';
});

const roiCircleBorder = computed(() => {
  const r = metrics.value.roi || 0;
  if (r > 0) return 'border-emerald-500/30';
  if (r < 0) return 'border-rose-500/30';
  return 'border-slate-500/30';
});

const roiStatusTitle = computed(() => {
  const r = metrics.value.roi || 0;
  if (r > 0) return 'Retorno Positivo! 🎉';
  if (r < 0) return 'Retorno Negativo (Prejuízo)';
  return 'Sem Retorno Calculado';
});

const roiStatusMessage = computed(() => {
  const r = metrics.value.roi || 0;
  if (r > 0) {
    return 'Excelente! As receitas geradas pelos procedimentos habilitados cobriram totalmente o custo do investimento.';
  }
  if (r < 0) {
    return 'O faturamento dos procedimentos vinculados ainda é inferior ao valor investido neste período.';
  }
  return 'Nenhum procedimento habilitou receitas no período ou o investimento não possui custo cadastrado.';
});

const goBack = () => {
  router.push('/investments');
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

const formatRoi = (value) => {
  const val = parseFloat(value || 0);
  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
};
</script>

<style scoped>
.flip-card {
  perspective: 1000px;
}
.flip-card-inner {
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

