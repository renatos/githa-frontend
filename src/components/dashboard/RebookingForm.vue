<template>
  <BaseModal
    :show="true"
    title="Detalhes do Rebooking"
    :subtitle="reminder.type === 'CHURN' ? 'Protocolo de Recuperação de Abandono' : 'Protocolo de Retorno Inteligente'"
    :icon="reminder.type === 'CHURN' ? 'fa-solid fa-heart-pulse' : 'fa-solid fa-arrows-rotate'"
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

      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cliente</label>
              <div 
                class="text-sm text-gray-900 dark:text-white font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                title="Ver detalhes do cliente"
                @click="$emit('open-client', reminder.client)"
              >
                {{ reminder.client?.name }}
              </div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <a :href="whatsappUrl" target="_blank" class="hover:text-emerald-500 transition-colors flex items-center gap-1" title="Enviar WhatsApp">
                    <i class="fa-brands fa-whatsapp text-emerald-500"></i> {{ reminder.client?.phone || 'Sem telefone' }}
                  </a>
              </div>
          </div>
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Serviço</label>
              <div class="text-sm text-gray-900 dark:text-white font-medium">{{ reminder.service?.name }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Ciclo: {{ reminder.service?.idealReturnDays }} dias 
                  <span v-if="reminder.lastAppointmentDate" class="ml-2" title="Data do último atendimento">
                    | Último: {{ new Date(reminder.lastAppointmentDate).toLocaleDateString('pt-BR') }}
                  </span>
              </div>
          </div>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
              <span>Mensagem Sugerida</span>
              <button class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1 transition-colors font-medium" @click="copyMessage">
                  <i class="fa-solid fa-copy"></i> Copiar
              </button>
          </label>
          <textarea v-model="form.message" rows="4" class="w-full text-sm border-gray-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-gray-300 rounded-lg shadow-inner focus:border-blue-500 focus:ring-blue-500 p-4 leading-relaxed transition-colors border resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select v-model="form.status" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2">
                  <option v-for="opt in statusOptions" :key="opt.name" :value="opt.name">{{ opt.description }}</option>
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
      <BaseWhatsAppButton
        :href="whatsappUrl"
        label="Enviar Mensagem"
      />
      <button 
        type="button" 
        :disabled="saving || !isValid" 
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
        @click="save"
        :title="!isValid ? 'Selecione o profissional para salvar' : ''"
      >
        <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
        {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { updateRebookingReminder } from '../../services/rebookingService';
import { professionalService } from '../../services/professionalService';
import BaseModal from '../common/BaseModal.vue';
import BaseWhatsAppButton from '../common/BaseWhatsAppButton.vue';
import { authService } from '../../services/authService';
import { enumService } from '../../services/enumService';
import { getWhatsappLink } from '../../utils/whatsappHelper';

const props = defineProps({
    reminder: { type: Object, required: true },
    zIndex: { type: Number, default: 10000 }
});

const emit = defineEmits(['close', 'save', 'open-client']);

const saving = ref(false);
const professionals = ref([]);

const form = ref({
    status: props.reminder.status || 'NEW',
    contactDate: props.reminder.contactDate || null,
    contactResponsibleId: props.reminder.contactResponsible?.id || null,
    notes: props.reminder.notes || '',
    message: props.reminder.message || ''
});

const currentStatusLabel = computed(() => {
    const option = statusOptions.value.find(opt => opt.name === form.value.status);
    return option ? option.description : form.value.status;
});

const isProfessionalRequired = computed(() => ['NOTIFIED', 'SCHEDULED', 'DECLINED'].includes(form.value.status));
const isValid = computed(() => {
    if (isProfessionalRequired.value && !form.value.contactResponsibleId) {
        return false;
    }
    return true;
});

const statusOptions = ref([]);

const loadStatusOptions = async () => {
    statusOptions.value = await enumService.getOptions('RebookingStatus');
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

const copyMessage = () => {
    navigator.clipboard.writeText(form.value.message);
};

const whatsappUrl = computed(() => {
    return getWhatsappLink(props.reminder.client?.phone, form.value.message);
});

const save = async () => {
    saving.value = true;
    try {
        await updateRebookingReminder(props.reminder.id, form.value);
        const selectedProf = professionals.value.find(p => p.id === form.value.contactResponsibleId);
        emit('save', { 
            ...props.reminder, 
            ...form.value,
            contactResponsibleName: selectedProf?.name 
        });
    } catch(e) {
        console.error(e);
        alert('Erro ao salvar.');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    loadProfessionals();
    loadStatusOptions();

    if (!form.value.contactResponsibleId) {
        const currentUser = authService.getCurrentUser();
        if (currentUser.professionalId) {
            form.value.contactResponsibleId = currentUser.professionalId;
        }
    }
});
</script>

