<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white m-0 flex items-center gap-3">
        <span v-if="icon" class="material-symbols-outlined text-2xl text-indigo-600">{{ icon }}</span>
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1 italic">
        {{ subtitle }}
      </p>
    </div>

    <div v-if="$slots.actions" class="flex items-center gap-3 flex-wrap">
      <slot name="actions"></slot>
    </div>
  </header>
</template>
