<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">

    <!-- Header -->
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Agendamentos</h2>
            <AiContextBadge context="APPOINTMENTS" />
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os agendamentos da clínica.</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Date Navigator -->
          <div class="flex items-center gap-1">
            <button
class="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    @click="navigateDate(-1)">
              <span class="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
class="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                    @click="goToToday">
              {{ dateRangeLabel }}
            </button>
            <button
class="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    @click="navigateDate(1)">
              <span class="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          <!-- View Toggle -->
          <div class="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
:class="viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                    @click="viewMode = 'list'">
              <span class="material-symbols-outlined text-[16px]">view_list</span>
              Lista
            </button>
            <button
:class="viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
                    @click="viewMode = 'calendar'">
              <span class="material-symbols-outlined text-[16px]">calendar_view_week</span>
              Calendário
            </button>
          </div>

          <button
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            @click="$emit('new')">
            <span class="material-symbols-outlined text-[18px] mr-2">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>
    </header>


    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Carregando agendamentos...</p>
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-else-if="viewMode === 'list'" class="flex flex-col gap-6">
      <div v-if="appointments.length === 0" class="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <span class="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-3">event_busy</span>
        <p class="text-slate-500 dark:text-slate-400 font-medium">Nenhum agendamento neste período.</p>
        <button class="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors" @click="$emit('new')">
          <span class="material-symbols-outlined text-[16px]">add</span>
          Novo Agendamento
        </button>
      </div>

      <div v-for="group in groupedAppointments" :key="group.date" class="flex flex-col gap-3">
        <!-- Date Header -->
        <div class="flex items-center gap-3 px-1 py-1">
          <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          <div class="flex items-center gap-2 whitespace-nowrap" :class="isToday(group.date) ? 'text-indigo-600 dark:text-indigo-400 scale-105 transition-transform' : 'text-slate-500 dark:text-slate-400'">
            <span class="material-symbols-outlined" :class="isToday(group.date) ? 'text-[20px]' : 'text-[18px]'">calendar_today</span>
            <span :class="isToday(group.date) ? 'text-sm font-black' : 'text-xs font-bold'" class="uppercase tracking-widest">
              Dia {{ formatDate(group.date) }} — {{ group.items.length }} 
              {{ group.items.length === 1 ? 'Agendamento' : 'Agendamentos' }}
            </span>
          </div>
          <div class="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
        </div>

        <div
v-for="item in group.items" :key="item.id"
             class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm transition-all cursor-pointer shadow-sm relative overflow-hidden"
             @click="$emit('edit', item)">
          
          <div class="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          
          <!-- Status indicator bar (discrete) -->
          <div class="absolute left-0 top-0 bottom-0 w-1" :class="statusAccentColor(item.status)"></div>

          <!-- Time Block -->
          <div class="flex-shrink-0 text-center bg-slate-50 dark:bg-slate-700/50 rounded-lg w-14 md:w-20 py-1.5 md:py-2 px-1 border border-slate-100 dark:border-slate-600">
            <p class="text-sm md:text-base font-bold text-slate-900 dark:text-white">{{ formatTime(item.startTime) }}</p>
            <p class="text-[9px] md:text-[10px] text-slate-400 uppercase font-medium tracking-tighter">{{ formatTime(item.endTime) }}</p>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 pr-12 md:pr-1 flex flex-col gap-0.5">
            <p class="font-bold text-slate-900 dark:text-white text-sm md:text-base leading-tight md:truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ item.clientName }}</p>
            <div class="flex flex-col md:flex-row md:items-center gap-x-2 min-w-0">
               <span class="text-[11px] text-indigo-500/80 dark:text-indigo-400/80 font-bold uppercase tracking-tight md:truncate">{{ item.serviceName }}</span>
               <span class="hidden md:inline text-[10px] text-slate-400">•</span>
               <span class="text-[11px] text-slate-500 dark:text-slate-400 md:truncate">{{ item.professionalName }}</span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="absolute md:relative top-2 right-2 md:top-0 md:right-0 md:flex-shrink-0">
            <span
class="inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm border"
                  :class="statusBadgeClass(item.status)">
              <span class="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full" :class="statusDotClass(item.status)"></span>
              {{ statusMap[item.status] || item.status }}
            </span>
          </div>
          </div>

          <!-- Actions -->
          <div class="flex-shrink-0 flex items-center justify-end gap-1.5 md:gap-1 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-700/50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:relative" @click.stop>
            <button
v-if="['SCHEDULED', 'MISSED'].includes(item.status)"
                    class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    title="Confirmar" @click="$emit('confirm', item)">
              <span class="material-symbols-outlined text-[18px]">check_circle</span>
            </button>
            <button
v-if="['SCHEDULED', 'CONFIRMED'].includes(item.status)"
                    class="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors"
                    title="Concluir" @click="$emit('complete', item)">
              <span class="material-symbols-outlined text-[18px]">star</span>
            </button>
            <button
v-if="['SCHEDULED', 'CONFIRMED'].includes(item.status)"
                    class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Cancelar" @click="$emit('cancel', item)">
              <span class="material-symbols-outlined text-[18px]">cancel</span>
            </button>
            <div class="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1"></div>
            <button
class="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Adicionar Procedimento" @click="$emit('add-procedure', item)">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
            </button>
            <button
class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    :disabled="isActionDisabled(item)"
                    :title="getDeleteTitle(item)"
                    @click="!isActionDisabled(item) && $emit('delete', item.id)">
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CALENDAR VIEW -->
    <div v-else class="bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <!-- Week Day Header -->
      <div
class="grid border-b-2 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800"
           :style="`grid-template-columns: 64px repeat(${weekDays.length}, 1fr)`">
        <div class="border-r border-slate-300 dark:border-slate-700"></div>
        <div
v-for="day in weekDays" :key="day.iso"
             :class="['px-3 py-3 text-center border-r border-slate-300 dark:border-slate-700/50 last:border-r-0',
                       day.isToday ? 'bg-indigo-100 dark:bg-indigo-900/20' : '']">
          <p class="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">{{ day.dayName }}</p>
          <p
:class="['text-lg font-bold mt-0.5',
                       day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white']">
            {{ day.dayNumber }}
          </p>
        </div>
      </div>

      <!-- Time Grid -->
      <div class="overflow-y-auto max-h-[600px] relative [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:hidden" style="scrollbar-width:none">
        <div class="grid" :style="`grid-template-columns: 64px repeat(${weekDays.length}, 1fr)`">

          <!-- Rows for each hour -->
          <template v-for="(hour, idx) in calendarHours" :key="hour">
            <!-- Time Label -->
            <div :class="['border-r border-b border-slate-300 dark:border-slate-700/50 py-3 px-2 text-right', idx % 2 === 0 ? 'bg-slate-100 dark:bg-slate-800/60' : 'bg-white dark:bg-slate-800']">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ String(hour).padStart(2, '0') }}:00</span>
            </div>
            <!-- Day cell per hour -->
            <div
v-for="day in weekDays" :key="day.iso"
                 :class="['border-r border-b border-slate-300 dark:border-slate-700/50 last:border-r-0 relative min-h-[56px] transition-colors cursor-pointer',
                           day.isToday ? (idx % 2 === 0 ? 'bg-indigo-100/60 dark:bg-indigo-900/10 hover:bg-indigo-200/50 dark:hover:bg-indigo-900/30' : 'bg-indigo-50/60 dark:bg-indigo-900/5 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20') : (idx % 2 === 0 ? 'bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/50 dark:hover:bg-slate-700/50' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/30')]"
                 @click.stop="onCellClick(day.iso, hour)">  
              <!-- Appointment blocks for this cell -->
              <div
v-for="appt in getAppointmentsForCell(day.iso, hour)" :key="appt.id"
                   class="absolute rounded-md px-2 py-1 cursor-pointer text-xs border-l-2 transition-all duration-200 z-10 hover:z-30 hover:scale-[1.05] hover:shadow-lg group/appt"
                   :class="calendarCardClass(appt.status)"
                   :style="getCardStyle(appt)"
                   @click.stop="$emit('edit', appt)">
                <p class="font-semibold truncate group-hover/appt:whitespace-normal group-hover/appt:break-words">{{ appt.clientName }}</p>
                <p class="opacity-75 truncate group-hover/appt:whitespace-normal group-hover/appt:break-words">{{ appt.serviceName }}</p>
              </div>
            </div>
          </template>

        </div>
      </div>

      <!-- Calendar legend -->
      <div class="flex items-center gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-700 flex-wrap">
        <div v-for="(label, key) in statusLegend" :key="key" class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm" :class="statusDotClass(key)"></span>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ label }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineEmits, defineExpose, defineProps } from 'vue';
import { appointmentService } from '../services/appointmentService';
import { authService } from '../services/authService';
import { enumService } from '../services/enumService';
import AiContextBadge from './common/AiContextBadge.vue';

const props = defineProps({
  embedded: { type: Boolean, default: false },
  clientId: { type: Number, default: null }
});

const emit = defineEmits(['new', 'edit', 'delete', 'confirm', 'complete', 'cancel', 'add-procedure']);

// --- State ---
const viewMode = ref(window.innerWidth < 1024 ? 'list' : 'calendar');
const loading = ref(false);
const appointments = ref([]);
const appointmentLayout = ref({});
const isAdmin = ref(false);
const statusMap = ref({});
const currentDate = ref(new Date());

// --- Status Legend ---
const statusLegend = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Finalizado',
  CANCELED: 'Cancelado',
  MISSED: 'Falta',
};

// --- Grouping ---
const groupedAppointments = computed(() => {
  if (!appointments.value.length) return [];
  
  const groups = {};
  appointments.value.forEach(appt => {
    const dateStr = appt.startTime.split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(appt);
  });

  // Sort groups by date descending (newest first)
  return Object.keys(groups)
    .sort()
    .reverse()
    .map(date => ({
      date,
      items: groups[date].sort((a, b) => b.startTime.localeCompare(a.startTime))
    }));
});

// --- Date Navigation ---
const dateRangeLabel = computed(() => {
  const start = getMonday(currentDate.value);
  const end = new Date(start);

  if (viewMode.value === 'list') {
    end.setDate(end.getDate() + 13);
  } else {
    end.setDate(end.getDate() + 5);
  }

  const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  return `${startStr} – ${endStr}`;
});

const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const navigateDate = (direction) => {
  const d = new Date(currentDate.value);
  d.setDate(d.getDate() + direction * 7);
  currentDate.value = d;
};

const goToToday = () => {
  currentDate.value = new Date();
};

const onCellClick = (isoDate, hour) => {
  // ISO string is YYYY-MM-DD
  const startTime = `${isoDate}T${String(hour).padStart(2, '0')}:00:00`;
  emit('new', { startTime });
};

const weekDays = computed(() => {
  const monday = getMonday(currentDate.value);
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    const isToday = d.getTime() === today.getTime();
    days.push({
      iso,
      isToday,
      dayName: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
      dayNumber: d.getDate(),
    });
  }
  return days;
});

const calendarHours = Array.from({ length: 14 }, (_, i) => 8 + i); // 08 to 21

// --- Data Loading ---
const loadAppointments = async () => {
  loading.value = true;
  try {
    let query = {};
    const start = getMonday(currentDate.value);
    let end = new Date(start);

    if (viewMode.value === 'list') {
      // Lista → 2 semanas
      end.setDate(end.getDate() + 13);
    } else {
      // Calendário → semana atual (seg a sáb)
      end.setDate(end.getDate() + 5);
    }

    query.startDate = start.toISOString().split('T')[0];
    query.endDate = end.toISOString().split('T')[0];

    if (props.clientId) query['client.id'] = props.clientId;
    if (viewMode.value === 'list') {
      query.size = 20; // 20 registros por página na visão lista
    } else {
      query.size = 100; // Limite maior para a visão calendário
    }

    const response = await appointmentService.getAll(query);
    appointments.value = response.data?.content || [];
    calculateLayout(appointments.value);
  } catch (e) {
    console.error('Failed to load appointments', e);
    appointments.value = [];
  } finally {
    loading.value = false;
  }
};

const loadStatuses = async () => {
  const options = await enumService.getOptions('AppointmentStatus');
  options.forEach(opt => {
    statusMap.value[opt.name] = opt.description;
  });
};

const checkUserRole = () => {
  const user = authService.getCurrentUser();
  isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

onMounted(() => {
  checkUserRole();
  loadStatuses();
  loadAppointments();
});

watch([currentDate, viewMode], () => {
  loadAppointments();
});

const refresh = () => loadAppointments();
defineExpose({ refresh });

// --- Helpers ---
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  return isoString.split('T')[1]?.substring(0, 5) || '--:--';
};

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

const isToday = (dateStr) => {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
};

const isActionDisabled = (item) => item.status === 'COMPLETED' && !isAdmin.value;

const getDeleteTitle = (item) => {
  if (isActionDisabled(item)) return 'Atendimento concluído, acesso permitido apenas para ADMIN';
  return 'Excluir';
};

// --- Status Styles ---
const statusBadgeClass = (status) => {
  const map = {
    SCHEDULED: 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
    CONFIRMED: 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    CANCELED: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
    MISSED: 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  };
  return map[status] || map.SCHEDULED;
};

const statusDotClass = (status) => {
  const map = {
    SCHEDULED: 'bg-sky-500',
    CONFIRMED: 'bg-indigo-500',
    COMPLETED: 'bg-emerald-500',
    CANCELED: 'bg-red-500',
    MISSED: 'bg-orange-500',
  };
  return map[status] || 'bg-slate-400';
};

const statusAccentColor = (status) => {
  const map = {
    SCHEDULED: 'bg-sky-400',
    CONFIRMED: 'bg-indigo-400',
    COMPLETED: 'bg-emerald-400',
    CANCELED: 'bg-red-400',
    MISSED: 'bg-orange-400',
  };
  return map[status] || 'bg-slate-300';
};

const calendarCardClass = (status) => {
  const map = {
    SCHEDULED: 'bg-sky-50 dark:bg-sky-900/30 border-sky-500 text-sky-900 dark:text-sky-100',
    CONFIRMED: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-900 dark:text-emerald-100',
    COMPLETED: 'bg-slate-100 dark:bg-slate-700 border-slate-400 text-slate-700 dark:text-slate-300',
    CANCELED: 'bg-red-50 dark:bg-red-900/20 border-red-400 text-red-800 dark:text-red-200',
    MISSED: 'bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-800 dark:text-orange-200',
  };
  return map[status] || map.SCHEDULED;
};

// --- Calendar Cell Logic ---
const calculateLayout = (apptsList) => {
  const byDay = {};
  apptsList.forEach(appt => {
    if (!appt.startTime || !appt.endTime) return;
    const day = appt.startTime.split('T')[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(appt);
  });

  const layoutDict = {};

  Object.values(byDay).forEach(dayAppts => {
    dayAppts.sort((a, b) => {
      const aStart = new Date(a.startTime).getTime();
      const bStart = new Date(b.startTime).getTime();
      if (aStart !== bStart) return aStart - bStart;
      const aEnd = new Date(a.endTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return bEnd - aEnd;
    });

    const packEvents = (columns) => {
      const numColumns = columns.length;
      columns.forEach((col, colIdx) => {
        col.forEach(appt => {
          layoutDict[appt.id] = { col: colIdx, numColumns: numColumns };
        });
      });
    };

    let columns = [];
    let lastEventEnding = null;

    dayAppts.forEach(appt => {
      const start = new Date(appt.startTime).getTime();
      if (lastEventEnding !== null && start >= lastEventEnding) {
        packEvents(columns);
        columns = [];
        lastEventEnding = null;
      }

      let placed = false;
      for (const col of columns) {
        const lastInCol = col[col.length - 1];
        if (new Date(lastInCol.endTime).getTime() <= start) {
          col.push(appt);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([appt]);
      }

      const end = new Date(appt.endTime).getTime();
      if (lastEventEnding === null || end > lastEventEnding) {
        lastEventEnding = end;
      }
    });

    if (columns.length > 0) {
      packEvents(columns);
    }
  });
  
  appointmentLayout.value = layoutDict;
};

const getAppointmentsForCell = (dayIso, hour) => {
  return appointments.value.filter(appt => {
    if (!appt.startTime) return false;
    const apptDate = appt.startTime.split('T')[0];
    const apptHour = parseInt(appt.startTime.split('T')[1]?.substring(0, 2) || '0');
    return apptDate === dayIso && apptHour === hour;
  });
};

const getCardStyle = (appt) => {
  if (!appt.startTime || !appt.endTime) return { top: '2px', height: '52px', left: '4px', width: 'calc(100% - 8px)' };
  const startH = parseInt(appt.startTime.split('T')[1]?.substring(0, 2) || '8');
  const startM = parseInt(appt.startTime.split('T')[1]?.substring(3, 5) || '0');
  const endH = parseInt(appt.endTime.split('T')[1]?.substring(0, 2) || '8');
  const endM = parseInt(appt.endTime.split('T')[1]?.substring(3, 5) || '30');
  const cellHeight = 56; // min-h in px
  const startMin = (startH - Math.floor(startH)) * 60 + startM;
  const durationMin = (endH * 60 + endM) - (startH * 60 + startM);
  const top = (startM / 60) * cellHeight;
  const minHeight = Math.max((durationMin / 60) * cellHeight, 30);

  const layout = appointmentLayout.value[appt.id] || { col: 0, numColumns: 1 };
  
  const leftPercent = (layout.col / layout.numColumns) * 100;
  const widthPercent = (1 / layout.numColumns) * 100;

  return { 
    top: `${top}px`, 
    minHeight: `${minHeight}px`,
    height: 'auto',
    left: `calc(${leftPercent}% + 4px)`,
    width: `calc(${widthPercent}% - 8px)`
  };
};
</script>
