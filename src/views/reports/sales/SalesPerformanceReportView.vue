<template>
  <ReportPageShell
    v-model:view-mode="viewMode"
    v-model:month="month"
    v-model:year="year"
    title="Desempenho de Vendas"
    description="Procedimentos e produtos mais vendidos, ticket médio e divisão de faturamento do catálogo."
    icon="fa-solid fa-bag-shopping"
    badge="Vendas"
    :loading="loading"
    :error="error"
    @period-change="onPeriodChange"
    @retry="loadData"
  >
    <!-- KPIs Slot -->
    <template #kpis>
      <!-- KPI 1: Faturamento Bruto -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento Bruto</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <i class="fa-solid fa-sack-dollar text-sm"></i>
          </div>
        </div>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-3">
          {{ formatCurrency(data?.totalGrossSales) }}
        </p>
        <span class="text-xs text-gray-400 mt-1 block">
          Líquido: {{ formatCurrency(data?.totalNetSales) }}
        </span>
      </div>

      <!-- KPI 2: Volume de Vendas -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendas Realizadas</span>
          <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <i class="fa-solid fa-receipt text-sm"></i>
          </div>
        </div>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-3">
          {{ data?.totalSalesCount || 0 }}
        </p>
        <span class="text-xs text-gray-400 mt-1 block">
          No período selecionado
        </span>
      </div>

      <!-- KPI 3: Ticket Médio -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</span>
          <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <i class="fa-solid fa-calculator text-sm"></i>
          </div>
        </div>
        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-3">
          {{ formatCurrency(data?.averageTicket) }}
        </p>
        <span class="text-xs text-gray-400 mt-1 block">
          Média por transação
        </span>
      </div>

      <!-- KPI 4: Descontos Concedidos -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total em Descontos</span>
          <div class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <i class="fa-solid fa-tag text-sm"></i>
          </div>
        </div>
        <p class="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-3">
          {{ formatCurrency(data?.totalDiscounts) }}
        </p>
        <span class="text-xs text-gray-400 mt-1 block">
          {{ discountPercentage }}% do faturamento bruto
        </span>
      </div>
    </template>

    <!-- Chart View -->
    <template #chart>
      <div class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Rosca: Procedimentos vs Produtos -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-indigo-500"></i>
                Procedimentos vs. Produtos
              </h3>
              <span class="text-xs text-gray-400">Divisão de Faturamento</span>
            </div>
            <div v-if="!hasSales" class="text-center py-16 text-gray-400 text-xs">
              Nenhuma venda registrada no período selecionado.
            </div>
            <div v-else class="h-64 sm:h-72 w-full relative flex items-center justify-center">
              <canvas ref="donutCanvas"></canvas>
            </div>
          </div>

          <!-- Barras: Top Procedimentos -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-chart-simple text-emerald-500"></i>
                Top Procedimentos por Faturamento
              </h3>
              <span class="text-xs text-gray-400">Até 5 mais vendidos</span>
            </div>
            <div v-if="!data?.topServices?.length" class="text-center py-16 text-gray-400 text-xs">
              Nenhum procedimento executado no período.
            </div>
            <div v-else class="h-64 sm:h-72 w-full relative flex items-center justify-center">
              <canvas ref="barCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Table View -->
    <template #table>
      <div class="space-y-8">
        <!-- Actions Bar -->
        <div class="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/60 pb-3">
          <div class="flex items-center gap-3">
            <h2 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <i class="fa-solid fa-table-list text-indigo-500"></i>
              Detalhamento de Vendas do Período
            </h2>
          </div>
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!hasSales"
            @click="exportCsv"
          >
            <i class="fa-solid fa-file-csv text-emerald-600"></i>
            Exportar CSV
          </button>
        </div>

        <!-- Section 1: Top Procedimentos -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-sparkles text-indigo-500"></i>
              Top Procedimentos & Serviços
            </h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Total Categoria: <strong class="text-gray-900 dark:text-white">{{ formatCurrency(data?.serviceRevenue) }}</strong>
              ({{ data?.serviceRevenuePercentage || 0 }}% do faturamento)
            </span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table class="w-full text-left text-sm border-separate border-spacing-0">
              <thead class="bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Procedimento
                  </th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Qtd Executada</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Bruto</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Líquido</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Descontos</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Share Categoria (%)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-if="!data?.topServices?.length">
                  <td colspan="6" class="py-8 text-center text-gray-400 text-xs">
                    Nenhum procedimento registrado no período.
                  </td>
                </tr>
                <tr
                  v-for="(item, index) in data?.topServices || []"
                  :key="item.itemId || index"
                  class="transition-colors group"
                  :class="index % 2 === 1
                    ? 'bg-slate-50/80 dark:bg-slate-700/30'
                    : 'bg-white dark:bg-gray-800/40'"
                >
                  <!-- Coluna Fixa / Congelada -->
                  <td
                    class="py-2.5 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 sticky left-0 z-10 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[160px] sm:min-w-[220px] transition-colors"
                    :class="index % 2 === 1
                      ? 'bg-slate-50/95 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-800/90'"
                  >
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      :class="index === 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        : index === 1
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="truncate" :title="item.itemName">{{ item.itemName }}</span>
                  </td>
                  <td class="py-3 px-4 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ item.quantity }}
                  </td>
                  <td class="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {{ formatCurrency(item.grossRevenue) }}
                  </td>
                  <td class="py-3 px-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ formatCurrency(item.netRevenue) }}
                  </td>
                  <td class="py-3 px-4 text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {{ formatCurrency(item.discountAmount) }}
                  </td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      {{ item.percentageOfCategory || 0 }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section 2: Top Produtos -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-box-open text-emerald-500"></i>
              Top Produtos (Home-Care)
            </h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              Total Categoria: <strong class="text-gray-900 dark:text-white">{{ formatCurrency(data?.productRevenue) }}</strong>
              ({{ data?.productRevenuePercentage || 0 }}% do faturamento)
            </span>
          </div>

          <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table class="w-full text-left text-sm border-separate border-spacing-0">
              <thead class="bg-gray-50 dark:bg-gray-900 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="py-2.5 px-3 sm:py-3 sm:px-4 text-[11px] sm:text-xs sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    Produto
                  </th>
                  <th class="py-3 px-4 text-center whitespace-nowrap">Qtd Vendida</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Bruto</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Faturamento Líquido</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Descontos</th>
                  <th class="py-3 px-4 text-right whitespace-nowrap">Share Categoria (%)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                <tr v-if="!data?.topProducts?.length">
                  <td colspan="6" class="py-8 text-center text-gray-400 text-xs">
                    Nenhum produto registrado no período.
                  </td>
                </tr>
                <tr
                  v-for="(item, index) in data?.topProducts || []"
                  :key="item.itemId || index"
                  class="transition-colors group"
                  :class="index % 2 === 1
                    ? 'bg-slate-50/80 dark:bg-slate-700/30'
                    : 'bg-white dark:bg-gray-800/40'"
                >
                  <!-- Coluna Fixa / Congelada -->
                  <td
                    class="py-2.5 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 sticky left-0 z-10 border-r border-gray-200/60 dark:border-gray-700/60 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[160px] sm:min-w-[220px] transition-colors"
                    :class="index % 2 === 1
                      ? 'bg-slate-50/95 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-800/90'"
                  >
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                      :class="index === 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        : index === 1
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          : index === 2
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'"
                    >
                      {{ index + 1 }}
                    </span>
                    <span class="truncate" :title="item.itemName">{{ item.itemName }}</span>
                  </td>
                  <td class="py-3 px-4 text-center font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ item.quantity }}
                  </td>
                  <td class="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {{ formatCurrency(item.grossRevenue) }}
                  </td>
                  <td class="py-3 px-4 text-right text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {{ formatCurrency(item.netRevenue) }}
                  </td>
                  <td class="py-3 px-4 text-right text-amber-600 dark:text-amber-400 whitespace-nowrap">
                    {{ formatCurrency(item.discountAmount) }}
                  </td>
                  <td class="py-3 px-4 text-right whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                      {{ item.percentageOfCategory || 0 }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import ReportPageShell from '../components/ReportPageShell.vue';
import { useReport } from '../../../composables/useReport.js';
import { reportService } from '../../../services/reportService.js';

// Registrar componentes do Chart.js sob demanda (Tree-shaking)
Chart.register(
  DoughnutController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const route = useRoute();
const router = useRouter();

const currentDate = new Date();
const month = ref(Number(route.query.month) || currentDate.getMonth() + 1);
const year = ref(Number(route.query.year) || currentDate.getFullYear());

const { data, loading, error, viewMode, fetchReport } = useReport();

const donutCanvas = ref(null);
const barCanvas = ref(null);
let donutChartInstance = null;
let barChartInstance = null;

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0);
};

const hasSales = computed(() => {
  return (Number(data.value?.totalSalesCount) || 0) > 0;
});

const discountPercentage = computed(() => {
  const gross = Number(data.value?.totalGrossSales) || 0;
  const discounts = Number(data.value?.totalDiscounts) || 0;
  if (gross <= 0) return '0.00';
  return ((discounts / gross) * 100).toFixed(2);
});

const destroyCharts = () => {
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }
};

const updateDonutChart = () => {
  if (!donutCanvas.value) return;
  if (donutChartInstance) {
    donutChartInstance.destroy();
    donutChartInstance = null;
  }

  const serviceRev = Number(data.value?.serviceRevenue) || 0;
  const productRev = Number(data.value?.productRevenue) || 0;

  if (serviceRev === 0 && productRev === 0) return;

  const ctx = donutCanvas.value.getContext('2d');
  donutChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Procedimentos (Serviços)', 'Produtos (Home-Care)'],
      datasets: [
        {
          data: [serviceRev, productRev],
          backgroundColor: ['#4f46e5', '#10b981'],
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
            font: { size: 12, weight: '500' }
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
              const total = serviceRev + productRev;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${context.label}: ${formatted} (${pct}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
};

const updateBarChart = () => {
  if (!barCanvas.value) return;
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }

  const services = (data.value?.topServices || []).slice(0, 5);
  if (services.length === 0) return;

  const labels = services.map((s) => s.itemName);
  const values = services.map((s) => Number(s.grossRevenue) || 0);

  const ctx = barCanvas.value.getContext('2d');
  barChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Faturamento Bruto',
          data: values,
          backgroundColor: '#4f46e5',
          borderRadius: 6
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: (context) => ` Faturamento: ${formatCurrency(context.raw)}`
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(156, 163, 175, 0.1)' },
          ticks: {
            callback: (val) => 'R$ ' + Number(val).toLocaleString('pt-BR')
          }
        },
        y: {
          grid: { display: false },
          ticks: {
            autoSkip: false,
            font: { size: 11 }
          }
        }
      }
    }
  });
};

const updateCharts = () => {
  updateDonutChart();
  updateBarChart();
};

const loadData = async () => {
  await fetchReport(reportService.getSalesPerformance, {
    month: month.value,
    year: year.value
  });
  await nextTick();
  if (viewMode.value === 'CHART') {
    updateCharts();
  }
};

const onPeriodChange = ({ month: m, year: y }) => {
  month.value = m;
  year.value = y;
  router.replace({
    query: {
      ...route.query,
      month: m,
      year: y
    }
  });
  loadData();
};

const exportCsv = () => {
  if (!data.value) return;

  const rows = [
    ['Relatório de Desempenho de Vendas'],
    [`Período: ${String(month.value).padStart(2, '0')}/${year.value}`],
    [`Faturamento Bruto: ${data.value.totalGrossSales || 0}`],
    [`Faturamento Líquido: ${data.value.totalNetSales || 0}`],
    [`Vendas Realizadas: ${data.value.totalSalesCount || 0}`],
    [`Ticket Médio: ${data.value.averageTicket || 0}`],
    [`Descontos Concedidos: ${data.value.totalDiscounts || 0}`],
    [],
    ['TOP PROCEDIMENTOS & SERVIÇOS'],
    ['Posição', 'Procedimento', 'Quantidade', 'Faturamento Bruto', 'Faturamento Líquido', 'Descontos', 'Share Categoria (%)']
  ];

  (data.value.topServices || []).forEach((s, idx) => {
    rows.push([
      idx + 1,
      `"${s.itemName.replace(/"/g, '""')}"`,
      s.quantity,
      s.grossRevenue,
      s.netRevenue,
      s.discountAmount,
      `${s.percentageOfCategory}%`
    ]);
  });

  rows.push([]);
  rows.push(['TOP PRODUTOS (HOME-CARE)']);
  rows.push(['Posição', 'Produto', 'Quantidade', 'Faturamento Bruto', 'Faturamento Líquido', 'Descontos', 'Share Categoria (%)']);

  (data.value.topProducts || []).forEach((p, idx) => {
    rows.push([
      idx + 1,
      `"${p.itemName.replace(/"/g, '""')}"`,
      p.quantity,
      p.grossRevenue,
      p.netRevenue,
      p.discountAmount,
      `${p.percentageOfCategory}%`
    ]);
  });

  const csvContent = '\uFEFF' + rows.map((r) => r.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `desempenho-vendas-${month.value}-${year.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

watch(viewMode, async (newMode) => {
  if (newMode === 'CHART') {
    await nextTick();
    updateCharts();
  }
});

onMounted(() => {
  loadData();
});

onBeforeUnmount(() => {
  destroyCharts();
});
</script>
