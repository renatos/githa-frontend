<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ transaction.id ? 'Editar Transação' : 'Nova Transação' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="launch-mode-selector" v-if="!transaction.id">
            <button 
                type="button"
                class="mode-btn" 
                :class="{ active: launchMode === 'MANUAL' }"
                @click="launchMode = 'MANUAL'"
            >
                Lançamento Manual
            </button>
            <button 
                type="button"
                class="mode-btn" 
                :class="{ active: launchMode === 'SALE' }"
                @click="launchMode = 'SALE'"
            >
                Venda de Produtos/Serviços
            </button>
        </div>

        <div class="form-group" v-if="launchMode === 'MANUAL'">
          <label>Descrição</label>
          <input v-model="form.description" :disabled="!canSave" />
        </div>

        <!-- NEW: Client Selection for SALE mode -->
        <div class="form-group" v-if="launchMode === 'SALE'">
          <label>Cliente</label>
          <BaseLookup
            v-model="form.clientId"
            :search-service="clientService"
            :initial-description="form.clientName"
            placeholder="Selecione o cliente"
            :disabled="!canSave"
            @select="onClientSelect"
          />
        </div>

        <div class="mb-3" v-if="!isAppointmentTransaction && launchMode === 'MANUAL'">
          <label for="accountGroup" class="form-label">Grupo de Contas</label>
          <select class="form-select" id="accountGroup" v-model="form.accountGroupId" :disabled="!canSave">
            <option :value="undefined">Selecione um grupo</option>
            <option v-for="group in accountGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>

        <!-- SALE MODE: Items Table -->
        <div v-if="launchMode === 'SALE'" class="sale-items-section">
            <label>Itens da Venda</label>
            <div class="items-table-container">
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Item</th>
                            <th>Qtd</th>
                            <th>Valor Un.</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in saleItems" :key="item.id">
                            <td>{{ item.type === 'PRODUCT' ? '📦' : '💇' }}</td>
                            <td>
                                {{ item.type === 'PRODUCT' ? item.productName : item.serviceName }}
                                <br v-if="item.professionalName">
                                <small v-if="item.professionalName" class="text-muted">Pro: {{ item.professionalName }}</small>
                            </td>
                            <td>{{ item.quantity }}</td>
                            <td>{{ formatCurrency(item.unitPrice) }}</td>
                            <td>{{ formatCurrency(item.unitPrice * item.quantity) }}</td>
                            <td><button type="button" class="btn-remove" @click="removeSaleItem(index)">×</button></td>
                        </tr>
                        <!-- Add New Item Row -->
                        <tr class="new-item-row">
                            <td>
                                <select v-model="newItem.type" class="type-select">
                                    <option value="PRODUCT">Prod</option>
                                    <option value="SERVICE">Serv</option>
                                </select>
                            </td>
                            <td>
                                <BaseLookup
                                    v-if="newItem.type === 'PRODUCT'"
                                    v-model="newItem.productId"
                                    :search-service="productService"
                                    :initial-description="newItem.productName"
                                    placeholder="Produto..."
                                    size="small"
                                    @select="onProductSelect"
                                />
                                <div v-else class="service-selectors">
                                    <BaseLookup
                                        v-model="newItem.serviceId"
                                        :search-service="serviceService"
                                        :initial-description="newItem.serviceName"
                                        placeholder="Serviço..."
                                        size="small"
                                        @select="onServiceSelect"
                                    />
                                    <BaseLookup
                                        v-if="newItem.serviceId"
                                        v-model="newItem.professionalId"
                                        :search-service="professionalService"
                                        :initial-description="newItem.professionalName"
                                        placeholder="Profissional..."
                                        size="small"
                                        @select="onProfessionalSelect"
                                    />
                                </div>
                            </td>
                            <td><input type="number" v-model="newItem.quantity" min="1" class="qty-input"></td>
                            <td class="unit-price-cell"><CurrencyInput v-model="newItem.unitPrice" /></td>
                            <td>{{ formatCurrency(newItem.unitPrice * newItem.quantity) }}</td>
                            <td><button type="button" class="btn-add" @click="addSaleItem" :disabled="(newItem.type === 'PRODUCT' && !newItem.productId) || (newItem.type === 'SERVICE' && (!newItem.serviceId || !newItem.professionalId))">+</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
            <label>Natureza</label>
            <select v-model="form.nature" required :disabled="isAppointmentTransaction || !!form.accountGroupId || !canSave">
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
import { clientService } from '../../services/clientService';
import productService from '../../services/productService';
import { serviceService } from '../../services/serviceService';
import { professionalService } from '../../services/professionalService';
import { saleService } from '../../services/saleService';

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

const launchMode = ref('MANUAL'); // 'MANUAL' or 'SALE'

const form = ref({
  description: '',
  amount: 0,
  nature: 'EXPENSE',
  status: 'PENDING',
  category: undefined,
  paymentDate: '',
  accountGroupId: undefined,
  paymentMethodId: undefined,
  paymentMethodName: '',
  clientId: undefined,
  clientName: '',
  active: true
});

const saleItems = ref([]);
const newItem = ref({
    type: 'PRODUCT',
    productId: null,
    productName: '',
    serviceId: null,
    serviceName: '',
    professionalId: null,
    professionalName: '',
    quantity: 1,
    unitPrice: 0
});

const selectedPaymentMethod = ref(null);

const accountGroups = ref([]); // Changed from groups
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
    const response = await financialService.getAccountGroups(); // Changed service call
    accountGroups.value = response.data.filter(group => group.active); // Changed from groups
  } catch (error) {
    console.error('Error loading account groups:', error); // Updated error message
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

const addSaleItem = () => {
    if (newItem.value.type === 'PRODUCT' && !newItem.value.productId) return;
    if (newItem.value.type === 'SERVICE' && (!newItem.value.serviceId || !newItem.value.professionalId)) return;
    
    saleItems.value.push({ ...newItem.value, id: Date.now() });
    
    // Reset newItem
    newItem.value = {
        type: newItem.value.type,
        productId: null,
        productName: '',
        serviceId: null,
        serviceName: '',
        professionalId: null,
        professionalName: '',
        quantity: 1,
        unitPrice: 0
    };
    
    calculateAmountFromItems();
};

const removeSaleItem = (index) => {
    saleItems.value.splice(index, 1);
    calculateAmountFromItems();
};

const calculateAmountFromItems = () => {
    const total = saleItems.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    form.value.amount = total;
};

const onProductSelect = (item) => {
    newItem.value.productId = item.id;
    newItem.value.productName = item.name;
    newItem.value.unitPrice = item.price || 0;
};

const onServiceSelect = (item) => {
    newItem.value.serviceId = item.id;
    newItem.value.serviceName = item.name;
    newItem.value.unitPrice = item.price || 0;
};

const onProfessionalSelect = (item) => {
    newItem.value.professionalId = item.id;
    newItem.value.professionalName = item.name;
};

const onClientSelect = (item) => {
    form.value.clientId = item.id;
    form.value.clientName = item.name;
    if (!form.value.description) {
        form.value.description = `Venda para ${item.name}`;
    }
};

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

const save = async () => {
  // Common Validations
  if (form.value.status === 'PAID' && !form.value.accountGroupId && !form.value.appointmentId && launchMode.value === 'MANUAL') {
    alert('Por favor, selecione um Grupo de Contas ou verifique o Agendamento para transações Pagas.');
    return;
  }

  // Manual Mode logic
  if (launchMode.value === 'MANUAL') {
      if (!form.value.description) {
          if (form.value.accountGroupId) {
            const selectedGroup = accountGroups.value.find(e => e.id == form.value.accountGroupId);
            if (selectedGroup) {
                form.value.description = selectedGroup.name;
            } else {
                alert('Descrição é obrigatória.');
                return;
            }
          } else {
              alert('Descrição é obrigatória.');
              return;
          }
      }
      emit('save', form.value);
      return;
  }

  // SALE Mode logic
  if (launchMode.value === 'SALE') {
      if (!form.value.clientId) {
          alert('Cliente é obrigatório para vendas.');
          return;
      }
      if (saleItems.value.length === 0) {
          alert('Adicione pelo menos um item à venda.');
          return;
      }

      try {
          const payload = {
              sale: {
                  clientId: form.value.clientId,
                  notes: form.value.description,
                  items: saleItems.value.map(item => ({
                      type: item.type,
                      productId: item.productId,
                      serviceId: item.serviceId,
                      professionalId: item.professionalId,
                      quantity: item.quantity,
                      unitPrice: item.unitPrice
                  }))
              },
              transaction: {
                  ...form.value,
                  description: form.value.description || `Venda para ${form.value.clientName}`,
                  nature: 'INCOME',
                  amount: form.value.amount,
                  originalAmount: form.value.amount
              }
          };

          await saleService.launchSale(payload);
          emit('save', { refresh: true }); // Notify parent to refresh list
      } catch (error) {
          console.error('Error launching sale:', error);
          alert('Erro ao lançar venda: ' + (error.response?.data?.message || error.message));
      }
  }
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
watch(() => form.value.accountGroupId, (newVal) => {
    if (newVal) {
        if (!isAppointmentTransaction.value) {
            // Nature is now on AccountGroup, but we still force EXPENSE for manual launch if linked to group?
            // Actually, we should probably load the nature from the group.
            const selectedGroup = accountGroups.value.find(e => e.id === newVal);
            if (selectedGroup && selectedGroup.nature) {
                form.value.nature = selectedGroup.nature;
            } else {
                form.value.nature = 'EXPENSE';
            }
        }
        
        // Auto-fill description if empty
        if (!form.value.description) {
            const selectedGroup = accountGroups.value.find(e => e.id === newVal);
            if (selectedGroup) {
                form.value.description = selectedGroup.name;
            }
        }
    }
});

watch(() => form.value.appointmentId, (newVal) => {
    if (newVal) {
        form.value.nature = 'INCOME';
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

/* NEW: Launch Mode and Sale Items Styles */
.launch-mode-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    background: var(--color-bg-body, #f8f9fa);
    padding: 0.35rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
}

.mode-btn {
    flex: 1;
    background: transparent;
    border: none;
    padding: 0.6rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-muted);
    transition: all 0.2s;
}

.mode-btn.active {
    background: var(--color-primary);
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sale-items-section {
    margin-top: 1rem;
    margin-bottom: 1.5rem;
}

.items-table-container {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    overflow: hidden;
    margin-top: 0.5rem;
}

.items-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
}

.items-table th {
    background: var(--color-bg-body, #f8f9fa);
    text-align: left;
    padding: 0.75rem 0.5rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border);
}

.items-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
}

.btn-remove {
    background: none;
    border: none;
    color: var(--color-error, #ef4444);
    cursor: pointer;
    font-size: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.new-item-row {
    background: var(--color-bg-body, #f8f9fa);
}

.new-item-row td {
    border-bottom: none;
}

.type-select {
    padding: 0.35rem;
    font-size: 0.8rem;
    width: auto;
}

.qty-input {
    width: 60px !important;
    padding: 0.35rem !important;
    text-align: center;
}

.btn-add {
    background: var(--color-success, #16a34a);
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
    transition: transform 0.1s;
}

.btn-add:active {
    transform: scale(0.9);
}

.btn-add:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background-color: var(--color-text-muted);
}

.service-selectors {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.unit-price-cell :deep(input) {
    width: 90px !important;
    padding: 0.35rem !important;
}

.text-muted {
    color: var(--color-text-muted);
}
</style>
