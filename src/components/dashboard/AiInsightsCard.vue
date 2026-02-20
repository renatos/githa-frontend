<template>
  <DashboardCard
    title="Githa AI Insights"
    icon="✨"
    :loading="loading"
    :error="error"
    @retry="fetchInsights"
    class="ai-insights-card"
  >
    <div class="insights-container">
      <div 
        v-for="(insight, index) in insights" 
        :key="index"
        class="insight-item"
        :class="insight.type.toLowerCase()"
      >
        <div class="insight-icon">
          {{ getInsightIcon(insight.type) }}
        </div>
        <div class="insight-content">
          <p>{{ insight.content }}</p>
        </div>
      </div>
    </div>
    
    <div class="ai-footer">
      <span class="ai-badge">Gerado por Inteligência Artificial</span>
    </div>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DashboardCard from './DashboardCard.vue';
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

<style scoped>
/* AI branding styles */
.ai-insights-card {
  position: relative;
  overflow: hidden;
}

/* AI gradient animated border top */
.ai-insights-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
  background-size: 300% 100%;
  animation: gradientMove 4s ease infinite;
}

@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.insights-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-grow: 1;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--color-border);
}

.insight-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-color: #8b5cf6; /* AI Purple hint */
}

.insight-icon {
  font-size: 1.5rem;
  background-color: var(--color-bg-card);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.insight-item.financial .insight-icon { border-color: #10b981; background-color: #ecfdf5; }
.insight-item.operational .insight-icon { border-color: #f59e0b; background-color: #fffbeb; }
.insight-item.retention .insight-icon { border-color: #3b82f6; background-color: #eff6ff; }
.insight-item.opportunity .insight-icon { border-color: #ec4899; background-color: #fdf2f8; }

.insight-content {
  flex-grow: 1;
}

.insight-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--color-text-main);
}

.ai-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-sm);
}

.ai-badge {
  font-size: 0.7rem;
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
