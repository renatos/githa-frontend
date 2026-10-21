import { ref, computed, onMounted, onUnmounted } from 'vue';

const MOBILE_MAX_WIDTH = 639; // Tailwind < sm (640px)
const TABLET_MAX_WIDTH = 1023; // Tailwind < lg (1024px)

const getInitialWidth = () => {
  if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth > 0) {
    return window.innerWidth;
  }
  return 1280;
};

const viewportWidth = ref(getInitialWidth());
let activeSubscribers = 0;
let resizeHandler = null;

/**
 * Allows programmatic override of viewport width (useful for unit tests).
 * @param {number} width
 */
export function setViewportWidth(width) {
  viewportWidth.value = width;
}

/**
 * Reactive composable for screen breakpoint detection and dynamic responsive labels.
 */
export function useBreakpoint() {
  const updateWidth = () => {
    if (typeof window !== 'undefined' && typeof window.innerWidth === 'number' && window.innerWidth > 0) {
      viewportWidth.value = window.innerWidth;
    }
  };

  onMounted(() => {
    updateWidth();
    if (activeSubscribers === 0 && typeof window !== 'undefined') {
      resizeHandler = () => updateWidth();
      window.addEventListener('resize', resizeHandler, { passive: true });
    }
    activeSubscribers++;
  });

  onUnmounted(() => {
    activeSubscribers = Math.max(0, activeSubscribers - 1);
    if (activeSubscribers === 0 && resizeHandler && typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
  });

  const isMobile = computed(() => viewportWidth.value <= MOBILE_MAX_WIDTH);
  const isTablet = computed(
    () => viewportWidth.value > MOBILE_MAX_WIDTH && viewportWidth.value <= TABLET_MAX_WIDTH
  );
  const isDesktop = computed(() => viewportWidth.value > TABLET_MAX_WIDTH);

  /**
   * Returns a dynamic label according to the current screen size.
   * @param {string} desktopLabel - Full label for tablet/desktop (>= 640px)
   * @param {string} mobileLabel - Compact label for mobile (< 640px)
   */
  const rLabel = (desktopLabel, mobileLabel) => {
    return isMobile.value ? mobileLabel : desktopLabel;
  };

  /**
   * Dynamically truncates labels according to the current screen size (ideal for Chart.js axes).
   * @param {string} text
   * @param {number} [mobileMax=15]
   * @param {number} [desktopMax=36]
   */
  const truncateLabel = (text, mobileMax = 15, desktopMax = 36) => {
    if (!text) return '';
    const maxLen = isMobile.value ? mobileMax : desktopMax;
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen - 1).trimEnd() + '…';
  };

  return {
    viewportWidth,
    isMobile,
    isTablet,
    isDesktop,
    rLabel,
    truncateLabel,
    setViewportWidth
  };
}
