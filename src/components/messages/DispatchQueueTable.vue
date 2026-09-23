<template>
  <div class="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 rounded-xl shadow-sm">
    <table class="w-full text-left border-collapse text-sm">
      <thead>
        <tr class="border-b border-slate-200 dark:border-slate-700/60 bg-slate-50/75 dark:bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <th class="py-3.5 px-4">Destinatário</th>
          <th class="py-3.5 px-4">Público / Origem</th>
          <th class="py-3.5 px-4">Horário Programado</th>
          <th class="py-3.5 px-4">Mensagem</th>
          <th class="py-3.5 px-4">Status</th>
          <th class="py-3.5 px-4 text-right">Ações</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
        <tr v-if="loading" class="text-center">
          <td colspan="6" class="py-8 text-slate-500 dark:text-slate-400">
            <i class="fa-solid fa-spinner fa-spin mr-2"></i> Carregando mensagens...
          </td>
        </tr>
        <tr v-else-if="messages.length === 0" class="text-center">
          <td colspan="6" class="py-8 text-slate-500 dark:text-slate-400">
            Nenhuma mensagem encontrada nesta seção.
          </td>
        </tr>
        <tr
          v-for="msg in messages"
          :key="msg.id"
          class="hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors"
        >
          <!-- Destinatário -->
          <td class="py-3.5 px-4">
            <div class="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{{ msg.targetName }}</span>
              <span v-if="msg.priority >= 10" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" title="Prioridade de Transbordo">
                TRANSBORDO
              </span>
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ formatPhone(msg.targetPhone) }}
            </div>
          </td>

          <!-- Público / Origem -->
          <td class="py-3.5 px-4">
            <div class="flex flex-col gap-1 items-start">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                :class="audienceBadgeClass(msg.targetType)"
              >
                {{ audienceLabel(msg.targetType) }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ originLabel(msg.originType) }}
              </span>
            </div>
          </td>

          <!-- Horário Programado -->
          <td class="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
            <div v-if="msg.scheduledAt" class="flex items-center gap-1 font-medium">
              <i class="fa-regular fa-clock text-slate-400"></i>
              {{ formatDateTime(msg.scheduledAt) }}
            </div>
            <div v-else-if="msg.sentAt" class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <i class="fa-solid fa-check-double"></i>
              {{ formatDateTime(msg.sentAt) }}
            </div>
            <div v-else class="text-slate-400">—</div>
          </td>

          <!-- Mensagem Preview -->
          <td class="py-3.5 px-4 max-w-xs">
            <p class="text-xs text-slate-600 dark:text-slate-300 truncate" :title="msg.messageText">
              {{ msg.messageText }}
            </p>
            <p v-if="msg.errorMessage" class="text-[11px] text-red-500 mt-1 font-medium">
              <i class="fa-solid fa-circle-exclamation mr-1"></i> {{ msg.errorMessage }}
            </p>
          </td>

          <!-- Status -->
          <td class="py-3.5 px-4">
            <span
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              :class="statusBadgeClass(msg.status)"
            >
              <i :class="statusIcon(msg.status)"></i>
              {{ statusLabel(msg.status) }}
            </span>
          </td>

          <!-- Ações -->
          <td class="py-3.5 px-4 text-right">
            <button
              v-if="msg.status === 'SCHEDULED' || msg.status === 'APPROVED'"
              type="button"
              title="Desfazer Aprovação (cancelar envio agendado)"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 text-amber-800 dark:text-amber-300 transition-colors"
              @click="$emit('unapprove', msg)"
            >
              <i class="fa-solid fa-rotate-left text-[11px]"></i>
              <span>Desfazer</span>
            </button>
            <span v-else class="text-xs text-slate-400">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  messages: { type: Array, default: () => [] },
  loading: { type: Boolean, default: () => false }
});

defineEmits(['unapprove']);

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
  if (origin === 'APPOINTMENT') return 'Agendamento';
  if (origin === 'LEAD') return 'Lead';
  if (origin === 'SYSTEM') return 'Sistema';
  return origin || 'Rebooking';
};

const statusLabel = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL': return 'Aguardando OK';
    case 'APPROVED': return 'Aprovado';
    case 'SCHEDULED': return 'Agendado';
    case 'SENT': return 'Enviado';
    case 'FAILED': return 'Falha';
    case 'REJECTED': return 'Descartado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20';
    case 'APPROVED':
    case 'SCHEDULED':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20';
    case 'SENT':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20';
    case 'FAILED':
      return 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-500/20';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }
};

const statusIcon = (status) => {
  switch (status) {
    case 'PENDING_APPROVAL': return 'fa-solid fa-clock';
    case 'APPROVED':
    case 'SCHEDULED': return 'fa-regular fa-calendar-check';
    case 'SENT': return 'fa-solid fa-check';
    case 'FAILED': return 'fa-solid fa-triangle-exclamation';
    default: return 'fa-solid fa-circle-info';
  }
};
</script>
