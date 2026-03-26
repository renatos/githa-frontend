<template>
  <BaseModal
    :show="true"
    title="Detalhes do Rebooking"
    subtitle="Protocolo de Retorno Inteligente"
    icon="fa-solid fa-arrows-rotate"
    @close="$emit('close')"
  >
    <div class="space-y-5 text-left">
      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Cliente</label>
              <div class="text-sm text-gray-900 dark:text-white font-medium">{{ reminder.client?.name }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <a :href="whatsappUrl" target="_blank" class="hover:text-emerald-500 transition-colors flex items-center gap-1" title="Enviar WhatsApp">
                    <i class="fa-brands fa-whatsapp text-emerald-500"></i> {{ reminder.client?.phone || 'Sem telefone' }}
                  </a>
              </div>
          </div>
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Serviço</label>
              <div class="text-sm text-gray-900 dark:text-white font-medium">{{ reminder.service?.name }}</div>
              <div class="text-xs text-gray-500 dark:text-slate-400 mt-1">Ciclo: {{ reminder.service?.idealReturnDays }} dias</div>
          </div>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
              <span>Mensagem Sugerida</span>
              <button @click="copyMessage" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-xs flex items-center gap-1 transition-colors font-medium">
                  <i class="fa-solid fa-copy"></i> Copiar
              </button>
          </label>
          <textarea v-model="form.message" rows="4" class="w-full text-sm border-gray-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-gray-300 rounded-lg shadow-inner focus:border-blue-500 focus:ring-blue-500 p-4 leading-relaxed transition-colors border resize-none"></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Status</label>
              <select v-model="form.status" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2">
                  <option value="NEW">Novo</option>
                  <option value="NOTIFIED">Notificado</option>
                  <option value="SCHEDULED">Agendado</option>
                  <option value="DECLINED">Recusado</option>
              </select>
          </div>
          <div>
              <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Data do Contato</label>
              <input type="date" v-model="form.contactDate" disabled class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-gray-400 rounded-md shadow-sm p-2 cursor-not-allowed" />
          </div>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Profissional Responsável</label>
          <select v-model="form.contactResponsibleId" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2">
              <option :value="null">Selecione o profissional</option>
              <option v-for="prof in professionals" :key="prof.id" :value="prof.id">{{ prof.name }}</option>
          </select>
      </div>

      <div>
          <label class="block text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Notas (Histórico)</label>
          <textarea v-model="form.notes" rows="3" class="w-full text-sm border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2" placeholder="Qual foi o desfecho do contato?..."></textarea>
      </div>
    </div>

    <template #footer>
      <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
        Cancelar
      </button>
      <a :href="whatsappUrl" target="_blank" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2">
        <i class="fa-brands fa-whatsapp"></i>
        Enviar Mensagem
      </a>
      <button type="button" @click="save" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
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

const props = defineProps({
    reminder: { type: Object, required: true }
});

const emit = defineEmits(['close', 'saved']);

const saving = ref(false);
const professionals = ref([]);

const form = ref({
    status: props.reminder.status || 'NEW',
    contactDate: props.reminder.contactDate || null,
    contactResponsibleId: props.reminder.contactResponsible?.id || null,
    notes: props.reminder.notes || '',
    message: props.reminder.message || ''
});

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
    const phone = props.reminder.client?.phone;
    if (!phone) return '#';
    
    // Remove non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(form.value.message || '');
    
    // If phone starts with 55, don't add it again. 
    // Usually in Brazil phones are stored without country code.
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    return `https://wa.me/${finalPhone}?text=${message}`;
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
});
</script>

