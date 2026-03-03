<template>
  <div class="sub-form eyebrow-anamnesis-form">
    <!-- Histórico -->
    <div class="form-section">
      <h3 class="section-title">🕒 Histórico</h3>
      
      <div class="form-row">
        <div class="form-group toggle-group">
          <label>Primeira vez fazendo extensão de cílios?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_firstTime" v-model="firstTimeComputed" :disabled="readonly"/>
             <label for="eye_firstTime"></label>
          </div>
        </div>
      </div>
      
      <div v-if="modelValue.hadPreviousLashExtension" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Qual a experiência anterior? Teve alguma reação?</label>
          <div style="display: flex; gap: 16px;">
             <div class="form-group toggle-group" style="min-width: 200px;">
               <label>Teve reação?</label>
               <div class="toggle-switch">
                  <input type="checkbox" id="eye_hadReactionToPrevious" v-model="modelValue.hadReactionToPrevious" :disabled="readonly"/>
                  <label for="eye_hadReactionToPrevious"></label>
               </div>
             </div>
             <input type="text" v-model="modelValue.reactionDetails" class="form-control" placeholder="Detalhes da reação" :disabled="readonly" v-if="modelValue.hadReactionToPrevious" style="flex: 1;" />
          </div>
          <label style="margin-top: 12px; display: block;">Técnica anterior utilizada</label>
          <input type="text" v-model="modelValue.previousTechniqueUsed" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Condições Oculares -->
    <div class="form-section">
      <h3 class="section-title">👁️ Condições Oculares</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Usa lentes de contato?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_wearsContactLenses" v-model="modelValue.wearsContactLenses" :disabled="readonly"/>
             <label for="eye_wearsContactLenses"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa colírio regularmente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_usesEyeDropsRegularly" v-model="modelValue.usesEyeDropsRegularly" :disabled="readonly"/>
             <label for="eye_usesEyeDropsRegularly"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Esfrega os olhos com frequência?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_rubsEyesFrequently" v-model="modelValue.rubsEyesFrequently" :disabled="readonly"/>
             <label for="eye_rubsEyesFrequently"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Infecção ocular recente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_hasOcularInfection" v-model="modelValue.hasOcularInfection" :disabled="readonly"/>
             <label for="eye_hasOcularInfection"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Dorme de lado / bruços?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_sleepsFaceDown" v-model="modelValue.sleepsFaceDown" :disabled="readonly"/>
             <label for="eye_sleepsFaceDown"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.hasOcularInfection" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Detalhes da infecção oftalmológica?</label>
          <input type="text" v-model="modelValue.ocularInfectionDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Saúde Geral -->
    <div class="form-section">
      <h3 class="section-title">⚠️ Saúde Geral</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Alergia ou sensibilidade a cola?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_hasSensitivityOrAllergyToGlue" v-model="modelValue.hasSensitivityOrAllergyToGlue" :disabled="readonly"/>
             <label for="eye_hasSensitivityOrAllergyToGlue"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Uso de medicação contínua?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_usesContinuousMedication" v-model="modelValue.usesContinuousMedication" :disabled="readonly"/>
             <label for="eye_usesContinuousMedication"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Gestante ou lactante?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_pregnantOrNursing" v-model="modelValue.pregnantOrNursing" :disabled="readonly"/>
             <label for="eye_pregnantOrNursing"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Doença autoimune, dermatológica ou ocular?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_hasAutoimmuneDermatologicalOrOcularDisease" v-model="modelValue.hasAutoimmuneDermatologicalOrOcularDisease" :disabled="readonly"/>
             <label for="eye_hasAutoimmuneDermatologicalOrOcularDisease"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.hasSensitivityOrAllergyToGlue" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais alergias/sensibilidades?</label>
          <input type="text" v-model="modelValue.sensitivityAllergyDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
      <div v-if="modelValue.usesContinuousMedication" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais medicações?</label>
          <input type="text" v-model="modelValue.continuousMedicationDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
      <div v-if="modelValue.hasAutoimmuneDermatologicalOrOcularDisease" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais doenças?</label>
          <input type="text" v-model="modelValue.diseaseDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Rotina e Beleza -->
    <div class="form-section">
      <h3 class="section-title">✨ Rotina de Beleza</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Usa maquiagem nos olhos diariamente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_usesEyeMakeupDaily" v-model="modelValue.usesEyeMakeupDaily" :disabled="readonly"/>
             <label for="eye_usesEyeMakeupDaily"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa curvex ou rímel à prova d'água?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_usesCurvexOrWaterproofMascara" v-model="modelValue.usesCurvexOrWaterproofMascara" :disabled="readonly"/>
             <label for="eye_usesCurvexOrWaterproofMascara"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa demaquilante bifásico/oleoso?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_usesBiphasicOrOilyMakeupRemover" v-model="modelValue.usesBiphasicOrOilyMakeupRemover" :disabled="readonly"/>
             <label for="eye_usesBiphasicOrOilyMakeupRemover"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Fez permanente/tintura de cílios recente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_hadLashPermanentOrTinting" v-model="modelValue.hadLashPermanentOrTinting" :disabled="readonly"/>
             <label for="eye_hadLashPermanentOrTinting"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Faz limpeza facial frequente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="eye_doesFrequentFacialCleansing" v-model="modelValue.doesFrequentFacialCleansing" :disabled="readonly"/>
             <label for="eye_doesFrequentFacialCleansing"></label>
          </div>
        </div>
      </div>
    </div>

    <!-- Técnica -->
    <div class="form-section">
      <h3 class="section-title">🖌 Técnica Sugerida</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Técnica</label>
          <select v-model="modelValue.suggestedTechnique" class="form-control" :disabled="readonly">
            <option :value="null">Selecione...</option>
            <option 
              v-for="tech in techniques" 
              :key="tech.value" 
              :value="tech.value"
            >
              {{ tech.label }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Mapping / Estilo</label>
          <input type="text" v-model="modelValue.mappingStyle" class="form-control" placeholder="ex: Gatinho, Boneca" :disabled="readonly" />
        </div>
      </div>
      <div class="form-row">
         <div class="form-group">
          <label>Tamanho / Curvatura / Espessura</label>
          <input type="text" v-model="modelValue.technicalDetails" class="form-control" placeholder="ex: 8-12mm / C / 0.15" :disabled="readonly" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, computed } from 'vue';

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

const firstTimeComputed = computed({
  get() {
    return !props.modelValue.hadPreviousLashExtension;
  },
  set(newValue) {
    emit('update:modelValue', {
      ...props.modelValue,
      hadPreviousLashExtension: !newValue
    });
  }
});

// Using static options because the backend stores this as a plain String, not an Enum.
const techniques = ref([
  { value: 'Fio a Fio', label: 'Fio a Fio' },
  { value: 'Volume Brasileiro', label: 'Volume Brasileiro' },
  { value: 'Volume Russo', label: 'Volume Russo' },
  { value: 'Mega Volume', label: 'Mega Volume' },
  { value: 'Híbrido', label: 'Híbrido' },
  { value: 'Volume Egípcio', label: 'Volume Egípcio' },
  { value: 'Lash Lifting', label: 'Lash Lifting' },
  { value: 'Outra', label: 'Outra' }
]);
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

/* End of specific styles */

.full-width {
  flex: 1 1 100%;
}
</style>
