<template>
  <input
    :value="modelValue"
    v-bind="$attrs"
    class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
    :class="{ 'disabled:opacity-60 cursor-not-allowed': disabled }"
    :disabled="disabled"
    maxlength="15"
    placeholder="(DD) 99999-9999"
    type="tel"
    inputmode="tel"
    @input="onInput"
  />
</template>

<script setup>
defineOptions({ inheritAttrs: false });

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const formatPhone = (value) => {
  if (!value) return '';
  // Strip all non-digit characters
  const digits = value.replace(/\D/g, '').substring(0, 11);

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
};

const onInput = (event) => {
  const formatted = formatPhone(event.target.value);
  event.target.value = formatted;
  emit('update:modelValue', formatted);
};
</script>
