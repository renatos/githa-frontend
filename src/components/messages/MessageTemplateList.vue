<template>
  <div class="space-y-4">
    <!-- Header with Filters & Action -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <!-- Filter Origin -->
        <select
          v-model="filterOrigin"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas as Origens</option>
          <option value="REBOOKING">Rebooking (Retorno)</option>
          <option value="FOLLOW_UP">Acompanhamento (Pós-Procedimento)</option>
          <option value="LEAD">Leads</option>
          <option value="APPOINTMENT">Agendamentos</option>
          <option value="SYSTEM">Sistema</option>
        </select>

        <!-- Filter Status -->
        <select
          v-model="filterActive"
          class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos os Status</option>
          <option value="true">Apenas Ativos</option>
          <option value="false">Apenas Inativos</option>
        </select>
      </div>

      <button
        class="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors shrink-0"
        @click="openCreateModal"
      >
        <Plus class="w-4 h-4" />
        Novo Template
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-400">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
        Carregando templates...
      </div>

      <div v-else-if="filteredTemplates.length === 0" class="p-8 text-center text-slate-400">
        <FileText class="w-8 h-8 mx-auto mb-2 opacity-50" />
        Nenhum template encontrado para os filtros selecionados.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 dark:bg-slate-800/80 text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-4 py-3">Template</th>
              <th class="px-4 py-3">Origem</th>
              <th class="px-4 py-3">Canal / Público</th>
              <th class="px-4 py-3 text-center">Padrão</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr
              v-for="tmpl in filteredTemplates"
              :key="tmpl.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
              @click="openEditModal(tmpl)"
            >
              <!-- Nome e Conteúdo -->
              <td class="px-4 py-3 max-w-xs">
                <div class="font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {{ tmpl.name }}
                </div>
                <div class="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {{ tmpl.description || tmpl.content }}
                </div>
              </td>

              <!-- Origem -->
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
                  :class="getOriginBadgeClass(tmpl.originType)"
                >
                  {{ tmpl.originTypeDescription || tmpl.originType }}
                </span>
              </td>

              <!-- Canal / Audiência -->
              <td class="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1.5">
                  <span class="font-medium">{{ tmpl.channel }}</span>
                  <span class="text-slate-400">•</span>
                  <span>{{ formatAudience(tmpl.audienceType) }}</span>
                </div>
              </td>

              <!-- Padrão -->
              <td class="px-4 py-3 text-center">
                <span
                  v-if="tmpl.isDefault"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                >
                  ★ Padrão
                </span>
                <span v-else class="text-xs text-slate-400">-</span>
              </td>

              <!-- Status -->
              <td class="px-4 py-3 text-center">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  :class="tmpl.active ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'"
                >
                  {{ tmpl.active ? 'Ativo' : 'Inativo' }}
                </span>
              </td>

              <!-- Ações -->
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <!-- Toggle Ativo -->
                  <button
                    :title="tmpl.active ? 'Desativar Template' : 'Ativar Template'"
                    class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    @click.stop="handleToggleActive(tmpl)"
                  >
                    <Power class="w-4 h-4" />
                  </button>

                  <!-- Excluir -->
                  <button
                    v-if="!tmpl.isDefault"
                    title="Excluir Template"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    @click.stop="handleDelete(tmpl)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Component -->
    <MessageTemplateModal
      :show="showModal"
      :template="selectedTemplate"
      @close="closeModal"
      @save="handleSaveTemplate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Plus, Trash2, Power, FileText, Loader2 } from 'lucide-vue-next';
import messageTemplateService from '../../services/messageTemplateService';
import MessageTemplateModal from './MessageTemplateModal.vue';

const templates = ref([]);
const loading = ref(false);
const filterOrigin = ref('');
const filterActive = ref('');

const showModal = ref(false);
const selectedTemplate = ref(null);

const loadTemplates = async () => {
  loading.value = true;
  try {
    const data = await messageTemplateService.getAll();
    templates.value = data || [];
  } catch (err) {
    console.error('Failed to load message templates:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(loadTemplates);

const filteredTemplates = computed(() => {
  return templates.value.filter((t) => {
    if (filterOrigin.value && t.originType !== filterOrigin.value) return false;
    if (filterActive.value !== '') {
      const activeBool = filterActive.value === 'true';
      if (t.active !== activeBool) return false;
    }
    return true;
  });
});

const getOriginBadgeClass = (origin) => {
  switch (origin) {
    case 'REBOOKING':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
    case 'FOLLOW_UP':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    case 'LEAD':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    case 'APPOINTMENT':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
};

const formatAudience = (aud) => {
  switch (aud) {
    case 'CLIENT': return 'Clientes';
    case 'LEAD': return 'Leads';
    case 'PROFESSIONAL': return 'Profissionais';
    default: return aud;
  }
};

const openCreateModal = () => {
  selectedTemplate.value = null;
  showModal.value = true;
};

const openEditModal = (tmpl) => {
  selectedTemplate.value = { ...tmpl };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedTemplate.value = null;
};

const handleSaveTemplate = async (formData) => {
  try {
    if (formData.id) {
      await messageTemplateService.update(formData.id, formData);
    } else {
      await messageTemplateService.create(formData);
    }
    closeModal();
    await loadTemplates();
  } catch (err) {
    console.error('Failed to save template:', err);
    alert(err?.response?.data?.message || 'Erro ao salvar template');
  }
};

const handleToggleActive = async (tmpl) => {
  try {
    await messageTemplateService.toggleActive(tmpl.id);
    await loadTemplates();
  } catch (err) {
    console.error('Failed to toggle template active status:', err);
    alert('Erro ao alterar status do template');
  }
};

const handleDelete = async (tmpl) => {
  if (!confirm(`Deseja realmente excluir o template "${tmpl.name}"?`)) return;
  try {
    await messageTemplateService.delete(tmpl.id);
    await loadTemplates();
  } catch (err) {
    console.error('Failed to delete template:', err);
    alert(err?.response?.data?.message || 'Erro ao excluir template');
  }
};
</script>
