<template>
  <div class="anamnesis-list-container">
    <div class="header-actions">
      <button type="button" class="btn btn-primary" @click="$emit('new', clientData)">+ Nova Anamnese</button>
    </div>

    <!-- GenericTable expects fetchData which returns a boolean or data. 
         We wrap anamnesisService.getAllByClient to inject the clientId. -->
    <GenericTable
      ref="tableRef"
      :columns="columns"
      :fetch-data="fetchAnamneses"
      :has-actions="true"
      @row-click="$emit('view', $event)"
    >
      <!-- Custom rendering for Type column to show colored badges -->
      <template #cell-type="{ item }">
        <span class="badge" :class="getTypeBadgeClass(item.type)">
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
          class="btn-icon delete"
          title="Deletar"
          @click.stop="deleteItem(item)"
        >
          ✕
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
    // Enrich with type descriptions if not provided by backend DTO
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

// Method exposed to parent to refresh the list after a save
const refresh = () => {
  if (tableRef.value) {
    tableRef.value.loadData();
  }
};
defineExpose({ refresh });

const deleteItem = async (item) => {
  if (confirm('Tem certeza que deseja excluir esta anamnese?')) {
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
    FACIAL: 'badge-success', // Green
    EYELASH_EXTENSION: 'badge-purple', // Purple
    MICROPIGMENTATION: 'badge-warning' // Orange/Yellow
  };
  return map[type] || 'badge-secondary';
};

</script>

<style scoped>
.anamnesis-list-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--spacing-md);
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-purple {
  background-color: #f3e8ff;
  color: #7e22ce;
}

.badge-success {
  background-color: #dcfce7 !important;
  color: #166534 !important;
}

.badge-warning {
  background-color: #fef9c3 !important;
  color: #854d0e !important;
}
</style>
