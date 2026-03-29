<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
      <span>📅</span> Agendamentos Hoje
    </h2>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button class="text-sm text-red-500 hover:text-red-400 transition-colors" @click="fetchAppointments">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="appointments.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum agendamento para hoje.
    </div>

    <div v-else class="space-y-4 flex-1">
      <div
        v-for="(appointment, index) in appointments"
        :key="appointment.id"
        class="flex items-center justify-between text-sm cursor-pointer hover:opacity-80 transition-opacity"
        :class="{ 'pb-3 border-b border-gray-100 dark:border-slate-700/50': index < appointments.length - 1 }"
        @click="goToAppointment(appointment)"
      >
        <div class="text-gray-400 dark:text-slate-400 w-16 font-medium">{{ formatTime(appointment.startTime) }}</div>
        <div class="font-medium text-gray-800 dark:text-white flex-1">{{ appointment.clientName }}</div>
        <span class="px-2 py-1 rounded text-xs font-medium" :class="getStatusStyle(appointment.status)">
          {{ statusMap[appointment.status] || appointment.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { appointmentService } from '../../services/appointmentService';
import { enumService } from '../../services/enumService';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const appointments = ref([]);
const statusMap = ref({});

const goToAppointment = (appointment) => {
  if (appointment && appointment.id) {
    router.push({ path: '/appointments', query: { highlight: appointment.id } });
  }
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const loadStatuses = async () => {
  const options = await enumService.getOptions('AppointmentStatus');
  options.forEach(opt => { statusMap.value[opt.name] = opt.description; });
};

const getStatusStyle = (status) => {
  if (!status) return 'bg-gray-100 text-gray-600 dark:bg-slate-600/30 dark:text-slate-400';
  const s = status.toLowerCase();
  if (['scheduled', 'confirmed'].includes(s)) return 'bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
  if (['in_progress'].includes(s)) return 'bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/30';
  if (['completed'].includes(s)) return 'bg-gray-100 text-gray-600 dark:bg-slate-600/30 dark:text-slate-400 border border-gray-200 dark:border-slate-600/30';
  if (['canceled', 'no_show'].includes(s)) return 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30';
  return 'bg-gray-100 text-gray-600 dark:bg-slate-600/30 dark:text-slate-400';
};

const fetchAppointments = async () => {
  loading.value = true;
  error.value = false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const startTimeIso = today.toISOString().replace('Z', '');
    const endTimeIso = endOfDay.toISOString().replace('Z', '');
    const response = await appointmentService.getAll({
      page: 0, size: 50, sort: 'startTime,asc',
      'startTime_gte': startTimeIso, 'startTime_lte': endTimeIso
    });
    const content = response?.data?.content || response?.data || [];
    appointments.value = Array.isArray(content) ? content : [];
  } catch (err) {
    console.error('Failed to fetch today appointments:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAppointments();
  loadStatuses();
});
</script>
