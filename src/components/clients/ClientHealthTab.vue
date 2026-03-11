<template>
  <div class="p-2 grid grid-cols-1 gap-4">

    <!-- Toggle Item component used inline for each condition -->
    <HealthToggle
      v-model="form.healthConditions.pregnantOrNursing"
      label="Está grávida ou amamentando?"
    />

    <HealthToggle
      v-model="form.healthConditions.hasAllergies"
      label="Possui alergias conhecidas?"
    >
      <template #details>
        <input
          v-if="form.healthConditions.hasAllergies"
          v-model="form.healthConditions.allergiesDetails"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow"
          type="text"
          placeholder="Descreva as alergias..."
        />
      </template>
    </HealthToggle>

    <HealthToggle
      v-model="form.healthConditions.hasSkinConditions"
      label="Possui problemas de pele (rosácea, dermatite, psoríase, etc.)?"
    >
      <template #details>
        <input
          v-if="form.healthConditions.hasSkinConditions"
          v-model="form.healthConditions.skinConditionsDetails"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow"
          type="text"
          placeholder="Quais?"
        />
      </template>
    </HealthToggle>

    <HealthToggle
      v-model="form.healthConditions.hasChronicConditions"
      label="Tem diabetes, hipertensão ou outra condição crônica?"
    />

    <HealthToggle
      v-model="form.healthConditions.usesContinuousMedication"
      label="Faz uso de medicamentos contínuos?"
    >
      <template #details>
        <input
          v-if="form.healthConditions.usesContinuousMedication"
          v-model="form.healthConditions.continuousMedicationDetails"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow"
          type="text"
          placeholder="Quais?"
        />
      </template>
    </HealthToggle>

    <HealthToggle
      v-model="form.healthConditions.usesAcidsOrAntibiotics"
      label="Está usando ácidos, antibióticos ou isotretinoína (Roacutan)?"
    >
      <template #details>
        <input
          v-if="form.healthConditions.usesAcidsOrAntibiotics"
          v-model="form.healthConditions.acidsOrAntibioticsDetails"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow"
          type="text"
          placeholder="Quais?"
        />
      </template>
    </HealthToggle>

    <HealthToggle
      v-model="form.healthConditions.hadRecentProcedures"
      label="Realizou cirurgias ou procedimentos estéticos recentes?"
    >
      <template #details>
        <input
          v-if="form.healthConditions.hadRecentProcedures"
          v-model="form.healthConditions.recentProceduresDetails"
          class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow"
          type="text"
          placeholder="Quais?"
        />
      </template>
    </HealthToggle>
  </div>
</template>

<script setup>
import HealthToggle from './HealthToggle.vue';

defineProps({
  form: { type: Object, required: true },
});
</script>
