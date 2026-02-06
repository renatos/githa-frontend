<template>
  <div class="modal-backdrop">
    <div class="modal-container">
      <div class="modal-header">
        <h3>Gerar Atendimento</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="submit" class="modal-body">
        
        <!-- Procedimento (Service) -->
        <div class="form-group">
          <label>Procedimento *</label>
          <BaseLookup 
            v-model="form.serviceId" 
            :initial-description="initialServiceName"
            :search-service="serviceService"
            placeholder="Pesquisar Procedimento..."
            @select="onServiceSelect"
          />
        </div>

        <!-- Profissional -->
        <div class="form-group">
          <label>Profissional *</label>
           <BaseLookup 
            v-model="form.professionalId" 
            :initial-description="initialProfessionalName"
            :search-service="professionalService"
            placeholder="Pesquisar Profissional..."
            @select="onProfessionalSelect"
          />
        </div>

        <!-- Descrição (ReadOnly) -->
        <div class="form-group">
          <label>Descrição</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="form.description" 
          >
        </div>

        <!-- Tipo e Desconto -->
        <div class="form-row">
            <div class="form-group col">
                <label>Tipo</label>
                <input type="text" class="form-control" value="RECEITA" disabled>
            </div>
             <div class="form-group col">
                <label>Desconto (%)</label>
                <input 
                    type="number" 
                    step="0.01" 
                    class="form-control" 
                    v-model.number="form.discount"
                >
            </div>
        </div>

        <!-- Valores (ReadOnly) -->
        <!-- Valores -->
        <div class="form-row">
             <div class="form-group col">
                <label>Valor Procedimento</label>
                <input 
                    type="text" 
                    class="form-control" 
                    :value="formatCurrency(computedValue)" 
                    disabled
                >
            </div>
             <div class="form-group col">
                <label>Pagamento (Valor da Transação) *</label>
                 <CurrencyInput 
                    v-model="form.amount" 
                    required
                />
            </div>
        </div>

        <!-- Valores (ReadOnly) -->

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Gerar' }}
          </button>
        </div>
      </form>
    </div>
    <ErrorModal 
        :show="showError" 
        :message="errorMessage" 
        @close="closeError" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import BaseLookup from '../common/BaseLookup.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import ErrorModal from '../common/ErrorModal.vue';
import financialService from '../../services/financialService';
import { serviceService } from '../../services/serviceService';
import { professionalService } from '../../services/professionalService';
import { useEscapeKey } from '../../composables/useEscapeKey';

const props = defineProps({
  transaction: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);

// Add ESC key support
useEscapeKey(() => emit('close'));

const loading = ref(false);
const form = ref({
    serviceId: null,
    professionalId: null,
    discount: 0,
    amount: null,
    description: '' // New editable description
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
    // Professional is PRE-FILLED from transaction as requested
    if (props.transaction.professionalId) {
        form.value.professionalId = props.transaction.professionalId;
        initialProfessionalName.value = props.transaction.professionalName;
    }
    
    // Service is EMPTY as requested
    
    // Payment Amount is EMPTY as requested
    form.value.amount = null;

    // Initialize description if empty (or keep empty until service selected)
    // Actually, we should probably start with what the computed value WOULD be if we had a service?
    // Or just default. If service is empty, description "Procedimento - Cliente" is weird.
    // Let's leave it blank or default to just Client Name until Service is picked?
    // For now, let's leave blank as valid start, or "Procedimento - Client" if that's generic.
    form.value.description = `Procedimento - ${props.transaction.clientName || 'Cliente'}`; 
});

const onServiceSelect = (service) => {
    selectedService.value = service;
};

const onProfessionalSelect = (professional) => {
    selectedProfessional.value = professional;
};

// Removed computedDescription, now using form.description and watcher

// Value of the selected service (Raw Price) - Displayed in "Valor Procedimento"
const computedValue = computed(() => {
    if (!selectedService.value) return 0;
    return selectedService.value.price || 0;
});

// Watch calculation dependencies to update form.amount automatically

watch([() => selectedService.value, () => form.value.discount], () => {
    // Update Amount
    if (!selectedService.value) {
        form.value.amount = null;
        // Don't clear description maybe? Or reset to default?
        // If user clears service, maybe they want to clear description or keep manual edit.
        // Let's just focus on Amount here as per previous step.
    } else {
        const price = selectedService.value.price || 0;
        const discount = form.value.discount || 0;
        const calculated = price * (1 - discount/100);
        form.value.amount = parseFloat(calculated.toFixed(2));
    }
});

// Separate watcher for Description to avoid overwriting manual edits too aggressively?
// Requirement: "Descrição: aberto para edição".
// Common pattern: Update description when Service changes.
watch(() => selectedService.value, (newService) => {
    if (newService) {
        form.value.description = `${newService.name} - ${props.transaction.clientName || 'Cliente'}`;
    }
});

const formatCurrency = (val) => {
    if (val === undefined || val === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const submit = async () => {
  if (!form.value.serviceId) {
    showError.value = true;
    errorMessage.value = 'Selecione um Procedimento.';
    return;
  }
  if (!form.value.professionalId) {
    showError.value = true;
    errorMessage.value = 'Selecione um Profissional.';
    return;
  }
  if (!form.value.amount) {
      showError.value = true;
      errorMessage.value = 'Informe o valor do pagamento.';
      return;
  }

  loading.value = true;
  try {
    await financialService.createAppointmentFromTransaction(props.transaction.id, {
        serviceId: form.value.serviceId,
        professionalId: form.value.professionalId,
        discount: form.value.discount,
        amount: form.value.amount,
        description: form.value.description // Send description
    });
    emit('save');
  } catch (error) {
    console.error(error);
    showError.value = true;
    errorMessage.value = 'Erro ao gerar atendimento: ' + (error.response?.data?.message || error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-border);
}

.modal-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.modal-body {
  padding: var(--spacing-lg);
}

.modal-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: var(--spacing-md);
}

.form-group.col {
    flex: 1;
}

label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-control {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-input);
  color: var(--color-text-primary);
}

.alert-warning {
    background-color: #fef3c7;
    color: #92400e;
    padding: 0.75rem;
    border-radius: 0.25rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}
</style>
