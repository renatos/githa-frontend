<template>
  <div v-if="tags && tags.length > 0" class="flex flex-wrap gap-2">
    <span
      v-for="(tag, idx) in tags"
      :key="idx"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/50"
    >
      <span v-if="tag.label" class="text-slate-400 dark:text-slate-500 font-normal">
        {{ tag.label }}:
      </span>
      <span class="font-semibold">{{ tag.value }}</span>
    </span>
  </div>
</template>

<script setup>
defineProps({
  tags: {
    type: Array,
    default: () => []
  }
});
</script>
