<template>
  <BaseModal
    :show="true"
    :title="isNew ? 'Novo Lead' : `Detalhes do Lead - ${formData.name || formatPhone(formData.phone) || 'Sem Nome'}`"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="space-y-6 max-h-[75vh] overflow-y-auto px-1">
      <!-- Status and Action Bar (Edit Mode Only) -->
      <div v-if="!isNew" class="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status:</span>
          <span
            class="px-2.5 py-1 text-xs font-medium rounded-full"
            :class="statusBadgeClass(formData.status)"
          >
            {{ formData.statusDescription || formData.status }}
          </span>
          <span
            v-if="formData.optOut"
            class="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
          >
            <i class="fa-solid fa-ban mr-1"></i> Não Perturbe (Opt-Out)
          </span>
        </div>

        <div class="flex items-center gap-2">
          <!-- WhatsApp direct button -->
          <BaseWhatsAppButton
            v-if="formData.phone"
            :href="whatsAppUrl"
            label="Conversar"
            variant="success"
            size="sm"
          />

          <!-- Convert to Client button -->
          <button
            v-if="formData.status !== 'CONVERTED'"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
            @click="handleConvert"
          >
            <i class="fa-solid fa-user-check"></i> Converter em Cliente
          </button>

          <!-- Discard button -->
          <button
            v-if="formData.status !== 'CONVERTED' && formData.status !== 'DISCARDED'"
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            @click="showDiscardModal = true"
          >
            <i class="fa-solid fa-trash-can text-rose-500"></i> Descartar
          </button>
        </div>
      </div>

      <!-- Discard Alert Box (if already discarded) -->
      <div v-if="!isNew && formData.status === 'DISCARDED'" class="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300">
        <div class="font-semibold mb-1"><i class="fa-solid fa-circle-exclamation mr-1"></i> Lead Descartado</div>
        <p><strong>Motivo:</strong> {{ formData.discardReasonDescription || formData.discardReason }}</p>
        <p v-if="formData.discardNotes"><strong>Observações:</strong> {{ formData.discardNotes }}</p>
        <p v-if="formData.discardedAt" class="text-slate-400 mt-0.5">Descartado em: {{ formatDate(formData.discardedAt) }}</p>
      </div>

      <!-- Converted Box (if converted) -->
      <div v-if="!isNew && formData.status === 'CONVERTED'" class="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
        <i class="fa-solid fa-circle-check mr-1 text-emerald-600"></i>
        Lead convertido com sucesso para o Cliente <strong>#{{ formData.convertedClientId }}</strong>.
      </div>

      <!-- Main Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Nome do contato ou perfil"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
          <PhoneInput
            v-model="formData.phone"
          />
        </div>

        <!-- Source -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Origem do Lead</label>
          <select
            v-model="formData.source"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          >
            <option :value="null">Selecione uma origem...</option>
            <option value="GOOGLE">Google Ads / Pesquisa</option>
            <option value="FACEBOOK">Facebook Ads</option>
            <option value="INSTAGRAM">Instagram Ads / Direct</option>
            <option value="MANUAL">Cadastro Manual</option>
            <option value="WHATSAPP_INCOMING">WhatsApp Recebido</option>
          </select>
        </div>

        <!-- Inferred Service -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Procedimento Procurado</label>
          <input
            v-model="formData.inferredService"
            type="text"
            placeholder="Ex: Botox, Limpeza de Pele..."
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
          />
        </div>
      </div>

      <!-- First Message (Creation mode only) -->
      <div v-if="isNew">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Primeira Mensagem Recebida (Opcional)</label>
        <textarea
          v-model="formData.firstMessage"
          rows="3"
          placeholder="Digite a mensagem de contato do lead..."
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none"
        ></textarea>
      </div>

      <!-- Opt-Out Toggle (Edit Mode Only) -->
      <div v-if="!isNew" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
        <div>
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">Comunicação WhatsApp (Opt-Out)</span>
          <p class="text-xs text-slate-500 dark:text-slate-400">Ative para bloquear envio de mensagens promocionais em massa para este lead.</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="formData.optOut"
            class="sr-only peer"
            @change="toggleOptOut"
          />
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-600"></div>
        </label>
      </div>

      <!-- Tabs: Conversation & Notification History (Edit Mode Only) -->
      <div v-if="!isNew" class="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div class="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeTab === 'conversation' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'"
            @click="activeTab = 'conversation'"
          >
            <i class="fa-regular fa-comments mr-1.5"></i> Conversas ({{ formData.conversationHistory?.length || 0 }})
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
            :class="activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'"
            @click="activeTab = 'notifications'"
          >
            <i class="fa-solid fa-paper-plane mr-1.5"></i> Notificações em Massa ({{ formData.notificationHistory?.length || 0 }})
          </button>
        </div>

        <!-- Conversation Tab -->
        <div v-if="activeTab === 'conversation'" class="space-y-3 max-h-60 overflow-y-auto p-2">
          <div v-if="!formData.conversationHistory || formData.conversationHistory.length === 0" class="text-center py-6 text-slate-400 text-sm">
            Nenhuma mensagem registrada no histórico.
          </div>
          <div
            v-for="(msg, index) in formData.conversationHistory"
            :key="index"
            class="flex flex-col"
            :class="msg.direction === 'INBOUND' ? 'items-start' : 'items-end'"
          >
            <div
              class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm"
              :class="msg.direction === 'INBOUND' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-sm' : 'bg-emerald-600 text-white rounded-tr-sm'"
            >
              <p class="whitespace-pre-wrap leading-relaxed">{{ msg.content }}</p>
              <div class="mt-1 flex items-center justify-end gap-1 text-[10px]" :class="msg.direction === 'INBOUND' ? 'text-slate-400' : 'text-emerald-100'">
                <span>{{ formatDate(msg.timestamp) }}</span>
                <i v-if="msg.direction === 'OUTBOUND'" class="fa-solid fa-check text-[9px]"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div v-if="activeTab === 'notifications'" class="space-y-3 max-h-60 overflow-y-auto p-2">
          <div v-if="!formData.notificationHistory || formData.notificationHistory.length === 0" class="text-center py-6 text-slate-400 text-sm">
            Nenhuma notificação em massa enviada para este lead.
          </div>
          <div
            v-for="(notif, idx) in formData.notificationHistory"
            :key="idx"
            class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1"
          >
            <div class="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>{{ formatDate(notif.timestamp) }}</span>
              <span
                class="px-2 py-0.5 rounded-full font-medium"
                :class="notif.status === 'SENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'"
              >
                {{ notif.status === 'SENT' ? 'Enviado' : 'Falhou' }}
              </span>
            </div>
            <p class="text-slate-800 dark:text-slate-200 font-normal whitespace-pre-wrap">{{ notif.message }}</p>
            <p v-if="notif.error" class="text-rose-500 italic text-[11px]">{{ notif.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="$emit('close')"
        >
          Fechar
        </button>
        <button
          type="button"
          class="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          :disabled="loading"
          @click="handleSubmit"
        >
          <i v-if="loading" class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>
          {{ isNew ? 'Salvar Lead' : 'Salvar Alterações' }}
        </button>
      </div>
    </template>

    <!-- Discard Confirmation Sub-Modal -->
    <div v-if="showDiscardModal" class="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/60 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Descartar Lead</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">Informe o motivo da perda ou desqualificação deste contato:</p>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Motivo *</label>
          <select
            v-model="discardData.reason"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
          >
            <option value="PRICE">Preço Alto / Fora do Orçamento</option>
            <option value="NO_INTEREST">Sem Interesse / Apenas Curiosidade</option>
            <option value="OUT_OF_REGION">Fora da Região / Não Atende Local</option>
            <option value="UNRESPONSIVE">Não Respondeu às Mensagens</option>
            <option value="INVALID_NUMBER">Número Inválido / Engano</option>
            <option value="OTHER">Outro Motivo</option>
          </select>
        </div>

        <div v-if="discardData.reason === 'OTHER'">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Observações Explicativas *</label>
          <textarea
            v-model="discardData.notes"
            rows="2"
            placeholder="Descreva o motivo..."
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-2 text-sm text-slate-900 dark:text-slate-100 resize-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            @click="showDiscardModal = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700"
            @click="confirmDiscard"
          >
            Confirmar Descarte
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from './common/BaseModal.vue';
import PhoneInput from './common/PhoneInput.vue';
import BaseWhatsAppButton from './common/BaseWhatsAppButton.vue';
import { leadService } from '../services/leadService';
import { toastBridge } from '../services/toastBridge';
import { formatPhone } from '../utils/formatters';

const props = defineProps({
  lead: {
    type: Object,
    default: null
  },
  zIndex: {
    type: Number,
    default: 10000
  }
});

const emit = defineEmits(['close', 'saved', 'convert']);

const isNew = computed(() => !props.lead || !props.lead.id);
const loading = ref(false);
const activeTab = ref('conversation');
const showDiscardModal = ref(false);

const formData = ref({
  id: null,
  name: '',
  phone: '',
  source: null,
  inferredService: '',
  campaignId: null,
  status: 'NEW',
  optOut: false,
  discardReason: null,
  discardNotes: '',
  discardedAt: null,
  firstMessage: '',
  conversationHistory: [],
  notificationHistory: []
});

const discardData = ref({
  reason: 'NO_INTEREST',
  notes: ''
});

watch(() => props.lead, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal };
  } else {
    formData.value = {
      id: null,
      name: '',
      phone: '',
      source: null,
      inferredService: '',
      campaignId: null,
      status: 'NEW',
      optOut: false,
      firstMessage: '',
      conversationHistory: [],
      notificationHistory: []
    };
  }
}, { immediate: true });

const whatsAppUrl = computed(() => {
  if (!formData.value.phone) return null;
  const digits = formData.value.phone.replace(/\D/g, '');
  const fullPhone = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${fullPhone}`;
});

const statusBadgeClass = (status) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'IN_CONVERSATION':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'APPOINTMENT_OFFERED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    case 'CONVERTED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'DISCARDED':
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
};

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoStr;
  }
};

const toggleOptOut = async (e) => {
  const newVal = e.target.checked;
  try {
    await leadService.updateOptOut(formData.value.id, newVal);
    formData.value.optOut = newVal;
    toastBridge.getToast().add({
      severity: 'info',
      summary: 'Preferência Atualizada',
      detail: newVal ? 'Lead marcado com Opt-Out (Não Perturbe).' : 'Opt-Out desativado.',
      life: 3000
    });
    emit('saved', formData.value);
  } catch (error) {
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível atualizar o status de Opt-Out.',
      life: 3000
    });
  }
};

const confirmDiscard = async () => {
  if (discardData.value.reason === 'OTHER' && !discardData.value.notes?.trim()) {
    toastBridge.getToast().add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe as observações explicativas para o motivo Outro.',
      life: 3000
    });
    return;
  }

  try {
    const res = await leadService.discard(formData.value.id, discardData.value);
    formData.value = res.data;
    showDiscardModal.value = false;
    toastBridge.getToast().add({
      severity: 'success',
      summary: 'Lead Descartado',
      detail: 'O status do lead foi atualizado para descartado.',
      life: 3000
    });
    emit('saved', formData.value);
  } catch (error) {
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível descartar o lead.',
      life: 3000
    });
  }
};

const handleConvert = () => {
  emit('convert', formData.value);
};

const handleSubmit = async () => {
  if (!formData.value.phone?.trim() && !formData.value.whatsAppLid?.trim()) {
    toastBridge.getToast().add({
      severity: 'warn',
      summary: 'Campo Obrigatório',
      detail: 'Informe o número de telefone.',
      life: 3000
    });
    return;
  }

  loading.value = true;
  try {
    let res;
    if (isNew.value) {
      res = await leadService.create(formData.value);
      toastBridge.getToast().add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Lead criado com sucesso!',
        life: 3000
      });
    } else {
      res = await leadService.update(formData.value.id, formData.value);
      toastBridge.getToast().add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Lead atualizado com sucesso!',
        life: 3000
      });
    }
    emit('saved', res.data);
    emit('close');
  } catch (error) {
    const msg = error.response?.data?.error || error.response?.data?.message || 'Erro ao salvar lead.';
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: msg,
      life: 4000
    });
  } finally {
    loading.value = false;
  }
};
</script>
