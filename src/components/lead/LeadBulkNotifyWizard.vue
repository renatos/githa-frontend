<template>
  <BaseModal
    :show="true"
    title="Disparo de Notificações em Massa"
    max-width="max-w-4xl"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <template #sub-header>
      <!-- Step Indicator -->
      <div class="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-6 w-full max-w-2xl mx-auto">
          <!-- Step 1 -->
          <div class="flex items-center gap-2 flex-1">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              :class="step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              1
            </div>
            <span class="text-xs font-medium" :class="step >= 1 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'">
              Critérios
            </span>
            <div class="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mx-2">
              <div class="h-full bg-indigo-600 transition-all" :style="{ width: step > 1 ? '100%' : '0%' }"></div>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="flex items-center gap-2 flex-1">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              :class="step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              2
            </div>
            <span class="text-xs font-medium" :class="step >= 2 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'">
              Leads
            </span>
            <div class="h-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mx-2">
              <div class="h-full bg-indigo-600 transition-all" :style="{ width: step > 2 ? '100%' : '0%' }"></div>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
              :class="step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              3
            </div>
            <span class="text-xs font-medium" :class="step >= 3 ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-500'">
              Mensagem
            </span>
          </div>
        </div>
      </div>
    </template>

    <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
      <!-- Step 1: Select Criteria -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Como você deseja filtrar os leads?</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Selecione o critério para buscar os contatos no funil. Leads que solicitaram <strong>Não Perturbe (Opt-Out)</strong> ou que já foram <strong>Convertidos em Clientes</strong> são automaticamente excluídos.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Option 1: By Service -->
          <div
            class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2"
            :class="criteriaType === 'SERVICE' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
            @click="criteriaType = 'SERVICE'"
          >
            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">spa</span>
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">Por Procedimento</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Filtre leads que demonstraram interesse em um procedimento específico</span>
          </div>

          <!-- Option 2: By Month -->
          <div
            class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2"
            :class="criteriaType === 'MONTH' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
            @click="criteriaType = 'MONTH'"
          >
            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">calendar_month</span>
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">Por Mês de Entrada</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Filtre leads capturados ou criados em um determinado mês</span>
          </div>

          <!-- Option 3: All Available -->
          <div
            class="p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2"
            :class="criteriaType === 'ALL' ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'"
            @click="criteriaType = 'ALL'"
          >
            <span class="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-3xl">group</span>
            <span class="text-sm font-bold text-slate-900 dark:text-slate-100">Todos os Leads Ativos</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">Buscar todos os leads não convertidos e sem opt-out</span>
          </div>
        </div>

        <!-- Filter Details Input -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <!-- By Service Selection -->
          <div v-if="criteriaType === 'SERVICE'" class="space-y-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Selecione o Procedimento / Serviço Procurado</label>
            <select
              v-model="selectedService"
              class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            >
              <option value="">Selecione um serviço...</option>
              <option v-for="srv in availableServices" :key="srv.id" :value="srv.name ? srv.name.trim() : ''">
                {{ srv.name ? srv.name.trim() : '' }}
              </option>
            </select>
          </div>

          <!-- By Month Selection -->
          <div v-if="criteriaType === 'MONTH'" class="space-y-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Mês de Entrada</label>
            <input
              v-model="selectedMonth"
              type="month"
              class="w-full sm:w-64 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <!-- Quick Source Filter Option (Optional refinement) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Origem específica (opcional)</label>
              <select
                v-model="selectedSource"
                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="">Todas as origens</option>
                <option value="GOOGLE">Google</option>
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="MANUAL">Manual</option>
                <option value="WHATSAPP_INCOMING">WhatsApp Recebido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Review and Select Leads -->
      <div v-if="step === 2" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Leads Encontrados</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Revise a lista de destinatários. Desmarque qualquer lead que não deseje incluir neste disparo.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
              {{ selectedLeadIds.length }} de {{ matchingLeads.length }} selecionados
            </span>
          </div>
        </div>

        <div v-if="loadingLeads" class="py-12 text-center text-slate-500">
          <i class="fa-solid fa-circle-notch fa-spin text-2xl text-indigo-600 mb-2"></i>
          <p class="text-sm">Buscando leads elegíveis...</p>
        </div>

        <div v-else-if="matchingLeads.length === 0" class="py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">group_off</span>
          <p class="text-sm font-medium text-slate-700 dark:text-slate-300">Nenhum lead elegível encontrado para os critérios selecionados.</p>
          <p class="text-xs text-slate-500 mt-1">Lembre-se que leads convertidos ou com opt-out não são incluídos.</p>
        </div>

        <div v-else class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <label class="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                :checked="allSelected"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                @change="toggleSelectAll"
              />
              <span>Selecionar Todos ({{ matchingLeads.length }})</span>
            </label>
            <span class="text-slate-500">Apenas leads ativos e sem opt-out</span>
          </div>

          <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            <div
              v-for="lead in matchingLeads"
              :key="lead.id"
              class="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between gap-3 text-xs"
              @click="toggleLeadSelection(lead.id)"
            >
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  :checked="selectedLeadIds.includes(lead.id)"
                  class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  @click.stop
                  @change="toggleLeadSelection(lead.id)"
                />
                <div>
                  <div class="font-semibold text-slate-900 dark:text-slate-100">{{ lead.name || 'Sem Nome' }}</div>
                  <div class="text-slate-500 dark:text-slate-400">{{ formatPhone(lead.phone) }}</div>
                </div>
              </div>

              <div class="text-right flex flex-col items-end gap-1">
                <span v-if="lead.inferredService" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium">
                  {{ lead.inferredService }}
                </span>
                <span class="text-[11px] text-slate-400">{{ formatDate(lead.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Compose Message -->
      <div v-if="step === 3" class="space-y-6">
        <div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">Composição da Mensagem</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Personalize o texto utilizando as variáveis dinâmicas. O sistema substituirá automaticamente os valores para cada lead.
          </p>
        </div>

        <!-- Dynamic Tag Insertion Chips -->
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Inserir variáveis dinâmicas:</label>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              @click="insertTag('{nome}')"
            >
              <i class="fa-solid fa-plus text-[10px]"></i>
              <span class="font-bold">{nome}</span> (Nome do lead)
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
              @click="insertTag('{servico}')"
            >
              <i class="fa-solid fa-plus text-[10px]"></i>
              <span class="font-bold">{servico}</span> (Procedimento procurado)
            </button>
          </div>
        </div>

        <!-- Textarea -->
        <div>
          <textarea
            ref="messageTextareaRef"
            v-model="messageTemplate"
            rows="5"
            placeholder="Olá {nome}, tudo bem? Temos uma novidade sobre {servico} para você!"
            class="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-sans"
          ></textarea>
          <div class="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>{{ messageTemplate.length }} caracteres</span>
            <span>Tags disponíveis: {nome}, {servico}</span>
          </div>
        </div>

        <!-- Live Preview Card -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span class="material-symbols-outlined text-[16px] text-emerald-600">visibility</span>
            Prévia da mensagem simulada:
          </div>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
            {{ previewMessage }}
          </div>
        </div>

        <!-- Anti-ban Alert Info -->
        <div class="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
          <span class="material-symbols-outlined text-blue-600 text-xl shrink-0">shield</span>
          <div>
            <div class="font-bold mb-0.5">Proteção Anti-Bloqueio Automática</div>
            <p>
              Os <strong>{{ selectedLeadIds.length }}</strong> disparos serão distribuídos aleatoriamente ao longo da janela de tempo configurada no sistema (padrão de 3 horas). O agendador processará cada envio gradativamente para evitar bloqueios no WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Buttons -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <button
          type="button"
          class="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="step > 1 ? step-- : $emit('close')"
        >
          {{ step > 1 ? 'Voltar' : 'Cancelar' }}
        </button>

        <div class="flex items-center gap-3">
          <button
            v-if="step === 1"
            type="button"
            class="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            :disabled="criteriaType === 'SERVICE' && !selectedService"
            @click="goToStep2"
          >
            Avançar para Leads
          </button>

          <button
            v-if="step === 2"
            type="button"
            class="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            :disabled="selectedLeadIds.length === 0"
            @click="step = 3"
          >
            Avançar para Mensagem ({{ selectedLeadIds.length }})
          </button>

          <button
            v-if="step === 3"
            type="button"
            class="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            :disabled="submitting || !messageTemplate.trim() || selectedLeadIds.length === 0"
            @click="submitBulkNotification"
          >
            <i v-if="submitting" class="fa-solid fa-circle-notch fa-spin"></i>
            <span class="material-symbols-outlined text-[18px]">send</span>
            Iniciar Disparos ({{ selectedLeadIds.length }})
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import { leadService } from '../../services/leadService';
import { serviceService } from '../../services/serviceService';
import { toastBridge } from '../../services/toastBridge';

const props = defineProps({
  initialData: {
    type: Object,
    default: null
  },
  zIndex: {
    type: Number,
    default: 10000
  }
});

const emit = defineEmits(['close', 'completed']);

const step = ref(1);
const criteriaType = ref('ALL');
const selectedService = ref('');
const selectedMonth = ref(new Date().toISOString().substring(0, 7)); // YYYY-MM
const selectedSource = ref('');
const availableServices = ref([]);

const matchingLeads = ref([]);
const selectedLeadIds = ref([]);
const loadingLeads = ref(false);

const messageTemplate = ref('');
const messageTextareaRef = ref(null);
const submitting = ref(false);

const allSelected = computed(() => {
  return matchingLeads.value.length > 0 && selectedLeadIds.value.length === matchingLeads.value.length;
});

const previewMessage = computed(() => {
  if (!messageTemplate.value.trim()) {
    return 'Digite a mensagem acima para visualizar a prévia.';
  }
  const sampleName = matchingLeads.value.length > 0 ? (matchingLeads.value[0].name || 'Maria Silva') : 'Maria Silva';
  const sampleService = (matchingLeads.value.length > 0 && matchingLeads.value[0].inferredService) || selectedService.value || 'Limpeza de Pele';

  return messageTemplate.value
    .replace(/{nome}/g, sampleName)
    .replace(/{servico}/g, sampleService);
});

onMounted(async () => {
  try {
    const res = await serviceService.getAll({ page: 0, size: 100, active: true });
    availableServices.value = res.data?.content || res.data || [];
  } catch (err) {
    console.error('Failed to load services:', err);
  }

  // Pre-fill from clone if initialData is provided
  if (props.initialData) {
    if (props.initialData.message) {
      messageTemplate.value = props.initialData.message;
    }
    if (props.initialData.criteria) {
      const crit = props.initialData.criteria;
      if (crit.service) {
        criteriaType.value = 'SERVICE';
        selectedService.value = crit.service.trim();
      } else if (crit.createdMonth) {
        criteriaType.value = 'MONTH';
        selectedMonth.value = crit.createdMonth;
      }
      if (crit.source) {
        selectedSource.value = crit.source;
      }
    }
  }
});

const goToStep2 = async () => {
  step.value = 2;
  await fetchMatchingLeads();
};

const fetchMatchingLeads = async () => {
  loadingLeads.value = true;
  matchingLeads.value = [];
  selectedLeadIds.value = [];

  try {
    const params = {
      page: 0,
      size: 500, // retrieve large batch for wizard selection
      optOut: false
    };

    if (criteriaType.value === 'SERVICE' && selectedService.value) {
      params.inferredService = selectedService.value.trim();
    }
    if (selectedSource.value) {
      params.source = selectedSource.value;
    }

    const res = await leadService.getAll(params);
    const allLeads = res.data?.content || res.data || [];

    // Filter leads on client side for month or non-converted safety
    let filtered = allLeads.filter(l => l.status !== 'CONVERTED' && !l.optOut);

    if (criteriaType.value === 'MONTH' && selectedMonth.value) {
      filtered = filtered.filter(l => {
        if (!l.createdAt) return false;
        return l.createdAt.startsWith(selectedMonth.value);
      });
    }

    matchingLeads.value = filtered;
    selectedLeadIds.value = filtered.map(l => l.id);
  } catch (err) {
    console.error('Failed to load leads for bulk notify:', err);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar os leads com os critérios informados.',
      life: 3000
    });
  } finally {
    loadingLeads.value = false;
  }
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedLeadIds.value = [];
  } else {
    selectedLeadIds.value = matchingLeads.value.map(l => l.id);
  }
};

const toggleLeadSelection = (id) => {
  const idx = selectedLeadIds.value.indexOf(id);
  if (idx >= 0) {
    selectedLeadIds.value.splice(idx, 1);
  } else {
    selectedLeadIds.value.push(id);
  }
};

const insertTag = (tag) => {
  const textarea = messageTextareaRef.value;
  if (!textarea) {
    messageTemplate.value += tag;
    return;
  }

  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const currentText = messageTemplate.value;

  messageTemplate.value = currentText.substring(0, start) + tag + currentText.substring(end);

  // Restore focus and cursor position after tag
  setTimeout(() => {
    textarea.focus();
    const newPos = start + tag.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 50);
};

const formatPhone = (phone) => {
  if (!phone) return '-';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

const formatDate = (isoStr) => {
  if (!isoStr) return '';
  try {
    return new Date(isoStr).toLocaleDateString('pt-BR');
  } catch {
    return isoStr;
  }
};

const submitBulkNotification = async () => {
  if (!messageTemplate.value.trim() || selectedLeadIds.value.length === 0) return;

  submitting.value = true;
  try {
    const criteriaPayload = {
      type: criteriaType.value,
      service: selectedService.value || null,
      createdMonth: selectedMonth.value || null,
      source: selectedSource.value || null
    };

    const payload = {
      criteria: criteriaPayload,
      leadIds: selectedLeadIds.value,
      message: messageTemplate.value.trim()
    };

    const res = await leadService.bulkNotify(payload);

    toastBridge.getToast().add({
      severity: 'success',
      summary: 'Processo Criado',
      detail: `Processo em massa criado com sucesso! ${selectedLeadIds.value.length} notificações agendadas.`,
      life: 4000
    });

    emit('completed', res.data);
    emit('close');
  } catch (err) {
    console.error('Failed to start bulk notification:', err);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro no Disparo',
      detail: err.response?.data?.message || 'Falha ao iniciar notificação em massa.',
      life: 4000
    });
  } finally {
    submitting.value = false;
  }
};
</script>
