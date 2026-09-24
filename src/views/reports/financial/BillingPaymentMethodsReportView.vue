<template>
  <ReportPageShell
    title="Faturamento por Forma de Pagamento"
    description="Auditoria de faturamento bruto, faturamento líquido, taxas aplicadas e distribuição por forma de pagamento."
    icon="fa-solid fa-credit-card"
    badge="Financeiro"
    :loading="loading"
    :error="error"
    :month="month"
    :year="year"
    :view-mode="viewMode"
    @update:month="onMonthChange"
    @update:year="onYearChange"
    @update:view-mode="viewMode = $event"
    @retry="loadData"
  >
    <!-- KPI Summary Cards -->
    <template #kpis>
      <!-- Total Bruto -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento Bruto</p>
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-money-bill-wave"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
          {{ formatCurrency(data?.totalGross) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Total antes dos descontos</p>
      </div>

      <!-- Total Líquido -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento Líquido</p>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-wallet"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
          {{ formatCurrency(data?.totalNet) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Valor efetivamente creditado</p>
      </div>

      <!-- Descontos / Taxas -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descontos & Taxas</p>
          <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-percent"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
          {{ formatCurrency(data?.totalDiscounts) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Taxas de intermediação e descontos</p>
      </div>

      <!-- Total de Transações -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Transações</p>
          <div class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-receipt"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
          {{ totalTransactionsCount }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Transações pagas no período</p>
      </div>
    </template>

    <!-- Chart View (Chart.js 4 Doughnut) -->
    <template #chart>
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-indigo-500"></i>
            Distribuição por Forma de Pagamento
          </h2>
          <span class="text-xs text-gray-400">Participação sobre o Bruto</span>
        </div>
        
        <div v-if="!data?.methods?.length" class="text-center py-12 text-gray-400 text-sm">
          Nenhuma transação registrada no período selecionado.
        </div>
        <div v-else class="h-64 sm:h-80 w-full relative flex items-center justify-center">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </div>
    </template>

    <!-- Table View -->
    <template #table>
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i class="fa-solid fa-table-list text-indigo-500"></i>
            Detalhamento por Forma de Pagamento
          </h2>
          <button
            @click="exportCsv"
            :disabled="!data?.methods?.length"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i class="fa-solid fa-file-csv text-emerald-600"></i>
            Exportar CSV
          </button>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table class="w-full text-left text-sm border-separate border-spacing-0">
            <thead class="bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Forma de Pagamento
                </th>
                <th class="py-3 px-4 text-center whitespace-nowrap">Transações</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Bruto</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Líquido</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Descontos / Taxas</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Taxa Média (%)</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Share (%)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr
                v-for="(item, index) in sortedMethods"
                :key="item.methodId || item.methodName"
                class="transition-colors group"
                :class="index % 2 === 1
                  ? 'bg-slate-50/80 dark:bg-slate-700/30'
                  : 'bg-white dark:bg-gray-800/40'"
              >
                <!-- Coluna Fixa / Congelada -->
                <td
                  class="py-2.5 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 sticky left-0 z-10 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[145px] sm:min-w-[190px] transition-colors"
                  :class="index % 2 === 1
                    ? 'bg-[#f8fafc] dark:bg-[#1e293b] group-hover:bg-indigo-50/60 dark:group-hover:bg-slate-700'
                    : 'bg-white dark:bg-[#131b2a] group-hover:bg-indigo-50/60 dark:group-hover:bg-slate-700'"
                >
                  <div class="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] flex-shrink-0">
                    <i :class="getMethodIcon(item.methodName)"></i>
                  </div>
                  <span class="truncate leading-tight text-gray-900 dark:text-gray-100">{{ item.methodName }}</span>
                </td>

                <!-- Demais Colunas (acompanham a cor da linha) -->
                <td class="py-3.5 px-4 text-center text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  {{ item.transactionsCount }}
                </td>
                <td class="py-3.5 px-4 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  {{ formatCurrency(item.grossAmount) }}
                </td>
                <td class="py-3.5 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  {{ formatCurrency(item.netAmount) }}
                </td>
                <td class="py-3.5 px-4 text-right text-rose-500 dark:text-rose-400 whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  {{ formatCurrency((item.grossAmount || 0) - (item.netAmount || 0)) }}
                </td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {{ item.discountPercentageAverage }}%
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap group-hover:bg-indigo-50/30 dark:group-hover:bg-slate-700/40 transition-colors">
                  {{ calculateShare(item.grossAmount) }}%
                </td>
              </tr>
              <tr v-if="!data?.methods?.length">
                <td colspan="7" class="py-8 text-center text-gray-400">
                  Nenhum registro encontrado para este período.
                </td>
              </tr>
            </tbody>
            <tfoot v-if="data?.methods?.length" class="bg-gray-50 dark:bg-gray-900 font-bold border-t-2 border-gray-200 dark:border-gray-700">
              <tr>
                <td class="py-2.5 px-3 sm:py-3.5 sm:px-4 text-gray-900 dark:text-white uppercase tracking-wider text-[11px] sm:text-xs sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">
                  Total Consolidado
                </td>
                <td class="py-3.5 px-4 text-center text-gray-900 dark:text-white whitespace-nowrap">{{ totalTransactionsCount }}</td>
                <td class="py-3.5 px-4 text-right text-gray-900 dark:text-white whitespace-nowrap">{{ formatCurrency(data?.totalGross) }}</td>
                <td class="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{{ formatCurrency(data?.totalNet) }}</td>
                <td class="py-3.5 px-4 text-right text-rose-500 dark:text-rose-400 whitespace-nowrap">{{ formatCurrency(data?.totalDiscounts) }}</td>
                <td class="py-3.5 px-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">{{ consolidatedDiscountPercentage }}%</td>
                <td class="py-3.5 px-4 text-right text-gray-900 dark:text-white whitespace-nowrap">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </ReportPageShell>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Chart,
  DoughnutController,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ReportPageShell from '../components/ReportPageShell.vue';
import { useReport } from '../../../composables/useReport.js';
import { reportService } from '../../../services/reportService.js';

// Registrar componentes do Chart.js sob demanda (Tree-shaking)
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const route = useRoute();
const router = useRouter();

const currentDate = new Date();
const month = ref(Number(route.query.month) || currentDate.getMonth() + 1);
const year = ref(Number(route.query.year) || currentDate.getFullYear());

const { data, loading, error, viewMode, fetchReport } = useReport();

const chartCanvas = ref(null);
let chartInstance = null;

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);
};

const totalTransactionsCount = computed(() => {
  if (!data.value?.methods?.length) return 0;
  return data.value.methods.reduce((acc, m) => acc + (Number(m.transactionsCount) || 0), 0);
});

const consolidatedDiscountPercentage = computed(() => {
  const gross = Number(data.value?.totalGross) || 0;
  const discounts = Number(data.value?.totalDiscounts) || 0;
  if (gross <= 0) return 0;
  return ((discounts / gross) * 100).toFixed(2);
});

const sortedMethods = computed(() => {
  if (!data.value?.methods?.length) return [];
  return [...data.value.methods].sort((a, b) => {
    return (a.methodName || '').localeCompare(b.methodName || '', 'pt-BR', { sensitivity: 'base' });
  });
});

const calculateShare = (grossAmount) => {
  const total = Number(data.value?.totalGross) || 0;
  const current = Number(grossAmount) || 0;
  if (total <= 0) return '0.00';
  return ((current / total) * 100).toFixed(2);
};

const getMethodIcon = (name = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('pix')) return 'fa-brands fa-pix';
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('card')) return 'fa-regular fa-credit-card';
  if (lower.includes('débito') || lower.includes('debito')) return 'fa-solid fa-credit-card';
  if (lower.includes('dinheiro') || lower.includes('cash')) return 'fa-solid fa-money-bill-1-wave';
  if (lower.includes('boleto')) return 'fa-solid fa-barcode';
  if (lower.includes('transferência') || lower.includes('transferencia')) return 'fa-solid fa-arrow-right-arrow-left';
  return 'fa-solid fa-wallet';
};

const chartPalette = [
  '#4f46e5', // indigo-600
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f97316'  // orange-500
];

const updateChart = () => {
  if (!chartCanvas.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const methods = sortedMethods.value;
  if (methods.length === 0) return;

  const labels = methods.map((m) => m.methodName);
  const values = methods.map((m) => Number(m.grossAmount) || 0);
  const colors = labels.map((_, i) => chartPalette[i % chartPalette.length]);

  const ctx = chartCanvas.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 16,
            usePointStyle: true,
            font: {
              size: 12,
              weight: '500'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const val = context.raw || 0;
              const formatted = formatCurrency(val);
              const share = calculateShare(val);
              return ` ${context.label}: ${formatted} (${share}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
};

const loadData = async () => {
  await fetchReport(reportService.getBillingByPaymentMethod, {
    month: month.value,
    year: year.value
  });
  await nextTick();
  if (viewMode.value !== 'TABLE') {
    updateChart();
  }
};

const onMonthChange = (m) => {
  month.value = m;
  syncQueryAndReload();
};

const onYearChange = (y) => {
  year.value = y;
  syncQueryAndReload();
};

const syncQueryAndReload = () => {
  router.replace({
    query: {
      ...route.query,
      month: month.value,
      year: year.value
    }
  });
  loadData();
};

const exportCsv = () => {
  if (!sortedMethods.value.length) return;

  const rows = [
    ['Forma_Pagamento', 'Transacoes', 'Faturamento_Bruto_BRL', 'Faturamento_Liquido_BRL', 'Descontos_Taxas_BRL', 'Taxa_Media_Perc', 'Share_Perc'],
    ...(sortedMethods.value.map((m) => [
      m.methodName,
      m.transactionsCount,
      m.grossAmount,
      m.netAmount,
      (Number(m.grossAmount || 0) - Number(m.netAmount || 0)).toFixed(2),
      m.discountPercentageAverage,
      calculateShare(m.grossAmount)
    ])),
    [
      'TOTAL_CONSOLIDADO',
      totalTransactionsCount.value,
      data.value.totalGross,
      data.value.totalNet,
      data.value.totalDiscounts,
      consolidatedDiscountPercentage.value,
      '100.00'
    ]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Faturamento_Forma_Pagamento_${month.value}_${year.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

watch(viewMode, async (newMode) => {
  if (newMode !== 'TABLE') {
    await nextTick();
    updateChart();
  }
});

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>
