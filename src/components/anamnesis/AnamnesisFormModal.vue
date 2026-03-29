<template>
  <BaseModal
    :show="true"
    :max-width="entity?.id ? 'max-w-2xl' : 'max-w-lg'"
    :body-padding="false"
    :z-index="10000"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="flex items-center gap-4 min-w-0">
        <span class="material-symbols-outlined text-[24px] shrink-0 text-indigo-600 dark:text-indigo-400">description</span>
        <div class="min-w-0">
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
            Ficha de Anamnese{{ typeLabel }}
          </h2>
        </div>
      </div>
    </template>
    <!-- Body Content -->
    <div class="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-6">
      <!-- Readonly Banner -->
      <div v-if="readonly" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300">
        <span class="material-symbols-outlined text-[20px]">info</span>
        <span class="text-sm font-medium">Ficha de Anamnese — Apenas Leitura</span>
      </div>

      <!-- Type Selector (Only on Creation) -->
      <label v-if="!entity?.id" class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">
          Tipo de Anamnese <span class="text-red-500">*</span>
        </p>
        <select 
          v-model="selectedType" 
          class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
          :disabled="readonly"
          required
        >
          <option :value="null">Selecione o tipo de anamnese</option>
          <option 
            v-for="type in anamnesisTypes" 
            :key="type.name" 
            :value="type.name"
          >
            {{ type.description }}
          </option>
        </select>
      </label>

      <div v-if="selectedType" class="flex flex-col gap-6">
        <!-- Common Fields -->
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Data do Atendimento</p>
          <input 
            v-model="form.attendanceDate" 
            type="date" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
            :disabled="readonly"
            required 
          />
        </label>

        <hr class="border-slate-200 dark:border-slate-700" />

        <!-- Dynamic Form Component Based on Type -->
        <component 
          :is="currentForm" 
          v-if="currentForm" 
          v-model="form" 
          :readonly="readonly"
        />

        <hr class="border-slate-200 dark:border-slate-700" />

        <!-- Common Observables -->
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Observações da Profissional</p>
          <textarea 
            v-model="form.professionalNotes" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-base font-normal leading-normal transition-colors resize-y min-h-[80px]"
            rows="3" 
            :disabled="readonly"
            placeholder="Adicione notas visíveis apenas para a clínica..."
          ></textarea>
        </label>

        <!-- Consents -->
        <div class="p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col gap-4">
          <label class="flex items-start gap-3 cursor-pointer">
            <input 
              v-model="form.consentGranted" 
              type="checkbox" 
              :disabled="readonly"
              required
              class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
            />
            <span class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Declaro que as informações fornecidas são verdadeiras e estou ciente dos procedimentos, riscos e cuidados necessários. <span class="text-red-500">*</span>
            </span>
          </label>
          <label class="flex items-start gap-3 cursor-pointer">
            <input 
              v-model="form.photoAuthorizationGranted" 
              type="checkbox" 
              :disabled="readonly"
              class="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-600"
            />
            <span class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Autorizo registro fotográfico e divulgação nas mídias sociais.
            </span>
          </label>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <button 
        type="button" 
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
        @click="$emit('close')"
      >
        {{ readonly ? 'Fechar' : 'Cancelar' }}
      </button>
      <button 
        v-if="!readonly" 
        type="button" 
        class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canSave"
        @click="save"
      >
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import FacialAnamnesisForm from './FacialAnamnesisForm.vue';
import EyelashExtensionAnamnesisForm from './EyelashExtensionAnamnesisForm.vue';
import MicropigmentationAnamnesisForm from './MicropigmentationAnamnesisForm.vue';
import { enumService } from '../../services/enumService';
import { anamnesisService } from '../../services/anamnesisService';
import { clientService } from '../../services/clientService';
import { toastBridge } from '../../services/toastBridge';
import { confirmBridge } from '../../services/confirmBridge';
import { useModal } from '../../composables/useModal';

const props = defineProps({
  clientId: {
    type: Number,
    required: true
  },
  clientData: {
    type: Object,
    default: null
  },
  entity: {
    type: Object,
    default: null
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);
useModal(emit);

const FORM_MAP = {
  FACIAL: FacialAnamnesisForm,
  EYELASH_EXTENSION: EyelashExtensionAnamnesisForm,
  MICROPIGMENTATION: MicropigmentationAnamnesisForm,
};

const anamnesisTypes = ref([]);
const selectedType = ref(null);

const typeLabel = computed(() => {
  if (!selectedType.value) return '';
  const opt = anamnesisTypes.value.find(t => t.name === selectedType.value);
  if (opt) return ` - ${opt.description}`;
  
  const map = {
    FACIAL: 'Facial',
    EYELASH_EXTENSION: 'Extensão de Cílios',
    MICROPIGMENTATION: 'Micropigmentação'
  };
  return ` - ${map[selectedType.value] || selectedType.value}`;
});

const currentForm = computed(() => {
  return FORM_MAP[selectedType.value] || null;
});

const form = ref({
  type: null,
  attendanceDate: new Date().toISOString().split('T')[0],
  consentGranted: false,
  photoAuthorizationGranted: false,
  professionalNotes: '',
});

onMounted(async () => {
  try {
    anamnesisTypes.value = await enumService.getOptions('AnamnesisType');
  } catch (error) {
    console.error('Failed to load AnamnesisType options', error);
  }

  if (props.entity) {
    if (props.entity.id) {
       try {
         const res = await anamnesisService.getById(props.clientId, props.entity.id);
         const fullEntity = res.data;
         selectedType.value = fullEntity.type;
         const { details, ...baseFields } = fullEntity;
         form.value = { ...baseFields, ...(details || {}) };
       } catch(error) {
         console.error('Failed to fetch full anamnesis details', error);
         confirmBridge.alert({
           title: 'Erro de Carregamento',
           message: 'Não foi possível carregar os detalhes da ficha de anamnese.',
           type: 'danger'
         });
       }
    } else {
       selectedType.value = props.entity.type;
       const { details, ...baseFields } = props.entity;
       form.value = { ...form.value, ...baseFields, ...(details || {}) };
    }
  } else {
    try {
      if (props.clientData && props.clientData.healthConditions) {
        const hc = props.clientData.healthConditions;
        form.value = {
          ...form.value,
          pregnantOrNursing: hc.pregnantOrNursing || false,
          hasSensitivityOrAllergyToGlue: hc.hasAllergies || false,
          sensitivityAllergyDetails: hc.allergiesDetails || '',
          allergyToPigmentsOrAnesthetics: hc.hasAllergies || false,
          usesContinuousMedication: hc.usesContinuousMedication || false,
          continuousMedicationDetails: hc.continuousMedicationDetails || '',
          hasDiabetesHypertensionOrAutoimmune: hc.hasChronicConditions || false,
          hasDiabetes: hc.hasChronicConditions || false,
          hasHypertension: hc.hasChronicConditions || false
        };
      }
    } catch (error) {
      console.error('Failed to parse client health data for auto-fill', error);
    }
  }
});

watch(selectedType, (newType) => {
  form.value.type = newType;
});

const canSave = computed(() => {
  return selectedType.value && form.value.attendanceDate && form.value.consentGranted;
});

const save = async () => {
  if (!canSave.value) return;

  const { 
    id, type, attendanceDate, consentGranted, 
    photoAuthorizationGranted, professionalNotes, 
    createdAt, updatedAt, clientId, typeDescription,
    ...details 
  } = form.value;

  const payload = {
    id, type, attendanceDate, consentGranted,
    photoAuthorizationGranted, professionalNotes,
    createdAt, updatedAt, clientId,
    details 
  };

  try {
    if (payload.id) {
      await anamnesisService.update(props.clientId, payload.id, payload);
      toastBridge.getToast().add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Ficha de anamnese atualizada com sucesso',
        life: 3000
      });
    } else {
      await anamnesisService.create(props.clientId, payload);
      toastBridge.getToast().add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Ficha de anamnese criada com sucesso',
        life: 3000
      });
    }
    emit('save');
  } catch (error) {
    console.error('Error saving anamnesis:', error);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Ocorreu um erro ao tentar salvar a ficha de anamnese.',
      type: 'danger'
    });
  }
};
</script>
