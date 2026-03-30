<template>
  <div class="hidden z-50 pointer-events-none">
    <div class="bg-slate-900 dark:bg-slate-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
      <div class="flex items-center gap-1.5 font-medium">
        <span v-if="icon" class="material-symbols-outlined text-xs text-rose-400">{{ icon }}</span>
        <slot>{{ text }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '' },
  icon: { type: String, default: 'info' }
});
</script>
