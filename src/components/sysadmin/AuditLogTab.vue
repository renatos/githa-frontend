<template>
  <div class="audit-log-tab h-full overflow-auto flex flex-col gap-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-200">Logs de Auditoria</h2>
        <p class="text-xs text-slate-500">Histórico de alterações das entidades do sistema.</p>
      </div>
      <div class="flex items-center gap-2">
        <label for="entity-select" class="text-sm font-medium text-slate-700 dark:text-slate-300">Entidade:</label>
        <select
            id="entity-select"
            v-model="selectedEntity"
            class="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none"
            @change="onEntityChange"
        >
          <option value="">Selecione uma entidade...</option>
          <option v-for="entity in entities" :key="entity" :value="entity">
            {{ formatEntityName(entity) }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="!selectedEntity" class="text-center py-12 text-slate-500">
      Selecione uma entidade para ver o histórico de auditoria.
    </div>

    <GenericTable
        v-else
        ref="tableRef"
        :columns="columns"
        :fetch-data="fetchAuditLogs"
        @row-click="showDetails"
    >
      <template #cell-changedAt="{ item }">
        {{ formatDate(item.changedAt) }}
      </template>
      <template #cell-diff="{ item }">
        <button
            class="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold"
            @click="showDetails(item)"
        >
          Ver Detalhes
        </button>
      </template>
    </GenericTable>

    <!-- Details Modal -->
    <BaseModal
        :show="selectedLog !== null"
        :title="selectedLog ? `Detalhes da Alteração - ID ${selectedLog.entityId}` : ''"
        subtitle="Auditoria de Entidades"
        icon="fa-solid fa-clock-rotate-left"
        maxWidth="max-w-2xl"
        @close="selectedLog = null"
    >
      <div v-if="selectedLog" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span class="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Ação</span>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold capitalize">
              {{ selectedLog.action }}
            </div>
          </div>
          <div>
            <span class="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Alterado por</span>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium truncate">
              {{ selectedLog.changedBy || '—' }}
            </div>
          </div>
          <div>
            <span class="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Data/Hora</span>
            <div class="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium">
              {{ formatDate(selectedLog.changedAt) }}
            </div>
          </div>
        </div>
        
        <div v-if="selectedLog.diff && Object.keys(selectedLog.diff).length > 0">
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Modificações Realizadas</h4>
          <div class="space-y-3">
            <div v-for="(change, field) in selectedLog.diff" :key="field" class="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <span class="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">{{ field }}</span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Antes</span>
                  <div class="px-2 py-1.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400 text-xs rounded font-mono break-all min-h-[1.5rem]">
                    {{ change.oldValue !== undefined ? change.oldValue : (change.from !== undefined ? change.from : 'null') }}
                  </div>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Depois</span>
                  <div class="px-2 py-1.5 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/20 text-green-600 dark:text-green-400 text-xs rounded font-mono break-all min-h-[1.5rem]">
                    {{ change.newValue !== undefined ? change.newValue : (change.to !== undefined ? change.to : 'null') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <h4 class="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Estado Completo da Entidade</h4>
          <pre class="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl font-mono text-xs overflow-auto border border-slate-200 dark:border-slate-800 leading-relaxed text-slate-700 dark:text-slate-300 max-h-[300px]">{{ JSON.stringify(selectedLog.snapshot, null, 2) }}</pre>
        </div>
      </div>
      <template #footer>
        <button
            type="button"
            class="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors"
            @click="selectedLog = null"
        >
          Fechar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GenericTable from '../common/GenericTable.vue';
import BaseModal from '../common/BaseModal.vue';
import { auditService } from '../../services/auditService';

const selectedEntity = ref('');
const entities = ref([]);
const tableRef = ref(null);
const selectedLog = ref(null);

const columns = [
  { key: 'entityId', label: 'ID da Entidade', sortable: true, width: '120px' },
  { key: 'action', label: 'Ação', sortable: true, width: '120px' },
  { key: 'changedBy', label: 'Alterado Por', sortable: true },
  { key: 'changedAt', label: 'Data/Hora', sortable: true, width: '180px' },
  { key: 'diff', label: 'Modificações', sortable: false, width: '120px' },
];

const loadEntities = async () => {
  try {
    const response = await auditService.getEntities();
    entities.value = response.data;
  } catch (error) {
    console.error('Failed to load audited entities', error);
  }
};

const onEntityChange = () => {
  if (selectedEntity.value && tableRef.value) {
    tableRef.value.loadData();
  }
};

const fetchAuditLogs = async (params) => {
  if (!selectedEntity.value) return { content: [], totalElements: 0, totalPages: 0 };
  const response = await auditService.getByEntity(selectedEntity.value, params);
  return {
    content: response.data,
    totalElements: response.data.length,
    totalPages: 1
  };
};

const formatEntityName = (name) => {
  return name.replace('Entity', '');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

const showDetails = (log) => {
  selectedLog.value = log;
};

onMounted(() => {
  loadEntities();
});
</script>
