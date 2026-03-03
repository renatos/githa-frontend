<template>
  <div class="modal-overlay" @mousedown.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ficha de Anamnese{{ typeLabel }}</h2>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="anamnesis-form">
          <div v-if="readonly" class="readonly-banner">
            <span class="icon">ℹ️</span>
            <span>Ficha de Anamnese — Apenas Leitura</span>
          </div>

      <!-- Type Selector (Only on Creation) -->
      <div v-if="!entity?.id" class="form-row">
        <div class="form-group">
          <label>Tipo de Anamnese <span class="required">*</span></label>
          <select 
            v-model="selectedType" 
            class="form-control" 
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
        </div>
      </div>

      <div v-if="selectedType">
        <!-- Common Fields -->
        <div class="form-row">
          <div class="form-group">
            <label>Data do Atendimento</label>
            <input 
              type="date" 
              v-model="form.attendanceDate" 
              class="form-control"
              :disabled="readonly"
              required 
            />
          </div>
        </div>

        <hr class="section-divider" />

        <!-- Dynamic Form Component Based on Type -->
        <div class="dynamic-form-section">
          <component 
            v-if="currentForm" 
            :is="currentForm" 
            v-model="form" 
            :readonly="readonly"
          />
        </div>

        <hr class="section-divider" />

        <!-- Common Observables -->
        <div class="form-row">
          <div class="form-group full-width">
            <label>Observações da Profissional</label>
            <textarea 
              v-model="form.professionalNotes" 
              class="form-control"
              rows="3" 
              :disabled="readonly"
              placeholder="Adicione notas visíveis apenas para a clínica..."
            ></textarea>
          </div>
        </div>

        <!-- Consents -->
        <div class="consent-section">
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.consentGranted" 
                :disabled="readonly"
                required 
              />
              <span class="checkbox-text">
                Declaro que as informações fornecidas são verdadeiras e estou ciente dos procedimentos, riscos e cuidados necessários. <span class="required">*</span>
              </span>
            </label>
          </div>
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="form.photoAuthorizationGranted" 
                :disabled="readonly"
              />
              <span class="checkbox-text">
                Autorizo registro fotográfico e divulgação nas mídias sociais.
              </span>
            </label>
          </div>
        </div>
      </div>

        </div>
      </div>
      <!-- Action Buttons -->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          {{ readonly ? 'Fechar' : 'Cancelar' }}
        </button>
        <button 
          v-if="!readonly" 
          type="button" 
          class="btn btn-primary" 
          :disabled="!canSave"
          @click="save"
        >
          Salvar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import FacialAnamnesisForm from './FacialAnamnesisForm.vue';
import EyelashExtensionAnamnesisForm from './EyelashExtensionAnamnesisForm.vue';
import MicropigmentationAnamnesisForm from './MicropigmentationAnamnesisForm.vue';
import { enumService } from '../../services/enumService';
import { anamnesisService } from '../../services/anamnesisService';
import { clientService } from '../../services/clientService';
import { toastBridge } from '../../services/toastBridge';
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
  
  // Fallback map if the enum data isn't loaded yet
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
  // Fields will be dynamically added here by sub-forms via v-model="form"
});

onMounted(async () => {
  try {
    anamnesisTypes.value = await enumService.getOptions('AnamnesisType');
  } catch (error) {
    console.error('Failed to load AnamnesisType options', error);
  }

  if (props.entity) {
    // Check if we need to fetch the full details since lists might only have summarized DTOs
    if (props.entity.id) {
       try {
         const res = await anamnesisService.getById(props.clientId, props.entity.id);
         const fullEntity = res.data;
         selectedType.value = fullEntity.type;
         const { details, ...baseFields } = fullEntity;
         form.value = { ...baseFields, ...(details || {}) };
       } catch(error) {
         console.error('Failed to fetch full anamnesis details', error);
         alert('Erro ao carregar detalhes da ficha');
       }
    } else {
       selectedType.value = props.entity.type;
       const { details, ...baseFields } = props.entity;
       form.value = { ...form.value, ...baseFields, ...(details || {}) };
    }
  } else {
    // New Anamnesis: Use passed client data to auto-fill common fields
    try {
      if (props.clientData && props.clientData.healthConditions) {
        const hc = props.clientData.healthConditions;
        // Map common health conditions to Anamnesis details
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

  // Split form.value into base fields and details
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
    alert('Erro ao salvar ficha de anamnese.');
  }
};
</script>

<style scoped>
.anamnesis-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 800px;
}

.readonly-banner {
  background-color: var(--color-bg-info, #e0f2fe);
  color: var(--color-text-info, #0369a1);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-sm);
}

.section-divider {
  border: 0;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-md) 0;
}

.consent-section {
  background-color: var(--color-bg-body);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  margin-top: var(--spacing-md);
}

.checkbox-group {
  margin-bottom: var(--spacing-sm);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 4px;
}

.checkbox-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
}

.required {
  color: var(--color-danger);
}

/* Modal styles included inside common forms.css/modal.css mostly, but added here for safety */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}

.modal-container {
  background-color: var(--color-bg-card, #fff);
  border-radius: var(--radius-lg, 8px);
  width: 100%;
  max-width: 800px;
  box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-bottom: 1px solid var(--color-border, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text-main, #1e293b);
}

.modal-body {
  padding: var(--spacing-lg, 24px);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
}

.modal-footer {
  padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
  border-top: 1px solid var(--color-border, #e2e8f0);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md, 16px);
}
</style>
