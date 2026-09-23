<template>
  <div
    class="flex items-center py-1"
    :class="[
      wrap ? 'flex-wrap gap-1.5' : 'gap-1.5 overflow-x-auto no-scrollbar'
    ]"
  >
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="inline-flex items-center rounded-full border font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0"
      :class="[
        size === 'xs' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        modelValue === item.value
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
      ]"
      @click="$emit('update:modelValue', item.value)"
    >
      <span
        v-if="item.dotColor"
        class="rounded-full shrink-0"
        :class="[
          item.dotColor,
          size === 'xs' ? 'w-1.5 h-1.5 mr-1' : 'w-2 h-2 mr-1.5'
        ]"
      ></span>
      <span>{{ item.label }}</span>
      <span
        v-if="item.count !== undefined && item.count !== null"
        class="rounded-full font-bold"
        :class="[
          size === 'xs' ? 'ml-1 text-[9px] px-1 py-0.2' : 'ml-1.5 text-[10px] px-1.5 py-0.2',
          modelValue === item.value
            ? 'bg-indigo-700 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
        ]"
      >
        {{ item.count }}
      </span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  items: {
    type: Array,
    required: true
    // Array of { label: string, value: any, dotColor?: string, count?: number }
  },
  wrap: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'sm',
    validator: (v) => ['xs', 'sm'].includes(v)
  }
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
