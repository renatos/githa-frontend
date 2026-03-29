<template>
  <div class="flex items-center bg-slate-900/50 rounded-xl border border-slate-800 p-1 backdrop-blur-sm shadow-inner group">
    <button 
      class="p-2 text-slate-400 hover:text-white transition-all transform hover:scale-110 active:scale-95" 
      title="Mês anterior"
      @click="previousMonth"
    >
      <span class="material-symbols-outlined text-sm">chevron_left</span>
    </button>
    
    <div class="px-4 font-bold text-sm min-w-[150px] text-center text-slate-100 tracking-wide select-none">
      {{ currentMonthLabel }}
    </div>
    
    <button 
      class="p-2 text-slate-400 hover:text-white transition-all transform hover:scale-110 active:scale-95" 
      title="Próximo mês"
      @click="nextMonth"
    >
      <span class="material-symbols-outlined text-sm">chevron_right</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  month: { 
    type: Number, 
    required: true,
    validator: (v) => v >= 1 && v <= 12
  },
  year: { 
    type: Number, 
    required: true 
  }
});

const emit = defineEmits(['update:month', 'update:year', 'change']);

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentMonthLabel = computed(() => {
  return `${monthNames[props.month - 1]} ${props.year}`;
});

const previousMonth = () => {
  let newMonth = props.month - 1;
  let newYear = props.year;
  if (newMonth === 0) {
    newMonth = 12;
    newYear--;
  }
  updateValues(newMonth, newYear);
};

const nextMonth = () => {
  let newMonth = props.month + 1;
  let newYear = props.year;
  if (newMonth === 13) {
    newMonth = 1;
    newYear++;
  }
  updateValues(newMonth, newYear);
};

const updateValues = (month, year) => {
  emit('update:month', month);
  emit('update:year', year);
  emit('change', { month, year });
};
</script>

<style scoped>
.select-none {
  user-select: none;
}
</style>
