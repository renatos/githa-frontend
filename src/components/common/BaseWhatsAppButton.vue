<template>
  <component
    :is="href ? 'a' : 'button'"
    :[attrName]="href || null"
    :target="href ? '_blank' : null"
    class="inline-flex items-center justify-center transition-all rounded-lg"
    :class="[
      variantClasses,
      sizeClasses,
      label ? 'gap-2 font-medium' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <i 
      class="fa-brands fa-whatsapp flex items-center justify-center" 
      :class="[
        iconSizeClass, 
        !label ? 'translate-y-[-2px]' : ''
      ]"
    ></i>
    <span v-if="label">{{ label }}</span>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  href: { type: String, default: null },
  label: { type: String, default: null },
  size: { type: String, default: 'md', validator: (v) => ['xs', 'sm', 'md', 'lg'].includes(v) },
  variant: { type: String, default: 'primary', validator: (v) => ['primary', 'outline', 'ghost'].includes(v) }
});

defineEmits(['click']);

const attrName = computed(() => props.href ? 'href' : 'type');

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return 'border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-sm';
    case 'ghost':
      return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10';
    default: // primary
      return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/10';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-[30px] h-[30px] text-[10px]';
    case 'sm': return 'px-3 py-1.5 text-xs';
    case 'lg': return 'px-6 py-3 text-base';
    default: return 'px-4 py-2 text-sm';
  }
});

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[18px]';
    case 'sm': return 'text-lg md:text-xl';
    case 'lg': return 'text-2xl';
    default: return 'text-lg md:text-xl';
  }
});
</script>
