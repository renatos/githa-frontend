<template>
  <div class="sub-form micropigmentation-form">
    
    <!-- Procedimentos -->
    <div class="form-section">
      <h3 class="section-title">🖌 Tipo de Procedimento</h3>
      <div class="form-row">
        <div class="form-group full-width">
          <div class="chips-container">
            <label 
              v-for="procType in procedureTypes" 
              :key="procType.name" 
              class="chip-label"
              :class="{ 'selected': modelValue.procedureTypes && modelValue.procedureTypes.includes(procType.name), 'disabled': readonly }"
            >
              <input 
                type="checkbox" 
                :value="procType.name" 
                v-model="internalProcedureTypes"
                :disabled="readonly"
                class="hidden-input"
              />
              {{ procType.description }}
            </label>
          </div>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group full-width">
          <label>Expectativa com o Procedimento</label>
          <textarea 
            v-model="modelValue.procedureExpectation" 
            class="form-control" 
            rows="2"
            :disabled="readonly"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Avaliação de Saúde -->
    <div class="form-section">
      <h3 class="section-title">⚠️ Avaliação de Saúde Clínica</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group" v-for="field in healthFields" :key="field.key">
          <label>{{ field.label }}</label>
          <div class="toggle-switch">
             <input type="checkbox" :id="'mic_' + field.key" v-model="modelValue[field.key]" :disabled="readonly"/>
             <label :for="'mic_' + field.key"></label>
          </div>
        </div>
      </div>
    </div>

    <!-- Histórico de Micropigmentação -->
    <div class="form-section">
      <h3 class="section-title">🕒 Histórico Estético</h3>
      
      <div class="form-row">
        <div class="form-group toggle-group">
          <label>Primeira vez fazendo micropigmentação nesta região?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="mic_firstMicropigmentation" v-model="firstTimeComputed" :disabled="readonly"/>
             <label for="mic_firstMicropigmentation"></label>
          </div>
        </div>
      </div>

      <div v-if="!modelValue.firstMicropigmentation" class="history-block sub-field">
        <div class="form-row">
          <div class="form-group">
            <label>Qual técnica anterior?</label>
            <input type="text" v-model="modelValue.previousTechnique" class="form-control" :disabled="readonly" />
          </div>
          <div class="form-group">
            <label>Data aprox. do procedimento anterior?</label>
            <input type="date" v-model="modelValue.previousProcedureDate" class="form-control" :disabled="readonly" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group toggle-group" style="margin-top: 10px; margin-bottom: 5px;">
             <label>Houve alguma complicação prévia?</label>
             <div class="toggle-switch">
                <input type="checkbox" id="mic_hadComplicationsInPrevious" v-model="modelValue.hadComplicationsInPrevious" :disabled="readonly"/>
                <label for="mic_hadComplicationsInPrevious"></label>
             </div>
          </div>
        </div>
        <div class="form-row" v-if="modelValue.hadComplicationsInPrevious">
           <div class="form-group full-width">
             <label>Detalhes da complicação/insatisfação</label>
             <textarea v-model="modelValue.complicationsDetails" class="form-control" rows="2" :disabled="readonly"></textarea>
           </div>
        </div>
      </div>
    </div>

    <!-- Orientações Informativas -->
    <div class="form-section informative-section">
      <h3 class="section-title">ℹ️ Orientações e Cuidados Pré e Pós</h3>
      <div class="informative-content">
        <p><strong>Pré-Procedimento:</strong> Evitar álcool e cafeína nas 24h anteriores. Não utilizar ácidos na região por 7 dias. Suspender ginkgo biloba, ômega 3 e aspirina (podem aumentar sangramento).</p>
        <p><strong>Pós-Procedimento:</strong> Não coçar, não arrancar casquinhas. Evitar sol, piscina, sauna, mar e exercícios com suor excessivo por 7 a 10 dias. Aplicar pomada recomendada conforme orientação (se aplicável).</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { defineProps, defineEmits, onMounted, ref, watch, computed } from 'vue';
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

const firstTimeComputed = computed({
  get() {
    return props.modelValue.firstMicropigmentation;
  },
  set(newValue) {
    emit('update:modelValue', {
      ...props.modelValue,
      firstMicropigmentation: newValue,
      // Clear previous history if it's their first time
      ...(newValue ? {
        previousTechnique: null,
        previousProcedureDate: null,
        hadComplicationsInPrevious: false,
        complicationsDetails: null
      } : {})
    });
  }
});

const procedureTypes = ref([]);
const internalProcedureTypes = ref(props.modelValue.procedureTypes || []);

const healthFields = [
  { key: 'hasDiabetes', label: 'Possui Diabetes?' },
  { key: 'hasHypertension', label: 'Hipertensão?' },
  { key: 'pregnantOrNursing', label: 'Gestante ou lactante?' },
  { key: 'hasKeloidOrHypertrophicScar', label: 'Histórico de queloide/cicatriz hipertrófica?' },
  { key: 'hasHerpes', label: 'Histórico de herpes labial/ocular?' },
  { key: 'hasCoagulationProblems', label: 'Problemas de coagulação?' },
  { key: 'usesAnticoagulants', label: 'Uso de anticoagulantes?' },
  { key: 'usedAcidRoacutanOrPeelingLast30Days', label: 'Uso de ácidos, Roacutan ou peeling (30 dias)?' },
  { key: 'hasAutoimmuneDiseases', label: 'Doença autoimune?' },
  { key: 'hasHepatitis', label: 'Portador de hepatite?' },
  { key: 'allergyToPigmentsOrAnesthetics', label: 'Alergia a pigmentos ou anestésicos?' },
  { key: 'hasDermatologicalHistoryInArea', label: 'Histórico dermatológico na área?' },
  { key: 'hadRecentSurgeryInArea', label: 'Cirurgia recente na área?' },
  { key: 'hadFillerOrBotoxLast30Days', label: 'Preenchimento ou Botox nos últimos 30 dias?' },
];

onMounted(async () => {
  try {
    procedureTypes.value = await enumService.getOptions('MicropigmentationType');
  } catch (error) {
    console.error('Failed to fetch MicropigmentationType enum', error);
  }
  
  if (!props.modelValue.procedureTypes) {
    emit('update:modelValue', { ...props.modelValue, procedureTypes: [] });
  }
});

watch(internalProcedureTypes, (newVal) => {
    emit('update:modelValue', { ...props.modelValue, procedureTypes: newVal });
}, { deep: true });

watch(() => props.modelValue.procedureTypes, (newVal) => {
    if (newVal) {
        internalProcedureTypes.value = newVal;
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

.informative-section {
  background-color: var(--color-bg-info, #e0f2fe);
  border-color: #bae6fd;
}

.informative-content {
  font-size: 0.9rem;
  color: #0c4a6e;
  line-height: 1.5;
}

.informative-content p {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
}

.informative-content p:last-child {
  margin-bottom: 0;
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

.history-block {
  margin-top: var(--spacing-md);
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
