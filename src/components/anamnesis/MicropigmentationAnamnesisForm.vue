<template>
  <div class="flex flex-col gap-6">
    
    <!-- Tipo de Procedimento -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🖌</span> Tipo de Procedimento
      </h3>
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <label 
            v-for="procType in procedureTypes" 
            :key="procType.name" 
            class="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all select-none border"
            :class="[
              modelValue.procedureTypes && modelValue.procedureTypes.includes(procType.name)
                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-600 font-medium'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
              readonly ? 'opacity-70 cursor-not-allowed' : ''
            ]"
          >
            <input 
              v-model="internalProcedureTypes" 
              type="checkbox" 
              :value="procType.name"
              :disabled="readonly"
              class="hidden"
            />
            {{ procType.description }}
          </label>
        </div>
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Expectativa com o Procedimento</p>
          <textarea 
            v-model="modelValue.procedureExpectation" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-sm font-normal leading-normal transition-colors resize-y min-h-[60px]"
            rows="2"
            :disabled="readonly"
          ></textarea>
        </label>
      </div>
    </div>

    <!-- Avaliação de Saúde -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>⚠️</span> Avaliação de Saúde Clínica
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
v-for="field in healthFields" :key="field.key"
             class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue[field.key] ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">{{ field.label }}</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input :id="'mic_' + field.key" v-model="modelValue[field.key]" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>
      </div>
    </div>

    <!-- Histórico Estético -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🕒</span> Histórico Estético
      </h3>
      
      <div class="flex flex-col gap-3">
        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.firstMicropigmentation ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Primeira vez fazendo micropigmentação nesta região?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="mic_firstMicropigmentation" v-model="firstTimeComputed" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>

        <div v-if="!modelValue.firstMicropigmentation" class="ml-4 pl-4 border-l-2 border-indigo-500 flex flex-col gap-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="flex flex-col">
              <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Qual técnica anterior?</p>
              <input
v-model="modelValue.previousTechnique" type="text" 
                     class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                     :disabled="readonly" />
            </label>
            <label class="flex flex-col">
              <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Data aprox. do procedimento anterior?</p>
              <input
v-model="modelValue.previousProcedureDate" type="date" 
                     class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                     :disabled="readonly" />
            </label>
          </div>
          <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
               :class="modelValue.hadComplicationsInPrevious ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Houve alguma complicação prévia?</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
              <input id="mic_hadComplicationsInPrevious" v-model="modelValue.hadComplicationsInPrevious" class="invisible absolute" type="checkbox" :disabled="readonly"/>
            </label>
          </div>
          <textarea
v-if="modelValue.hadComplicationsInPrevious" v-model="modelValue.complicationsDetails" 
                    class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 px-3 py-2 text-sm transition-shadow resize-y min-h-[60px]" 
                    rows="2" :disabled="readonly" placeholder="Detalhes da complicação/insatisfação"></textarea>
        </div>
      </div>
    </div>

    <!-- Orientações Informativas -->
    <div class="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700">
      <h3 class="flex items-center gap-2 text-sky-700 dark:text-sky-300 text-base font-semibold mb-4 pb-2 border-b border-sky-200 dark:border-sky-700">
        <span>ℹ️</span> Orientações e Cuidados Pré e Pós
      </h3>
      <div class="text-sm text-sky-800 dark:text-sky-200 leading-relaxed space-y-2">
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
