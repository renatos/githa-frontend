<template>
  <input
      ref="inputRef"
      type="text"
      inputmode="decimal"
      v-bind="$attrs"
      class="flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 px-3 py-2 text-sm transition-colors"
  />
</template>

<script setup>
import {useCurrencyInput} from 'vue-currency-input'
import {watch} from 'vue'

const props = defineProps({
  modelValue: Number,
  options: Object
})

const {inputRef, setValue} = useCurrencyInput({
  currency: 'BRL',
  autoDecimalDigits: true, // Habilita o preenchimento da direita para a esquerda (cents first)
  ...props.options
})

watch(
    () => props.modelValue,
    (value) => {
      setValue(value)
    }
)
</script>
