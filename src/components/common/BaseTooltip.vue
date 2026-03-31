<template>
  <span ref="tooltipRef" class="hidden"></span>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTooltip } from '../../composables/useTooltip';

const props = defineProps({
  text: { type: String, default: '' },
  icon: { type: String, default: 'info' }
});

const tooltipRef = ref(null);
let parentEl = null;
const { showTooltip, hideTooltip } = useTooltip();

const handleMouseEnter = () => {
  if (!parentEl) return;
  const rect = parentEl.getBoundingClientRect();
  // We want the tooltip to appear centered above the hovered element
  const x = rect.left + (rect.width / 2);
  const y = rect.top; // The global tooltip will use translateY(-100%) to sit above this coordinate
  showTooltip(props.text, x, y, props.icon);
};

onMounted(() => {
  if (tooltipRef.value) {
    parentEl = tooltipRef.value.parentElement;
    if (parentEl) {
      parentEl.addEventListener('mouseenter', handleMouseEnter);
      parentEl.addEventListener('mouseleave', hideTooltip);
    }
  }
});

onUnmounted(() => {
  if (parentEl) {
    parentEl.removeEventListener('mouseenter', handleMouseEnter);
    parentEl.removeEventListener('mouseleave', hideTooltip);
  }
});
</script>
