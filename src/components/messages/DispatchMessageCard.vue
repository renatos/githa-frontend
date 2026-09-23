<template>
  <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 rounded-xl p-5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600 flex flex-col justify-between">
    <!-- Header -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <i class="fa-brands fa-whatsapp text-lg"></i>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              {{ message.targetName }}
              <span v-if="metadataObj.serviceName" class="text-xs font-normal text-slate-500 dark:text-slate-400">
                • {{ metadataObj.serviceName }}
              </span>
            </h4>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{{ formatPhone(message.targetPhone) }}</span>
              <span>•</span>
              <span class="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <i class="fa-solid fa-arrows-rotate text-[10px]"></i> Rebooking
              </span>
            </div>
          </div>
        </div>

        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
          <i class="fa-solid fa-clock text-[10px]"></i> Aguardando OK
        </span>
      </div>

      <!-- Message Content -->
      <div class="mt-3">
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Mensagem a ser enviada
          </label>
          <button
            type="button"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            @click="isEditing = !isEditing"
          >
            <i :class="isEditing ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square'"></i>
            {{ isEditing ? 'Concluir Edição' : 'Editar Texto' }}
          </button>
        </div>

        <textarea
          v-if="isEditing"
          v-model="editedText"
          rows="4"
          class="w-full text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-900/60 dark:text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Digite a mensagem personalizada..."
        ></textarea>
        <div
          v-else
          class="text-sm bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/50 rounded-lg p-3 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed"
        >
          {{ editedText }}
        </div>
      </div>
    </div>

    <!-- Actions & Professional Selection -->
    <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex-1 max-w-xs">
        <select
          v-model="selectedProfessionalId"
          class="w-full text-xs border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 focus:ring-blue-500"
        >
          <option :value="null">Profissional responsável (opcional)</option>
          <option v-for="prof in professionals" :key="prof.id" :value="prof.id">
            {{ prof.name }}
          </option>
        </select>
      </div>

      <div class="flex items-center gap-2 justify-end">
        <button
          type="button"
          :disabled="rejecting || approving"
          class="px-3.5 py-2 border border-slate-300 dark:border-slate-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          @click="handleReject"
        >
          <i v-if="rejecting" class="fa-solid fa-spinner fa-spin mr-1"></i>
          <i v-else class="fa-solid fa-xmark mr-1"></i> Descartar
        </button>

        <button
          type="button"
          :disabled="approving || rejecting"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          @click="handleApprove"
        >
          <i v-if="approving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i>
          <span>Aprovar e Agendar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  message: { type: Object, required: true },
  professionals: { type: Array, default: () => [] }
});

const emit = defineEmits(['approve', 'reject']);

const isEditing = ref(false);
const editedText = ref(props.message.messageText || '');
const selectedProfessionalId = ref(props.message.approvedByProfessionalId || null);
const approving = ref(false);
const rejecting = ref(false);

const metadataObj = computed(() => {
  if (!props.message.metadata) return {};
  try {
    return typeof props.message.metadata === 'string'
      ? JSON.parse(props.message.metadata)
      : props.message.metadata;
  } catch {
    return {};
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

const handleApprove = () => {
  approving.value = true;
  emit('approve', {
    id: props.message.id,
    customMessageText: editedText.value,
    professionalId: selectedProfessionalId.value,
    done: () => { approving.value = false; }
  });
};

const handleReject = () => {
  if (!confirm(`Deseja descartar o envio da mensagem para ${props.message.targetName}?`)) {
    return;
  }
  rejecting.value = true;
  emit('reject', {
    id: props.message.id,
    done: () => { rejecting.value = false; }
  });
};
</script>
