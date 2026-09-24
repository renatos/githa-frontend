<template>
  <div class="space-y-6">
    <!-- Top Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <router-link
        to="/reports"
        class="hover:text-indigo-600 dark:hover:text-indigo-400 font-medium flex items-center gap-1.5 transition"
      >
        <i class="fa-solid fa-arrow-left text-[11px]"></i>
        Central de Relatórios
      </router-link>
      <span>/</span>
      <span class="text-gray-900 dark:text-white font-semibold">{{ title }}</span>
    </div>

    <!-- Main Header with PageHeader pattern -->
    <PageHeader
      :title="title"
      :subtitle="description"
    >
      <template #actions>
        <div class="flex items-center gap-3 flex-nowrap shrink-0">
          <!-- Month/Year Selector -->
          <MonthYearSelector
            :month="month"
            :year="year"
            @update:month="$emit('update:month', $event)"
            @update:year="$emit('update:year', $event)"
            @change="$emit('period-change', $event)"
          />

          <!-- Segmented View Toggle (Chart vs Table) -->
          <div
            v-if="showViewToggle"
            class="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
          >
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="viewMode === 'CHART'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
              @click="$emit('update:viewMode', 'CHART')"
            >
              <i class="fa-solid fa-chart-pie text-xs"></i>
              Gráfico
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
              :class="viewMode === 'TABLE'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
              @click="$emit('update:viewMode', 'TABLE')"
            >
              <i class="fa-solid fa-table-list text-xs"></i>
              Tabela
            </button>
          </div>
        </div>
      </template>
    </PageHeader>

    <!-- Error State -->
    <div
      v-if="error"
      class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-6 text-center"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-3">
        <i class="fa-solid fa-triangle-exclamation text-xl"></i>
      </div>
      <h3 class="text-base font-bold text-red-800 dark:text-red-300">Falha ao carregar relatório</h3>
      <p class="text-xs text-red-600 dark:text-red-400 mt-1 max-w-md mx-auto">{{ error }}</p>
      <button
        type="button"
        @click="$emit('retry')"
        class="mt-4 px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition shadow-sm"
      >
        <i class="fa-solid fa-rotate-right mr-1.5"></i>
        Tentar Novamente
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-else-if="loading" class="space-y-6 animate-pulse">
      <!-- KPI Skeletons -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
      <!-- Body Skeleton -->
      <div class="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
    </div>

    <!-- Ready Content -->
    <div v-else class="space-y-6">
      <!-- KPI Summary Cards Slot -->
      <div v-if="$slots.kpis" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <slot name="kpis"></slot>
      </div>

      <!-- Main Visual Section (Chart or Table) -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div v-show="viewMode === 'CHART'">
          <slot name="chart"></slot>
        </div>
        <div v-show="viewMode === 'TABLE'" class="overflow-x-auto">
          <slot name="table"></slot>
        </div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue';
import MonthYearSelector from '@/components/common/MonthYearSelector.vue';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'fa-solid fa-chart-pie' },
  badge: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null },
  viewMode: { type: String, default: 'TABLE' },
  showViewToggle: { type: Boolean, default: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true }
});

defineEmits([
  'update:month',
  'update:year',
  'update:viewMode',
  'period-change',
  'retry'
]);
</script>
