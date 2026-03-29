<script setup>
import { computed } from 'vue';
import { confirmBridge } from '../../services/confirmBridge';
import BaseModal from './BaseModal.vue';
import { AlertTriangle, AlertCircle, Info, Check } from 'lucide-vue-next';

const state = confirmBridge.state;

const iconMap = {
    info: { component: Info, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    warning: { component: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    danger: { component: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' }
};

const currentTheme = computed(() => iconMap[state.type] || iconMap.info);

const handleConfirm = () => {
    confirmBridge.close(true);
};

const handleCancel = () => {
    confirmBridge.close(false);
};
</script>

<template>
    <BaseModal
        :show="state.show"
        title=""
        max-width="max-w-md"
        :body-padding="false"
        :z-index="10001"
        @close="handleCancel"
    >
        <div class="p-6">
            <div class="flex flex-col items-center text-center gap-4">
                <div :class="['p-3 rounded-full', currentTheme.bg]">
                    <component :is="currentTheme.component" :size="32" :class="currentTheme.color" stroke-width="2.5" />
                </div>
                
                <div class="space-y-2">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-slate-100">{{ state.title }}</h3>
                    <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                        {{ state.message }}
                    </p>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex items-center gap-3 w-full">
                <button 
                    v-if="state.cancelLabel"
                    class="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
                    @click="handleCancel"
                >
                    {{ state.cancelLabel }}
                </button>
                <button 
                    class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-95"
                    :class="[
                        state.type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 dark:shadow-none' : 
                        state.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200 dark:shadow-none' : 
                        'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none'
                    ]"
                    @click="handleConfirm"
                >
                    {{ state.confirmLabel }}
                </button>
            </div>
        </template>
    </BaseModal>
</template>
