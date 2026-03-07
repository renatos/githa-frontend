<template>
  <div class="p-4 md:p-6 flex flex-col gap-6">
    <header class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white m-0">Feedbacks e Suporte</h2>
          <AiContextBadge context="FEEDBACKS" contextName="Feedbacks" />
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400 m-0 mt-1">Gerencie os feedbacks e sugestões do sistema.</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="$emit('new')"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <span class="material-symbols-outlined text-[18px] mr-2">add</span>
          Novo Feedback
        </button>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('NEW') 
            ? 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-100'
            : 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
        ]"
        @click="toggleFilter('NEW')"
      >
        <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
        Novo
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('ACCEPTED') 
            ? 'border-amber-500 bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:border-amber-500 dark:text-amber-100'
            : 'border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
        ]"
        @click="toggleFilter('ACCEPTED')"
      >
        <span class="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
        Em Análise
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('IMPLEMENTED') 
            ? 'border-emerald-500 bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:border-emerald-500 dark:text-emerald-100'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
        ]"
        @click="toggleFilter('IMPLEMENTED')"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
        Concluído
      </button>

      <button 
        class="inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium transition-colors"
        :class="[
          selectedStatuses.includes('REJECTED') 
            ? 'border-red-500 bg-red-100 text-red-900 dark:bg-red-900/50 dark:border-red-500 dark:text-red-100'
            : 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50'
        ]"
        @click="toggleFilter('REJECTED')"
      >
        <span class="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
        Rejeitado
      </button>
    </div>

    <GenericTable
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchDataAdapter"
        :row-class="getRowClass"
        @row-click="(item) => $emit('edit', item)"
    >
      <template #cell-feedbackType="{ item }">
        <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold"
              :class="getTypeBadgeClass(item.feedbackType)">
          {{ formatType(item.feedbackType) }}
        </span>
      </template>

      <template #cell-feedbackStatus="{ item }">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
              :class="getStatusBadgeClass(item.feedbackStatus)">
          <span class="w-1.5 h-1.5 rounded-full" :class="getStatusDotClass(item.feedbackStatus)"></span>
          {{ formatStatus(item.feedbackStatus) }}
        </span>
      </template>

      <template #cell-user="{ item }">
        {{ item.user ? item.user.name : '-' }}
      </template>

      <template #cell-reporter="{ item }">
        {{ item.reporter ? item.reporter.name : '-' }}
      </template>

      <template #cell-createdAt="{ item }">
        {{ formatDateTime(item.createdAt) }}
      </template>

    </GenericTable>
  </div>
</template>

<script setup>
import {ref, defineEmits, defineExpose} from 'vue';
import GenericTable from './common/GenericTable.vue';
import AiContextBadge from './common/AiContextBadge.vue';
import {feedbackService} from '../services/feedbackService';
import {formatDateTime} from '../utils/formatters';

defineEmits(['new', 'edit']);

const tableRef = ref(null);
const selectedStatuses = ref([]);

const columns = [
  {key: 'id', label: '#', width: '50px', sortable: true},
  {key: 'title', label: 'Título', sortable: true, filterable: true},
  {key: 'feedbackType', label: 'Tipo', sortable: true, filterable: true},
  {key: 'feedbackStatus', label: 'Status', sortable: true, filterable: true},
  {key: 'reporter', label: 'Relator', sortable: false},
  {key: 'createdAt', label: 'Data', sortable: true},
];

const toggleFilter = (status) => {
  if (selectedStatuses.value.includes(status)) {
    selectedStatuses.value = selectedStatuses.value.filter(s => s !== status);
  } else {
    selectedStatuses.value.push(status);
  }
  refresh();
};

const fetchDataAdapter = async (params) => {
  const query = {
    page: params.page,
    size: params.size,
    sort: params.sort,
    ...params.filters
  };

  if (selectedStatuses.value.length > 0) {
    query.feedbackStatus = selectedStatuses.value.join(',');
  }

  // Remove empty keys
  Object.keys(query).forEach(key => (query[key] === null || query[key] === '') && delete query[key]);

  const response = await feedbackService.getAll(query);
  return response.data;
};

const refresh = () => {
  tableRef.value?.loadData();
};

const getRowClass = (item) => {
  if (!item.feedbackStatus) return '';
  return `feedback-row-${item.feedbackStatus.toLowerCase()}`;
};

const formatType = (type) => {
  const map = {
    'BUG': 'Erro',
    'FEATURE': 'Nova Funcionalidade',
    'IMPROVEMENT': 'Melhoria',
    'SUGGESTION': 'Sugestão da IA'
  };
  return map[type] || type;
};

const formatStatus = (status) => {
  const map = {
    'NEW': 'Novo',
    'ACCEPTED': 'Em Análise',
    'IN_PROGRESS': 'Em Andamento',
    'REJECTED': 'Rejeitado',
    'IMPLEMENTED': 'Concluído'
  };
  return map[status] || status;
};

const getTypeBadgeClass = (type) => {
  const map = {
    'BUG': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'FEATURE': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'IMPROVEMENT': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'SUGGESTION': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return map[type] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const getStatusBadgeClass = (status) => {
  const map = {
    'NEW': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'ACCEPTED': 'bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
    'IN_PROGRESS': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    'REJECTED': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    'IMPLEMENTED': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  };
  return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const getStatusDotClass = (status) => {
  const map = {
    'NEW': 'bg-blue-500',
    'ACCEPTED': 'bg-amber-500',
    'IN_PROGRESS': 'bg-indigo-500',
    'REJECTED': 'bg-red-500',
    'IMPLEMENTED': 'bg-emerald-500',
  };
  return map[status] || 'bg-slate-400';
};

defineExpose({refresh});
</script>

<style scoped>
/* Scoped styles replaced by Tailwind utils in template */
</style>
