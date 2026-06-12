<template>
  <BaseModal
    :show="true"
    :title="investment ? 'Editar Investimento' : 'Registrar Investimento'"
    icon="fa-solid fa-chart-line"
    :body-padding="false"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <form id="investmentForm" class="flex flex-col h-full animate-fadeIn" @submit.prevent="save">
      <div class="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
        <!-- Form Errors -->
        <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <i class="fa-solid fa-circle-exclamation text-base"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Investment Type Selection -->
        <div class="flex flex-col">
          <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
            Tipo de Investimento <span class="text-red-500">*</span>
          </span>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200 text-sm font-medium">
              <input
                v-model="form.type"
                type="radio"
                value="PROCEDURE"
                class="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Procedimento
            </label>
            <label class="flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200 text-sm font-medium">
              <input
                v-model="form.type"
                type="radio"
                value="MARKETING"
                class="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              Campanha de Marketing
            </label>
          </div>
        </div>

        <!-- Name -->
        <label class="flex flex-col">
          <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
            Nome do Investimento / Campanha <span class="text-red-500">*</span>
          </span>
          <input
            v-model="form.name"
            class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors"
            placeholder="Ex: Curso de Toxina Botulínica, Anúncios do Instagram"
            required
            type="text"
          />
        </label>

        <!-- Operating Expense or Credit Card Expense (CAPEX) -->
        <label class="flex flex-col">
          <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
            Transação / Despesa Associada (CAPEX) <span class="text-red-500">*</span>
          </span>
          <select
            v-model="selectedExpenseUnifiedId"
            class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors"
            required
          >
            <option :value="null" disabled>Selecione uma despesa CAPEX...</option>
            <option
              v-for="opt in capexOptions"
              :key="opt.unifiedId"
              :value="opt.unifiedId"
            >
              {{ opt.description }} ({{ formatCurrency(opt.amount) }})
            </option>
          </select>
          <span class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Vincule a uma despesa ou gasto de cartão do tipo CAPEX (Investimento).
          </span>
        </label>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cost -->
          <label class="flex flex-col">
            <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
              Custo <span class="text-red-500">*</span>
            </span>
            <div class="h-11 flex w-full">
              <CurrencyInput
                v-model="form.cost"
                class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 text-base transition-colors cursor-not-allowed"
                required
                readonly
              />
            </div>
          </label>

          <!-- Date -->
          <label class="flex flex-col">
            <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
              Data do Investimento <span class="text-red-500">*</span>
            </span>
            <input
              v-model="form.date"
              class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors cursor-not-allowed"
              required
              type="date"
              readonly
            />
          </label>
        </div>

        <!-- Recurrence Configuration (Marketing Only) -->
        <label v-if="form.type === 'MARKETING'" class="flex flex-col">
          <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
            Recorrência da Campanha <span class="text-red-500">*</span>
          </span>
          <select
            v-model="form.recurrence"
            class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors"
          >
            <option value="NONE">Nenhuma</option>
            <option value="WEEKLY">Semanal</option>
            <option value="MONTHLY">Mensal</option>
          </select>
        </label>

        <!-- Services Enabled (Checkboxes - Procedure Only) -->
        <div v-if="form.type === 'PROCEDURE'" class="flex flex-col">
          <span class="text-slate-900 dark:text-slate-100 text-sm font-semibold pb-2 flex items-center gap-1">
            Procedimentos Habilitados (Selecione pelo menos um) <span class="text-red-500">*</span>
          </span>
          
          <!-- Search input for services -->
          <div class="relative mb-3">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <i class="fa-solid fa-magnifying-glass"></i>
            </span>
            <input
              v-model="serviceSearch"
              class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-10 pl-9 pr-4 text-sm transition-colors"
              placeholder="Filtrar procedimentos..."
              type="text"
            />
          </div>

          <!-- Services List -->
          <div class="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/20 custom-scrollbar flex flex-col gap-2">
            <div v-if="loadingServices" class="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              <i class="fa-solid fa-spinner animate-spin mr-2"></i>Carregando procedimentos...
            </div>
            <div v-else-if="filteredServices.length === 0" class="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">
              Nenhum procedimento encontrado.
            </div>
            <label
              v-for="service in filteredServices"
              :key="service.id"
              class="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <input
                v-model="form.serviceIds"
                type="checkbox"
                :value="service.id"
                class="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{{ service.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ service.group }}</p>
              </div>
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                {{ formatCurrency(service.price) }}
              </span>
            </label>
          </div>
        </div>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
        type="button"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        form="investmentForm"
        class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        :disabled="saving || (form.type === 'PROCEDURE' && form.serviceIds.length === 0)"
      >
        <span v-if="saving"><i class="fa-solid fa-spinner animate-spin mr-2"></i>Salvando...</span>
        <span v-else>Salvar</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import { serviceService } from '../../services/serviceService';
import { investmentService } from '../../services/investmentService';
import financialService from '../../services/financialService';

const props = defineProps({
  investment: { type: Object, default: null },
  zIndex: { type: Number, default: 9999 }
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  type: 'PROCEDURE',
  name: '',
  cost: 0,
  date: new Date().toISOString().substring(0, 10),
  operatingExpenseId: null,
  creditCardExpenseId: null,
  serviceIds: [],
  recurrence: 'NONE'
});

const services = ref([]);
const capexOptions = ref([]);
const selectedExpenseUnifiedId = ref(null);
const serviceSearch = ref('');
const loadingServices = ref(false);
const saving = ref(false);
const error = ref('');

const filteredServices = computed(() => {
  if (!serviceSearch.value) return services.value;
  const search = serviceSearch.value.toLowerCase();
  return services.value.filter(s =>
    s.name.toLowerCase().includes(search) ||
    (s.group && s.group.toLowerCase().includes(search))
  );
});

onMounted(async () => {
  if (props.investment) {
    form.value = {
      type: props.investment.type || 'PROCEDURE',
      name: props.investment.name || '',
      cost: props.investment.cost || 0,
      date: props.investment.date || new Date().toISOString().substring(0, 10),
      operatingExpenseId: props.investment.operatingExpenseId || null,
      creditCardExpenseId: props.investment.creditCardExpenseId || null,
      serviceIds: props.investment.enabledServices ? props.investment.enabledServices.map(s => s.id) : [],
      recurrence: props.investment.recurrence || 'NONE'
    };

    if (form.value.operatingExpenseId) {
      selectedExpenseUnifiedId.value = `TX-${form.value.operatingExpenseId}`;
    } else if (form.value.creditCardExpenseId) {
      selectedExpenseUnifiedId.value = `CC-${form.value.creditCardExpenseId}`;
    }
  }

  // Load CAPEX expenses from backend
  try {
    const response = await financialService.getCapexOptions();
    capexOptions.value = response.data || [];

    // Prepend active selection if missing from fetched options
    if (selectedExpenseUnifiedId.value && !capexOptions.value.some(opt => opt.unifiedId === selectedExpenseUnifiedId.value)) {
      capexOptions.value.unshift({
        unifiedId: selectedExpenseUnifiedId.value,
        id: form.value.operatingExpenseId || form.value.creditCardExpenseId,
        type: form.value.operatingExpenseId ? 'TRANSACTION' : 'CREDIT_CARD_EXPENSE',
        description: 'Despesa Atual Vinculada',
        amount: form.value.cost,
        date: form.value.date
      });
    }

    updateCostAndDate();
  } catch (err) {
    console.error('Erro ao carregar despesas CAPEX:', err);
  }

  loadingServices.value = true;
  try {
    const response = await serviceService.getAll({ page: 0, size: 200 });
    if (Array.isArray(response.data)) {
      services.value = response.data.filter(s => s.active);
    } else if (response.data && response.data.content) {
      services.value = response.data.content.filter(s => s.active);
    }
  } catch (err) {
    console.error('Erro ao carregar procedimentos:', err);
    error.value = 'Não foi possível carregar a lista de procedimentos.';
  } finally {
    loadingServices.value = false;
  }
});

const updateCostAndDate = () => {
  if (selectedExpenseUnifiedId.value) {
    const selectedOpt = capexOptions.value.find(opt => opt.unifiedId === selectedExpenseUnifiedId.value);
    if (selectedOpt) {
      form.value.cost = selectedOpt.amount || 0;
      if (selectedOpt.date) {
        form.value.date = typeof selectedOpt.date === 'string' 
          ? selectedOpt.date.substring(0, 10) 
          : selectedOpt.date;
      }
      if (selectedOpt.type === 'TRANSACTION') {
        form.value.operatingExpenseId = selectedOpt.id;
        form.value.creditCardExpenseId = null;
      } else {
        form.value.creditCardExpenseId = selectedOpt.id;
        form.value.operatingExpenseId = null;
      }
    }
  } else {
    form.value.cost = 0;
    form.value.operatingExpenseId = null;
    form.value.creditCardExpenseId = null;
  }
};

watch(selectedExpenseUnifiedId, updateCostAndDate);

const save = async () => {
  if (form.value.cost < 0) {
    error.value = 'O custo do investimento não pode ser negativo.';
    return;
  }
  if (!form.value.name.trim()) {
    error.value = 'O nome do investimento é obrigatório.';
    return;
  }
  if (form.value.type === 'PROCEDURE' && form.value.serviceIds.length === 0) {
    error.value = 'Selecione pelo menos um procedimento habilitado.';
    return;
  }
  if (!form.value.operatingExpenseId && !form.value.creditCardExpenseId) {
    error.value = 'A transação ou gasto de cartão associado é obrigatório.';
    return;
  }

  saving.value = true;
  error.value = '';
  try {
    const payload = {
      type: form.value.type,
      name: form.value.name.trim(),
      cost: form.value.cost,
      date: form.value.date,
      operatingExpenseId: form.value.operatingExpenseId || null,
      creditCardExpenseId: form.value.creditCardExpenseId || null,
      serviceIds: form.value.type === 'PROCEDURE' ? form.value.serviceIds : [],
      recurrence: form.value.type === 'MARKETING' ? form.value.recurrence : 'NONE'
    };
    
    let response;
    if (props.investment && props.investment.id) {
      response = await investmentService.updateInvestment(props.investment.id, payload);
    } else {
      response = await investmentService.createInvestment(payload);
    }
    
    emit('save', response.data);
  } catch (err) {
    console.error('Erro ao salvar investimento:', err);
    error.value = err.response?.data?.message || 'Falha ao salvar o investimento. Tente novamente.';
  } finally {
    saving.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};
</script>
