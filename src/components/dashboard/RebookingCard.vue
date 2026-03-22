<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col h-full">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <span>🔄</span> Smart Rebooking
      </h2>
      <select v-model="statusFilter" @change="fetchReminders" class="text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option value="">Todos</option>
        <option value="NEW">Novos</option>
        <option value="NOTIFIED">Notificados</option>
        <option value="SCHEDULED">Agendados</option>
        <option value="DECLINED">Recusados</option>
      </select>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button @click="fetchReminders" class="text-sm text-red-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="reminders.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum lembrete pendente.
    </div>

    <div v-else class="space-y-4 flex-1 overflow-y-auto pr-2" style="max-height: 20rem;">
      <div
        v-for="(reminder, index) in reminders"
        :key="reminder.id"
        class="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded transition-colors"
        :class="{ 'border-b border-gray-100 dark:border-slate-700/50': index < reminders.length - 1 }"
        @click="openForm(reminder)"
      >
        <div class="flex flex-col">
            <span class="font-medium text-gray-800 dark:text-white">{{ reminder.client?.name }}</span>
            <span class="text-xs text-gray-500 dark:text-slate-400">{{ reminder.service?.name }}</span>
        </div>
        <StatusBadge :status="reminder.status" :status-map="rebookingStatusMap" />
      </div>
    </div>

    <RebookingForm v-if="selectedReminder" :reminder="selectedReminder" @close="selectedReminder = null" @save="onSaved" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { listRebookingReminders } from '../../services/rebookingService';
import RebookingForm from './RebookingForm.vue';
import StatusBadge from '../common/StatusBadge.vue';

const loading = ref(true);
const error = ref(false);
const reminders = ref([]);
const statusFilter = ref('NEW');
const selectedReminder = ref(null);

const rebookingStatusMap = {
    NEW: { label: 'Novo', badge: 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30', dot: 'bg-green-500' },
    NOTIFIED: { label: 'Notificado', badge: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30', dot: 'bg-yellow-500' },
    SCHEDULED: { label: 'Agendado', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30', dot: 'bg-blue-500' },
    DECLINED: { label: 'Recusado', badge: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30', dot: 'bg-red-500' }
};

const fetchReminders = async () => {
    loading.value = true;
    error.value = false;
    try {
        reminders.value = await listRebookingReminders(statusFilter.value);
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
    fetchReminders();
};

onMounted(() => {
    fetchReminders();
});
</script>
