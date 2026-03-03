<template>
  <div class="sub-form facial-anamnesis-form">
    <div class="form-section">
      <h3 class="section-title">👩 Dados da Cliente</h3>
      <div class="form-row">
        <div class="form-group full-width">
          <label>Queixa Principal / Motivo da Consulta</label>
          <textarea 
            v-model="modelValue.chiefComplaint" 
            class="form-control" 
            rows="2"
            :disabled="readonly"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Profissão</label>
          <input 
            type="text" 
            v-model="modelValue.profession" 
            class="form-control"
            :disabled="readonly"
          />
        </div>
      </div>
    </div>

    <!-- Rotina de Cuidados -->
    <div class="form-section">
      <h3 class="section-title">🧴 Rotina de Cuidados</h3>
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Usa protetor solar diariamente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesSunscreenDaily" v-model="modelValue.usesSunscreenDaily" :disabled="readonly"/>
             <label for="fac_usesSunscreenDaily"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Usa maquiagem com frequência?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesMakeupFrequently" v-model="modelValue.usesMakeupFrequently" :disabled="readonly"/>
             <label for="fac_usesMakeupFrequently"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Faz uso de cosméticos/ácidos?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesAcidsOrManipulatedCosmetics" v-model="modelValue.usesAcidsOrManipulatedCosmetics" :disabled="readonly"/>
             <label for="fac_usesAcidsOrManipulatedCosmetics"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.usesAcidsOrManipulatedCosmetics" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais cosméticos/ácidos?</label>
          <input type="text" v-model="modelValue.acidsOrCosmeticsDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Histórico de Saúde -->
    <div class="form-section">
      <h3 class="section-title">⚠️ Histórico Clínico e Saúde</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Possui diabetes, hipertensão ou doença autoimune?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_hasDiabetesHypertensionOrAutoimmune" v-model="modelValue.hasDiabetesHypertensionOrAutoimmune" :disabled="readonly"/>
             <label for="fac_hasDiabetesHypertensionOrAutoimmune"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Faz uso de anticoagulantes?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesAnticoagulants" v-model="modelValue.usesAnticoagulants" :disabled="readonly"/>
             <label for="fac_usesAnticoagulants"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Realizou procedimentos faciais anteriores?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_hadPreviousFacialProcedures" v-model="modelValue.hadPreviousFacialProcedures" :disabled="readonly"/>
             <label for="fac_hadPreviousFacialProcedures"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Usa sabonete facial?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesFacialSoap" v-model="modelValue.usesFacialSoap" :disabled="readonly"/>
             <label for="fac_usesFacialSoap"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa hidratante?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_usesMoisturizer" v-model="modelValue.usesMoisturizer" :disabled="readonly"/>
             <label for="fac_usesMoisturizer"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Fumante?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="fac_smoker" v-model="modelValue.smoker" :disabled="readonly"/>
             <label for="fac_smoker"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.hasDiabetesHypertensionOrAutoimmune" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais alterações?</label>
          <input type="text" v-model="modelValue.diabetesHypertensionAutoimmuneDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>

      <div v-if="modelValue.hadPreviousFacialProcedures" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais procedimentos faciais?</label>
          <input type="text" v-model="modelValue.previousFacialProceduresDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Avaliação Profissional -->
    <div class="form-section">
      <h3 class="section-title">🔍 Avaliação Profissional</h3>
      
      <div class="form-row">
        <div class="form-group full-width">
          <label>Tipos e Características da Pele</label>
          <div class="chips-container">
            <label 
              v-for="skinType in skinTypes" 
              :key="skinType.name" 
              class="chip-label"
              :class="{ 'selected': modelValue.skinTypes && modelValue.skinTypes.includes(skinType.name), 'disabled': readonly }"
            >
              <input 
                type="checkbox" 
                :value="skinType.name" 
                v-model="internalSkinTypes"
                :disabled="readonly"
                class="hidden-input"
              />
              {{ skinType.description }}
            </label>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group full-width">
          <label>Tratamentos Sugeridos</label>
          <textarea 
            v-model="modelValue.suggestedTreatments" 
            class="form-control" 
            rows="2"
            :disabled="readonly"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref, watch } from 'vue';
import { enumService } from '../../services/enumService';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const skinTypes = ref([]);
// Internal array for handling checkbox v-model directly, avoiding nested mutation issues if not initialized
const internalSkinTypes = ref(props.modelValue.skinTypes || []);

onMounted(async () => {
  try {
    skinTypes.value = await enumService.getOptions('SkinType');
  } catch (error) {
    console.error('Failed to fetch SkinType enum', error);
  }
  
  if (!props.modelValue.skinTypes) {
    emit('update:modelValue', { ...props.modelValue, skinTypes: [] });
  }
});

watch(internalSkinTypes, (newVal) => {
  emit('update:modelValue', { ...props.modelValue, skinTypes: newVal });
}, { deep: true });

watch(() => props.modelValue.skinTypes, (newVal) => {
  if (newVal) {
      internalSkinTypes.value = newVal;
  }
}, { deep: true });
</script>

<style scoped>
.sub-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-section {
  background-color: var(--color-bg-card);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.section-title {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary);
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--color-border-light, #eee);
  padding-bottom: 8px;
}

.boolean-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-md);
}

.sub-field {
  margin-top: var(--spacing-sm);
  padding-left: var(--spacing-md);
  border-left: 2px solid var(--color-primary);
}

/* Chips Container */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hidden-input {
  display: none;
}

.chip-label {
  padding: 6px 12px;
  border-radius: 20px;
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  user-select: none;
}

.chip-label:hover:not(.disabled) {
  background-color: #e2e8f0;
}

.chip-label.selected {
  background-color: var(--color-primary-light, #e0e7ff);
  color: var(--color-primary-dark, #3730a3);
  border-color: var(--color-primary, #6366f1);
  font-weight: 500;
}

.chip-label.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.full-width {
  flex: 1 1 100%;
}
</style>
