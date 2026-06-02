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

          <!-- ROI Card -->
          <div
            class="bg-gradient-to-br border rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between h-40"
            :class="roiClass"
          >
            <div class="absolute right-4 top-4 opacity-20" :class="roiTextColor">
              <span class="material-symbols-outlined text-6xl">insights</span>
            </div>
            <div>
              <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Retorno sobre Investimento (ROI)</span>
              <p class="text-3xl font-extrabold mt-2 font-mono" :class="roiTextColor">
                {{ formatRoi(metrics.roi) }}
              </p>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
              ROI = ((Faturamento - Custo) / Custo) * 100
            </p>
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
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageHeader from '../components/common/PageHeader.vue';
import { investmentService } from '../services/investmentService';

const route = useRoute();
const router = useRouter();

const investmentId = route.params.id;

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

onMounted(() => {
  fetchMetrics();
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
