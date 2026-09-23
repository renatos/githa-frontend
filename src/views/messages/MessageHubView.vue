<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <!-- Header Row -->
    <PageHeader
      title="Central de Envio de Mensagens"
      subtitle="Aprovação prévia, moderação e escalonamento espaçado de disparos via WhatsApp."
    >
      <template #actions>
        <button
          type="button"
          :disabled="loading"
          class="px-3.5 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          @click="loadCurrentTab"
        >
          <i class="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': loading }"></i>
          Atualizar
        </button>
      </template>
    </PageHeader>

    <!-- Operational Banner: Anti-Ban & Pacing -->
    <div class="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 rounded-xl p-4 flex items-start gap-3">
      <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
        <i class="fa-solid fa-shield-halved text-sm"></i>
      </div>
      <div class="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
        <strong class="font-semibold">Proteção Anti-Bloqueio Ativa:</strong> As mensagens aprovadas são distribuídas ao longo do horário comercial (08:30 às 18:30) com intervalos seguros e jitter aleatório. Clientes têm limite máximo de 2 mensagens automáticas por mês.
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="border-b border-slate-200 dark:border-slate-700">
      <nav class="flex space-x-2 sm:space-x-6 text-xs sm:text-sm font-medium overflow-x-auto no-scrollbar justify-between sm:justify-start">
        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0 cursor-pointer"
          :class="activeTab === 'pending'
            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('pending')"
        >
          <i class="fa-solid fa-clock text-xs sm:text-sm"></i>
          <span>
            <span class="sm:hidden">Aprovação</span>
            <span class="hidden sm:inline">Aguardando Aprovação</span>
          </span>
          <span
            v-if="pendingCount > 0"
            class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
          >
            {{ pendingCount }}
          </span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0 cursor-pointer"
          :class="activeTab === 'queue'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('queue')"
        >
          <i class="fa-solid fa-list-check text-xs sm:text-sm"></i>
          <span>
            <span class="sm:hidden">Fila de Envio</span>
            <span class="hidden sm:inline">Fila de Envio (Agendadas)</span>
          </span>
          <span
            v-if="queueMessages.length > 0"
            class="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
          >
            {{ queueMessages.length }}
          </span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0 cursor-pointer"
          :class="activeTab === 'history'
            ? 'border-slate-500 text-slate-700 dark:text-white font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('history')"
        >
          <i class="fa-solid fa-clock-rotate-left text-xs sm:text-sm"></i>
          <span>
            <span class="sm:hidden">Histórico</span>
            <span class="hidden sm:inline">Histórico & Falhas</span>
          </span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-1.5 sm:gap-2 transition-colors shrink-0 cursor-pointer"
          :class="activeTab === 'templates'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('templates')"
        >
          <i class="fa-solid fa-file-lines text-xs sm:text-sm"></i>
          <span>
            <span class="sm:hidden">Templates</span>
            <span class="hidden sm:inline">Modelos de Mensagem (Templates)</span>
          </span>
        </button>
      </nav>
    </div>

    <!-- Origin Filter Bar (Active on pending, queue, history) -->
    <div v-if="activeTab !== 'templates'" class="flex flex-col gap-3">
      <!-- Desktop Origin Bullets -->
      <div class="hidden sm:block">
        <StatusBulletsBar
          v-model="selectedOrigin"
          :items="originFilterItems"
        />
      </div>

      <!-- Mobile Origin Select -->
      <div class="sm:hidden">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Origem da Mensagem
        </label>
        <select
          v-model="selectedOrigin"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
        >
          <option v-for="item in originFilterItems" :key="item.value" :value="item.value">
            {{ item.label }} ({{ item.count }})
          </option>
        </select>
      </div>

      <!-- Mobile Secondary Filters Toggle Button -->
      <div class="sm:hidden flex items-center justify-between gap-2 pt-0.5">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer"
          :class="showMobileFilters || activeFiltersCount > 0
            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-semibold'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
          @click="showMobileFilters = !showMobileFilters"
        >
          <i class="fa-solid fa-sliders text-xs"></i>
          <span>Filtros Adicionais</span>
          <span
            v-if="activeFiltersCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white"
          >
            {{ activeFiltersCount }}
          </span>
          <i
            class="fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ml-0.5"
            :class="{ 'rotate-180': showMobileFilters }"
          ></i>
        </button>

        <button
          v-if="activeFiltersCount > 0 || selectedOrigin"
          type="button"
          class="text-xs text-rose-600 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
          @click="resetFilters"
        >
          <i class="fa-solid fa-filter-circle-xmark text-xs"></i>
          Limpar Filtros
        </button>
      </div>

      <!-- Secondary Filters Bar (Collapsible on Mobile, Grid on Desktop) -->
      <div
        class="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs shadow-xs"
        :class="showMobileFilters ? 'grid' : 'hidden sm:grid'"
      >
        <!-- Search Client or Phone -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Buscar Cliente / Telefone</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nome ou telefone..."
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <!-- Service / Procedure -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Procedimento</label>
          <select
            v-model="filters.service"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Todos os procedimentos</option>
            <option v-for="srv in availableServices" :key="srv" :value="srv">
              {{ srv }}
            </option>
          </select>
        </div>

        <!-- Professional -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Profissional Responsável</label>
          <select
            v-model="filters.professionalId"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option :value="null">Todos os profissionais</option>
            <option v-for="prof in professionals" :key="prof.id" :value="prof.id">
              {{ prof.name }}
            </option>
          </select>
        </div>

        <!-- Message Status -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Status da Mensagem</label>
          <select
            v-model="filters.status"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Todos os status</option>
            <option v-for="st in availableStatusOptions" :key="st.name" :value="st.name">
              {{ st.description }} ({{ st.count }})
            </option>
          </select>
        </div>

        <!-- Sort By -->
        <div>
          <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Ordenar Por</label>
          <select
            v-model="filters.sortBy"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/80 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="POTENTIAL_DESC">Maior Potencial / Ticket</option>
            <option value="DATE_ASC">Mais Antigos (FIFO)</option>
            <option value="DATE_DESC">Mais Recentes</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="flex items-end">
          <button
            type="button"
            class="w-full inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium cursor-pointer"
            @click="resetFilters"
          >
            <i class="fa-solid fa-filter-circle-xmark mr-1.5 text-slate-400"></i>
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 1: Aguardando Aprovação -->
    <div v-if="activeTab === 'pending'" class="space-y-4">
      <div v-if="loading && pendingMessages.length === 0" class="text-center py-12 text-slate-500">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
        <p class="text-sm">Carregando mensagens...</p>
      </div>

      <div
        v-else-if="filteredPendingMessages.length === 0"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-12 text-center"
      >
        <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <i class="fa-solid fa-check text-xl"></i>
        </div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">
          {{ pendingMessages.length === 0 ? 'Tudo em dia!' : 'Nenhuma mensagem para os filtros selecionados' }}
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          {{ pendingMessages.length === 0
            ? 'Não há mensagens para moderação no momento. A lista matinal de rebooking é gerada diariamente às 08:00.'
            : 'Tente alterar os filtros de origem, procedimento ou busca para ver outras mensagens.' }}
        </p>
      </div>

      <template v-else>
        <!-- Mobile swipe hint -->
        <div class="sm:hidden flex items-center justify-between px-3 py-1.5 bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/50 rounded-lg text-[11px] text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5">
            <i class="fa-solid fa-arrows-left-right text-slate-400"></i>
            <span>Deslize o card: <strong class="text-emerald-600 dark:text-emerald-400">direita</strong> aprova, <strong class="text-red-600 dark:text-red-400">esquerda</strong> descarta</span>
          </span>
        </div>

        <TransitionGroup
          name="dispatch-card-list"
          tag="div"
          class="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <DispatchMessageCard
            v-for="msg in filteredPendingMessages"
            :key="msg.id"
            :message="msg"
            :professionals="professionals"
            :highlighted="highlightedMessageId === msg.id"
            @approve="onApprove"
            @reject="onReject"
            @unapprove="onUnapprove"
          />
        </TransitionGroup>
      </template>
    </div>

    <!-- Tab 2: Fila de Envio (Agendadas) -->
    <div v-if="activeTab === 'queue'">
      <DispatchQueueTable
        :messages="filteredQueueMessages"
        :loading="loading"
        :highlighted-message-id="highlightedMessageId"
        @unapprove="handleQueueUnapprove"
      />
    </div>

    <!-- Tab 3: Histórico & Falhas -->
    <div v-if="activeTab === 'history'">
      <DispatchQueueTable
        :messages="filteredHistoryMessages"
        :loading="loading"
        :highlighted-message-id="highlightedMessageId"
      />
    </div>

    <!-- Tab 4: Modelos de Mensagem (Templates) -->
    <div v-if="activeTab === 'templates'">
      <MessageTemplateList />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { dispatchMessageService } from '../../services/dispatchMessageService';
import { professionalService } from '../../services/professionalService';
import { enumService } from '../../services/enumService';
import PageHeader from '../../components/common/PageHeader.vue';
import StatusBulletsBar from '../../components/common/StatusBulletsBar.vue';
import DispatchMessageCard from '../../components/messages/DispatchMessageCard.vue';
import DispatchQueueTable from '../../components/messages/DispatchQueueTable.vue';
import MessageTemplateList from '../../components/messages/MessageTemplateList.vue';
import { toastBridge } from '../../services/toastBridge';

const route = useRoute();
const activeTab = ref('pending');
const loading = ref(false);
const highlightedMessageId = ref(null);

const pendingMessages = ref([]);
const queueMessages = ref([]);
const historyMessages = ref([]);
const professionals = ref([]);
const statusOptions = ref([]);

// Filter States
const selectedOrigin = ref('');
const showMobileFilters = ref(false);
const filters = ref({
  search: '',
  service: '',
  professionalId: null,
  status: '',
  sortBy: 'POTENTIAL_DESC'
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.value.search) count++;
  if (filters.value.service) count++;
  if (filters.value.professionalId) count++;
  if (filters.value.status) count++;
  if (filters.value.sortBy !== 'POTENTIAL_DESC') count++;
  return count;
});

const currentActiveList = computed(() => {
  if (activeTab.value === 'pending') return pendingMessages.value;
  if (activeTab.value === 'queue') return queueMessages.value;
  if (activeTab.value === 'history') return historyMessages.value;
  return [];
});

const originFilterItems = computed(() => {
  const list = currentActiveList.value;
  const countByOrigin = (origin) => list.filter(m => m.originType === origin).length;

  return [
    { label: 'Todas as Mensagens', value: '', count: list.length },
    { label: 'Retorno / Rebooking', value: 'REBOOKING', dotColor: 'bg-emerald-500', count: countByOrigin('REBOOKING') },
    { label: 'Acompanhamento', value: 'FOLLOW_UP', dotColor: 'bg-indigo-500', count: countByOrigin('FOLLOW_UP') },
    { label: 'Leads', value: 'LEAD', dotColor: 'bg-blue-500', count: countByOrigin('LEAD') },
    { label: 'Agendamentos', value: 'APPOINTMENT', dotColor: 'bg-amber-500', count: countByOrigin('APPOINTMENT') },
    { label: 'Sistema', value: 'SYSTEM', dotColor: 'bg-slate-500', count: countByOrigin('SYSTEM') }
  ];
});

const getParsedMetadata = (msg) => {
  if (!msg.metadata) return {};
  if (typeof msg.metadata === 'object') return msg.metadata;
  try {
    return JSON.parse(msg.metadata);
  } catch {
    return {};
  }
};

const availableServices = computed(() => {
  const set = new Set();
  currentActiveList.value.forEach(msg => {
    const meta = getParsedMetadata(msg);
    if (meta.serviceName) {
      set.add(meta.serviceName);
    }
  });
  return Array.from(set).sort();
});

const availableStatusOptions = computed(() => {
  const counts = {};
  currentActiveList.value.forEach(m => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });

  if (statusOptions.value.length > 0) {
    return statusOptions.value
      .filter(opt => counts[opt.name] > 0)
      .map(opt => ({
        ...opt,
        count: counts[opt.name]
      }));
  }

  return Object.keys(counts).map(status => ({
    name: status,
    description: status,
    count: counts[status]
  }));
});

const resetFilters = () => {
  selectedOrigin.value = '';
  filters.value = {
    search: '',
    service: '',
    professionalId: null,
    status: '',
    sortBy: 'POTENTIAL_DESC'
  };
};

const applyFiltersAndSort = (items) => {
  return items.filter(msg => {
    // 1. Origin filter
    if (selectedOrigin.value && msg.originType !== selectedOrigin.value) {
      return false;
    }

    // 2. Status filter
    if (filters.value.status && msg.status !== filters.value.status) {
      return false;
    }

    // 3. Search filter (targetName or phone)
    if (filters.value.search) {
      const q = filters.value.search.toLowerCase().trim();
      const matchName = msg.targetName && msg.targetName.toLowerCase().includes(q);
      const matchPhone = msg.targetPhone && msg.targetPhone.includes(q.replace(/\D/g, ''));
      if (!matchName && !matchPhone) return false;
    }

    // 4. Service filter
    if (filters.value.service) {
      const meta = getParsedMetadata(msg);
      if (meta.serviceName !== filters.value.service) return false;
    }

    // 5. Professional filter
    if (filters.value.professionalId) {
      const meta = getParsedMetadata(msg);
      if (meta.professionalId !== filters.value.professionalId && msg.contactResponsibleId !== filters.value.professionalId) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.value.sortBy === 'POTENTIAL_DESC') {
      const prioA = a.priority || 0;
      const prioB = b.priority || 0;
      if (prioB !== prioA) return prioB - prioA;
      return (a.id || 0) - (b.id || 0);
    }
    if (filters.value.sortBy === 'DATE_ASC') {
      const dateA = a.createdAt || a.scheduledAt || '';
      const dateB = b.createdAt || b.scheduledAt || '';
      return dateA.localeCompare(dateB);
    }
    if (filters.value.sortBy === 'DATE_DESC') {
      const dateA = a.createdAt || a.scheduledAt || '';
      const dateB = b.createdAt || b.scheduledAt || '';
      return dateB.localeCompare(dateA);
    }
    return 0;
  });
};

const filteredPendingMessages = computed(() => applyFiltersAndSort(pendingMessages.value));
const filteredQueueMessages = computed(() => applyFiltersAndSort(queueMessages.value));
const filteredHistoryMessages = computed(() => applyFiltersAndSort(historyMessages.value));

const pendingCount = computed(() => {
  return pendingMessages.value.filter(m => m.status === 'PENDING_APPROVAL').length;
});

const loadProfessionals = async () => {
  try {
    const resp = await professionalService.getAll({ page: 0, size: 100 });
    professionals.value = resp.data?.content || resp.data || [];
  } catch (e) {
    console.error('Erro ao carregar profissionais', e);
  }
};

const loadPending = async () => {
  loading.value = true;
  try {
    const data = await dispatchMessageService.getAll({
      statuses: 'PENDING_APPROVAL'
    });
    pendingMessages.value = data || [];
  } catch (e) {
    console.error(e);
    toastBridge.error('Erro', 'Erro ao carregar mensagens pendentes.');
  } finally {
    loading.value = false;
  }
};

const loadQueue = async () => {
  loading.value = true;
  try {
    const data = await dispatchMessageService.getQueue();
    queueMessages.value = data || [];
  } catch (e) {
    console.error(e);
    toastBridge.error('Erro', 'Erro ao carregar fila de envio.');
  } finally {
    loading.value = false;
  }
};

const loadHistory = async () => {
  loading.value = true;
  try {
    const data = await dispatchMessageService.getHistory();
    historyMessages.value = data || [];
  } catch (e) {
    console.error(e);
    toastBridge.error('Erro', 'Erro ao carregar histórico de envios.');
  } finally {
    loading.value = false;
  }
};

const loadCurrentTab = async () => {
  if (activeTab.value === 'pending') await loadPending();
  else if (activeTab.value === 'queue') await loadQueue();
  else if (activeTab.value === 'history') await loadHistory();
};

const switchTab = (tab) => {
  activeTab.value = tab;
  filters.value.status = '';
  loadCurrentTab();
};

const scrollToTargetCard = (msgId) => {
  nextTick(() => {
    setTimeout(() => {
      const cardEl = document.getElementById(`dispatch-card-${msgId}`) || document.getElementById(`dispatch-row-${msgId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        highlightedMessageId.value = msgId;
        setTimeout(() => {
          highlightedMessageId.value = null;
        }, 4500);
      }
    }, 250);
  });
};

const handleTargetMessageHighlight = async () => {
  const targetMessageId = route.query.messageId ? Number(route.query.messageId) : null;
  const targetReminderId = route.query.reminderId ? Number(route.query.reminderId) : null;
  if (!targetMessageId && !targetReminderId) return;

  // Search in current active list
  let targetMsg = currentActiveList.value.find(m =>
    (targetMessageId && m.id === targetMessageId) ||
    (targetReminderId && m.originId === targetReminderId)
  );

  // If not found in current tab, search other tabs
  if (!targetMsg) {
    if (activeTab.value !== 'pending') {
      if (pendingMessages.value.length === 0) await loadPending();
      targetMsg = pendingMessages.value.find(m =>
        (targetMessageId && m.id === targetMessageId) ||
        (targetReminderId && m.originId === targetReminderId)
      );
      if (targetMsg) {
        activeTab.value = 'pending';
      }
    }
    if (!targetMsg && activeTab.value !== 'queue') {
      if (queueMessages.value.length === 0) await loadQueue();
      targetMsg = queueMessages.value.find(m =>
        (targetMessageId && m.id === targetMessageId) ||
        (targetReminderId && m.originId === targetReminderId)
      );
      if (targetMsg) {
        activeTab.value = 'queue';
      }
    }
    if (!targetMsg && activeTab.value !== 'history') {
      if (historyMessages.value.length === 0) await loadHistory();
      targetMsg = historyMessages.value.find(m =>
        (targetMessageId && m.id === targetMessageId) ||
        (targetReminderId && m.originId === targetReminderId)
      );
      if (targetMsg) {
        activeTab.value = 'history';
      }
    }
  }

  if (targetMsg) {
    // If origin filter would hide this message, adjust to match
    if (selectedOrigin.value && selectedOrigin.value !== targetMsg.originType) {
      selectedOrigin.value = targetMsg.originType;
    }
    // If status filter would hide this message, reset it
    if (filters.value.status && filters.value.status !== targetMsg.status) {
      filters.value.status = '';
    }
    // If search text would hide this message, reset it
    if (filters.value.search) {
      filters.value.search = '';
    }

    scrollToTargetCard(targetMsg.id);
  }
};

const onApprove = async ({ id, customMessageText, professionalId, done }) => {
  try {
    const updated = await dispatchMessageService.approve(id, {
      customMessageText,
      professionalId
    });
    // Remove from pending list (next pending card seamlessly moves up)
    pendingMessages.value = pendingMessages.value.filter(m => m.id !== id);
    // Add to scheduled queue list
    if (updated) {
      queueMessages.value = [updated, ...queueMessages.value.filter(m => m.id !== id)];
    }
    toastBridge.success('Sucesso', 'Mensagem aprovada e agendada na fila!');
  } catch (e) {
    console.error('Erro ao aprovar mensagem:', e);
    const errorMsg = e.response?.data?.message || 'Erro ao aprovar mensagem.';
    toastBridge.error('Erro', errorMsg);
  } finally {
    done();
  }
};

const onReject = async ({ id, done }) => {
  try {
    await dispatchMessageService.reject(id);
    pendingMessages.value = pendingMessages.value.filter(m => m.id !== id);
    toastBridge.info('Informação', 'Mensagem descartada.');
  } catch (e) {
    console.error('Erro ao descartar mensagem:', e);
    toastBridge.error('Erro', 'Erro ao descartar mensagem.');
  } finally {
    done();
  }
};

const onUnapprove = async ({ id, done }) => {
  try {
    const updated = await dispatchMessageService.unapprove(id);
    const idx = pendingMessages.value.findIndex(m => m.id === id);
    if (idx !== -1 && updated) {
      pendingMessages.value.splice(idx, 1, { ...pendingMessages.value[idx], ...updated });
    }
    toastBridge.info('Informação', 'Aprovação desfeita. Mensagem retornou para aprovação pendente.');
  } catch (e) {
    console.error('Erro ao desfazer aprovação:', e);
    const errorMsg = e.response?.data?.message || 'Erro ao desfazer aprovação.';
    toastBridge.error('Erro', errorMsg);
  } finally {
    done();
  }
};

const handleQueueUnapprove = async (msg) => {
  if (!confirm(`Deseja desfazer a aprovação da mensagem para ${msg.targetName}? O envio agendado será cancelado.`)) {
    return;
  }
  try {
    const unapproved = await dispatchMessageService.unapprove(msg.id);
    toastBridge.info('Informação', 'Aprovação desfeita com sucesso!');
    queueMessages.value = queueMessages.value.filter(m => m.id !== msg.id);
    if (unapproved) {
      pendingMessages.value = [unapproved, ...pendingMessages.value.filter(m => m.id !== msg.id)];
    } else {
      await loadPending();
    }
  } catch (e) {
    console.error('Erro ao desfazer aprovação:', e);
    const errorMsg = e.response?.data?.message || 'Erro ao desfazer aprovação.';
    toastBridge.error('Erro', errorMsg);
  }
};

onMounted(async () => {
  loadProfessionals();
  try {
    statusOptions.value = await enumService.getOptions('DispatchStatus');
  } catch (e) {
    console.error('Erro ao carregar enum DispatchStatus:', e);
  }

  if (route.query.tab && ['pending', 'queue', 'history', 'templates'].includes(route.query.tab)) {
    activeTab.value = route.query.tab;
  }
  if (route.query.origin) {
    selectedOrigin.value = route.query.origin;
  }

  await loadCurrentTab();

  if (route.query.messageId || route.query.reminderId) {
    await handleTargetMessageHighlight();
  }
});

watch(() => route.query.messageId, async (newVal) => {
  if (newVal) {
    await handleTargetMessageHighlight();
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* FLIP animation for cards remaining in list */
.dispatch-card-list-move {
  transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
}
.dispatch-card-list-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.dispatch-card-list-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.dispatch-card-list-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.dispatch-card-list-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
