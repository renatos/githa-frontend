<template>
  <input
    :value="displayValue"
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
import { computed } from 'vue';

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
  let digits = String(value).replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }
  digits = digits.substring(0, 11);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  if (digits.length <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
};

const displayValue = computed(() => formatPhone(props.modelValue));

const onInput = (event) => {
  let digits = event.target.value.replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }
  digits = digits.substring(0, 11);

  event.target.value = formatPhone(digits);
  emit('update:modelValue', digits);
};
</script>
