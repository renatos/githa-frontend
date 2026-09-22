<template>
  <div class="lead-list-view p-4 md:p-6 flex flex-col gap-6">
    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Gestão de Leads</h2>
          <AiContextBadge context="LEADS" context-name="Leads" />
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">
          Acompanhe os contatos recebidos via WhatsApp e redes sociais, histórico de mensagens e conversão em clientes.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          class="inline-flex items-center justify-center px-3.5 py-2 border border-slate-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          @click="showBulkProcessList = true"
        >
          <span class="material-symbols-outlined text-[18px] mr-1.5 text-slate-500">history</span>
          Processos em Massa
        </button>

        <button
          type="button"
          class="inline-flex items-center justify-center px-3.5 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          @click="openBulkNotifyWizard()"
        >
          <span class="material-symbols-outlined text-[18px] mr-1.5">campaign</span>
          Notificação em Massa
        </button>

        <button
          type="button"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          @click="openNewLeadForm"
        >
          <span class="material-symbols-outlined text-[18px] mr-1.5">person_add</span>
          Novo Lead
        </button>
      </div>
    </header>

    <!-- Status Filters Bar -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="st in statusOptions"
        :key="st.value"
        type="button"
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors"
        :class="selectedStatus === st.value
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
          : 'border-slate-300 bg-white text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'"
        @click="setStatusFilter(st.value)"
      >
        <span v-if="st.dotColor" class="w-2 h-2 rounded-full mr-2" :class="st.dotColor"></span>
        {{ st.label }}
      </button>
    </div>

    <!-- Secondary Filters Bar -->
    <div class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
      <!-- Search Inferred Service -->
      <div>
        <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Procedimento Procurado</label>
        <input
          v-model="filters.inferredService"
          type="text"
          placeholder="Ex: Limpeza de pele..."
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          @input="debounceRefresh"
        />
      </div>

      <!-- Source Filter -->
      <div>
        <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Origem</label>
        <select
          v-model="filters.source"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          @change="refreshTable"
        >
          <option value="">Todas as origens</option>
          <option value="GOOGLE">Google</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="MANUAL">Manual</option>
          <option value="WHATSAPP_INCOMING">WhatsApp Recebido</option>
        </select>
      </div>

      <!-- Opt-Out Filter -->
      <div>
        <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Não Perturbe (Opt-Out)</label>
        <select
          v-model="filters.optOut"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100"
          @change="refreshTable"
        >
          <option value="">Todos</option>
          <option value="false">Apenas Ativos (Recebem mensagens)</option>
          <option value="true">Apenas Opt-Out (Não Perturbe)</option>
        </select>
      </div>

      <!-- Reset Filters Button -->
      <div class="flex items-end">
        <button
          type="button"
          class="w-full inline-flex items-center justify-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="resetFilters"
        >
          <span class="material-symbols-outlined text-[16px] mr-1">clear_all</span>
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Generic Table -->
    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchLeadsData"
      :initial-sort-key="'createdAt'"
      :initial-sort-order="'desc'"
      @row-click="openEditLeadForm"
    >
      <!-- Custom Cell: Name -->
      <template #cell-name="{ item }">
        <div>
          <div class="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            {{ item.name || 'Sem Nome' }}
            <span v-if="item.profileName && item.profileName !== item.name" class="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-normal">
              ~{{ item.profileName }}
            </span>
          </div>
          <div class="text-xs text-slate-400">{{ formatPhone(item.phone) || '-' }}</div>
        </div>
      </template>

      <!-- Custom Cell: Source -->
      <template #cell-source="{ value }">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          :class="sourceBadgeClass(value)"
        >
          <i :class="sourceIconClass(value)"></i>
          {{ sourceLabel(value) }}
        </span>
      </template>

      <!-- Custom Cell: Inferred Service -->
      <template #cell-inferredService="{ value }">
        <span v-if="value" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium">
          {{ value }}
        </span>
        <span v-else class="text-slate-400">-</span>
      </template>

      <!-- Custom Cell: Message Count -->
      <template #cell-messageCount="{ item }">
        <span class="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <i class="fa-regular fa-comment-dots text-slate-400"></i>
          {{ item.conversationHistory?.length || 0 }}
        </span>
      </template>

      <!-- Custom Cell: Status -->
      <template #cell-status="{ item }">
        <span
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
          :class="statusBadgeClass(item.status)"
        >
          <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(item.status)"></span>
          {{ item.statusDescription || statusLabelText(item.status) }}
        </span>
      </template>

      <!-- Custom Cell: Created At -->
      <template #cell-createdAt="{ value }">
        <span class="text-xs text-slate-500">{{ formatDateTime(value) }}</span>
      </template>

      <!-- Actions Column -->
      <template #actions="{ item }">
        <div class="flex items-center justify-end gap-1.5" @click.stop>
          <!-- WhatsApp direct button -->
          <BaseWhatsAppButton
            v-if="item.phone"
            :href="getWhatsAppLink(item.phone)"
            size="xs"
            variant="ghost"
            title="Abrir WhatsApp"
          />

          <!-- Convert to Client -->
          <button
            v-if="item.status !== 'CONVERTED'"
            type="button"
            class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title="Converter em Cliente"
            @click.stop="startConversion(item)"
          >
            <span class="material-symbols-outlined text-[18px]">person_add</span>
          </button>

          <!-- Edit / View Lead -->
          <button
            type="button"
            class="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Ver / Editar Lead"
            @click.stop="openEditLeadForm(item)"
          >
            <span class="material-symbols-outlined text-[18px]">edit</span>
          </button>
        </div>
      </template>
    </GenericTable>

    <!-- Lead Form Modal (Create / Details) -->
    <LeadForm
      v-if="showLeadForm"
      :lead="editingLead"
      @close="closeLeadForm"
      @saved="onLeadSaved"
      @convert="startConversion"
    />

    <!-- Client Form Modal for Conversion -->
    <ClientForm
      v-if="showClientForm"
      :client="convertingClientData"
      @close="closeClientForm"
      @save="onClientSaveForConversion"
    />

    <!-- Bulk Notify Wizard Modal -->
    <LeadBulkNotifyWizard
      v-if="showBulkWizard"
      :initial-data="wizardInitialData"
      @close="showBulkWizard = false"
      @completed="onBulkProcessCreated"
    />

    <!-- Bulk Process List Modal -->
    <LeadBulkProcessList
      v-if="showBulkProcessList"
      @close="showBulkProcessList = false"
      @new-bulk="openBulkNotifyWizard()"
      @clone="cloneProcessToWizard"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GenericTable from '@/components/common/GenericTable.vue';
import AiContextBadge from '@/components/common/AiContextBadge.vue';
import BaseWhatsAppButton from '@/components/common/BaseWhatsAppButton.vue';
import LeadForm from '@/components/LeadForm.vue';
import ClientForm from '@/components/ClientForm.vue';
import LeadBulkNotifyWizard from '@/components/lead/LeadBulkNotifyWizard.vue';
import LeadBulkProcessList from '@/components/lead/LeadBulkProcessList.vue';
import { leadService } from '@/services/leadService';
import { clientService } from '@/services/clientService';
import { toastBridge } from '@/services/toastBridge';

const tableRef = ref(null);

// Modal states
const showLeadForm = ref(false);
const editingLead = ref(null);

const showClientForm = ref(false);
const convertingLeadId = ref(null);
const convertingClientData = ref({});

const showBulkWizard = ref(false);
const wizardInitialData = ref(null);

const showBulkProcessList = ref(false);

// Filter states
const selectedStatus = ref('');
const filters = ref({
  inferredService: '',
  source: '',
  optOut: ''
});

let debounceTimer = null;

const statusOptions = [
  { label: 'Todos os Status', value: '', dotColor: null },
  { label: 'Novo', value: 'NEW', dotColor: 'bg-blue-500' },
  { label: 'Em Conversa', value: 'IN_CONVERSATION', dotColor: 'bg-amber-500' },
  { label: 'Agendamento Ofertado', value: 'APPOINTMENT_OFFERED', dotColor: 'bg-purple-500' },
  { label: 'Convertido', value: 'CONVERTED', dotColor: 'bg-emerald-500' },
  { label: 'Descartado', value: 'DISCARDED', dotColor: 'bg-slate-400' }
];

const columns = [
  { key: 'name', label: 'Contato / Nome', sortable: true, filterable: true },
  { key: 'source', label: 'Origem', sortable: true, width: '130px' },
  { key: 'inferredService', label: 'Procedimento', sortable: true },
  { key: 'messageCount', label: 'Msgs', align: 'center', width: '70px', sortable: false },
  { key: 'status', label: 'Status', align: 'center', width: '140px', sortable: true },
  { key: 'createdAt', label: 'Data de Entrada', sortable: true, width: '140px' }
];

const fetchLeadsData = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };

  if (selectedStatus.value) {
    query.status = selectedStatus.value;
  }
  if (filters.value.source) {
    query.source = filters.value.source;
  }
  if (filters.value.inferredService) {
    query.inferredService = filters.value.inferredService;
  }
  if (filters.value.optOut !== '') {
    query.optOut = filters.value.optOut === 'true';
  }

  // Clean empty query properties
  Object.keys(query).forEach(key => (query[key] === null || query[key] === undefined || query[key] === '') && delete query[key]);

  const res = await leadService.getAll(query);
  return res.data;
};

const refreshTable = () => {
  tableRef.value?.loadData();
};

const debounceRefresh = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    refreshTable();
  }, 350);
};

const setStatusFilter = (val) => {
  selectedStatus.value = val;
  refreshTable();
};

const resetFilters = () => {
  selectedStatus.value = '';
  filters.value = {
    inferredService: '',
    source: '',
    optOut: ''
  };
  refreshTable();
};

// Lead Form
const openNewLeadForm = () => {
  editingLead.value = null;
  showLeadForm.value = true;
};

const openEditLeadForm = (lead) => {
  editingLead.value = { ...lead };
  showLeadForm.value = true;
};

const closeLeadForm = () => {
  showLeadForm.value = false;
  editingLead.value = null;
};

const onLeadSaved = () => {
  refreshTable();
  closeLeadForm();
};

// Conversion Flow (Task 5.4)
const startConversion = (lead) => {
  closeLeadForm();
  convertingLeadId.value = lead.id;
  convertingClientData.value = {
    name: lead.name || '',
    phone: lead.phone || '',
    originLeadId: lead.id
  };
  showClientForm.value = true;
};

const closeClientForm = () => {
  showClientForm.value = false;
  convertingLeadId.value = null;
  convertingClientData.value = {};
};

const onClientSaveForConversion = async (clientPayload) => {
  try {
    // 1. Create client
    const savedClientRes = await clientService.create(clientPayload);
    const newClientId = savedClientRes.data?.id || savedClientRes.data;

    // 2. Link lead to newly created client
    if (convertingLeadId.value && newClientId) {
      await leadService.convert(convertingLeadId.value, newClientId);
    }

    toastBridge.getToast().add({
      severity: 'success',
      summary: 'Conversão Realizada',
      detail: 'Lead convertido em cliente com sucesso!',
      life: 4000
    });

    closeClientForm();
    refreshTable();
  } catch (err) {
    console.error('Conversion error:', err);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro na Conversão',
      detail: err.response?.data?.message || 'Falha ao converter lead em cliente.',
      life: 4000
    });
  }
};

// Bulk Wizard
const openBulkNotifyWizard = (data = null) => {
  wizardInitialData.value = data;
  showBulkWizard.value = true;
};

const cloneProcessToWizard = (process) => {
  showBulkProcessList.value = false;
  openBulkNotifyWizard({
    criteria: process.searchCriteria,
    message: process.message
  });
};

const onBulkProcessCreated = () => {
  refreshTable();
};

// Utilities & Badges
const getWhatsAppLink = (phone) => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const fullPhone = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${fullPhone}`;
};

const sourceBadgeClass = (source) => {
  switch (source) {
    case 'GOOGLE':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    case 'INSTAGRAM':
      return 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800';
    case 'FACEBOOK':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
    case 'WHATSAPP_INCOMING':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'MANUAL':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  }
};

const sourceIconClass = (source) => {
  switch (source) {
    case 'GOOGLE': return 'fa-brands fa-google';
    case 'INSTAGRAM': return 'fa-brands fa-instagram';
    case 'FACEBOOK': return 'fa-brands fa-facebook';
    case 'WHATSAPP_INCOMING': return 'fa-brands fa-whatsapp';
    case 'MANUAL': return 'fa-solid fa-keyboard';
    default: return 'fa-solid fa-share-nodes';
  }
};

const sourceLabel = (source) => {
  switch (source) {
    case 'GOOGLE': return 'Google';
    case 'INSTAGRAM': return 'Instagram';
    case 'FACEBOOK': return 'Facebook';
    case 'WHATSAPP_INCOMING': return 'WhatsApp';
    case 'MANUAL': return 'Manual';
    default: return source || '-';
  }
};

const statusBadgeClass = (status) => {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    case 'IN_CONVERSATION':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    case 'APPOINTMENT_OFFERED':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    case 'CONVERTED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'DISCARDED':
      return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  }
};

const statusDotClass = (status) => {
  switch (status) {
    case 'NEW': return 'bg-blue-500';
    case 'IN_CONVERSATION': return 'bg-amber-500';
    case 'APPOINTMENT_OFFERED': return 'bg-purple-500';
    case 'CONVERTED': return 'bg-emerald-500';
    case 'DISCARDED': return 'bg-slate-400';
    default: return 'bg-slate-400';
  }
};

const statusLabelText = (status) => {
  switch (status) {
    case 'NEW': return 'Novo';
    case 'IN_CONVERSATION': return 'Em Conversa';
    case 'APPOINTMENT_OFFERED': return 'Agendamento';
    case 'CONVERTED': return 'Convertido';
    case 'DISCARDED': return 'Descartado';
    default: return status || '-';
  }
};

const formatPhone = (phone) => {
  if (!phone) return '-';
  let cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return '-';
  try {
    return new Date(isoStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoStr;
  }
};
</script>
