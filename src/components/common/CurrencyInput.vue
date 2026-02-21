<template>
  <InputText
      ref="inputRef"
      type="text"
      inputmode="decimal"
      v-bind="$attrs"
  />
</template>

<script setup>
import {useCurrencyInput} from 'vue-currency-input'
import {watch} from 'vue'
import InputText from 'primevue/inputtext'

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
