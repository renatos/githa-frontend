<template>
  <BaseModal
    :show="show"
    title="Detalhes do Envio"
    :subtitle="message ? `ID #${message.id} • ${message.targetName || 'Destinatário'}` : ''"
    icon="fa-brands fa-whatsapp"
    max-width="max-w-2xl"
    @close="$emit('close')"
  >
    <div v-if="message" class="space-y-5 text-sm">
      <!-- Error Alert Banner (if message has error or status is FAILED) -->
      <div
        v-if="message.errorMessage || message.status === 'FAILED'"
        class="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-xs"
      >
        <div class="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 mt-0.5">
          <i class="fa-solid fa-triangle-exclamation text-base"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-sm text-rose-900 dark:text-rose-100">
            Falha no Envio da Mensagem
          </h4>
          <p class="text-xs text-rose-700 dark:text-rose-300 mt-1 whitespace-pre-wrap break-words font-mono bg-white/60 dark:bg-black/20 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800/40">
            {{ message.errorMessage || 'Erro não especificado retornado pela integração.' }}
          </p>
        </div>
      </div>

      <!-- Recipient & General Status Header Card -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60">
        <!-- Target Info -->
        <div>
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
            Destinatário
          </span>
          <div class="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>{{ message.targetName }}</span>
            <span
              v-if="isOverflow"
              class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
              title="Mensagem de Transbordo"
            >
              TRANSBORDO
            </span>
          </div>
          <div class="text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
            <i class="fa-solid fa-phone text-[10px] text-slate-400"></i>
            <span>{{ formatPhone(message.targetPhone) }}</span>
          </div>
        </div>

        <!-- Status & Origin Badges -->
        <div class="flex flex-col items-start sm:items-end justify-center gap-2">
          <span
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs"
            :class="statusBadgeClass(message.status)"
          >
            <i :class="statusIcon(message.status)"></i>
            {{ statusLabel(message.status) }}
          </span>

          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
              :class="audienceBadgeClass(message.targetType)"
            >
              {{ audienceLabel(message.targetType) }}
            </span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              {{ originLabel(message.originType) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Audit & Approval Information Section -->
      <div class="rounded-xl border border-slate-200 dark:border-slate-700/70 p-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fa-solid fa-user-check text-emerald-600 dark:text-emerald-400"></i>
          Auditoria de Aprovação e Envio
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs pt-1">
          <!-- Profissional que aprovou -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Profissional que Aprovou:</span>
            <div class="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <i class="fa-solid fa-user-tie text-slate-400 text-[11px]"></i>
              <span>{{ approverDisplayName }}</span>
            </div>
          </div>

          <!-- Horário de Aprovação -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Horário de Aprovação:</span>
            <div class="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <i class="fa-regular fa-calendar-check text-slate-400 text-[11px]"></i>
              <span>{{ formatDateTime(message.approvedAt) || 'Não registrado' }}</span>
            </div>
          </div>

          <!-- Horário Programado -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Horário Programado:</span>
            <div class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i class="fa-regular fa-clock text-slate-400 text-[11px]"></i>
              <span>{{ formatDateTime(message.scheduledAt) || 'Imediato / Não agendado' }}</span>
            </div>
          </div>

          <!-- Horário de Envio Efetivo -->
          <div>
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Disparado em:</span>
            <div class="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <i class="fa-solid fa-paper-plane text-slate-400 text-[11px]"></i>
              <span>{{ formatDateTime(message.sentAt) || 'Ainda não enviado' }}</span>
            </div>
          </div>

          <!-- Bridge ID Externo -->
          <div v-if="message.externalMessageId" class="sm:col-span-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span class="text-slate-500 dark:text-slate-400 block mb-0.5">Identificador Externo WhatsApp:</span>
            <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              {{ message.externalMessageId }}
            </span>
          </div>
        </div>
      </div>

      <!-- Metadata Display Tags (Service Name, Procedures, etc.) -->
      <div v-if="metadataTags.length > 0" class="flex flex-wrap gap-2 pt-1">
        <span
          v-for="(tag, idx) in metadataTags"
          :key="idx"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium"
        >
          <span class="text-slate-400 font-normal">{{ tag.label }}:</span>
          <span>{{ tag.value }}</span>
        </span>
      </div>

      <!-- Message Content (WhatsApp Bubble Style) -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-regular fa-comment-dots text-emerald-600 dark:text-emerald-400"></i>
            Mensagem Enviada
          </label>
          <button
            type="button"
            class="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            @click="copyMessageText"
          >
            <i :class="copied ? 'fa-solid fa-check text-emerald-600' : 'fa-regular fa-copy'"></i>
            <span>{{ copied ? 'Copiado!' : 'Copiar Texto' }}</span>
          </button>
        </div>

        <div class="relative p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 text-slate-900 dark:text-slate-100 shadow-inner">
          <p class="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed font-sans select-text">
            {{ message.messageText }}
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <button
        type="button"
        class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
        @click="$emit('close')"
      >
        Fechar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from '@/components/common/BaseModal.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: Object, default: null },
  professionals: { type: Array, default: () => [] }
});

defineEmits(['close']);

const copied = ref(false);

const copyMessageText = async () => {
  if (!props.message?.messageText) return;
  try {
    await navigator.clipboard.writeText(props.message.messageText);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error('Falha ao copiar:', e);
  }
};

const approverDisplayName = computed(() => {
  if (!props.message) return 'Não informado';
  if (props.message.approvedByProfessionalName) {
    return props.message.approvedByProfessionalName;
  }
  if (props.message.approvedByProfessionalId && props.professionals?.length) {
    const prof = props.professionals.find(p => p.id === props.message.approvedByProfessionalId);
    if (prof) return prof.name;
  }
  if (props.message.approvedByUserName) {
    return props.message.approvedByUserName;
  }
  if (props.message.approvedByUserId) {
    return `Usuário #${props.message.approvedByUserId}`;
  }
  if (props.message.status === 'PENDING_APPROVAL') {
    return 'Pendente de aprovação';
  }
  return 'Não informado';
});

const isOverflow = computed(() => {
  if (!props.message) return false;
  if (props.message.overflow === true) return true;
  if (!props.message.metadata) return false;
  try {
    const meta = typeof props.message.metadata === 'string'
      ? JSON.parse(props.message.metadata)
      : props.message.metadata;
    return !!meta.overflow;
  } catch {
    return false;
  }
});

const metadataTags = computed(() => {
  if (!props.message?.metadata) return [];
  try {
    const meta = typeof props.message.metadata === 'string'
      ? JSON.parse(props.message.metadata)
      : props.message.metadata;
    if (Array.isArray(meta.displayTags)) {
      return meta.displayTags;
    }
    const tags = [];
    if (meta.serviceName) {
      tags.push({ label: 'Procedimento', value: meta.serviceName });
    }
    return tags;
  } catch {
    return [];
  }
});

const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const audienceLabel = (type) => {
  if (type === 'CLIENT') return 'Cliente';
  if (type === 'LEAD') return 'Lead';
  if (type === 'PROFESSIONAL') return 'Profissional';
  return type || 'Cliente';
};

const audienceBadgeClass = (type) => {
  if (type === 'PROFESSIONAL') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
  if (type === 'LEAD') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
};

const originLabel = (origin) => {
  if (origin === 'REBOOKING') return 'Rebooking';
  if (origin === 'FOLLOW_UP') return 'Acompanhamento';
  if (origin === 'APPOINTMENT') return 'Agendamento';
  if (origin === 'LEAD') return 'Lead';
  if (origin === 'SYSTEM') return 'Sistema';
  return origin || 'Rebooking';
};

const statusLabel = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL': return 'Aguardando Aprovação';
    case 'APPROVED': return 'Aprovado';
    case 'SCHEDULED': return 'Agendado';
    case 'SENT': return 'Enviado com Sucesso';
    case 'FAILED': return 'Falha no Disparo';
    case 'REJECTED': return 'Descartado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300/60 dark:border-amber-500/30';
    case 'APPROVED':
    case 'SCHEDULED':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300/60 dark:border-blue-500/30';
    case 'SENT':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-500/30';
    case 'FAILED':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300/60 dark:border-rose-500/30';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
};

const statusIcon = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL': return 'fa-solid fa-clock';
    case 'APPROVED':
    case 'SCHEDULED': return 'fa-regular fa-calendar-check';
    case 'SENT': return 'fa-solid fa-check-double';
    case 'FAILED': return 'fa-solid fa-triangle-exclamation';
    default: return 'fa-solid fa-circle-info';
  }
};
</script>
