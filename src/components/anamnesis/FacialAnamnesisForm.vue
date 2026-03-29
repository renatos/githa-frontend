<template>
  <div class="flex flex-col gap-6">
    <!-- Dados da Cliente -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>👩</span> Dados da Cliente
      </h3>
      <div class="flex flex-col gap-4">
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Queixa Principal / Motivo da Consulta</p>
          <textarea 
            v-model="modelValue.chiefComplaint" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-sm font-normal leading-normal transition-colors resize-y min-h-[60px]"
            rows="2"
            :disabled="readonly"
          ></textarea>
        </label>
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Profissão</p>
          <input 
            v-model="modelValue.profession" 
            type="text" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-sm font-normal leading-normal transition-colors"
            :disabled="readonly"
          />
        </label>
      </div>
    </div>

    <!-- Rotina de Cuidados -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🧴</span> Rotina de Cuidados
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.usesSunscreenDaily ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Usa protetor solar diariamente?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_usesSunscreenDaily" v-model="modelValue.usesSunscreenDaily" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>
        
        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.usesMakeupFrequently ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Usa maquiagem com frequência?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_usesMakeupFrequently" v-model="modelValue.usesMakeupFrequently" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>
        
        <div
class="flex flex-col gap-2 p-3 rounded-lg transition-colors border md:col-span-2"
             :class="modelValue.usesAcidsOrManipulatedCosmetics ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <div class="flex items-center justify-between gap-4">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Faz uso de cosméticos/ácidos?</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
              <input id="fac_usesAcidsOrManipulatedCosmetics" v-model="modelValue.usesAcidsOrManipulatedCosmetics" class="invisible absolute" type="checkbox" :disabled="readonly"/>
            </label>
          </div>
          <input
v-if="modelValue.usesAcidsOrManipulatedCosmetics" v-model="modelValue.acidsOrCosmeticsDetails" type="text" 
                 class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                 :disabled="readonly" placeholder="Quais cosméticos/ácidos?" />
        </div>
      </div>
    </div>

    <!-- Histórico de Saúde -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>⚠️</span> Histórico Clínico e Saúde
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div
class="flex flex-col gap-2 p-3 rounded-lg transition-colors border"
             :class="modelValue.hasDiabetesHypertensionOrAutoimmune ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <div class="flex items-center justify-between gap-4">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Diabetes, hipertensão ou doença autoimune?</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
              <input id="fac_hasDiabetesHypertensionOrAutoimmune" v-model="modelValue.hasDiabetesHypertensionOrAutoimmune" class="invisible absolute" type="checkbox" :disabled="readonly"/>
            </label>
          </div>
          <input
v-if="modelValue.hasDiabetesHypertensionOrAutoimmune" v-model="modelValue.diabetesHypertensionAutoimmuneDetails" type="text" 
                 class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                 :disabled="readonly" placeholder="Quais alterações?" />
        </div>

        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.usesAnticoagulants ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Faz uso de anticoagulantes?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_usesAnticoagulants" v-model="modelValue.usesAnticoagulants" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>

        <div
class="flex flex-col gap-2 p-3 rounded-lg transition-colors border"
             :class="modelValue.hadPreviousFacialProcedures ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <div class="flex items-center justify-between gap-4">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Procedimentos faciais anteriores?</p>
            <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
              <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
              <input id="fac_hadPreviousFacialProcedures" v-model="modelValue.hadPreviousFacialProcedures" class="invisible absolute" type="checkbox" :disabled="readonly"/>
            </label>
          </div>
          <input
v-if="modelValue.hadPreviousFacialProcedures" v-model="modelValue.previousFacialProceduresDetails" type="text" 
                 class="form-input flex w-full rounded-md text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-1 focus:ring-indigo-600 h-10 px-3 text-sm transition-shadow" 
                 :disabled="readonly" placeholder="Quais procedimentos?" />
        </div>
        
        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.usesFacialSoap ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Usa sabonete facial?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_usesFacialSoap" v-model="modelValue.usesFacialSoap" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>

        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.usesMoisturizer ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Usa hidratante?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_usesMoisturizer" v-model="modelValue.usesMoisturizer" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>

        <div
class="flex items-center justify-between gap-4 p-3 rounded-lg transition-colors border"
             :class="modelValue.smoker ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Fumante?</p>
          <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors shrink-0">
            <div class="h-4 w-4 rounded-full bg-white shadow-sm"></div>
            <input id="fac_smoker" v-model="modelValue.smoker" class="invisible absolute" type="checkbox" :disabled="readonly"/>
          </label>
        </div>
      </div>
    </div>

    <!-- Avaliação Profissional -->
    <div class="p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <h3 class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-base font-semibold mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <span>🔍</span> Avaliação Profissional
      </h3>
      
      <div class="flex flex-col gap-4">
        <div>
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Tipos e Características da Pele</p>
          <div class="flex flex-wrap gap-2">
            <label 
              v-for="skinType in skinTypes" 
              :key="skinType.name" 
              class="px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all select-none border"
              :class="[
                modelValue.skinTypes && modelValue.skinTypes.includes(skinType.name)
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-400 dark:border-indigo-600 font-medium'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600',
                readonly ? 'opacity-70 cursor-not-allowed' : ''
              ]"
            >
              <input 
                v-model="internalSkinTypes" 
                type="checkbox" 
                :value="skinType.name"
                :disabled="readonly"
                class="hidden"
              />
              {{ skinType.description }}
            </label>
          </div>
        </div>

        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Tratamentos Sugeridos</p>
          <textarea 
            v-model="modelValue.suggestedTreatments" 
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-3 text-sm font-normal leading-normal transition-colors resize-y min-h-[60px]"
            rows="2"
            :disabled="readonly"
          ></textarea>
        </label>
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
