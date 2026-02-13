<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ transaction.id ? 'Editar Transação' : 'Nova Transação' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-group">
          <label>Descrição</label>
          <input v-model="form.description" :disabled="!canSave" />
        </div>

        <div class="mb-3" v-if="!isAppointmentTransaction">
          <label for="operatingExpense" class="form-label">Despesa Operacional</label>
          <select class="form-select" id="operatingExpense" v-model="form.operatingExpenseId" :disabled="!canSave">
            <option :value="undefined">Selecione uma despesa</option>
            <option v-for="expense in operatingExpenses" :key="expense.id" :value="expense.id">
              {{ expense.name }}
            </option>
          </select>
        </div>

        <div class="form-row" v-if="isAppointmentTransaction">
           <div class="form-group">
                <div class="appointment-link">
                    <span class="badge income" @click="viewAppointment">Vinculado ao Agendamento #{{ form.appointmentId }}</span>
                </div>
           </div>
        </div>

        <div class="form-group">
          <label>Forma de Pagamento</label>
          <BaseLookup
            v-model="form.paymentMethodId"
            :search-service="paymentMethodService"
            :initial-description="form.paymentMethodName"
            placeholder="Selecione a forma de pagamento"
            :disabled="!canSave"
            @select="onPaymentMethodSelect"
          />
        </div>

        <div class="form-row">
           <div class="form-group">
            <label>Tipo</label>
            <select v-model="form.type" required :disabled="isAppointmentTransaction || !!form.operatingExpenseId || !canSave">
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>

          <div class="form-group">
            <label>Valor</label>
            <CurrencyInput v-model="form.amount" required :disabled="!canSave" />
          </div>
        </div>

        <!-- Discount Preview -->
        <div v-if="discountPreview" class="discount-preview">
          <div class="discount-header">
            <span class="discount-icon">💰</span>
            <span>Desconto: <strong>{{ selectedPaymentMethod.name }}</strong> ({{ discountPreview.percentage }}%)</span>
          </div>
          <div class="discount-details">
            <div class="discount-row">
              <span>Valor original:</span>
              <span>{{ formatCurrency(form.amount) }}</span>
            </div>
            <div class="discount-row discount-value">
              <span>Desconto:</span>
              <span>- {{ formatCurrency(discountPreview.discountAmount) }}</span>
            </div>
            <div class="discount-row discount-final">
              <span>Valor final estimado:</span>
              <span>{{ formatCurrency(discountPreview.finalAmount) }}</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Categoria</label>
            <input v-model="form.category" :disabled="!canSave" />
          </div>
          
           <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" required :disabled="!canSave">
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>




        <div class="form-row">
          <div class="form-group">
            <label>Pagamento</label>
             <input type="datetime-local" v-model="form.paymentDate" step="1" :disabled="!canSave" />
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="!canSave" :title="saveTooltip">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, watch } from 'vue';
import financialService from '../../services/financialService';
import { authService } from '../../services/authService';
import { useEscapeKey } from '../../composables/useEscapeKey';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';
import paymentMethodService from '../../services/paymentMethodService';

const props = defineProps({
  transaction: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'save', 'view-appointment']);

// Add ESC key support
useEscapeKey(() => emit('close'));

const isAdmin = ref(false);
const originalStatus = ref('');

const checkUserRole = () => {
    const user = authService.getCurrentUser();
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

const form = ref({
  description: '',
  amount: 0,
  type: 'EXPENSE',
  status: 'PENDING',
  category: undefined,
  paymentDate: '',
  operatingExpenseId: undefined,
  paymentMethodId: undefined,
  paymentMethodName: '',
  active: true
});

const selectedPaymentMethod = ref(null);

const operatingExpenses = ref([]); // Changed from accounts
const categories = ref([ // Added categories
  'Alimentação',
  'Transporte',
  'Lazer',
  'Saúde',
  'Educação',
  'Moradia',
  'Serviços',
  'Vestuário',
  'Outros',
  'IMPORTACAO 2025'
]);

const canSave = computed(() => {
    // If it's a new transaction (no ID), anyone can save
    if (!props.transaction.id) return true;
    
    // If original status was PAID, only ADMIN can save any changes
    if (originalStatus.value === 'PAID' && !isAdmin.value) {
        return false;
    }

    // If current status is PAID (and changing to it), only ADMIN can save
    if (form.value.status === 'PAID' && !isAdmin.value) {
        return false;
    }
    
    return true;
});

const saveTooltip = computed(() => {
    if (!canSave.value) {
        return 'Transação paga, apenas ADMIN pode salvar alterações.';
    }
    return '';
});

onMounted(async () => {
  checkUserRole();
  try {
    const response = await financialService.getOperatingExpenses(); // Changed service call
    operatingExpenses.value = response.data.filter(opEx => opEx.active); // Changed from accounts
  } catch (error) {
    console.error('Error loading operating expenses:', error); // Updated error message
  }

  if (props.transaction && props.transaction.id) {
    form.value = { ...props.transaction };
    originalStatus.value = props.transaction.status;
    
    // Show originalAmount in the Valor field so user sees the pre-discount value
    if (form.value.originalAmount) {
        form.value.amount = form.value.originalAmount;
    }
    
    // Format LocalDateTime for input type="datetime-local" (YYYY-MM-DDThh:mm:ss)
    if (form.value.paymentDate && form.value.paymentDate.length > 16) {
        form.value.paymentDate = form.value.paymentDate.substring(0, 19);
    }
    
    // Set payment method name for lookup
    if (form.value.paymentMethodId && props.transaction.paymentMethodName) {
        form.value.paymentMethodName = props.transaction.paymentMethodName;
    }

    // Load full payment method data for discount preview
    if (form.value.paymentMethodId) {
        try {
            const pmResponse = await paymentMethodService.getById(form.value.paymentMethodId);
            if (pmResponse.data) {
                selectedPaymentMethod.value = pmResponse.data;
            }
        } catch (e) {
            console.warn('Could not load payment method details', e);
        }
    }
  } else {
    // Default to current time
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    form.value.paymentDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
});

const onPaymentMethodSelect = (item) => {
    selectedPaymentMethod.value = item;
};

const discountPreview = computed(() => {
    if (!selectedPaymentMethod.value) return null;
    const pct = parseFloat(selectedPaymentMethod.value.discountPercentage);
    if (!pct || pct <= 0) return null;
    const amount = parseFloat(form.value.amount);
    if (!amount || amount <= 0) return null;
    const discountAmount = (amount * pct) / 100;
    return {
        percentage: pct,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round((amount - discountAmount) * 100) / 100
    };
});

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const save = () => {
  // Validate Description or Auto-fill
  if (!form.value.description) {
      if (form.value.operatingExpenseId) {
           const selectedExpense = operatingExpenses.value.find(e => e.id == form.value.operatingExpenseId);
            if (selectedExpense) {
                form.value.description = selectedExpense.name;
            } else {
                alert('Descrição é obrigatória.');
                return;
            }
      } else {
          alert('Descrição é obrigatória.');
          return;
      }
  }

  if (form.value.status === 'PAID' && !form.value.operatingExpenseId && !form.value.appointmentId) {
    alert('Por favor, selecione uma Despesa Operacional ou verifique o Agendamento para transações Pagas.');
    return;
  }
  emit('save', form.value);
};

// Keep originalAmount in sync when user edits the Valor field
watch(() => form.value.amount, (newVal) => {
    form.value.originalAmount = newVal;
});

const viewAppointment = () => {
    if (form.value.appointmentId) {
        emit('view-appointment', form.value.appointmentId);
    }
}

// Computed property to check if transaction is from appointment
const isAppointmentTransaction = computed(() => {
    return !!form.value.appointmentId;
});

// Watchers for business logic
watch(() => form.value.operatingExpenseId, (newVal) => {
    if (newVal) {
        if (!isAppointmentTransaction.value) {
            form.value.type = 'EXPENSE';
        }
        
        // Auto-fill description if empty
        if (!form.value.description) {
            const selectedExpense = operatingExpenses.value.find(e => e.id === newVal);
            if (selectedExpense) {
                form.value.description = selectedExpense.name;
            }
        }
    }
});

watch(() => form.value.appointmentId, (newVal) => {
    if (newVal) {
        form.value.type = 'INCOME';
    }
}, { immediate: true });
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--color-bg-card, #fff);
  padding: 2rem;
  border-radius: var(--radius-md);
  width: 500px;
  max-width: 95%;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
    margin: 0;
    color: var(--color-text-main);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-muted);
}

.form-group {
  margin-bottom: 1rem;
  flex: 1;
}

.form-row {
    display: flex;
    gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

input, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-main);
}

.appointment-link {
    display: inline-block;
    margin-bottom: 0.5rem;
}
.appointment-link .badge {
    cursor: pointer;
    text-decoration: underline;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.income {
    background-color: #dcfce7;
    color: #166534;
    border: 1px solid #166534;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}

.discount-preview {
    background: var(--color-bg-body, #f8f9fa);
    border: 1px solid var(--color-border);
    border-left: 3px solid var(--color-success, #16a34a);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.discount-header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}

.discount-icon {
    font-size: 1rem;
}

.discount-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.discount-row {
    display: flex;
    justify-content: space-between;
    color: var(--color-text-main);
}

.discount-value {
    color: var(--color-danger, #dc2626);
}

.discount-final {
    font-weight: 700;
    padding-top: 0.35rem;
    border-top: 1px solid var(--color-border);
    color: var(--color-success, #16a34a);
}
</style>
