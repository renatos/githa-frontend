<template>
  <div class="flex flex-col gap-6">
    <!-- Histórico -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🕒</span> Histórico
      </h3>
      
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="!modelValue.hadPreviousLashExtension ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Primeira vez fazendo extensão de cílios?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input class="invisible absolute" type="checkbox" id="eye_firstTime" v-model="firstTimeComputed" :disabled="readonly"/>
          </label>
        </div>
        
        <div v-if="modelValue.hadPreviousLashExtension" class="ml-4 pl-4 border-l-2 border-indigo-500 flex flex-col gap-3">
          <div class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
               :class="modelValue.hadReactionToPrevious ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Teve reação?</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
              <input class="invisible absolute" type="checkbox" id="eye_hadReactionToPrevious" v-model="modelValue.hadReactionToPrevious" :disabled="readonly"/>
            </label>
          </div>
          <input v-if="modelValue.hadReactionToPrevious" type="text" v-model="modelValue.reactionDetails" 
                 class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                 placeholder="Detalhes da reação" :disabled="readonly" />
          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Técnica anterior utilizada</p>
            <input type="text" v-model="modelValue.previousTechniqueUsed" 
                   class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                   :disabled="readonly" />
          </label>
        </div>
      </div>
    </div>

    <!-- Condições Oculares -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>👁️</span> Condições Oculares
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="field in ocularFields" :key="field.id"
             class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue[field.model] ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">{{ field.label }}</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input class="invisible absolute" type="checkbox" :id="field.id" v-model="modelValue[field.model]" :disabled="readonly"/>
          </label>
        </div>
      </div>

      <div v-if="modelValue.hasOcularInfection" class="mt-3 ml-4 pl-4 border-l-2 border-indigo-500">
        <input type="text" v-model="modelValue.ocularInfectionDetails" 
               class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
               :disabled="readonly" placeholder="Detalhes da infecção oftalmológica" />
      </div>
    </div>

    <!-- Saúde Geral -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>⚠️</span> Saúde Geral
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="field in healthFields" :key="field.id"
             class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue[field.model] ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">{{ field.label }}</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input class="invisible absolute" type="checkbox" :id="field.id" v-model="modelValue[field.model]" :disabled="readonly"/>
          </label>
        </div>
      </div>

      <div class="mt-3 flex flex-col gap-3 ml-4 pl-4 border-l-2 border-indigo-500" v-if="modelValue.hasSensitivityOrAllergyToGlue || modelValue.usesContinuousMedication || modelValue.hasAutoimmuneDermatologicalOrOcularDisease">
        <input v-if="modelValue.hasSensitivityOrAllergyToGlue" type="text" v-model="modelValue.sensitivityAllergyDetails" 
               class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
               :disabled="readonly" placeholder="Quais alergias/sensibilidades?" />
        <input v-if="modelValue.usesContinuousMedication" type="text" v-model="modelValue.continuousMedicationDetails" 
               class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
               :disabled="readonly" placeholder="Quais medicações?" />
        <input v-if="modelValue.hasAutoimmuneDermatologicalOrOcularDisease" type="text" v-model="modelValue.diseaseDetails" 
               class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
               :disabled="readonly" placeholder="Quais doenças?" />
      </div>
    </div>

    <!-- Rotina de Beleza -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>✨</span> Rotina de Beleza
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="field in beautyFields" :key="field.id"
             class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue[field.model] ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">{{ field.label }}</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input class="invisible absolute" type="checkbox" :id="field.id" v-model="modelValue[field.model]" :disabled="readonly"/>
          </label>
        </div>
      </div>
    </div>

    <!-- Técnica Sugerida -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🖌</span> Técnica Sugerida
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Técnica</p>
          <select v-model="modelValue.suggestedTechnique" class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-sm transition-colors" :disabled="readonly">
            <option :value="null">Selecione...</option>
            <option v-for="tech in techniques" :key="tech.value" :value="tech.value">{{ tech.label }}</option>
          </select>
        </label>
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Mapping / Estilo</p>
          <input type="text" v-model="modelValue.mappingStyle" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-sm transition-colors" placeholder="ex: Gatinho, Boneca" :disabled="readonly" />
        </label>
        <label class="flex flex-col md:col-span-2">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Tamanho / Curvatura / Espessura</p>
          <input type="text" v-model="modelValue.technicalDetails" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-sm transition-colors" placeholder="ex: 8-12mm / C / 0.15" :disabled="readonly" />
        </label>
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

const ocularFields = [
  { id: 'eye_wearsContactLenses', model: 'wearsContactLenses', label: 'Usa lentes de contato?' },
  { id: 'eye_usesEyeDropsRegularly', model: 'usesEyeDropsRegularly', label: 'Usa colírio regularmente?' },
  { id: 'eye_rubsEyesFrequently', model: 'rubsEyesFrequently', label: 'Esfrega os olhos com frequência?' },
  { id: 'eye_hasOcularInfection', model: 'hasOcularInfection', label: 'Infecção ocular recente?' },
  { id: 'eye_sleepsFaceDown', model: 'sleepsFaceDown', label: 'Dorme de lado / bruços?' },
];

const healthFields = [
  { id: 'eye_hasSensitivityOrAllergyToGlue', model: 'hasSensitivityOrAllergyToGlue', label: 'Alergia ou sensibilidade a cola?' },
  { id: 'eye_usesContinuousMedication', model: 'usesContinuousMedication', label: 'Uso de medicação contínua?' },
  { id: 'eye_pregnantOrNursing', model: 'pregnantOrNursing', label: 'Gestante ou lactante?' },
  { id: 'eye_hasAutoimmuneDermatologicalOrOcularDisease', model: 'hasAutoimmuneDermatologicalOrOcularDisease', label: 'Doença autoimune, dermatológica ou ocular?' },
];

const beautyFields = [
  { id: 'eye_usesEyeMakeupDaily', model: 'usesEyeMakeupDaily', label: 'Usa maquiagem nos olhos diariamente?' },
  { id: 'eye_usesCurvexOrWaterproofMascara', model: 'usesCurvexOrWaterproofMascara', label: 'Usa curvex ou rímel à prova d\'água?' },
  { id: 'eye_usesBiphasicOrOilyMakeupRemover', model: 'usesBiphasicOrOilyMakeupRemover', label: 'Usa demaquilante bifásico/oleoso?' },
  { id: 'eye_hadLashPermanentOrTinting', model: 'hadLashPermanentOrTinting', label: 'Fez permanente/tintura de cílios recente?' },
  { id: 'eye_doesFrequentFacialCleansing', model: 'doesFrequentFacialCleansing', label: 'Faz limpeza facial frequente?' },
];

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
