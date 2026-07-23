<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
        <span>🔄</span> Smart Rebooking
      </h2>
      <select v-model="statusFilter" class="text-xs bg-gray-50 border border-gray-200 text-gray-900 rounded focus:ring-blue-500 focus:border-blue-500 block p-1.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
        <option value="">Todos</option>
        <option v-for="opt in statusFilterOptions" :key="opt.name" :value="opt.name">{{ opt.description }}</option>
      </select>
    </div>

    <!-- Metrics Summary Section -->
    <div v-if="!loading && !error" class="grid grid-cols-2 gap-4 mb-6">
      <!-- Potential Revenue -->
      <div class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-500/15 dark:to-transparent border border-amber-500/20 dark:border-amber-500/30 rounded-lg p-3 flex flex-col justify-between">
        <span class="text-xs text-amber-600 dark:text-amber-400 font-medium">Potencial</span>
        <span class="text-lg font-bold text-amber-700 dark:text-amber-300 mt-1">
          {{ formatCurrency(potentialRevenue) }}
        </span>
        <span class="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
          {{ newAndNotifiedCount }} {{ newAndNotifiedCount === 1 ? 'pendente' : 'pendentes' }}
        </span>
      </div>

      <!-- Scheduled Revenue (Recuperado) -->
      <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/15 dark:to-transparent border border-blue-500/20 dark:border-blue-500/30 rounded-lg p-3 flex flex-col justify-between">
        <span class="text-xs text-blue-600 dark:text-blue-400 font-medium">Retornos Agendados</span>
        <span class="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
          {{ formatCurrency(scheduledRevenue) }}
        </span>
        <span class="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5">
          {{ scheduledCount }} {{ scheduledCount === 1 ? 'agendado' : 'agendados' }}
        </span>
      </div>

      <!-- Converted Revenue (Convertido) -->
      <div v-if="convertedCount > 0" class="col-span-2 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/15 dark:to-transparent border border-emerald-500/20 dark:border-emerald-500/30 rounded-lg p-3 flex flex-row items-center justify-between animate-bounce-subtle">
        <div class="flex flex-col">
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
            <span>Retornos Efetivados</span>
            <span class="animate-pulse">🎉</span>
          </span>
          <span class="text-lg font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
            {{ formatCurrency(convertedRevenue) }}
          </span>
        </div>
        <span class="text-[10px] text-gray-500 dark:text-slate-400 font-medium bg-emerald-100/50 dark:bg-emerald-500/10 px-2 py-1 rounded">
          {{ convertedCount }} {{ convertedCount === 1 ? 'retorno' : 'retornos' }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center py-8">
      <button class="text-sm text-red-500 hover:text-red-400 transition-colors" @click="fetchReminders">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="reminders.length === 0" class="flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum lembrete pendente.
    </div>

    <div v-else class="space-y-4 overflow-y-auto pr-2" style="max-height: 20rem;">
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
            <span v-if="reminder.lastAppointmentDate" class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Último atendimento: {{ new Date(reminder.lastAppointmentDate).toLocaleDateString('pt-BR') }}
            </span>
        </div>
        <div class="flex flex-col items-end gap-1.5">
            <span class="font-semibold text-gray-700 dark:text-slate-200">
                {{ formatCurrency(reminder.service?.price) }}
            </span>
            <StatusBadge :status="reminder.status" :status-map="rebookingStatusMap" />
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

    <AppointmentForm 
      v-if="showAppointmentForm" 
      :appointment="preFilledAppointment" 
      :z-index="11000"
      @close="showAppointmentForm = false" 
      @save="onAppointmentSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineEmits, computed } from 'vue';

const emit = defineEmits(['select-client']);
import { listReminders } from '../../services/reminderService';
import ReminderForm from './ReminderForm.vue';
import StatusBadge from '../common/StatusBadge.vue';
import AppointmentForm from '../AppointmentForm.vue';
import { confirmBridge } from '../../services/confirmBridge';
import { enumService } from '../../services/enumService';
import { formatCurrency } from '../../utils/formatters';

const props = defineProps({
    serviceId: {
        type: Number,
        default: null
    }
});

const loading = ref(true);
const error = ref(false);
const allReminders = ref([]);
const statusFilter = ref('NEW');
const selectedReminder = ref(null);
const showAppointmentForm = ref(false);
const preFilledAppointment = ref({});

const statusFilterOptions = ref([]);

const rebookingStyles = {
    NEW: { badge: 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30', dot: 'bg-green-500' },
    NOTIFIED: { badge: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30', dot: 'bg-yellow-500' },
    SCHEDULED: { badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30', dot: 'bg-blue-500' },
    CONVERTED: { badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30', dot: 'bg-emerald-500' },
    DECLINED: { badge: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30', dot: 'bg-red-500' },
    NO_CONTACT: { badge: 'bg-gray-50 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30', dot: 'bg-gray-500' }
};

const rebookingStatusMap = computed(() => {
    const map = {};
    statusFilterOptions.value.forEach(opt => {
        map[opt.name] = {
            label: opt.description,
            ...(rebookingStyles[opt.name] || rebookingStyles.NO_CONTACT)
        };
    });
    return map;
});

const loadStatusOptions = async () => {
    statusFilterOptions.value = await enumService.getOptions('ReminderStatus');
};

const isWithinLast30Days = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
};

const reminders = computed(() => {
    if (!statusFilter.value) {
        return allReminders.value.filter(r => r.status !== 'CONVERTED' || isWithinLast30Days(r.updatedAt));
    }
    if (statusFilter.value === 'CONVERTED') {
        return allReminders.value.filter(r => r.status === 'CONVERTED' && isWithinLast30Days(r.updatedAt));
    }
    return allReminders.value.filter(r => r.status === statusFilter.value);
});

const potentialRevenue = computed(() => {
    return allReminders.value
        .filter(r => r.status === 'NEW' || r.status === 'NOTIFIED')
        .reduce((acc, r) => acc + (r.service?.price || 0), 0);
});

const scheduledRevenue = computed(() => {
    return allReminders.value
        .filter(r => r.status === 'SCHEDULED')
        .reduce((acc, r) => acc + (r.service?.price || 0), 0);
});

const convertedRevenue = computed(() => {
    return allReminders.value
        .filter(r => r.status === 'CONVERTED' && isWithinLast30Days(r.updatedAt))
        .reduce((acc, r) => acc + (r.service?.price || 0), 0);
});

const newAndNotifiedCount = computed(() => {
    return allReminders.value.filter(r => r.status === 'NEW' || r.status === 'NOTIFIED').length;
});

const scheduledCount = computed(() => {
    return allReminders.value.filter(r => r.status === 'SCHEDULED').length;
});

const convertedCount = computed(() => {
    return allReminders.value.filter(r => r.status === 'CONVERTED' && isWithinLast30Days(r.updatedAt)).length;
});

const fetchReminders = async () => {
    loading.value = true;
    error.value = false;
    try {
        allReminders.value = await listReminders(null, props.serviceId, ['REBOOKING', 'REMINDER', 'CHURN']);
    } catch(e) {
        error.value = true;
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const handleClientUpdate = async () => {
    await fetchReminders();
    if (selectedReminder.value) {
        const updatedMatchingReminder = reminders.value.find(r => r.id === selectedReminder.value.id);
        if (updatedMatchingReminder) {
            selectedReminder.value = updatedMatchingReminder;
        }
    }
};

const openForm = (reminder) => {
    selectedReminder.value = reminder;
};

const onSaved = (updatedData) => {
    selectedReminder.value = null;
    fetchReminders();

    if (updatedData.status === 'SCHEDULED') {
        confirmBridge.confirm({
            title: 'Gerar Agendamento?',
            message: `O status foi definido como Agendado para ${updatedData.client?.name}. Deseja abrir o formulário de agendamento agora?`,
            type: 'info',
            confirmLabel: 'Sim, agendar',
            cancelLabel: 'Agora não',
            onConfirm: () => {
                preFilledAppointment.value = {
                    client: {
                        id: updatedData.client?.id,
                        name: updatedData.client?.name
                    },
                    professional: {
                        id: updatedData.contactResponsibleId,
                        name: updatedData.contactResponsibleName
                    },
                    service: {
                        id: updatedData.service?.id,
                        name: updatedData.service?.name
                    },
                    notes: updatedData.notes ? `Rebooking - ${updatedData.notes}` : 'Rebooking',
                    date: new Date().toISOString().split('T')[0],
                    status: 'SCHEDULED'
                };
                showAppointmentForm.value = true;
            }
        });
    }
};

const onAppointmentSaved = () => {
    showAppointmentForm.value = false;
};

onMounted(() => {
    loadStatusOptions();
    fetchReminders();
    window.addEventListener('client-updated', handleClientUpdate);
});

onUnmounted(() => {
    window.removeEventListener('client-updated', handleClientUpdate);
});
</script>
