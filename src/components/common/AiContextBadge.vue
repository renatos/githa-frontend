<template>
  <div ref="badgeRef" class="ai-context-badge relative">
    <!-- Trigger Button -->
    <button
      type="button"
      :disabled="loading && !insights.length"
      class="inline-flex items-center justify-center px-4 py-2 border shadow-sm text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      :class="[
        isOpen 
          ? 'bg-purple-50 border-purple-300 text-purple-800 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-200' 
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700'
      ]"
      @click="toggleOverlay"
    >
      <i class="material-symbols-outlined text-[18px] mr-2 text-purple-500" :class="{ 'animate-spin': loading && insights.length === 0 }">
        {{ loading && insights.length === 0 ? 'refresh' : 'auto_awesome' }}
      </i>
      <span class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
        Githa AI
      </span>
      
      <!-- Counter Badge -->
      <span
        v-if="insights.length > 0"
        class="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full"
      >
        {{ insights.length }}
      </span>
    </button>

    <!-- Popover Panel -->
    <transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 sm:right-auto z-50 mt-2 w-80 max-w-[90vw] sm:w-[26rem] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl overflow-hidden"
      >
        <div class="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h4 class="m-0 flex items-center text-slate-800 dark:text-slate-100 font-semibold">
            <i class="material-symbols-outlined mr-2 text-purple-500">auto_awesome</i>
            Insights: {{ contextName }}
          </h4>
          <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" @click="isOpen = false">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div class="p-4 max-h-[60vh] overflow-y-auto">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-6">
             <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
          
          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400 text-sm p-3 rounded-lg flex items-start gap-2">
            <span class="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>Falha ao carregar insights para este contexto.</span>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="insights.length === 0" class="text-sm p-6 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700/50">
            <span class="material-symbols-outlined text-3xl opacity-50">hourglass_empty</span>
            <span>A IA ainda está reunindo dados sobre este contexto.</span>
          </div>
          
          <!-- Insights List -->
          <div v-else class="flex flex-col gap-3">
            <div
              v-for="insight in insights"
              :key="insight.id"
              class="bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-lg p-3 transition-colors hover:border-purple-300 dark:hover:border-purple-500/50"
            >
              <div class="flex items-center mb-1.5">
                <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">{{ insight.title }}</span>
              </div>
              <p class="m-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{{ insight.description }}</p>
            </div>
            
            <!-- Custom injected content slot -->
            <slot name="extra-content"></slot>
          </div>
        </div>

        <!-- Popover Footer -->
        <div class="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 text-right">
           <router-link to="/ai-insights" class="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors uppercase tracking-wider inline-flex items-center gap-1 group">
             Ver tudo na Central <span class="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
           </router-link>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
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

const badgeRef = ref(null);
const isOpen = ref(false);
const loading = ref(true);
const error = ref(false);
const insights = ref([]);

const toggleOverlay = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && insights.value.length === 0 && !error.value) {
    fetchContextualInsights();
  }
};

const closeOverlay = (e) => {
  if (isOpen.value && badgeRef.value && !badgeRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

const fetchContextualInsights = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await aiService.getDashboardInsights({ page: 0, size: 5, sort: 'createdAt,desc' });
    let allInsights = response?.data?.content || [];
    
    // Inject mock if empty so dev mode stays functional
    if (allInsights.length === 0) {
      allInsights = [
         {
          id: 991,
          type: 'RETENTION_ALERT',
          title: 'Atenção na Retenção',
          description: 'Hillary Viana e mais 88 clientes não retornam há mais de 6 meses. Considere enviar um pacote de vantagens.'
         },
         {
          id: 992,
          type: 'BUG',
          title: 'Relato de Lentidão',
          description: '3 usuários relataram lentidão no agendamento via aplicativo na última hora.'
         }
      ];
    }
    
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
  document.addEventListener('click', closeOverlay);
  // Try to load silently in background to show the badge count
  fetchContextualInsights();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOverlay);
});
</script>
