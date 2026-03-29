<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-[0_0_15px_rgba(139,92,246,0.1)] dark:shadow-[0_0_15px_rgba(139,92,246,0.15)] border border-purple-200 dark:border-purple-500/50 relative overflow-hidden flex flex-col">
    <!-- Decorative icon -->
    <div class="absolute top-0 right-0 p-4 opacity-10 dark:opacity-20">
      <i class="fa-solid fa-wand-magic-sparkles text-purple-400 text-4xl"></i>
    </div>

    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 relative z-10">
      <span>✨</span> Githa AI Insights
    </h2>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8 relative z-10">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8 relative z-10">
      <button class="text-sm text-red-500 hover:text-red-400 transition-colors" @click="fetchInsights">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="insights.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm relative z-10">
      Nenhum insight no momento.
    </div>

    <div v-else class="space-y-4 relative z-10 flex-1">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border-l-4"
        :class="getInsightBorderColor(index)"
      >
        <p class="text-sm text-gray-600 dark:text-slate-300">
          <strong class="text-gray-800 dark:text-white">{{ getInsightLabel(insight.type) }}:</strong>
          {{ insight.title || insight.description }}
        </p>
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

const getInsightLabel = (type) => {
  const labels = {
    'FINANCIAL_ALERT': 'Atenção',
    'OPERATIONAL': 'Operacional',
    'RETENTION_ALERT': 'Atenção',
    'OPPORTUNITY': 'Sugestão',
    'BUG': 'Bug',
    'IMPROVEMENT': 'Sugestão',
    'FEATURE': 'Sugestão'
  };
  return labels[type] || 'Sugestão';
};

const getInsightBorderColor = (index) => {
  const colors = ['border-purple-500', 'border-pink-500', 'border-blue-500', 'border-green-500'];
  return colors[index % colors.length];
};

const fetchInsights = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await aiService.getDashboardInsights({ page: 0, size: 3, sort: 'createdAt,desc' });
    insights.value = response.data.content || [];
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
