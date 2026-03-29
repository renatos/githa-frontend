<template>
  <BaseModal
    :show="true"
    max-width="max-w-lg"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
        <i class="fa-solid fa-calendar-plus text-indigo-600 dark:text-indigo-400 text-lg"></i>
      </div>
      <div class="min-w-0">
        <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
          Gerar Atendimento
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Vincular Transação
        </p>
      </div>
    </template>
    <form class="space-y-6" @submit.prevent="submit">
      
      <!-- Procedimento -->
      <div class="space-y-2">
        <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Procedimento *</label>
        <div class="h-12 w-full mt-1">
          <BaseLookup
            v-model="form.serviceId"
            :initial-description="initialServiceName"
            :search-service="serviceService"
            placeholder="Pesquisar Procedimento..."
            @select="onServiceSelect"
          />
        </div>
      </div>

      <!-- Profissional -->
      <div class="space-y-2">
        <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Profissional *</label>
        <div class="h-12 w-full mt-1">
          <BaseLookup
            v-model="form.professionalId"
            :initial-description="initialProfessionalName"
            :search-service="professionalService"
            placeholder="Pesquisar Profissional..."
            @select="onProfessionalSelect"
          />
        </div>
      </div>

      <!-- Descrição -->
      <div class="space-y-2">
        <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Descrição</label>
        <div class="relative group mt-1">
          <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors"></i>
          <input 
            v-model="form.description" 
            placeholder="Descrição do atendimento..."
            class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 pl-11 pr-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
          />
        </div>
      </div>

      <!-- Tipo e Desconto -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Tipo</label>
          <div class="h-12 flex items-center gap-2 px-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 border-dashed text-slate-400 font-bold text-base opacity-70">
             <i class="fa-solid fa-arrow-up text-emerald-500/50"></i>
             RECEITA
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Desconto (%)</label>
          <div class="relative group mt-1">
            <i class="fa-solid fa-percent absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors"></i>
            <input 
              v-model.number="form.discount" 
              type="number" 
              step="0.01"
              class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 pl-11 pr-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
            />
          </div>
        </div>
      </div>

      <!-- Valores -->
      <div class="grid grid-flow-row sm:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Valor Procedimento</label>
          <div class="h-12 flex items-center px-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 font-bold tracking-tight text-base">
             {{ formatCurrency(computedValue) }}
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-indigo-600 dark:text-indigo-400 text-sm font-medium leading-normal block ml-1 pb-1">Pagamento *</label>
          <div class="h-12 mt-1">
            <CurrencyInput 
              v-model="form.amount" 
              required
              class="flex w-full h-12 rounded-lg text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-black"
            />
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <button 
        type="button" 
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button 
        :disabled="loading"
        class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
        @click="submit"
      >
        <i v-if="loading" class="fa-solid fa-circle-notch animate-spin"></i>
        {{ loading ? 'Salvando...' : 'Gerar Atendimento' }}
      </button>
    </template>

    <!-- Error Modal Portal -->
    <ErrorModal
        :message="errorMessage"
        :show="showError"
        @close="closeError"
    />
  </BaseModal>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import BaseModal from '../common/BaseModal.vue';
import BaseLookup from '../common/BaseLookup.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import ErrorModal from '../common/ErrorModal.vue';
import financialService from '../../services/financialService';
import {serviceService} from '../../services/serviceService';
import {professionalService} from '../../services/professionalService';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

const loading = ref(false);
const form = ref({
  serviceId: null,
  professionalId: null,
  discount: 0,
  amount: 0,
  description: ''
});

const selectedService = ref(null);
const selectedProfessional = ref(null);

const initialServiceName = ref('');
const initialProfessionalName = ref('');

// Error state
const showError = ref(false);
const errorMessage = ref('');

const closeError = () => {
  showError.value = false;
  errorMessage.value = '';
};

onMounted(() => {
  if (props.transaction.professionalId) {
    form.value.professionalId = props.transaction.professionalId;
    initialProfessionalName.value = props.transaction.professionalName;
  }
  form.value.amount = 0;
  form.value.description = `Procedimento - ${props.transaction.clientName || 'Cliente'}`;
});

const onServiceSelect = (service) => {
  selectedService.value = service;
};

const onProfessionalSelect = (professional) => {
  selectedProfessional.value = professional;
};

const computedValue = computed(() => {
  if (!selectedService.value) return 0;
  return selectedService.value.price || 0;
});

watch([() => selectedService.value, () => form.value.discount], () => {
  if (!selectedService.value) {
    form.value.amount = null;
  } else {
    const price = selectedService.value.price || 0;
    const discount = form.value.discount || 0;
    const calculated = price * (1 - discount / 100);
    form.value.amount = parseFloat(calculated.toFixed(2));
  }
});

watch(() => selectedService.value, (newService) => {
  if (newService) {
    form.value.description = `${newService.name} - ${props.transaction.clientName || 'Cliente'}`;
  }
});

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '';
  return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(val);
};

const submit = async () => {
  if (!form.value.serviceId || !form.value.professionalId || !form.value.amount) {
    showError.value = true;
    errorMessage.value = 'Preencha todos os campos obrigatórios.';
    return;
  }

  loading.value = true;
  try {
    await financialService.createAppointmentFromTransaction(props.transaction.id, {
      serviceId: form.value.serviceId,
      professionalId: form.value.professionalId,
      discount: form.value.discount,
      amount: form.value.amount,
      description: form.value.description
    });
    emit('save');
  } catch (error) {
    showError.value = true;
    errorMessage.value = 'Erro ao gerar atendimento: ' + (error.response?.data?.message || error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Legado CSS removido em favor do Tailwind CSS */
</style>
