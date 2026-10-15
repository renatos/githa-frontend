<template>
  <BaseModal
    :show="show"
    title=""
    max-width="max-w-xl"
    :body-padding="false"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="p-6 sm:p-7">
      <div class="flex flex-col items-center text-center">
        <!-- Ícone topo -->
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
          <i class="fa-solid fa-layer-group text-2xl"></i>
        </div>

        <!-- Título e Subtítulo -->
        <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1.5">
          Atualizar Status da Sessão
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
          Este agendamento faz parte de uma sessão com <span class="font-semibold text-slate-700 dark:text-slate-300">{{ totalCount }} procedimentos</span>. Como deseja aplicar a alteração para <span class="font-bold text-indigo-600 dark:text-indigo-400">"{{ statusLabel }}"</span>?
        </p>

        <!-- Cards de Ação / Escolha -->
        <div class="w-full flex flex-col gap-3 text-left">
          <!-- Opção 1: Apenas Este -->
          <button
            type="button"
            class="group w-full relative flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 bg-white dark:bg-slate-800/90 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-all text-left cursor-pointer shadow-xs"
            @click="$emit('choose', 'SINGLE')"
          >
            <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center shrink-0 transition-colors mt-0.5">
              <i class="fa-solid fa-calendar-day text-base"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Apenas este agendamento
                </p>
                <span v-if="appointmentDetails?.time" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide shrink-0">
                  <i class="fa-solid fa-clock text-[10px] mr-1"></i>
                  {{ appointmentDetails.time }}
                </span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300 font-semibold truncate mt-1">
                {{ appointmentDetails?.serviceName || 'Procedimento selecionado' }}
                <span v-if="appointmentDetails?.professionalName" class="font-normal text-slate-400">
                  • {{ appointmentDetails.professionalName }}
                </span>
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Altera o status somente deste procedimento. Os demais procedimentos da sessão continuam com seus status atuais.
              </p>
            </div>
            <div class="self-center text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0 pl-1">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </div>
          </button>

          <!-- Opção 2: Toda a Sessão -->
          <button
            type="button"
            class="group w-full relative flex items-start gap-4 p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-600 dark:hover:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 transition-all text-left cursor-pointer shadow-xs"
            @click="$emit('choose', 'ALL')"
          >
            <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fa-solid fa-layer-group text-base"></i>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="font-bold text-sm text-indigo-950 dark:text-indigo-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Toda a sessão (todos os {{ totalCount }} procedimentos)
                </p>
                <span class="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full shrink-0">
                  Em lote
                </span>
              </div>
              <p class="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1">
                Atualizar todos os procedimentos da sessão para "{{ statusLabel }}"
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Aplica a alteração em conjunto para todos os procedimentos vinculados a esta sessão.
              </p>
            </div>
            <div class="self-center text-indigo-400 dark:text-indigo-500 group-hover:text-indigo-600 transition-colors shrink-0 pl-1">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </div>
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        @click="$emit('close')"
      >
        Cancelar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './common/BaseModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  newStatus: {
    type: String,
    required: true
  },
  appointment: {
    type: Object,
    default: () => null
  },
  totalProcedures: {
    type: Number,
    default: 0
  },
  zIndex: {
    type: Number,
    default: 11000
  }
});

defineEmits(['close', 'choose']);

const statusMap = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  REQUESTED: 'Solicitado',
  CANCELED: 'Cancelado',
  MISSED: 'Faltou',
  COMPLETED: 'Concluído'
};

const statusLabel = computed(() => statusMap[props.newStatus] || props.newStatus);

const totalCount = computed(() => props.totalProcedures || props.appointment?.totalInSession || 2);

const appointmentDetails = computed(() => {
  if (!props.appointment) return null;
  const appt = props.appointment;
  const serviceName = appt.serviceName || appt.service?.name || '';
  const professionalName = appt.professionalName || appt.professional?.name || '';
  let time = appt.time || '';
  if (!time && (appt.start || appt.startTime)) {
    const s = (appt.start || appt.startTime?.split('T')[1]?.substring(0, 5) || '');
    const e = (appt.end || appt.endTime?.split('T')[1]?.substring(0, 5) || '');
    time = s && e ? `${s} - ${e}` : (s || '');
  }
  return {
    serviceName,
    professionalName,
    time,
    clientName: appt.clientName || appt.client?.name || ''
  };
});
</script>
