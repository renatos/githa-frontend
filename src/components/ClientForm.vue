<template>
  <BaseModal
    :show="true"
    title="Cliente"
    max-width="max-w-4xl"
    :body-padding="false"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="flex items-center gap-4 min-w-0">
        <span
class="material-symbols-outlined text-[24px] shrink-0"
              :class="form.personalData?.gender === 'FEMALE' ? 'text-pink-400' : form.personalData?.gender === 'MALE' ? 'text-blue-400' : 'text-slate-900 dark:text-slate-100'">person_edit</span>
        <div class="min-w-0">
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
            {{ form.id ? firstName : 'Novo Cliente' }}
          </h2>
          <div v-if="form.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span v-if="clientAge" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">cake</span>
              {{ clientAge }} anos
            </span>
            <span v-if="clientSince" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">calendar_month</span>
              Cliente desde {{ clientSince }}
            </span>
            <StatusBadge v-if="form.status" :status="form.status" :status-map="clientStatusMap" />
          </div>
        </div>
      </div>
    </template>

    <template #sub-header>
      <TabNavigation v-model="activeTab" :tabs="tabs" />
    </template>

    <form id="clientForm" class="flex flex-col h-full" @submit.prevent="save">
      <div class="p-6 flex-1 bg-transparent dark:bg-slate-900/50">

        <!-- Tab 0: Dados Gerais -->
        <div v-show="activeTab === 0" class="pb-32">
          <ClientGeneralTab
            :form="form"
            :client-service="clientService"
            :show-search-results="showSearchResults"
            :search-results="searchQueryResults"
            :max-date="maxDate"
            @name-input="onNameInput"
            @focus-name="() => { if(searchQueryResults.length > 0) showSearchResults = true; }"
            @blur-name="hideSearchResults"
            @select-client="selectExistingClient"
          />
        </div>

        <!-- Tab 1: Dados Pessoais -->
        <div v-show="activeTab === 1">
          <ClientPersonalTab
            :form="form"
            :genders="genders"
            :primary-objectives="primaryObjectives"
          />
        </div>

        <!-- Tab 2: Condições de Saúde -->
        <div v-show="activeTab === 2">
          <ClientHealthTab :form="form" />
        </div>

        <!-- Tab 3: Hábitos -->
        <div v-show="activeTab === 3">
          <ClientHabitsTab :form="form" />
        </div>

        <!-- Tab 4: Anamneses -->
        <div v-if="form.id" v-show="activeTab === 4">
          <div class="anamneses-tab">
            <AnamnesisList
              ref="anamnesesList"
              :client-id="form.id"
              :client-data="form"
              @new="(cData) => openAnamnesisModal(null, false, cData)"
              @view="(entity) => openAnamnesisModal(entity, true)"
            />
          </div>
        </div>

        <!-- Tab 5: Histórico -->
        <div v-if="form.id" v-show="activeTab === 5">
          <div class="history-tab">
            <SaleList :client-id="form.id" :embedded="true" />
          </div>
        </div>

      </div>
    </form>

    <template #footer>
      <button
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
        type="button"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        form="clientForm"
        class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        type="submit"
      >
        Salvar
      </button>
    </template>
  </BaseModal>

  <!-- Modals -->
  <AnamnesisFormModal
    v-if="showAnamnesisModal"
    :client-id="form.id"
    :entity="editingAnamnesis"
    :client-data="anamnesisClientData"
    :readonly="readonlyAnamnesis"
    @close="closeAnamnesisModal"
    @save="onAnamnesisSaved"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import BaseModal from './common/BaseModal.vue';
import StatusBadge from './common/StatusBadge.vue';
import TabNavigation from './common/TabNavigation.vue';
import SaleList from './SaleList.vue';
import AnamnesisList from './anamnesis/AnamnesisList.vue';
import AnamnesisFormModal from './anamnesis/AnamnesisFormModal.vue';
import ClientGeneralTab from './clients/ClientGeneralTab.vue';
import ClientPersonalTab from './clients/ClientPersonalTab.vue';
import ClientHealthTab from './clients/ClientHealthTab.vue';
import ClientHabitsTab from './clients/ClientHabitsTab.vue';
import { clientService } from '../services/clientService';
import { enumService } from '../services/enumService';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';

const activeTab = ref(0);

const tabs = computed(() => {
  const isNew = !form.value.id;
  return [
    { label: 'Dados Gerais' },
    { label: 'Dados Pessoais' },
    { label: 'Condições de Saúde' },
    { label: 'Hábitos' },
    { label: 'Anamneses', disabled: isNew },
    { label: 'Histórico', disabled: isNew },
  ];
});

const clientStatusMap = {
  VIP: {
    label: 'VIP',
    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  AT_RISK: {
    label: 'Em Risco',
    badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
  NEW: {
    label: 'Novo',
    badge: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  ACTIVE: {
    label: 'Ativo',
    badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
};

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);

const maxDate = new Date().toISOString().split('T')[0];

const firstName = computed(() => {
  if (!form.value.name) return 'Editar Cliente';
  return form.value.name.split(' ')[0];
});

const clientAge = computed(() => {
  if (!form.value.birthday) return null;
  const birth = new Date(form.value.birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
});

const clientSince = computed(() => {
  const d = form.value.createdAt;
  if (!d) return null;
  const date = new Date(d);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${months[date.getMonth()]}/${date.getFullYear()}`;
});

const form = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  birthday: '',
  notes: '',
  referredById: null,
  personalData: {
    gender: null,
    address: '',
    primaryObjective: null,
    primaryObjectiveOtherDetails: '',
  },
  healthConditions: {
    pregnantOrNursing: false,
    hasAllergies: false,
    allergiesDetails: '',
    hasSkinConditions: false,
    skinConditionsDetails: '',
    hasChronicConditions: false,
    usesContinuousMedication: false,
    continuousMedicationDetails: '',
    usesAcidsOrAntibiotics: false,
    acidsOrAntibioticsDetails: '',
    hadRecentProcedures: false,
    recentProceduresDetails: '',
  },
  personalHabits: {
    sunscreenDaily: false,
    makeupDaily: false,
    skincareRoutine: false,
    prescribedProducts: false,
  },
});

// Auto-complete logic
const searchQueryResults = ref([]);
const showSearchResults = ref(false);
let searchTimeout = null;

// Anamnesis Modal State
const anamnesesList = ref(null);
const showAnamnesisModal = ref(false);
const editingAnamnesis = ref(null);
const readonlyAnamnesis = ref(false);
const anamnesisClientData = ref(null);

const genders = ref([]);
const primaryObjectives = ref([]);

const onNameInput = () => {
  if (form.value.id) return;

  if (searchTimeout) clearTimeout(searchTimeout);

  if (!form.value.name || form.value.name.length < 2) {
    searchQueryResults.value = [];
    showSearchResults.value = false;
    return;
  }

  showSearchResults.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const response = await clientService.getAll({ page: 0, size: 5, name: form.value.name });
      if (response.data && response.data.content) {
        searchQueryResults.value = response.data.content;
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  }, 300);
};

const hideSearchResults = () => {
  setTimeout(() => { showSearchResults.value = false; }, 200);
};

const selectExistingClient = async (item) => {
  try {
    const response = await clientService.getById(item.id);
    if (response.data) {
      populateForm({ ...response.data });
    }
  } catch (e) {
    console.error('Failed to load full client:', e);
  } finally {
    showSearchResults.value = false;
    searchQueryResults.value = [];
  }
};

const populateForm = (clientData) => {
  let initialPrimaryObjective = null;
  let initialPrimaryObjectiveOtherDetails = '';

  if (clientData.personalData?.primaryObjective) {
    const validEnums = [
      'SKIN_CLEANING', 'EYEBROW_DESIGN', 'MICROPIGMENTATION',
      'PEELING', 'BROW_LAMINATION', 'LASH_LIFTING', 'MICRONEEDLING',
    ];

    if (validEnums.includes(clientData.personalData.primaryObjective)) {
      initialPrimaryObjective = clientData.personalData.primaryObjective;
    } else {
      initialPrimaryObjective = 'OTHER';
      initialPrimaryObjectiveOtherDetails = clientData.personalData.primaryObjective;
    }
  }

  form.value = {
    ...clientData,
    birthday: clientData.birthday || '',
    personalData: {
      address: clientData.personalData?.address || '',
      gender: clientData.personalData?.gender || null,
      primaryObjective: initialPrimaryObjective,
      primaryObjectiveOtherDetails: initialPrimaryObjectiveOtherDetails,
    },
    healthConditions: clientData.healthConditions || {
      pregnantOrNursing: false,
      hasAllergies: false,
      allergiesDetails: '',
      hasSkinConditions: false,
      skinConditionsDetails: '',
      hasChronicConditions: false,
      usesContinuousMedication: false,
      continuousMedicationDetails: '',
      usesAcidsOrAntibiotics: false,
      acidsOrAntibioticsDetails: '',
      hadRecentProcedures: false,
      recentProceduresDetails: '',
    },
    personalHabits: clientData.personalHabits || {
      sunscreenDaily: false,
      makeupDaily: false,
      skincareRoutine: false,
      prescribedProducts: false,
    },
  };
};

onMounted(async () => {
  try {
    genders.value = await enumService.getOptions('Gender');
    primaryObjectives.value = await enumService.getOptions('PrimaryObjective');
  } catch (error) {
    console.error('Failed to load enum options', error);
  }

  if (props.client.id) {
    populateForm(props.client);
  }
});

const save = () => {
  const payload = { ...form.value };

  if (payload.personalData.primaryObjective === 'OTHER') {
    payload.personalData.primaryObjective = payload.personalData.primaryObjectiveOtherDetails;
  }

  delete payload.personalData.primaryObjectiveOtherDetails;

  emit('save', payload);
};

// Anamnesis methods
const openAnamnesisModal = (entity = null, readonly = false, clientDataArg = null) => {
  editingAnamnesis.value = entity;
  readonlyAnamnesis.value = readonly;
  anamnesisClientData.value = clientDataArg || form.value;
  showAnamnesisModal.value = true;
};

const closeAnamnesisModal = () => {
  showAnamnesisModal.value = false;
  editingAnamnesis.value = null;
  readonlyAnamnesis.value = false;
};

const onAnamnesisSaved = () => {
  closeAnamnesisModal();
  if (anamnesesList.value) {
    anamnesesList.value.refresh();
  }
};
</script>
