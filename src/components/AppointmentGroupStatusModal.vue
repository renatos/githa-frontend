<template>
  <BaseModal
    :show="show"
    title=""
    max-width="max-w-md"
    :body-padding="false"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="p-6">
      <div class="flex flex-col items-center text-center gap-4">
        <div class="p-3.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <i class="fa-solid fa-layer-group text-2xl"></i>
        </div>

        <div class="space-y-2">
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
            Atualizar Status da Sessão
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Este agendamento faz parte de uma sessão com múltiplos procedimentos. Como deseja aplicar a alteração para <span class="font-bold text-slate-800 dark:text-slate-200">"{{ statusLabel }}"</span>?
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row items-center gap-2 w-full">
        <button
          type="button"
          class="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
          @click="$emit('choose', 'SINGLE')"
        >
          Apenas Este
        </button>
        <button
          type="button"
          class="w-full sm:flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all"
          @click="$emit('choose', 'ALL')"
        >
          Toda a Sessão
        </button>
      </div>
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
</script>
