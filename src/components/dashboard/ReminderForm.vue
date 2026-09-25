<template>
  <BaseModal
    :show="true"
    title="Detalhes do Lembrete"
    :subtitle="reminder.type === 'CHURN' ? 'Protocolo de Recuperação de Abandono' : (reminder.type === 'FOLLOW_UP' ? 'Acompanhamento Pós-Procedimento' : 'Protocolo de Retorno Inteligente')"
    :icon="reminder.type === 'CHURN' ? 'fa-solid fa-heart-pulse' : (reminder.type === 'FOLLOW_UP' ? 'fa-solid fa-clipboard-check' : 'fa-solid fa-arrows-rotate')"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-left">
      <div v-if="reminder.type === 'CHURN'" class="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
              <p class="text-xs font-bold text-red-700 dark:text-red-300 uppercase">Atenção: Risco de Abandono</p>
              <p class="text-[10px] text-red-600 dark:text-red-400">Este cliente foi identificado pelo motor de predição como passível de evasão.</p>
          </div>
      </div>

      <!-- Active Dispatch Banner in Message Hub -->
      <div v-if="activeDispatch" class="rounded-xl p-3 border text-xs flex items-center justify-between gap-3" :class="dispatchBannerClass">
        <div class="flex items-center gap-2.5 min-w-0">
          <i :class="dispatchBannerIcon" class="text-base shrink-0"></i>
          <div class="truncate">
            <p class="font-semibold">{{ dispatchBannerTitle }}</p>
            <p class="text-[11px] opacity-90 truncate">{{ dispatchBannerSubtitle }}</p>
          </div>
        </div>
        <button
          type="button"
          title="Abrir Central de Mensagens"
          class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-xs"
          @click="goToMessageHub"
        >
          <span>Ver no Hub</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cliente</label>
              <div 
                title="Ver detalhes do cliente"
                class="text-sm text-gray-900 dark:text-white font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                @click="$emit('open-client', reminder.client)"
              >
                {{ reminder.client?.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <span class="flex items-center gap-1">
                    <i class="fa-brands fa-whatsapp text-emerald-500"></i> {{ reminder.client?.phone || 'Sem telefone' }}
                  </span>
              </div>
          </div>
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Serviço</label>
              <div class="text-sm text-gray-900 dark:text-white font-medium">{{ reminder.service?.name }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  <template v-if="reminder.type === 'FOLLOW_UP'">
                    Prazo: {{ reminder.service?.followUpDays }} dias
                  </template>
                  <template v-else>
                    Ciclo: {{ reminder.service?.idealReturnDays }} dias 
                  </template>
                  <span v-if="reminder.lastAppointmentDate" class="ml-2" title="Data do último atendimento">
                    | Último: {{ new Date(reminder.lastAppointmentDate).toLocaleDateString('pt-BR') }}
                  </span>
              </div>
          </div>
      </div>

      <!-- Template Selector & Suggested Message -->
      <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
              <label class="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                Mensagem Sugerida
              </label>
              <div class="flex items-center gap-2">
                <!-- Hub Template Dropdown -->
                <select
                  v-if="templates.length > 0"
                  v-model="selectedTemplateId"
                  title="Aplicar modelo de mensagem cadastrado no Hub"
                  class="text-xs border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                  @change="onTemplateChange"
                >
                  <option value="">Modelos do Hub ({{ templates.length }})</option>
                  <option v-for="tmpl in templates" :key="tmpl.id" :value="tmpl.id">
                    {{ tmpl.name }} {{ tmpl.isDefault ? '★' : '' }}
                  </option>
                </select>

                <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1 transition-colors font-medium shrink-0" @click="copyMessage">
                    <i class="fa-solid fa-copy"></i> Copiar
                </button>
              </div>
          </div>
          <textarea v-model="form.message" rows="4" class="w-full text-sm border-gray-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-gray-300 rounded-lg shadow-inner focus:border-blue-500 focus:ring-blue-500 p-4 leading-relaxed transition-colors border resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select v-model="form.status" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2">
                  <option v-for="opt in filteredStatusOptions" :key="opt.name" :value="opt.name">{{ opt.description }}</option>
              </select>
          </div>
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Data do Contato</label>
              <input v-model="form.contactDate" type="date" disabled class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-gray-400 rounded-md shadow-sm p-2 cursor-not-allowed" />
          </div>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            Profissional Responsável
            <span v-if="isProfessionalRequired" class="text-red-500">*</span>
          </label>
          <select 
            v-model="form.contactResponsibleId" 
            class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 transition-colors"
            :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': isProfessionalRequired && !form.contactResponsibleId }"
          >
              <option :value="null">Selecione o profissional</option>
              <option v-for="prof in professionals" :key="prof.id" :value="prof.id">{{ prof.name }}</option>
          </select>
          <p v-if="isProfessionalRequired && !form.contactResponsibleId" class="text-[10px] text-red-500 mt-1">
            A seleção do profissional é obrigatória para os status "{{ currentStatusLabel }}".
          </p>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notas (Histórico)</label>
          <textarea v-model="form.notes" rows="3" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" placeholder="Qual foi o desfecho do contato?..."></textarea>
      </div>
    </div>

    <template #footer>
      <button type="button" class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm" @click="$emit('close')">
        Cancelar
      </button>

      <!-- Action: Enfileirar no Hub de Disparo -->
      <button
        v-if="!isQueuedOrSent"
        type="button"
        :disabled="enqueuing || !reminder.client?.phone"
        title="Enfileirar na Central de Mensagens com proteção de horário e anti-ban"
        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        @click="enqueueInHub"
      >
        <i v-if="enqueuing" class="fa-solid fa-spinner fa-spin"></i>
        <i v-else class="fa-solid fa-paper-plane"></i>
        <span>{{ enqueuing ? 'Enfileirando...' : 'Enfileirar no Hub' }}</span>
      </button>

      <!-- Action: Já Enfileirado no Hub (Informativo / Link Direto) -->
      <button
        v-else
        type="button"
        title="Abrir Central de Mensagens"
        class="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
        @click="goToMessageHub"
      >
        <i class="fa-solid fa-check text-emerald-500"></i>
        <span>{{ activeDispatch?.status === 'SENT' ? 'Enviado no Hub' : 'Na Fila do Hub' }}</span>
      </button>

      <button 
        type="button" 
        :disabled="saving || !isValid" 
        :title="!isValid ? 'Selecione o profissional para salvar' : ''"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
        @click="save"
      >
        <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
        {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { updateReminder } from '../../services/reminderService';
import { professionalService } from '../../services/professionalService';
import { dispatchMessageService } from '../../services/dispatchMessageService';
import { messageTemplateService } from '../../services/messageTemplateService';
import BaseModal from '../common/BaseModal.vue';
import { authService } from '../../services/authService';
import { enumService } from '../../services/enumService';
import { toastBridge } from '../../services/toastBridge';

const props = defineProps({
    reminder: { type: Object, required: true },
    zIndex: { type: Number, default: 10000 }
});

const emit = defineEmits(['close', 'save', 'open-client']);
const router = useRouter();

const saving = ref(false);
const enqueuing = ref(false);
const professionals = ref([]);
const templates = ref([]);
const selectedTemplateId = ref('');
const activeDispatch = ref(null);

const form = ref({
    status: props.reminder.status || 'NEW',
    contactDate: props.reminder.contactDate || new Date().toISOString().split('T')[0],
    contactResponsibleId: props.reminder.contactResponsible?.id || null,
    notes: props.reminder.notes || '',
    message: props.reminder.message || ''
});

const originType = computed(() => {
    if (props.reminder.type === 'CHURN') return 'CHURN';
    if (props.reminder.type === 'FOLLOW_UP') return 'FOLLOW_UP';
    return 'REBOOKING';
});

const isQueuedOrSent = computed(() => {
    if (!activeDispatch.value) return false;
    return ['PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENT'].includes(activeDispatch.value.status);
});

const dispatchBannerClass = computed(() => {
    const status = activeDispatch.value?.status;
    if (status === 'SENT') {
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
    }
    if (status === 'SCHEDULED' || status === 'APPROVED') {
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
    return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
});

const dispatchBannerIcon = computed(() => {
    const status = activeDispatch.value?.status;
    if (status === 'SENT') return 'fa-solid fa-circle-check text-emerald-500';
    if (status === 'SCHEDULED') return 'fa-solid fa-calendar-check text-blue-500';
    if (status === 'APPROVED') return 'fa-solid fa-check text-blue-500';
    return 'fa-solid fa-clock text-amber-500';
});

const dispatchBannerTitle = computed(() => {
    const status = activeDispatch.value?.status;
    if (status === 'SENT') return 'Mensagem enviada com sucesso pelo Hub';
    if (status === 'SCHEDULED') return 'Envio agendado na fila do Hub';
    if (status === 'APPROVED') return 'Mensagem aprovada no Hub';
    return 'Mensagem aguardando aprovação no Hub';
});

const dispatchBannerSubtitle = computed(() => {
    const d = activeDispatch.value;
    if (!d) return '';
    if (d.status === 'SENT' && d.sentAt) {
        return `Disparada em ${new Date(d.sentAt).toLocaleString('pt-BR')}`;
    }
    if (d.scheduledAt) {
        return `Horário previsto: ${new Date(d.scheduledAt).toLocaleString('pt-BR')}`;
    }
    return 'Aguardando liberação na Central de Mensagens';
});

const currentStatusLabel = computed(() => {
    const option = statusOptions.value.find(opt => opt.name === form.value.status);
    return option ? option.description : form.value.status;
});

const isProfessionalRequired = computed(() => ['NOTIFIED', 'SCHEDULED', 'CONVERTED', 'DECLINED'].includes(form.value.status));
const isValid = computed(() => {
    if (isProfessionalRequired.value && !form.value.contactResponsibleId) {
        return false;
    }
    return true;
});

const statusOptions = ref([]);

const filteredStatusOptions = computed(() => {
    if (props.reminder.type === 'FOLLOW_UP') {
        return statusOptions.value.filter(opt => opt.name !== 'SCHEDULED' && opt.name !== 'CONVERTED');
    }
    return statusOptions.value;
});

const loadStatusOptions = async () => {
    statusOptions.value = await enumService.getOptions('ReminderStatus');
};

watch(() => form.value.status, (newStatus) => {
    if (newStatus === 'NOTIFIED') {
        form.value.contactDate = new Date().toISOString().split('T')[0];
    }
});

const loadProfessionals = async () => {
    try {
        const resp = await professionalService.getAll({ page: 0, size: 100 });
        professionals.value = resp.data?.content || resp.data || [];
    } catch(e) { console.error(e); }
};

const loadTemplates = async () => {
    try {
        const data = await messageTemplateService.getAll({
            origin: originType.value,
            channel: 'WHATSAPP',
            active: true
        });
        templates.value = data || [];
    } catch(e) {
        console.error('Erro ao carregar templates do Hub', e);
    }
};

const checkActiveDispatch = async () => {
    if (!props.reminder.id) return;
    try {
        const history = await dispatchMessageService.getHistoryByOrigin(originType.value, props.reminder.id);
        if (history && history.length > 0) {
            const active = history.find(m => ['PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'SENT'].includes(m.status));
            activeDispatch.value = active || history[0];
        } else {
            activeDispatch.value = null;
        }
    } catch(e) {
        console.error('Erro ao checar status de disparo no Hub', e);
    }
};

const copyMessage = () => {
    navigator.clipboard.writeText(form.value.message);
    toastBridge.info('Copiado', 'Mensagem copiada para a área de transferência.');
};

const goToMessageHub = () => {
    emit('close');
    const msg = activeDispatch.value;
    const msgId = msg?.id;
    const origin = msg?.originType || originType.value;
    const isSent = msg?.status === 'SENT';
    const targetTab = isSent ? 'history' : 'pending';

    router.push({
        path: '/messages',
        query: {
            messageId: msgId ? String(msgId) : undefined,
            origin: origin || undefined,
            tab: targetTab,
            reminderId: props.reminder.id ? String(props.reminder.id) : undefined
        }
    });
};

const interpolateTemplate = (content) => {
    if (!content) return '';
    const fullName = props.reminder.client?.name || '';
    const firstName = fullName.trim().split(' ')[0] || '';
    const formattedFirstName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() : '';
    const serviceName = props.reminder.service?.name || 'procedimento';
    const days = props.reminder.type === 'FOLLOW_UP' 
        ? (props.reminder.service?.followUpDays || 7) 
        : (props.reminder.service?.idealReturnDays || 30);
    const linkAvaliacao = 'https://g.page/r/CW-rcCV825eOEBM/review';

    let satisfaction = 'satisfeito(a)';
    const gender = props.reminder.client?.personalData?.gender;
    if (gender === 'FEMALE') satisfaction = 'satisfeita';
    else if (gender === 'MALE') satisfaction = 'satisfeito';

    return content
        .replaceAll('{nome}', formattedFirstName)
        .replaceAll('{servico}', serviceName)
        .replaceAll('{dias}', String(days))
        .replaceAll('{satisfacao}', satisfaction)
        .replaceAll('{link_avaliacao}', linkAvaliacao);
};

const onTemplateChange = () => {
    if (!selectedTemplateId.value) return;
    const selected = templates.value.find(t => t.id === selectedTemplateId.value);
    if (selected && selected.content) {
        form.value.message = interpolateTemplate(selected.content);
    }
};

const enqueueInHub = async () => {
    enqueuing.value = true;
    try {
        const resp = await dispatchMessageService.enqueueFromReminder(props.reminder.id, {
            customMessageText: form.value.message
        });
        activeDispatch.value = resp.dispatchMessage || resp;
        if (resp.alreadyQueued) {
            toastBridge.info('Já Enfileirado', 'Este lembrete já estava enfileirado na Central de Mensagens.');
        } else {
            toastBridge.success('Enfileirado!', 'Mensagem enviada para moderação na Central de Mensagens.');
        }
    } catch(e) {
        console.error('Erro ao enfileirar no Hub', e);
        const errorMsg = e.response?.data?.message || 'Erro ao enfileirar lembrete no Hub.';
        toastBridge.error('Erro', errorMsg);
    } finally {
        enqueuing.value = false;
    }
};

const save = async () => {
    saving.value = true;
    try {
        await updateReminder(props.reminder.id, form.value);
        const selectedProf = professionals.value.find(p => p.id === form.value.contactResponsibleId);
        emit('save', { 
            ...props.reminder, 
            ...form.value,
            contactResponsibleName: selectedProf?.name 
        });
    } catch(e) {
        console.error(e);
        toastBridge.error('Erro', 'Erro ao salvar alterações do lembrete.');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadProfessionals();
    loadStatusOptions();
    loadTemplates();
    checkActiveDispatch();

    if (!form.value.contactResponsibleId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser.professionalId) {
            form.value.contactResponsibleId = currentUser.professionalId;
        }
    }
});
</script>
