<template>
  <div class="ai-central-container p-4 md:p-6 max-w-7xl mx-auto">
    <!-- Standard Page Header -->
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 mb-6" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Central de Inteligência Githa AI</h2>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">AI Powered</span>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Acompanhe todos os insights, alertas e descobertas geradas automaticamente.</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          :disabled="loading"
          class="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          @click="fetchInsights"
        >
          <span
            class="material-symbols-outlined text-[18px] mr-2"
            :class="{ 'animate-spin': loading }"
          >
            refresh
          </span>
          Atualizar Insights
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading && insights.length === 0" class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-900/20 border border-red-500/30 p-4 rounded-xl text-red-400 text-center">
      Erro ao carregar os insights. Tente novamente mais tarde.
    </div>

    <!-- Empty State -->
    <div v-else-if="insights.length === 0" class="bg-slate-800/30 border border-slate-700/50 p-10 text-center rounded-2xl flex flex-col items-center justify-center">
      <i class="material-symbols-outlined text-4xl mb-3 text-slate-500">auto_awesome</i>
      <h3 class="text-slate-300 font-semibold mb-2">Nenhum insight disponível no momento</h3>
      <p class="text-slate-500 text-sm max-w-md">
        A inteligência artificial ainda está analisando os dados da sua clínica. Volte mais tarde.
      </p>
    </div>

    <!-- Insights Grid (List mode) -->
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="insight in insights"
        :key="insight.id"
        class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 md:p-6 transition-all duration-300 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5"
      >
        <!-- Card Header -->
        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50 text-xl shadow-sm">
              {{ getInsightIcon(insight.type) }}
            </div>
            <span class="text-lg font-semibold text-slate-100">{{ insight.title || 'Insight' }}</span>
          </div>
          <span class="text-xs text-slate-400 whitespace-nowrap">{{ formatDate(insight.createdAt) }}</span>
        </div>

        <!-- Card Body -->
        <div class="mb-5">
          <p class="m-0 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {{ insight.description }}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="flex justify-start w-full">
          <span class="text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 select-none">
            Githa AI
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { aiService } from '@/services/aiService';

const loading = ref(true);
const error = ref(false);
const insights = ref([]);

const getInsightIcon = (type) => {
  const icons = {
    'FINANCIAL_ALERT': '📈',
    'OPERATIONAL': '⚙️',
    'RETENTION_ALERT': '🤝',
    'OPPORTUNITY': '💡',
    'BUG': '🐛',
    'IMPROVEMENT': '✨',
    'FEATURE': '🚀'
  };
  return icons[type] || '🔍';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateString;
  }
};

const fetchInsights = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await aiService.getDashboardInsights({ page: 0, size: 50, sort: 'createdAt,desc' });
    insights.value = response?.data?.content || [];
  } catch (err) {
    console.error('Failed to fetch AI insights:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchInsights();
});
</script>
