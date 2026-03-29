<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { toastBridge } from '../../services/toastBridge';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-vue-next';

const toasts = ref([]);
let toastId = 0;

const addToast = (toast) => {
    const id = toastId++;
    const newToast = {
        id,
        severity: toast.severity || 'info', 
        summary: toast.summary || '',
        detail: toast.detail || '',
        life: toast.life || 3000
    };
    toasts.value.push(newToast);

    if (newToast.life > 0) {
        setTimeout(() => {
            removeToast(id);
        }, newToast.life);
    }
};

const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
};

const getIcon = (severity) => {
    switch (severity) {
        case 'success': return CheckCircle2;
        case 'error': return AlertCircle;
        case 'warn': return AlertTriangle;
        default: return Info;
    }
};

const getSeverityClasses = (severity) => {
    switch (severity) {
        case 'success': 
            return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800';
        case 'error': 
            return 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800';
        case 'warn': 
            return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
        default: 
            return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800';
    }
};

const getIconClasses = (severity) => {
    switch (severity) {
        case 'success': return 'text-emerald-500 dark:text-emerald-400';
        case 'error': return 'text-rose-500 dark:text-rose-400';
        case 'warn': return 'text-amber-500 dark:text-amber-400';
        default: return 'text-sky-500 dark:text-sky-400';
    }
};

onMounted(() => {
    toastBridge.setToast({
        add: addToast
    });
});

onUnmounted(() => {
    toastBridge.setToast(null);
});
</script>

<template>
    <div class="fixed top-4 right-4 z-[10002] flex flex-col gap-3 pointer-events-none min-w-[320px] max-w-full">
        <TransitionGroup name="toast">
            <div 
                v-for="toast in toasts" 
                :key="toast.id"
                class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300"
                :class="getSeverityClasses(toast.severity)"
            >
                <div class="shrink-0 mt-0.5" :class="getIconClasses(toast.severity)">
                    <component :is="getIcon(toast.severity)" :size="20" stroke-width="2.5" />
                </div>
                
                <div class="flex-1 min-w-0">
                    <h4 v-if="toast.summary" class="text-sm font-bold leading-tight">{{ toast.summary }}</h4>
                    <p v-if="toast.detail" class="text-xs mt-1 leading-normal opacity-90">{{ toast.detail }}</p>
                </div>

                <button 
                    class="shrink-0 rounded-lg p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    @click="removeToast(toast.id)"
                >
                    <X :size="16" class="opacity-50" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-enter-from {
    opacity: 0;
    transform: translateX(30px) scale(0.95);
}
.toast-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
.toast-leave-active {
    position: absolute;
}
</style>
