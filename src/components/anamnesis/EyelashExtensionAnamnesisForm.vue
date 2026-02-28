<template>
  <div class="sub-form eyebrow-anamnesis-form">
    <!-- Histórico -->
    <div class="form-section">
      <h3 class="section-title">🕒 Histórico</h3>
      
      <div class="form-row">
        <div class="form-group toggle-group">
          <label>Primeira vez fazendo extensão de cílios?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="firstTime" v-model="modelValue.firstTime" :disabled="readonly"/>
             <label for="firstTime"></label>
          </div>
        </div>
      </div>
      
      <div v-if="!modelValue.firstTime" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Qual a experiência anterior? Teve alguma reação?</label>
          <textarea 
            v-model="modelValue.previousExperience" 
            class="form-control" 
            rows="2"
            :disabled="readonly"
          ></textarea>
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
             <input type="checkbox" id="wearsContactLenses" v-model="modelValue.wearsContactLenses" :disabled="readonly"/>
             <label for="wearsContactLenses"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Usa óculos?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="wearsGlasses" v-model="modelValue.wearsGlasses" :disabled="readonly"/>
             <label for="wearsGlasses"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Tem sensibilidade à luz?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasLightSensitivity" v-model="modelValue.hasLightSensitivity" :disabled="readonly"/>
             <label for="hasLightSensitivity"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Olhos lacrimejam frequentemente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasWateryEyes" v-model="modelValue.hasWateryEyes" :disabled="readonly"/>
             <label for="hasWateryEyes"></label>
          </div>
        </div>
        
        <div class="form-group toggle-group">
          <label>Dorme de lado / bruços?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="sleepsOnSideOrStomach" v-model="modelValue.sleepsOnSideOrStomach" :disabled="readonly"/>
             <label for="sleepsOnSideOrStomach"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Tratamento oftalmológico recente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="recentEyeTreatment" v-model="modelValue.recentEyeTreatment" :disabled="readonly"/>
             <label for="recentEyeTreatment"></label>
          </div>
        </div>
      </div>

      <div v-if="modelValue.recentEyeTreatment" class="form-row sub-field">
        <div class="form-group full-width">
          <label>Qual tratamento oftalmológico?</label>
          <input type="text" v-model="modelValue.eyeTreatmentDetails" class="form-control" :disabled="readonly" />
        </div>
      </div>
    </div>

    <!-- Saúde Geral -->
    <div class="form-section">
      <h3 class="section-title">⚠️ Saúde Geral</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Alergia a cianoacrilato (cola)?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="allergicToCyanoacrylate" v-model="modelValue.allergicToCyanoacrylate" :disabled="readonly"/>
             <label for="allergicToCyanoacrylate"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Distúrbio na tireoide?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="hasThyroidDisorder" v-model="modelValue.hasThyroidDisorder" :disabled="readonly"/>
             <label for="hasThyroidDisorder"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Gestante ou lactante?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="pregnantOrNursing" v-model="modelValue.pregnantOrNursing" :disabled="readonly"/>
             <label for="pregnantOrNursing"></label>
          </div>
        </div>
      </div>
    </div>

    <!-- Rotina e Beleza -->
    <div class="form-section">
      <h3 class="section-title">✨ Rotina de Beleza</h3>
      
      <div class="boolean-grid">
        <div class="form-group toggle-group">
          <label>Usa rímel à prova d'água?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesWaterproofMascara" v-model="modelValue.usesWaterproofMascara" :disabled="readonly"/>
             <label for="usesWaterproofMascara"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa demaquilante bifásico/óleo?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesOilyMakeupRemover" v-model="modelValue.usesOilyMakeupRemover" :disabled="readonly"/>
             <label for="usesOilyMakeupRemover"></label>
          </div>
        </div>

        <div class="form-group toggle-group">
          <label>Usa curvex frequentemente?</label>
          <div class="toggle-switch">
             <input type="checkbox" id="usesEyelashCurler" v-model="modelValue.usesEyelashCurler" :disabled="readonly"/>
             <label for="usesEyelashCurler"></label>
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
import { defineProps, defineEmits, ref } from 'vue';

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

/* Toggle Switch Styles */
.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0px;
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

.full-width {
  flex: 1 1 100%;
}
</style>
