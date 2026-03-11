<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Gênero</p>
      <select
        v-model="form.personalData.gender"
        class="form-select flex w-full max-w-full truncate resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
      >
        <option :value="null">Selecione</option>
        <option v-for="gender in genders" :key="gender.name" :value="gender.name">
          {{ gender.description }}
        </option>
      </select>
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Objetivo Principal</p>
      <select
        v-model="form.personalData.primaryObjective"
        class="form-select flex w-full max-w-full truncate resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        :class="{ 'mb-2': form.personalData.primaryObjective === 'OTHER' }"
      >
        <option :value="null">Selecione o objetivo</option>
        <option v-for="objective in primaryObjectives" :key="objective.name" :value="objective.name">
          {{ objective.description }}
        </option>
      </select>
      <input
        v-if="form.personalData.primaryObjective === 'OTHER'"
        v-model="form.personalData.primaryObjectiveOtherDetails"
        class="form-input flex w-full resize-none overflow-hidden mt-3 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        type="text"
        placeholder="Descreva qual o objetivo principal"
      />
    </label>

    <label class="flex flex-col md:col-span-2">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Endereço Completo</p>
      <input
        v-model="form.personalData.address"
        class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        type="text"
        placeholder="Insira o endereço completo"
      />
    </label>
  </div>
</template>

<script setup>
defineProps({
  form: { type: Object, required: true },
  genders: { type: Array, default: () => [] },
  primaryObjectives: { type: Array, default: () => [] },
});
</script>
