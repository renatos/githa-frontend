<template>
  <div class="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
    <div class="flex flex-wrap px-4 md:px-6 gap-1 md:gap-6">
      <a
        v-for="(tab, index) in tabs"
        :key="index"
        :title="tab.disabled ? disabledTitle : ''"
        :class="[
          tab.disabled
            ? 'border-b-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            : modelValue === index
              ? 'border-b-indigo-600 text-slate-900 dark:text-slate-100'
              : 'border-b-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
          'flex items-center justify-center border-b-[3px] px-3 md:px-1 pb-3 pt-4 transition-colors whitespace-nowrap',
          tab.disabled ? '' : 'cursor-pointer',
        ]"
        @click.prevent="!tab.disabled && $emit('update:modelValue', index)"
      >
        <p class="text-xs md:text-sm font-bold leading-normal tracking-[0.015em] flex items-center gap-1">
          <span v-if="tab.icon" class="material-symbols-outlined text-[16px]">{{ tab.icon }}</span>
          {{ tab.label }}
          <span v-if="tab.disabled" class="material-symbols-outlined text-[14px]">lock</span>
        </p>
      </a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Array of tab objects: { label: String, disabled?: Boolean, icon?: String }
   */
  tabs: {
    type: Array,
    required: true,
  },
  /**
   * The index of the currently active tab (v-model).
   */
  modelValue: {
    type: Number,
    default: 0,
  },
  /**
   * Tooltip shown when hovering a disabled tab.
   */
  disabledTitle: {
    type: String,
    default: 'Salve o registro primeiro para acessar esta aba',
  },
});

defineEmits(['update:modelValue']);
</script>
