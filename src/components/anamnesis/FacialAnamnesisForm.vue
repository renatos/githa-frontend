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
             <input type="checkbox" id="usesSunscreen" v-model="modelValue.usesSunscreen" :disabled="readonly"/>
             <label for="usesSunscreen"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Usa maquiagem com frequência?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesMakeup" v-model="modelValue.usesMakeup" :disabled="readonly"/>
             <label for="usesMakeup"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Faz uso de cosméticos/ácidos?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesSkincareProducts" v-model="modelValue.usesSkincareProducts" :disabled="readonly"/>
             <label for="usesSkincareProducts"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.usesSkincareProducts" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais cosméticos/ácidos?</label>
          <input type="text" v-model="modelValue.skincareProductsDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Histórico de Saúde -->
    <div class="form-section">
      <h3 class="section-title">⚠️ Histórico Clínico e Saúde</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Está gestante ou lactante?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="pregnantOrNursing" v-model="modelValue.pregnantOrNursing" :disabled="readonly"/>
             <label for="pregnantOrNursing"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Portador de marcapasso?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasPacemaker" v-model="modelValue.hasPacemaker" :disabled="readonly"/>
             <label for="hasPacemaker"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Distúrbio hormonal?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasHormonalChanges" v-model="modelValue.hasHormonalChanges" :disabled="readonly"/>
             <label for="hasHormonalChanges"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Possui alergias?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasAllergies" v-model="modelValue.hasAllergies" :disabled="readonly"/>
             <label for="hasAllergies"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Problemas oncológicos?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasOncologicalHistory" v-model="modelValue.hasOncologicalHistory" :disabled="readonly"/>
             <label for="hasOncologicalHistory"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Uso de Roacutan?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesRoaccutane" v-model="modelValue.usesRoaccutane" :disabled="readonly"/>
             <label for="usesRoaccutane"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Qualidade do sono ruim?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="poorSleepQuality" v-model="modelValue.poorSleepQuality" :disabled="readonly"/>
             <label for="poorSleepQuality"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Baixa ingestão de água?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="lowWaterIntake" v-model="modelValue.lowWaterIntake" :disabled="readonly"/>
             <label for="lowWaterIntake"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Funcionamento intestinal irregular?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="irregularBowelFunction" v-model="modelValue.irregularBowelFunction" :disabled="readonly"/>
             <label for="irregularBowelFunction"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.hasAllergies" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Quais alergias?</label>
          <input type="text" v-model="modelValue.allergiesDetails" class="form-control" :disabled="readonly" />
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

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.toggle-group label {
  margin-bottom: 0;
  font-weight: 500;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: var(--color-primary);
}

.toggle-switch input:focus + label {
  box-shadow: 0 0 1px var(--color-primary);
}

.toggle-switch input:checked + label:before {
  transform: translateX(20px);
}

.toggle-switch input:disabled + label {
  opacity: 0.6;
  cursor: not-allowed;
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
