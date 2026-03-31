<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div 
        v-if="tooltipState.visible"
        class="fixed z-[9999] pointer-events-none"
        :style="{
          left: `${tooltipState.x}px`,
          top: `${tooltipState.y}px`,
          transform: 'translate(-50%, -100%)'
        }"
      >
        <!-- Adding mb-2 inside to ensure spacing above the trigger element -->
        <div class="mb-2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
          <div class="flex items-center gap-1.5 font-medium">
            <span v-if="tooltipState.icon" class="material-symbols-outlined text-xs text-rose-400">
              {{ tooltipState.icon }}
            </span>
            <span>{{ tooltipState.text }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useTooltip } from '../../composables/useTooltip';

const { tooltipState } = useTooltip();
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -90%);
}
</style>
