<!--
  HealthToggle.vue — a reusable toggle row used inside ClientHealthTab.
  Accepts:
    - modelValue (Boolean): whether the condition is active
    - label (String): the question text
  Provides a named slot #details for expanding content when toggle is ON.
-->
<template>
  <div
    class="flex flex-col gap-3 p-4 rounded-lg transition-colors border"
    :class="modelValue
      ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 border-l-4 border-l-indigo-600'
      : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'"
  >
    <div class="flex items-center justify-between gap-4">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">{{ label }}</p>
      <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
        <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
        <input
          class="invisible absolute"
          type="checkbox"
          :checked="modelValue"
          @change="$emit('update:modelValue', $event.target.checked)"
        />
      </label>
    </div>
    <div v-if="modelValue" class="w-full mt-1">
      <slot name="details" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  label: { type: String, required: true },
});

defineEmits(['update:modelValue']);
</script>
