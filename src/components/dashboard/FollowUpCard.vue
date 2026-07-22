<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <span>📋</span> Acompanhamento Pós-Procedimento
      </h2>
      <select v-model="statusFilter" class="text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option value="">Todos</option>
        <option v-for="opt in filteredStatusOptions" :key="opt.name" :value="opt.name">{{ opt.description }}</option>
      </select>
    </div>

    <!-- Metrics Summary Section -->
    <div v-if="!loading && !error" class="mb-6">
      <div class="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/15 dark:to-transparent border border-indigo-500/20 dark:border-indigo-500/30 rounded-lg p-3 flex flex-col justify-between">
        <span class="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Acompanhamentos Pendentes</span>
        <span class="text-lg font-bold text-indigo-700 dark:text-indigo-300 mt-1">
          {{ pendingCount }} {{ pendingCount === 1 ? 'pendente' : 'pendentes' }}
        </span>
        <span class="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
          {{ pendingCount === 1 ? '1 procedimento aguardando contato' : `${pendingCount} procedimentos aguardando contato` }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando acompanhamentos...
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center py-8">
      <button class="text-sm text-red-500 hover:text-red-400 transition-colors" @click="fetchFollowUps">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="reminders.length === 0" class="flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum acompanhamento pendente.
    </div>

    <div v-else class="space-y-2 overflow-y-auto pr-2" style="max-height: 20rem;">
      <div
        v-for="(reminder, index) in reminders"
        :key="reminder.id"
        class="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded transition-colors"
        :class="{ 'border-b border-gray-100 dark:border-slate-700/50': index < reminders.length - 1 }"
        @click="openForm(reminder)"
      >
        <div class="flex flex-col">
            <span class="font-medium text-gray-800 dark:text-white flex items-center gap-1.5">
              {{ reminder.client?.name }}
            </span>
            <span class="text-xs text-gray-500 dark:text-slate-400">{{ reminder.service?.name }}</span>
            <span v-if="reminder.lastAppointmentDate" class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Há {{ getDaysAgo(reminder.lastAppointmentDate) }} dias
            </span>
        </div>

        <div class="flex items-center">
            <StatusBadge :status="reminder.status" :status-map="followUpStatusMap" />
        </div>
      </div>
    </div>

    <ReminderForm 
      v-if="selectedReminder" 
      :reminder="selectedReminder" 
      @close="selectedReminder = null" 
      @save="onSaved" 
      @open-client="(client) => $emit('select-client', client)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, computed } from 'vue';
import { listReminders } from '../../services/reminderService';
import ReminderForm from './ReminderForm.vue';
import StatusBadge from '../common/StatusBadge.vue';
import { enumService } from '../../services/enumService';

defineEmits(['select-client']);

const props = defineProps({
    serviceId: {
        type: Number,
        default: null
    }
});

const loading = ref(true);
const error = ref(false);
const allFollowUps = ref([]);
const statusFilter = ref('NEW');
const selectedReminder = ref(null);
const statusFilterOptions = ref([]);

const followUpStyles = {
    NEW: { badge: 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30', dot: 'bg-green-500' },
    NOTIFIED: { badge: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30', dot: 'bg-yellow-500' },
    DECLINED: { badge: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30', dot: 'bg-red-500' },
    NO_CONTACT: { badge: 'bg-gray-50 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30', dot: 'bg-gray-500' }
};

const filteredStatusOptions = computed(() => {
    return statusFilterOptions.value.filter(opt => opt.name !== 'SCHEDULED' && opt.name !== 'CONVERTED');
});

const followUpStatusMap = computed(() => {
    const map = {};
    statusFilterOptions.value.forEach(opt => {
        map[opt.name] = {
            label: opt.description,
            ...(followUpStyles[opt.name] || followUpStyles.NO_CONTACT)
        };
    });
    return map;
});

const reminders = computed(() => {
    if (!statusFilter.value) {
        return allFollowUps.value;
    }
    return allFollowUps.value.filter(r => r.status === statusFilter.value);
});

const pendingCount = computed(() => {
    return allFollowUps.value.filter(r => r.status === 'NEW' || r.status === 'NOTIFIED').length;
});

const getDaysAgo = (dateStr) => {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const loadStatusOptions = async () => {
    statusFilterOptions.value = await enumService.getOptions('ReminderStatus');
};

const fetchFollowUps = async () => {
    loading.value = true;
    error.value = false;
    try {
        const data = await listReminders(null, props.serviceId, 'FOLLOW_UP');
        allFollowUps.value = data || [];
    } catch(e) {
        error.value = true;
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const openForm = (reminder) => {
    selectedReminder.value = reminder;
};

const onSaved = () => {
    selectedReminder.value = null;
    fetchFollowUps();
};

onMounted(() => {
    loadStatusOptions();
    fetchFollowUps();
    window.addEventListener('client-updated', fetchFollowUps);
});

onUnmounted(() => {
    window.removeEventListener('client-updated', fetchFollowUps);
});
</script>
