<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
    <!-- View Mode Toggle -->
    <div v-if="showModeToggle" class="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm shadow-inner">
      <button 
        v-for="mode in availableModes"
        :key="mode.value"
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
        :class="viewMode === mode.value ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'"
        @click="$emit('update:viewMode', mode.value)"
      >
        {{ mode.label }}
      </button>
    </div>

    <!-- Month/Day Selectors -->
    <div class="flex items-center gap-3">
      <MonthYearSelector 
        v-show="viewMode === 'MONTH'"
        :month="month"
        :year="year"
        @update:month="$emit('update:month', $event)"
        @update:year="$emit('update:year', $event)"
        @change="$emit('change', $event)"
      />

      <div v-show="viewMode === 'DAY'" class="flex items-center bg-slate-900/50 rounded-xl border border-slate-800 p-1 backdrop-blur-sm shadow-inner group">
        <button 
          @click="previousDay" 
          class="p-2 text-slate-400 hover:text-white transition-all transform hover:scale-110 active:scale-95"
          title="Dia anterior"
        >
          <span class="material-symbols-outlined text-sm">chevron_left</span>
        </button>
        <span class="px-4 font-bold text-sm min-w-[100px] text-center text-slate-100 tracking-wide select-none">
          {{ currentDayLabel }}
        </span>
        <button 
          @click="nextDay" 
          class="p-2 text-slate-400 hover:text-white transition-all transform hover:scale-110 active:scale-95"
          title="Próximo dia"
        >
          <span class="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import MonthYearSelector from './MonthYearSelector.vue';

const props = defineProps({
  viewMode: { type: String, default: 'MONTH' },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  day: { type: Number, default: 1 },
  showModeToggle: { type: Boolean, default: true },
  availableModes: { 
    type: Array, 
    default: () => [
      { label: 'Mensal', value: 'MONTH' },
      { label: 'Diário', value: 'DAY' }
    ]
  }
});

const emit = defineEmits(['update:viewMode', 'update:month', 'update:year', 'update:day', 'change']);

const currentDayLabel = computed(() => {
  const dayStr = String(props.day).padStart(2, '0');
  const monthStr = String(props.month).padStart(2, '0');
  return `${dayStr}/${monthStr}`;
});

const daysInMonth = (m, y) => new Date(y, m, 0).getDate();

const previousDay = () => {
  let d = props.day - 1;
  let m = props.month;
  let y = props.year;

  if (d < 1) {
    m--;
    if (m < 1) {
      m = 12;
      y--;
    }
    d = daysInMonth(m, y);
  }

  emit('update:day', d);
  emit('update:month', m);
  emit('update:year', y);
  emit('change', { day: d, month: m, year: y, viewMode: props.viewMode });
};

const nextDay = () => {
  let d = props.day + 1;
  let m = props.month;
  let y = props.year;

  if (d > daysInMonth(m, y)) {
    d = 1;
    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  emit('update:day', d);
  emit('update:month', m);
  emit('update:year', y);
  emit('change', { day: d, month: m, year: y, viewMode: props.viewMode });
};
</script>

<style scoped>
.select-none {
  user-select: none;
}
</style>
