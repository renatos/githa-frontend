<template>
  <div class="ai-central-container p-4">
    <div class="header-section mb-4 flex justify-content-between align-items-center">
      <div>
        <h2 class="text-2xl font-bold mb-2">Central de Inteligência Githa AI</h2>
        <p class="text-color-secondary">Acompanhe todos os insights, alertas e descobertas geradas automaticamente pela inteligência artificial da sua clínica.</p>
      </div>
      <div>
        <Button icon="pi pi-refresh" outlined rounded class="mr-2" @click="fetchInsights" :loading="loading" />
      </div>
    </div>

    <div v-if="loading && insights.length === 0" class="flex justify-content-center align-items-center h-20rem">
      <ProgressSpinner />
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 border-round text-red-700">
      Erro ao carregar os insights. Tente novamente mais tarde.
    </div>

    <div v-else-if="insights.length === 0" class="surface-100 p-5 text-center border-round">
      <i class="pi pi-sparkles text-4xl mb-3 text-500"></i>
      <h3 class="text-500">Nenhum insight disponível no momento</h3>
      <p class="text-500 text-sm">A inteligência artificial ainda está analisando os dados da sua clínica. Volte mais tarde.</p>
    </div>

    <div v-else class="grid">
      <!-- In a real implementation we could have filters by type here -->
      <div v-for="insight in insights" :key="insight.id" class="col-12 md:col-6 lg:col-4">
        <Card class="insight-card h-full" :class="insight.type.toLowerCase()">
          <template #title>
            <div class="flex align-items-center gap-2">
              <span class="insight-icon">{{ getInsightIcon(insight.type) }}</span>
              <span class="text-lg">{{ insight.title || 'Insight' }}</span>
            </div>
          </template>
          <template #subtitle>
            <span class="text-xs text-color-secondary">{{ formatDate(insight.createdAt) }}</span>
          </template>
          <template #content>
            <p class="m-0 text-color">{{ insight.description }}</p>
          </template>
          <template #footer>
            <div class="flex justify-content-end w-full">
               <span class="ai-badge">Githa AI</span>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { aiService } from '@/services/aiService';
import Card from 'primevue/card';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';

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

<style scoped>
.insight-card {
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.3s;
  border: 1px solid var(--color-border, var(--surface-border));
  background-color: var(--color-bg-card, var(--surface-card)) !important;
  color: var(--color-text-main, var(--text-color)) !important;
  border-radius: var(--radius-lg, 8px);
}
.insight-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary-soft, var(--primary-color));
}
:deep(.p-card-body) {
  padding: 1.5rem;
}
:deep(.p-card-content p) {
  color: var(--color-text-muted, var(--text-color-secondary));
  line-height: 1.5;
}
.insight-icon {
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--color-bg-body, var(--surface-hover));
}
.ai-badge {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  display: inline-block;
}
</style>
