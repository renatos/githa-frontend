<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <i class="fa-solid fa-paper-plane text-emerald-600 dark:text-emerald-400"></i>
          Central de Envio de Mensagens
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Aprovação prévia, moderação e escalonamento espaçado de disparos via WhatsApp.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="loading"
          class="px-3.5 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          @click="loadCurrentTab"
        >
          <i class="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': loading }"></i>
          Atualizar
        </button>
      </div>
    </div>

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
      <nav class="flex space-x-6 text-sm font-medium">
        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-2 transition-colors"
          :class="activeTab === 'pending'
            ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('pending')"
        >
          <i class="fa-solid fa-clock"></i>
          <span>Aguardando Aprovação</span>
          <span
            v-if="pendingMessages.length > 0"
            class="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
          >
            {{ pendingMessages.length }}
          </span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-2 transition-colors"
          :class="activeTab === 'queue'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('queue')"
        >
          <i class="fa-solid fa-list-check"></i>
          <span>Fila de Envio (Agendadas)</span>
          <span
            v-if="queueMessages.length > 0"
            class="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
          >
            {{ queueMessages.length }}
          </span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-2 transition-colors"
          :class="activeTab === 'history'
            ? 'border-slate-500 text-slate-700 dark:text-white font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('history')"
        >
          <i class="fa-solid fa-clock-rotate-left"></i>
          <span>Histórico & Falhas</span>
        </button>

        <button
          type="button"
          class="pb-3 border-b-2 flex items-center gap-2 transition-colors"
          :class="activeTab === 'templates'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="switchTab('templates')"
        >
          <i class="fa-solid fa-file-lines"></i>
          <span>Modelos de Mensagem (Templates)</span>
        </button>
      </nav>
    </div>

    <!-- Tab 1: Aguardando Aprovação -->
    <div v-if="activeTab === 'pending'" class="space-y-4">
      <div v-if="loading && pendingMessages.length === 0" class="text-center py-12 text-slate-500">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i>
        <p class="text-sm">Carregando mensagens pendentes...</p>
      </div>

      <div
        v-else-if="pendingMessages.length === 0"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-12 text-center"
      >
        <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
          <i class="fa-solid fa-check text-xl"></i>
        </div>
        <h3 class="text-base font-semibold text-slate-900 dark:text-white">Tudo em dia!</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Não há mensagens aguardando aprovação no momento. A lista matinal de rebooking é gerada diariamente às 08:00.
        </p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DispatchMessageCard
          v-for="msg in pendingMessages"
          :key="msg.id"
          :message="msg"
          :professionals="professionals"
          @approve="onApprove"
          @reject="onReject"
        />
      </div>
    </div>

    <!-- Tab 2: Fila de Envio (Agendadas) -->
    <div v-if="activeTab === 'queue'">
      <DispatchQueueTable :messages="queueMessages" :loading="loading" />
    </div>

    <!-- Tab 3: Histórico & Falhas -->
    <div v-if="activeTab === 'history'">
      <DispatchQueueTable :messages="historyMessages" :loading="loading" />
    </div>

    <!-- Tab 4: Modelos de Mensagem (Templates) -->
    <div v-if="activeTab === 'templates'">
      <MessageTemplateList />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { dispatchMessageService } from '../../services/dispatchMessageService';
import { professionalService } from '../../services/professionalService';
import DispatchMessageCard from '../../components/messages/DispatchMessageCard.vue';
import DispatchQueueTable from '../../components/messages/DispatchQueueTable.vue';
import MessageTemplateList from '../../components/messages/MessageTemplateList.vue';
import { toastBridge } from '../../services/toastBridge';

const activeTab = ref('pending');
const loading = ref(false);

const pendingMessages = ref([]);
const queueMessages = ref([]);
const historyMessages = ref([]);
const professionals = ref([]);

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
    const data = await dispatchMessageService.getAll({ status: 'PENDING_APPROVAL' });
    pendingMessages.value = data || [];
  } catch (e) {
    console.error(e);
    toastBridge.getToast()?.error('Erro ao carregar mensagens pendentes.');
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
    toastBridge.getToast()?.error('Erro ao carregar fila de envio.');
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
    toastBridge.getToast()?.error('Erro ao carregar histórico de envios.');
  } finally {
    loading.value = false;
  }
};

const loadCurrentTab = () => {
  if (activeTab.value === 'pending') loadPending();
  else if (activeTab.value === 'queue') loadQueue();
  else if (activeTab.value === 'history') loadHistory();
};

const switchTab = (tab) => {
  activeTab.value = tab;
  loadCurrentTab();
};

const onApprove = async ({ id, customMessageText, professionalId, done }) => {
  try {
    await dispatchMessageService.approve(id, {
      customMessageText,
      professionalId
    });
    toastBridge.getToast()?.success('Mensagem aprovada e agendada na fila!');
    pendingMessages.value = pendingMessages.value.filter(m => m.id !== id);
  } catch (e) {
    const errorMsg = e.response?.data?.message || 'Erro ao aprovar mensagem.';
    toastBridge.getToast()?.error(errorMsg);
  } finally {
    done();
  }
};

const onReject = async ({ id, done }) => {
  try {
    await dispatchMessageService.reject(id);
    toastBridge.getToast()?.info('Mensagem descartada.');
    pendingMessages.value = pendingMessages.value.filter(m => m.id !== id);
  } catch (e) {
    console.error(e);
    toastBridge.getToast()?.error('Erro ao descartar mensagem.');
  } finally {
    done();
  }
};

onMounted(() => {
  loadProfessionals();
  loadPending();
});
</script>
