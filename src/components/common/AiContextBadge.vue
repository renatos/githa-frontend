<template>
  <div class="ai-context-badge">
    <Button 
      type="button" 
      :loading="loading"
      class="p-button-outlined p-button-sm p-button-secondary ai-badge-btn"
      @click="toggleOverlay"
    >
      <i class="pi pi-sparkles mr-2" style="color: #8b5cf6"></i>
      <span class="font-bold">Githa AI</span>
      <Badge v-if="insights.length > 0" :value="insights.length" severity="danger" class="ml-2"></Badge>
    </Button>

    <OverlayPanel ref="op" :showCloseIcon="true" style="width: 400px; max-width: 90vw;">
      <div class="p-3">
        <h4 class="mt-0 mb-3 flex align-items-center">
          <i class="pi pi-sparkles mr-2" style="color: #8b5cf6"></i> 
          Insights: {{ contextName }}
        </h4>
        
        <div v-if="loading" class="flex justify-content-center p-4">
          <ProgressSpinner style="width: 30px; height: 30px" />
        </div>
        
        <div v-else-if="error" class="text-red-500 text-sm p-2 bg-red-50 border-round">
          Falha ao carregar insights para este contexto.
        </div>
        
        <div v-else-if="insights.length === 0" class="text-sm p-3 text-center text-500 surface-50 border-round">
          A IA ainda está reunindo dados sobre este contexto.
        </div>
        
        <div v-else class="flex flex-column gap-3">
          <div v-for="insight in insights" :key="insight.id" class="p-2 border-round surface-50 border-1 border-300">
            <div class="flex align-items-center mb-2">
              <span class="text-sm font-semibold">{{ insight.title }}</span>
            </div>
            <p class="m-0 text-sm text-color-secondary line-height-2">{{ insight.description }}</p>
          </div>
          <div class="mt-2 text-right">
            <router-link to="/ai-insights" class="text-sm text-primary no-underline hover:underline">Ver todos na Central Githa AI &rarr;</router-link>
          </div>
        </div>
      </div>
    </OverlayPanel>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { aiService } from '@/services/aiService';

const props = defineProps({
  context: {
    type: String,
    required: true
  },
  contextName: {
    type: String,
    default: 'Página Atual'
  }
});

const op = ref(null);
const loading = ref(true);
const error = ref(false);
const insights = ref([]);

const toggleOverlay = (event) => {
  op.value.toggle(event);
  if (insights.value.length === 0 && !error.value) {
    fetchContextualInsights();
  }
};

const fetchContextualInsights = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    // We send the context filter, assuming the backend can filter by type eventually
    // For now we just fetch the latest
    const response = await aiService.getDashboardInsights({ page: 0, size: 3, sort: 'createdAt,desc' });
    
    // In a real scenario we'd filter response.data.content by context.
    // E.g., if context === 'CLIENTS', filter for RETENTION_ALERT
    // if context === 'FINANCIAL', filter for FINANCIAL_ALERT
    let allInsights = response.data.content || [];
    
    if (props.context === 'FINANCIAL') {
      insights.value = allInsights.filter(i => i.type.includes('FINANCIAL') || i.type === 'OPPORTUNITY');
    } else if (props.context === 'CLIENTS') {
      insights.value = allInsights.filter(i => i.type.includes('RETENTION'));
    } else if (props.context === 'FEEDBACKS') {
      insights.value = allInsights.filter(i => i.type.includes('BUG') || i.type.includes('IMPROVEMENT') || i.type.includes('FEATURE'));
    } else {
      insights.value = allInsights.slice(0, 3);
    }
    
  } catch (err) {
    console.error('Failed to fetch AI insights for context:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  // Try to load silently in background to show the badge count
  fetchContextualInsights();
});
</script>

<style scoped>
.ai-badge-btn {
  border-color: #e2e8f0;
  transition: all 0.2s;
}
.ai-badge-btn:hover {
  border-color: #8b5cf6;
  background-color: #f5f3ff;
}
</style>
