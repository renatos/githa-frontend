<template>
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div 
        v-if="tooltipState.visible"
        ref="tooltipEl"
        class="fixed z-[9999] pointer-events-none"
        :style="computedStyle"
      >
        <!-- Adding mb-2 inside to ensure spacing above the trigger element -->
        <div class="mb-2 bg-slate-900 dark:bg-slate-700 text-white text-[11px] px-3 py-2 rounded-lg shadow-2xl border border-slate-700 max-w-[260px] whitespace-normal text-center leading-relaxed">
          <div class="flex items-center justify-center gap-1.5 font-medium">
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
import { ref, computed, watch, nextTick } from 'vue';
import { useTooltip } from '../../composables/useTooltip';

const { tooltipState } = useTooltip();
const tooltipEl = ref(null);
const translateX = ref('-50%');

watch(() => tooltipState.value.visible, async (isVisible) => {
  if (isVisible) {
    translateX.value = '-50%'; // Reset for initial measurement
    await nextTick();
    if (tooltipEl.value) {
      const rect = tooltipEl.value.getBoundingClientRect();
      const padding = 12; // safety margin from screen edges
      
      if (rect.right > window.innerWidth - padding) {
        const overflow = rect.right - (window.innerWidth - padding);
        translateX.value = `calc(-50% - ${overflow}px)`;
      } else if (rect.left < padding) {
        const underflow = padding - rect.left;
        translateX.value = `calc(-50% + ${underflow}px)`;
      }
    }
  }
});

const computedStyle = computed(() => {
  return {
    left: `${tooltipState.value.x}px`,
    top: `${tooltipState.value.y}px`,
    transform: `translate(${translateX.value}, -100%)`
  };
});
</script>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translate(v-bind(translateX), -80%);
}
</style>
