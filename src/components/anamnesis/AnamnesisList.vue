<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-end">
      <button
type="button" 
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              @click="$emit('new', clientData)">
        <span class="material-symbols-outlined text-[18px]">add</span>
        Nova Anamnese
      </button>
    </div>

    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchAnamneses"
      :has-actions="true"
      @row-click="$emit('view', $event)"
    >
      <!-- Custom rendering for Type column to show colored badges -->
      <template #cell-type="{ item }">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" :class="getTypeBadgeClass(item.type)">
          {{ getTypeIcon(item.type) }} {{ item.typeDescription || formatType(item.type) }}
        </span>
      </template>
      
      <template #cell-attendanceDate="{ item }">
        {{ formatDate(item.attendanceDate) }}
      </template>

      <!-- Custom Actions (Delete) -->
      <template #actions="{ item }">
        <button
          type="button"
          class="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Deletar"
          @click.stop="deleteItem(item)"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </template>
    </GenericTable>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import GenericTable from '../common/GenericTable.vue';
import { anamnesisService } from '../../services/anamnesisService';
import { enumService } from '../../services/enumService';
import { toastBridge } from '../../services/toastBridge';
import { confirmBridge } from '../../services/confirmBridge';
import { formatDate } from '../../utils/formatters';

const props = defineProps({
  clientId: {
    type: [Number, String],
    required: true
  },
  clientData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['new', 'edit', 'view']);
const tableRef = ref(null);
const anamnesisTypes = ref([]);

const columns = [
  { key: 'attendanceDate', label: 'Data', sortable: true },
  { key: 'type', label: 'Tipo', sortable: true },
  { key: 'professionalNotes', label: 'Observações', sortable: true },
];

onMounted(async () => {
  try {
    anamnesisTypes.value = await enumService.getOptions('AnamnesisType');
  } catch (error) {
    console.error('Failed to load AnamnesisType options', error);
  }
});

const fetchAnamneses = async (params) => {
  if (!props.clientId) return { data: { content: [], totalElements: 0 } };
  
  try {
    const response = await anamnesisService.getAllByClient(props.clientId, params);
    if (response.data && response.data.content) {
      response.data.content = response.data.content.map(item => {
        const typeOpt = anamnesisTypes.value.find(t => t.name === item.type);
        return {
          ...item,
          typeDescription: typeOpt ? typeOpt.description : item.type
        };
      });
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching anamneses:", error);
    throw error;
  }
};

watch(() => props.clientId, () => {
  if (tableRef.value) {
    tableRef.value.loadData();
  }
});

const refresh = () => {
  if (tableRef.value) {
    tableRef.value.loadData();
  }
};
defineExpose({ refresh });

const deleteItem = async (item) => {
  confirmBridge.confirm({
    title: 'Excluir Anamnese',
    message: 'Tem certeza que deseja excluir esta anamnese?',
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await anamnesisService.delete(props.clientId, item.id);
        
        const toast = toastBridge.getToast();
        if (toast) {
          toast.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Anamnese excluída com sucesso!',
            life: 3000
          });
        }
        refresh();
      } catch (error) {
        console.error('Erro ao excluir anamnese:', error);
        const toast = toastBridge.getToast();
        if (toast) {
          toast.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível excluir a anamnese',
            life: 3000
          });
        }
      }
    }
  });
};

const formatType = (type) => {
  const map = {
    FACIAL: 'Facial',
    EYELASH_EXTENSION: 'Extensão de Cílios',
    MICROPIGMENTATION: 'Micropigmentação'
  };
  return map[type] || type;
};

const getTypeIcon = (type) => {
  const map = {
    FACIAL: '💆‍♀️',
    EYELASH_EXTENSION: '👁️',
    MICROPIGMENTATION: '🖊️'
  };
  return map[type] || '📄';
};

const getTypeBadgeClass = (type) => {
  const map = {
    FACIAL: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    EYELASH_EXTENSION: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    MICROPIGMENTATION: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };
  return map[type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
};

</script>
