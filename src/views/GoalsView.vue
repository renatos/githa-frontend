<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
    <!-- Header Section -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Metas de Receita</h1>
        <p class="text-gray-400 mt-1">Acompanhe seu desempenho e projeções financeiras.</p>
      </div>
      <div class="flex items-center gap-3">
        <MonthYearSelector 
          v-model:month="selectedMonth" 
          v-model:year="selectedYear" 
          @change="fetchData"
        />
        <button 
          v-if="isAdmin" 
          @click="showGoalModal = true"
          class="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus :size="18" />
          <span class="hidden md:inline">Nova Meta</span>
        </button>
      </div>
    </header>

    <!-- Professional Selector (Admin only) -->
    <div v-if="isAdmin" class="bg-gray-800/30 border border-gray-700/50 p-4 rounded-2xl flex items-center gap-4">
      <span class="text-sm font-medium text-gray-400">Filtrar por Profissional:</span>
      <BaseLookup 
        v-model="filterProfessionalId" 
        endpoint="/professionals" 
        placeholder="Todos os Profissionais"
        class="max-w-xs"
        @update:modelValue="fetchData"
      />
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 mb-4"></div>
      <p class="text-gray-400">Calculando seu progresso...</p>
    </div>

    <div v-else-if="!progressData" class="text-center py-20 bg-gray-800/20 border border-dashed border-gray-700 rounded-3xl">
      <Target :size="48" class="mx-auto text-gray-600 mb-4" />
      <h3 class="text-xl font-semibold text-gray-300">Nenhuma meta definida</h3>
      <p class="text-gray-500 mt-2 max-w-sm mx-auto">Não há metas de receita configuradas para este período e profissional.</p>
      <button v-if="isAdmin" @click="showGoalModal = true" class="mt-6 text-primary hover:text-white transition-colors">
        Configurar meta agora
      </button>
    </div>

    <template v-else>
      <!-- Main Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Radial Progress Card -->
        <div class="lg:col-span-1 bg-gray-800/40 backdrop-blur-xl border border-gray-700/50 rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
          
          <div class="relative w-64 h-64">
            <!-- SVG Radial Chart -->
            <svg class="w-full h-full transform -rotate-90">
              <!-- Background track -->
              <circle 
                cx="128" cy="128" r="110" 
                fill="none" stroke="currentColor" stroke-width="12" 
                class="text-gray-700/30"
              />
              <!-- Progress Fill -->
              <circle 
                cx="128" cy="128" r="110" 
                fill="none" :stroke="progressData.onTrack ? '#484cb0' : '#f59e0b'" stroke-width="12" 
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="progressOffset"
                class="transition-all duration-1000 ease-out"
              />
            </svg>
            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-5xl font-black text-white">{{ percentage }}%</span>
              <span class="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Atingido</span>
            </div>
          </div>

          <div class="mt-8 text-center space-y-1">
            <p class="text-gray-400 text-sm">Meta mensal</p>
            <p class="text-2xl font-bold text-white">{{ formatCurrency(progressData.goal.targetAmount) }}</p>
          </div>
          
          <div v-if="progressData.onTrack" class="mt-6 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            <CheckCircle :size="14" /> DENTRO DA META
          </div>
          <div v-else class="mt-6 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
            <AlertCircle :size="14" /> ABAIXO DO PRO-RATA
          </div>
        </div>

        <!-- Breakdown and Projection -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Realized Card -->
          <div class="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl hover:border-primary/50 transition-all group">
            <div class="flex items-center gap-4 mb-4">
              <div class="bg-primary/10 p-3 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <DollarSign :size="24" />
              </div>
              <div>
                <p class="text-gray-400 text-sm">Receita Realizada (Paga)</p>
                <h4 class="text-2xl font-bold text-white">{{ formatCurrency(progressData.realizedRevenue) }}</h4>
              </div>
            </div>
            <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-primary transition-all duration-1000" :style="{ width: realizedPercent + '%' }"></div>
            </div>
          </div>

          <!-- Pending Card -->
          <div class="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="bg-amber-500/10 p-3 rounded-2xl text-amber-500">
                <Clock :size="24" />
              </div>
              <div>
                <p class="text-gray-400 text-sm">Pendente (Vencida/Aberta)</p>
                <h4 class="text-2xl font-bold text-white">{{ formatCurrency(progressData.pendingRevenue) }}</h4>
              </div>
            </div>
          </div>

          <!-- Scheduled Card -->
          <div class="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
                <Calendar :size="24" />
              </div>
              <div>
                <p class="text-gray-400 text-sm">Agendado (Estimado)</p>
                <h4 class="text-2xl font-bold text-white">{{ formatCurrency(progressData.scheduledRevenue) }}</h4>
              </div>
            </div>
          </div>

          <!-- Rebooking Card -->
          <div class="bg-gray-800/40 border border-gray-700/50 p-6 rounded-3xl">
            <div class="flex items-center gap-4 mb-4">
              <div class="bg-purple-500/10 p-3 rounded-2xl text-purple-500">
                <RefreshCw :size="24" />
              </div>
              <div>
                <p class="text-gray-400 text-sm">Pipeline Rebooking</p>
                <h4 class="text-2xl font-bold text-white">{{ formatCurrency(progressData.rebookingPipelineValue) }}</h4>
              </div>
            </div>
          </div>

          <!-- Total Projection -->
          <div class="md:col-span-2 bg-gradient-to-br from-primary/20 to-indigo-900/10 border border-primary/30 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p class="text-primary-light font-semibold uppercase tracking-widest text-xs mb-1">Total Projetado (Safe Forecast)</p>
              <h3 class="text-4xl font-black text-white">{{ formatCurrency(progressData.totalProjectedRevenue) }}</h3>
              <p class="text-gray-400 text-sm mt-2">Soma de Realizado + Pendente + Agendado + Rebooking</p>
            </div>
            <div class="text-center md:text-right">
              <p class="text-gray-400 text-sm mb-1">Gap para Batimento</p>
              <h4 class="text-2xl font-bold" :class="progressData.revenueGap > 0 ? 'text-amber-500' : 'text-green-500'">
                {{ progressData.revenueGap > 0 ? formatCurrency(progressData.revenueGap) : 'BATIDA! 🎉' }}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Plan Section -->
      <section class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="h-8 w-1.5 bg-primary rounded-full"></div>
          <h2 class="text-2xl font-bold text-white">Como atingir minha meta?</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="need in progressData.servicesNeeded" :key="need.serviceName" 
               class="bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50 flex items-center justify-between">
            <div>
              <p class="text-white font-semibold truncate max-w-[180px]">{{ need.serviceName }}</p>
              <p class="text-gray-400 text-xs">{{ formatCurrency(need.servicePrice) }} / un</p>
            </div>
            <div class="text-right">
              <span class="block text-primary text-2xl font-black">{{ need.unitsNeeded }}</span>
              <span class="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Vendas necessárias</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Weekly Flow (Mon-Sat) -->
      <section class="bg-gray-800/20 border border-gray-700/50 p-8 rounded-[2rem] space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-300">Fluxo Operacional Mensal (Seg-Sab)</h3>
          <div class="text-sm text-gray-400">
            <span class="font-bold text-white">{{ progressData.elapsedOperationalDays }}</span> de 
            <span class="font-bold text-white">{{ progressData.totalOperationalDays }}</span> dias operacionais decorridos
          </div>
        </div>
        
        <div class="relative pt-1">
          <div class="flex mb-2 items-center justify-between text-xs text-gray-500">
            <span>Início do Mês</span>
            <span class="text-primary font-bold">Hoje</span>
            <span>Final do Mês</span>
          </div>
          <div class="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-700">
            <div 
              :style="{ width: (progressData.elapsedOperationalDays / progressData.totalOperationalDays * 100) + '%' }" 
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"
            ></div>
          </div>
          <p class="text-xs text-center text-gray-500 italic">O algoritmo considera apenas dias úteis de Segunda a Sábado para o cálculo pro-rata.</p>
        </div>
      </section>
    </template>

    <!-- Admin: Add Goal Modal -->
    <BaseModal v-if="showGoalModal" title="Configurar Meta de Receita" @close="showGoalModal = false">
      <form @submit.prevent="handleSaveGoal" class="space-y-6 p-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-400">Profissional (Deixe vazio para Clinic Meta)</label>
          <BaseLookup v-model="newGoal.professionalId" endpoint="/professionals" placeholder="Selecione o profissional ou Meta Geral" />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-400">Mês</label>
            <select v-model="newGoal.month" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none">
              <option v-for="(name, idx) in monthNames" :key="idx" :value="idx + 1">{{ name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-400">Ano</label>
            <input v-model.number="newGoal.year" type="number" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-400">Valor Alvo (R$)</label>
          <CurrencyInput v-model="newGoal.targetAmount" class="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-white" />
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button type="button" @click="showGoalModal = false" class="px-6 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
          <button 
            type="submit" 
            :disabled="saving"
            class="bg-primary hover:bg-primary-hover text-white px-8 py-2 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {{ saving ? 'Salvando...' : 'Salvar Meta' }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { 
  Plus, Target, DollarSign, Clock, Calendar, 
  RefreshCw, CheckCircle, AlertCircle 
} from 'lucide-vue-next';
import MonthYearSelector from '../components/common/MonthYearSelector.vue';
import BaseLookup from '../components/common/BaseLookup.vue';
import BaseModal from '../components/common/BaseModal.vue';
import CurrencyInput from '../components/common/CurrencyInput.vue';
import { goalService } from '../services/goalService';
import { authService } from '../services/authService';

// State
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());
const filterProfessionalId = ref(null);
const loading = ref(false);
const saving = ref(false);
const progressData = ref(null);
const showGoalModal = ref(false);
const isAdmin = ref(false);

const newGoal = ref({
  professionalId: null,
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  targetAmount: 0
});

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// SVG Chart Constant
const circumference = 2 * Math.PI * 110;

// Computed
const percentage = computed(() => {
  if (!progressData.value || !progressData.value.goal.targetAmount) return 0;
  return Math.min(100, Math.round((progressData.value.realizedRevenue / progressData.value.goal.targetAmount) * 100));
});

const progressOffset = computed(() => {
  const p = percentage.value / 100;
  return circumference * (1 - p);
});

const realizedPercent = computed(() => {
  if (!progressData.value || !progressData.value.goal.targetAmount) return 0;
  return Math.min(100, (progressData.value.realizedRevenue / progressData.value.goal.targetAmount) * 100);
});

// Methods
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await goalService.getGoalProgress(
      filterProfessionalId.value, 
      selectedMonth.value, 
      selectedYear.value
    );
    progressData.value = res.data;
  } catch (err) {
    console.error('Error fetching goal progress:', err);
    progressData.value = null;
  } finally {
    loading.value = false;
  }
};

const handleSaveGoal = async () => {
  saving.value = true;
  try {
    await goalService.createGoal(newGoal.value);
    showGoalModal.value = false;
    await fetchData();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao salvar meta.');
  } finally {
    saving.value = false;
  }
};

const formatCurrency = (val) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

onMounted(() => {
  const user = authService.getCurrentUser();
  isAdmin.value = user && user.roles && user.roles.includes('ADMIN');
  fetchData();
});
</script>

<style scoped>
.animate-in {
  animation: animate-in 0.5s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
