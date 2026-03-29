<template>
  <Teleport to="body">
    <!-- Backdrop Transition -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
v-if="show" 
           class="fixed inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
           :style="{ zIndex: zIndex }">
        
        <!-- Modal Backdrop Click Area -->
        <div class="absolute inset-0" @click="closeOnBackdrop && $emit('close')"></div>

        <!-- Modal Container Transition -->
        <Transition
          appear
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div 
            v-if="show"
            class="relative bg-[var(--color-bg-card)] dark:bg-slate-800 rounded-xl shadow-xl w-full flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden"
            :class="[maxWidth, hFull ? 'h-full md:h-auto max-h-screen md:max-h-[90vh]' : 'max-h-[90vh]']"
          >
            <!-- Modal Header -->
            <header class="shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-[var(--color-bg-body)] dark:bg-slate-800/50">
              <div class="flex items-center gap-4 min-w-0">
                <slot name="header-content">
                  <div v-if="icon" class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
                    <i :class="[icon, 'text-indigo-600 dark:text-indigo-400 text-lg']"></i>
                  </div>
                  <div class="min-w-0">
                    <h2 v-if="title" class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
                      {{ title }}
                    </h2>
                    <p v-if="subtitle" class="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">
                      {{ subtitle }}
                    </p>
                  </div>
                </slot>
              </div>
              <button 
                type="button" 
                class="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors shrink-0"
                @click="$emit('close')"
              >
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </header>

            <!-- Sub-header (e.g. Tabs) -->
            <div v-if="$slots['sub-header']" class="shrink-0 border-b border-slate-200 dark:border-slate-700">
              <slot name="sub-header"></slot>
            </div>

            <!-- Modal Content & Forms -->
            <div class="flex-1 flex flex-col min-h-0">
              <div 
                class="overflow-y-auto flex-1 bg-transparent dark:bg-slate-900/5 custom-scrollbar"
                :class="bodyPadding ? 'p-6 md:p-8' : ''"
              >
                <slot></slot>
              </div>
              
              <!-- Modal Footer -->
              <footer v-if="$slots.footer" class="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-[var(--color-bg-body)] dark:bg-slate-800 mt-auto flex-shrink-0">
                <slot name="footer"></slot>
              </footer>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  maxWidth: { type: String, default: 'max-w-lg' }, // e.g., max-w-lg, max-w-2xl, max-w-4xl
  closeOnBackdrop: { type: Boolean, default: true },
  hFull: { type: Boolean, default: false }, // If true, takes more height on mobile
  bodyPadding: { type: Boolean, default: true },
  zIndex: { type: Number, default: 9999 }
});

const emit = defineEmits(['close']);

// Handle ESC key
const handleEsc = (e) => {
  if (e.key === 'Escape' && props.show) {
    emit('close');
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEsc);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEsc);
});

// Prevent body scroll when modal is open
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, { immediate: true });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-200 dark:bg-slate-700 rounded-full;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-300 dark:bg-slate-600;
}
</style>
