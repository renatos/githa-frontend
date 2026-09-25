<template>
  <div
    class="card-collapse-track"
    :class="{ 'is-collapsing': isCollapsing }"
  >
    <div class="card-collapse-content">
      <div class="relative overflow-hidden sm:overflow-visible rounded-xl">
    <!-- Swipe Action Backdrop (Mobile visual cues revealed when dragging horizontally) -->
    <div
      v-if="!isScheduled && message.status !== 'SENT' && message.status !== 'UPDATING' && (isSwiping || animatingOut)"
      class="absolute inset-0 rounded-xl flex items-center justify-between px-6 pointer-events-none transition-colors duration-200 z-0"
      :class="{
        'bg-emerald-500/15 dark:bg-emerald-500/25 border-2 border-emerald-500/50': touchDeltaX > 0 || animatingOut === 'right',
        'bg-red-500/15 dark:bg-red-500/25 border-2 border-red-500/50': touchDeltaX < 0 || animatingOut === 'left',
      }"
    >
      <!-- Left side (Aprovar) -->
      <div
        class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm transition-all duration-150"
        :style="{
          opacity: (touchDeltaX > 15 || animatingOut === 'right') ? 1 : 0,
          transform: `scale(${touchDeltaX > 70 || animatingOut === 'right' ? 1.08 : 0.95})`
        }"
      >
        <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-check text-base"></i>
        </div>
        <span>Aprovar e Agendar</span>
      </div>

      <!-- Right side (Descartar) -->
      <div
        class="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm ml-auto transition-all duration-150"
        :style="{
          opacity: (touchDeltaX < -15 || animatingOut === 'left') ? 1 : 0,
          transform: `scale(${Math.abs(touchDeltaX) > 70 || animatingOut === 'left' ? 1.08 : 0.95})`
        }"
      >
        <span>Descartar</span>
        <div class="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg">
          <i class="fa-solid fa-xmark text-base"></i>
        </div>
      </div>
    </div>

    <!-- The Interactive Card Element -->
    <div
      :id="'dispatch-card-' + message.id"
      class="bg-white dark:bg-slate-800 border rounded-xl p-5 shadow-sm flex flex-col justify-between select-none touch-pan-y relative z-10"
      :class="[
        highlighted
          ? 'ring-4 ring-emerald-500/90 dark:ring-emerald-400 border-emerald-500 shadow-xl shadow-emerald-500/25 scale-[1.01]'
          : 'border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600',
        animatingOut === 'right' ? 'shadow-2xl shadow-emerald-500/30' : '',
        animatingOut === 'left' ? 'shadow-2xl shadow-red-500/30' : ''
      ]"
      :style="cardTransformStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
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
              <span v-if="metadataObj.serviceName && displayTags.length === 0" class="text-xs font-normal text-slate-500 dark:text-slate-400">
                • {{ metadataObj.serviceName.toLowerCase() }}
              </span>
            </h4>
            <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{{ formatPhone(message.targetPhone) }}</span>
              <span>•</span>
              <span class="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                <i :class="originIcon" class="text-[10px]"></i> {{ originLabel }}
              </span>
            </div>
          </div>
        </div>

        <!-- Dynamic Status Badge -->
        <span
          v-if="isScheduled"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20"
        >
          <i class="fa-regular fa-calendar-check text-[10px]"></i>
          {{ scheduledLabel }}
        </span>
        <span
          v-else-if="message.status === 'SENT'"
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20"
        >
          <i class="fa-solid fa-check text-[10px]"></i> Enviado
        </span>
        <span
          v-else-if="message.status === 'UPDATING'"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20"
        >
          <i class="fa-solid fa-arrows-rotate fa-spin text-[10px]"></i> Atualizando texto...
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20"
        >
          <i class="fa-solid fa-clock text-[10px]"></i> Aguardando OK
        </span>
      </div>

      <!-- Dynamic Metadata Display Tags -->
      <DisplayTags :tags="displayTags" class="mt-2 mb-1" />

      <!-- Message Content -->
      <div class="mt-3">
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Mensagem a ser enviada
          </label>
          <button
            v-if="!isScheduled && message.status !== 'SENT' && message.status !== 'UPDATING'"
            type="button"
            class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            @click="isEditing = !isEditing"
          >
            <i :class="isEditing ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square'"></i>
            {{ isEditing ? 'Concluir Edição' : 'Editar Texto' }}
          </button>
        </div>

        <textarea
          v-if="isEditing && !isScheduled"
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
      <!-- Se já estiver Agendado, permite Desfazer Aprovação -->
      <div v-if="isScheduled" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
        <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <i class="fa-solid fa-clock-rotate-left text-blue-500"></i>
          <span>Agendado para disparo automático.</span>
        </div>

        <button
          type="button"
          :disabled="unapproving"
          class="px-3.5 py-2 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-500/10 dark:hover:text-amber-400 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          @click="handleUnapprove"
        >
          <i v-if="unapproving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-rotate-left"></i>
          <span>Desfazer Aprovação</span>
        </button>
      </div>

      <!-- Se ainda estiver Aguardando Aprovação -->
      <template v-else>
        <div class="flex-1 max-w-xs">
          <select
            v-model="selectedProfessionalId"
            :disabled="message.status === 'UPDATING'"
            class="w-full text-xs border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 focus:ring-blue-500 disabled:opacity-50"
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
            :disabled="rejecting || approving || message.status === 'UPDATING'"
            class="px-3.5 py-2 border border-slate-300 dark:border-slate-600 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            @click="handleReject"
          >
            <i v-if="rejecting" class="fa-solid fa-spinner fa-spin mr-1"></i>
            <i v-else class="fa-solid fa-xmark mr-1"></i> Descartar
          </button>

          <button
            type="button"
            :disabled="approving || rejecting || message.status === 'UPDATING'"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            @click="handleApprove"
          >
            <i v-if="approving" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else-if="message.status === 'UPDATING'" class="fa-solid fa-arrows-rotate fa-spin"></i>
            <i v-else class="fa-solid fa-check"></i>
            <span v-if="message.status === 'UPDATING'">Atualizando...</span>
            <span v-else>Aprovar e Agendar</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import DisplayTags from '@/components/common/DisplayTags.vue';
import { enumService } from '@/services/enumService';

const props = defineProps({
  message: { type: Object, required: true },
  professionals: { type: Array, default: () => [] },
  highlighted: { type: Boolean, default: false }
});

const emit = defineEmits(['approve', 'reject', 'unapprove']);

const isEditing = ref(false);
const editedText = ref(props.message.messageText || '');
const selectedProfessionalId = ref(props.message.approvedByProfessionalId || null);
const approving = ref(false);
const rejecting = ref(false);
const unapproving = ref(false);
const originDescription = ref('');

const fetchOriginDescription = async (originType) => {
  if (!originType) {
    originDescription.value = '';
    return;
  }
  try {
    const desc = await enumService.getDescription('MessageOriginType', originType);
    if (desc) {
      originDescription.value = desc;
    }
  } catch {
    // fallback will be used
  }
};

onMounted(() => {
  fetchOriginDescription(props.message?.originType);
});

watch(
  () => props.message,
  (newMsg) => {
    if (newMsg) {
      editedText.value = newMsg.messageText || '';
      selectedProfessionalId.value = newMsg.approvedByProfessionalId || null;
      fetchOriginDescription(newMsg.originType);
    }
  },
  { deep: true }
);

const isScheduled = computed(() => {
  return props.message.status === 'SCHEDULED' || props.message.status === 'APPROVED';
});

const scheduledLabel = computed(() => {
  if (props.message.scheduledAt) {
    const d = new Date(props.message.scheduledAt);
    const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `Agendado às ${timeStr}`;
  }
  return 'Agendado';
});

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

const displayTags = computed(() => {
  if (Array.isArray(metadataObj.value?.displayTags)) {
    return metadataObj.value.displayTags;
  }
  return [];
});

const originLabel = computed(() => {
  if (originDescription.value) {
    return originDescription.value;
  }
  const map = {
    REBOOKING: 'Retorno / Rebooking',
    FOLLOW_UP: 'Acompanhamento',
    APPOINTMENT: 'Agendamento',
    LEAD: 'Lead',
    SYSTEM: 'Sistema'
  };
  return map[props.message.originType] || props.message.originType || 'Mensagem';
});

const originIcon = computed(() => {
  const map = {
    REBOOKING: 'fa-solid fa-arrows-rotate',
    FOLLOW_UP: 'fa-solid fa-heart-pulse',
    APPOINTMENT: 'fa-regular fa-calendar-check',
    LEAD: 'fa-solid fa-bullhorn',
    SYSTEM: 'fa-solid fa-gear'
  };
  return map[props.message.originType] || 'fa-solid fa-message';
});

const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

const isCollapsing = ref(false);
const animatingOut = ref(null); // 'right' | 'left' | null
const touchDeltaX = ref(0);
const isSwiping = ref(false);
let touchStartX = null;
let touchStartY = null;

const cardTransformStyle = computed(() => {
  if (animatingOut.value === 'right') {
    return {
      transform: 'translateX(110%) rotate(5deg)',
      opacity: '0',
      transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease'
    };
  }
  if (animatingOut.value === 'left') {
    return {
      transform: 'translateX(-110%) rotate(-5deg)',
      opacity: '0',
      transition: 'transform 360ms cubic-bezier(0.16, 1, 0.3, 1), opacity 320ms ease'
    };
  }
  if (isSwiping.value) {
    const rot = touchDeltaX.value * 0.04;
    return {
      transform: `translateX(${touchDeltaX.value}px) rotate(${rot}deg)`,
      transition: 'none'
    };
  }
  return {
    transform: 'translateX(0px) rotate(0deg)',
    transition: 'transform 250ms ease, opacity 250ms ease'
  };
});

const onTouchStart = (e) => {
  if (animatingOut.value || isScheduled.value || props.message.status === 'SENT') return;
  const target = e.target;
  // Ignore swipe when touching interactive controls
  if (target && target.closest('input, textarea, select, button, a, [contenteditable="true"]')) {
    touchStartX = null;
    touchStartY = null;
    return;
  }
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchDeltaX.value = 0;
  isSwiping.value = false;
};

const onTouchMove = (e) => {
  if (touchStartX === null || animatingOut.value) return;
  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const deltaX = currentX - touchStartX;
  const deltaY = currentY - touchStartY;

  if (!isSwiping.value) {
    // If vertical scrolling is dominant, abort swipe to allow native scrolling
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      touchStartX = null;
      return;
    }
    // If horizontal drag is dominant, engage swipe
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      isSwiping.value = true;
    }
  }

  if (isSwiping.value) {
    if (e.cancelable) e.preventDefault();
    touchDeltaX.value = deltaX;
  }
};

const onTouchEnd = () => {
  if (!isSwiping.value || touchStartX === null || animatingOut.value) {
    touchStartX = null;
    touchStartY = null;
    isSwiping.value = false;
    touchDeltaX.value = 0;
    return;
  }

  const threshold = 85;
  if (touchDeltaX.value > threshold) {
    triggerApprove();
  } else if (touchDeltaX.value < -threshold) {
    triggerReject();
  } else {
    touchDeltaX.value = 0;
    isSwiping.value = false;
  }
  touchStartX = null;
  touchStartY = null;
};

const triggerApprove = () => {
  if (animatingOut.value) return;
  animatingOut.value = 'right';
  // Begin height collapse at 60ms so the next card smoothly glides up simultaneously with the slide
  setTimeout(() => {
    isCollapsing.value = true;
  }, 60);

  setTimeout(() => {
    approving.value = true;
    emit('approve', {
      id: props.message.id,
      customMessageText: editedText.value,
      professionalId: selectedProfessionalId.value,
      done: () => {
        approving.value = false;
        animatingOut.value = null;
        isCollapsing.value = false;
        isSwiping.value = false;
        touchDeltaX.value = 0;
      }
    });
  }, 380);
};

const triggerReject = () => {
  if (animatingOut.value) return;
  animatingOut.value = 'left';
  setTimeout(() => {
    isCollapsing.value = true;
  }, 60);

  setTimeout(() => {
    rejecting.value = true;
    emit('reject', {
      id: props.message.id,
      done: () => {
        rejecting.value = false;
        animatingOut.value = null;
        isCollapsing.value = false;
        isSwiping.value = false;
        touchDeltaX.value = 0;
      }
    });
  }, 380);
};

const handleApprove = () => {
  triggerApprove();
};

const handleReject = () => {
  if (!confirm(`Deseja descartar o envio da mensagem para ${props.message.targetName}?`)) {
    return;
  }
  triggerReject();
};

const handleUnapprove = () => {
  if (!confirm(`Deseja desfazer a aprovação da mensagem para ${props.message.targetName}? O envio agendado será cancelado e a mensagem voltará para a moderação.`)) {
    return;
  }
  unapproving.value = true;
  emit('unapprove', {
    id: props.message.id,
    done: () => { unapproving.value = false; }
  });
};
</script>

<style scoped>
.card-collapse-track {
  display: grid;
  grid-template-rows: 1fr;
  opacity: 1;
  margin-bottom: 0px;
  transition: grid-template-rows 380ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 320ms ease,
              margin-bottom 380ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: grid-template-rows, opacity, margin-bottom;
}

.card-collapse-track.is-collapsing {
  grid-template-rows: 0fr;
  opacity: 0;
  margin-bottom: -1rem; /* Absorb the parent grid gap-4 smoothly */
  pointer-events: none;
}

.card-collapse-content {
  min-height: 0;
  overflow: hidden;
}
</style>
