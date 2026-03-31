import { ref } from 'vue';

const tooltipState = ref({
  visible: false,
  text: '',
  icon: '',
  x: 0,
  y: 0
});

export function useTooltip() {
  const showTooltip = (text, x, y, icon = 'info') => {
    tooltipState.value = {
      visible: true,
      text,
      icon,
      x,
      y
    };
  };

  const hideTooltip = () => {
    tooltipState.value.visible = false;
  };

  return {
    tooltipState,
    showTooltip,
    hideTooltip
  };
}
