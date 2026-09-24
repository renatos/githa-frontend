<template>
  <ReportPageShell
    title="DRE Simplificado"
    description="Demonstrativo de receitas, despesas operacionais (OPEX), investimentos (CAPEX) e margem líquida."
    icon="fa-solid fa-file-invoice-dollar"
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
      <!-- Receita Bruta -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receita Bruta</p>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-arrow-trend-up"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
          {{ formatCurrency(data?.revenue?.total) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Total de receitas pagas</p>
      </div>

      <!-- OPEX -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Custos OPEX</p>
          <div class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-arrow-trend-down"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
          {{ formatCurrency(data?.opex?.total) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Despesas operacionais</p>
      </div>

      <!-- CAPEX -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CAPEX</p>
          <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm">
            <i class="fa-solid fa-building-columns"></i>
          </div>
        </div>
        <p class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
          {{ formatCurrency(data?.capex?.total) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Investimentos em ativos</p>
      </div>

      <!-- Lucro Líquido & Margem -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lucro Líquido</p>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :class="(data?.netProfit ?? 0) >= 0
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'"
          >
            {{ data?.netMarginPercentage ?? 0 }}% Margem
          </span>
        </div>
        <p
          class="text-2xl font-extrabold mt-2"
          :class="(data?.netProfit ?? 0) >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'"
        >
          {{ formatCurrency(data?.netProfit) }}
        </p>
        <p class="text-[11px] text-gray-400 mt-1">Resultado final do período</p>
      </div>
    </template>

    <!-- Chart View (Chart.js 4) -->
    <template #chart>
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <i class="fa-solid fa-chart-column text-indigo-500"></i>
            Comparativo de Resultados (R$)
          </h2>
          <span class="text-xs text-gray-400">Valores consolidados</span>
        </div>
        <div class="h-72 w-full relative">
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
            Estrutura Detalhada do DRE
          </h2>
          <button
            type="button"
            @click="exportCsv"
            :disabled="!data"
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
                  Classificação / Categoria
                </th>
                <th class="py-3 px-4 text-right whitespace-nowrap">Valor (R$)</th>
                <th class="py-3 px-4 text-right whitespace-nowrap">% da Receita</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <!-- 1. Receita Bruta -->
              <tr class="bg-emerald-50/60 dark:bg-emerald-950/30 font-bold text-emerald-900 dark:text-emerald-300">
                <td class="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 sticky left-0 z-10 bg-emerald-50 dark:bg-emerald-950/80 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  <i class="fa-solid fa-circle-plus text-emerald-600 text-xs"></i>
                  RECEITA BRUTA OPERACIONAL
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-emerald-700 dark:text-emerald-400">{{ formatCurrency(data?.revenue?.total) }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-semibold">100.00%</td>
              </tr>
              <tr
                v-for="item in data?.revenue?.categories || []"
                :key="item.category"
                class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <td class="py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm pl-8 sm:pl-10 text-gray-700 dark:text-gray-300 sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  {{ item.category }}
                </td>
                <td class="py-2.5 px-4 text-right text-gray-900 dark:text-white whitespace-nowrap font-medium">{{ formatCurrency(item.amount) }}</td>
                <td class="py-2.5 px-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ calcPercentage(item.amount, data?.revenue?.total) }}%</td>
              </tr>

              <!-- 2. OPEX -->
              <tr class="bg-rose-50/60 dark:bg-rose-950/30 font-bold text-rose-900 dark:text-rose-300">
                <td class="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 sticky left-0 z-10 bg-rose-50 dark:bg-rose-950/80 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  <i class="fa-solid fa-circle-minus text-rose-600 text-xs"></i>
                  CUSTOS OPERACIONAIS (OPEX)
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-rose-700 dark:text-rose-400">{{ formatCurrency(data?.opex?.total) }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-semibold">{{ calcPercentage(data?.opex?.total, data?.revenue?.total) }}%</td>
              </tr>
              <tr
                v-for="item in data?.opex?.categories || []"
                :key="item.category"
                class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <td class="py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm pl-8 sm:pl-10 text-gray-700 dark:text-gray-300 sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  {{ item.category }}
                </td>
                <td class="py-2.5 px-4 text-right text-gray-900 dark:text-white whitespace-nowrap font-medium">{{ formatCurrency(item.amount) }}</td>
                <td class="py-2.5 px-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ calcPercentage(item.amount, data?.revenue?.total) }}%</td>
              </tr>

              <!-- 3. CAPEX -->
              <tr class="bg-indigo-50/60 dark:bg-indigo-950/30 font-bold text-indigo-900 dark:text-indigo-300">
                <td class="py-2.5 px-3 sm:py-3 sm:px-4 text-xs sm:text-sm flex items-center gap-2 sticky left-0 z-10 bg-indigo-50 dark:bg-indigo-950/80 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  <i class="fa-solid fa-building-columns text-indigo-600 text-xs"></i>
                  INVESTIMENTOS DE CAPITAL (CAPEX)
                </td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-bold text-indigo-700 dark:text-indigo-400">{{ formatCurrency(data?.capex?.total) }}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap font-semibold">{{ calcPercentage(data?.capex?.total, data?.revenue?.total) }}%</td>
              </tr>
              <tr
                v-for="item in data?.capex?.categories || []"
                :key="item.category"
                class="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
              >
                <td class="py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm pl-8 sm:pl-10 text-gray-700 dark:text-gray-300 sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px]">
                  {{ item.category }}
                </td>
                <td class="py-2.5 px-4 text-right text-gray-900 dark:text-white whitespace-nowrap font-medium">{{ formatCurrency(item.amount) }}</td>
                <td class="py-2.5 px-4 text-right text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ calcPercentage(item.amount, data?.revenue?.total) }}%</td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50 dark:bg-gray-900 font-bold border-t-2 border-gray-200 dark:border-gray-700">
              <!-- 4. Lucro Líquido Final -->
              <tr>
                <td class="py-3 px-3 sm:py-3.5 sm:px-4 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2 sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-gray-900 dark:text-white min-w-[200px] sm:min-w-[260px]">
                  <i class="fa-solid fa-equals text-indigo-600"></i>
                  LUCRO LÍQUIDO DO EXERCÍCIO
                </td>
                <td
                  class="py-3.5 px-4 text-right whitespace-nowrap font-extrabold text-sm"
                  :class="(data?.netProfit ?? 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
                >
                  {{ formatCurrency(data?.netProfit) }}
                </td>
                <td class="py-3.5 px-4 text-right whitespace-nowrap font-bold text-indigo-600 dark:text-indigo-400">
                  {{ data?.netMarginPercentage ?? 0 }}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </template>
  </ReportPageShell>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import ReportPageShell from '../components/ReportPageShell.vue';
import { useReport } from '@/composables/useReport';
import { reportService } from '@/services/reportService';

// Tree-shaking: register only required Chart.js components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const route = useRoute();
const router = useRouter();

const now = new Date();
const month = ref(route.query.month ? parseInt(route.query.month) : now.getMonth() + 1);
const year = ref(route.query.year ? parseInt(route.query.year) : now.getFullYear());

const { data, loading, error, viewMode, fetchReport } = useReport();
const chartCanvas = ref(null);
let chartInstance = null;

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val ?? 0);
};

const calcPercentage = (part, total) => {
  if (!part || !total || total <= 0) return '0.00';
  return ((part / total) * 100).toFixed(2);
};

const updateChart = () => {
  if (!chartCanvas.value || !data.value) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const revenue = data.value.revenue?.total ?? 0;
  const opex = data.value.opex?.total ?? 0;
  const capex = data.value.capex?.total ?? 0;
  const netProfit = data.value.netProfit ?? 0;

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: ['Receita Bruta', 'Custos OPEX', 'Investimentos CAPEX', 'Lucro Líquido'],
      datasets: [
        {
          label: 'Total (R$)',
          data: [revenue, opex, capex, netProfit],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(244, 63, 94, 0.85)',
            'rgba(99, 102, 241, 0.85)',
            netProfit >= 0 ? 'rgba(14, 165, 233, 0.85)' : 'rgba(239, 68, 68, 0.85)'
          ],
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `Valor: ${formatCurrency(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (val) => formatCurrency(val)
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.15)'
          }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
};

const loadData = async () => {
  await fetchReport(reportService.getDre, {
    month: month.value,
    year: year.value
  });
  await nextTick();
  if (viewMode.value === 'CHART') {
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
  if (!data.value) return;

  const rows = [
    ['Classificacao', 'Categoria', 'Valor_BRL'],
    ...((data.value.revenue?.categories || []).map((c) => ['RECEITA_BRUTA', c.category, c.amount])),
    ...((data.value.opex?.categories || []).map((c) => ['OPEX', c.category, c.amount])),
    ...((data.value.capex?.categories || []).map((c) => ['CAPEX', c.category, c.amount])),
    ['TOTAL', 'LUCRO_LIQUIDO', data.value.netProfit],
    ['METRICA', 'MARGEM_PERCENTUAL', data.value.netMarginPercentage]
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `DRE_${month.value}_${year.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

watch(viewMode, async (newMode) => {
  if (newMode === 'CHART') {
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
