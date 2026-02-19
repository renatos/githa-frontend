<template>
  <div class="modal-backdrop">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ transaction.id ? 'Editar Transação' : 'Nova Transação' }}</h3>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div v-if="!transaction.id" class="launch-mode-selector">
          <button
              :class="{ active: launchMode === 'MANUAL' }"
              class="mode-btn"
              type="button"
              @click="launchMode = 'MANUAL'"
          >
            Lançamento Manual
          </button>
          <button
              :class="{ active: launchMode === 'SALE' }"
              class="mode-btn"
              type="button"
              @click="launchMode = 'SALE'"
          >
            Venda de Produtos/Serviços
          </button>
        </div>

        <div v-if="launchMode === 'MANUAL'" class="form-group">
          <label>Descrição</label>
          <input v-model="form.description" :disabled="!canSave"/>
        </div>

        <!-- NEW: Client Selection for SALE mode -->
        <div v-if="launchMode === 'SALE'" class="form-group">
          <label>Cliente</label>
          <BaseLookup
              v-model="form.clientId"
              :disabled="!canSave"
              :initial-description="form.clientName"
              :search-service="clientService"
              placeholder="Selecione o cliente"
              @select="onClientSelect"
          />
        </div>

        <div v-if="!isAppointmentTransaction && launchMode === 'MANUAL'" class="form-group">
          <label class="form-label" for="accountGroup">Grupo de Contas</label>
          <BaseLookup
              id="accountGroup"
              v-model="form.accountGroupId"
              :disabled="!canSave"
              :initial-description="form.accountGroupName"
              :search-service="accountGroupServiceAdapter"
              placeholder="Selecione um grupo de contas"
              @select="onAccountGroupSelect"
          />
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
                <td>
                  <button class="btn-remove" type="button" @click="removeSaleItem(index)">×</button>
                </td>
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
                      :initial-description="newItem.productName"
                      :search-service="productService"
                      placeholder="Produto..."
                      size="small"
                      @select="onProductSelect"
                  />
                  <div v-else class="service-selectors">
                    <BaseLookup
                        v-model="newItem.serviceId"
                        :initial-description="newItem.serviceName"
                        :search-service="serviceService"
                        placeholder="Serviço..."
                        size="small"
                        @select="onServiceSelect"
                    />
                    <BaseLookup
                        v-if="newItem.serviceId"
                        v-model="newItem.professionalId"
                        :initial-description="newItem.professionalName"
                        :search-service="professionalService"
                        placeholder="Profissional..."
                        size="small"
                        @select="onProfessionalSelect"
                    />
                  </div>
                </td>
                <td><input v-model="newItem.quantity" class="qty-input" type="number" min="1"></td>
                <td class="unit-price-cell">
                  <CurrencyInput v-model="newItem.unitPrice"/>
                </td>
                <td>{{ formatCurrency(newItem.unitPrice * newItem.quantity) }}</td>
                <td>
                  <button
                      :disabled="(newItem.type === 'PRODUCT' && !newItem.productId) || (newItem.type === 'SERVICE' && (!newItem.serviceId || !newItem.professionalId))"
                      class="btn-add" type="button"
                      @click="addSaleItem">
                    +
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="isAppointmentTransaction" class="form-row">
          <div class="form-group">
            <div class="appointment-link">
              <span class="badge income"
                    @click="viewAppointment">Vinculado ao Agendamento #{{ form.appointmentId }}</span>
            </div>
          </div>
        </div>

        <div v-if="form.nature === 'INCOME'" class="form-group">
          <label>Forma de Pagamento</label>
          <BaseLookup
              v-model="form.paymentMethodId"
              :disabled="!canSave"
              :initial-description="form.paymentMethodName"
              :search-service="paymentMethodService"
              placeholder="Selecione a forma de pagamento"
              @select="onPaymentMethodSelect"
          />
        </div>

        <div class="form-row">
          <div v-if="launchMode === 'MANUAL'" class="form-group">
            <label>Natureza</label>
            <select v-model="form.nature" :disabled="true" required>
              <option value="INCOME">Receita</option>
              <option value="EXPENSE">Despesa</option>
            </select>
          </div>

          <div class="form-group">
            <label>Valor</label>
            <CurrencyInput v-model="form.amount" :disabled="!canSave" required/>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" :disabled="!canSave" required>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
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
            <input v-model="form.category" :disabled="!canSave"/>
          </div>

          <div class="form-group">
            <label>Pagamento</label>
            <input v-model="form.paymentDate" :disabled="!canSave" type="datetime-local" step="1"/>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
          <button :disabled="!canSave" :title="saveTooltip" class="btn btn-primary" type="submit">Salvar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted, computed, watch} from 'vue';
import financialService from '../../services/financialService';
import {authService} from '../../services/authService';
import {useEscapeKey} from '../../composables/useEscapeKey';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';
import paymentMethodService from '../../services/paymentMethodService';
import {clientService} from '../../services/clientService';
import productService from '../../services/productService';
import {serviceService} from '../../services/serviceService';
import {professionalService} from '../../services/professionalService';
import {saleService} from '../../services/saleService';

const props = defineProps({
  transaction: {type: Object, default: () => ({})}
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

const launchMode = ref('SALE'); // 'MANUAL' or 'SALE'

const form = ref({
  description: '',
  amount: 0,
  nature: 'INCOME',
  status: 'PENDING',
  category: undefined,
  paymentDate: '',
  accountGroupId: undefined,
  accountGroupName: '',
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
  servicePrice: 0,
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

// Adapter for BaseLookup to work with financialService.getAccountGroups
const accountGroupServiceAdapter = {
  getAll: async (params) => {
    const response = await financialService.getAccountGroups();
    let data = response.data;
    if (params.name) {
      data = data.filter(g => g.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    // Filter active groups only
    data = data.filter(group => group.active);
    
    return {
      data: {
        content: data,
        totalElements: data.length
      }
    };
  },
  getById: async (id) => {
    // Retrieve all and find by ID since API might not have specific getById for public consumption or just reusing logic
    // Actually financialService has no getAccountGroupById exposed clearly in previous view, so reusing logic
    const response = await financialService.getAccountGroups();
    const group = response.data.find(g => g.id == id);
    return { data: group };
  }
};


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
    form.value = {...props.transaction};
    originalStatus.value = props.transaction.status;

    // Detect Launch Mode
    if (props.transaction.saleId || props.transaction.sale) {
      launchMode.value = 'SALE';
      if (props.transaction.sale && props.transaction.sale.items) {
          saleItems.value = props.transaction.sale.items.map(item => ({
              ...item,
              type: item.type || (item.productId ? 'PRODUCT' : 'SERVICE')
          }));
      }
    } else {
      launchMode.value = 'MANUAL';
    }

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

    // Set Account Group Name for lookup if exists
    if (form.value.accountGroupId) {
       // Try to find in loaded groups first
       const group = accountGroups.value.find(g => g.id === form.value.accountGroupId);
       if (group) {
         form.value.accountGroupName = group.name;
         // Ensure nature is set explicitly from group if not already
         if (group.nature) form.value.nature = group.nature;
       } else {
         // Fallback fetch if not in initial list (e.g. inactive)
         try {
           const list = await financialService.getAccountGroups();
           const found = list.data.find(g => g.id === form.value.accountGroupId);
           if (found) {
             form.value.accountGroupName = found.name;
             if (found.nature) form.value.nature = found.nature;
           }
         } catch (e) {
           console.warn('Could not load account group details', e);
         }
       }
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

  saleItems.value.push({...newItem.value, id: Date.now()});

  // Reset newItem
  newItem.value = {
    type: newItem.value.type,
    productId: null,
    productName: '',
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
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
  form.value.originalAmount = total; // Sync original for sales
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

const onAccountGroupSelect = (item) => {
  form.value.accountGroupId = item ? item.id : undefined;
  form.value.accountGroupName = item ? item.name : '';
  
  if (item) {
     if (item.nature) {
       form.value.nature = item.nature;
     }
     
     if (!form.value.description) {
       form.value.description = item.name;
     }
  } else {
    // Reset or keep? user might want to custom nature if no group?
    // Requirement says "Natureza deve mudar de acordo com o grupo".
    // If no group, we likely keep previous or default to Expense.
  }
};

const onPaymentMethodSelect = (item) => {
  selectedPaymentMethod.value = item;
  form.value.paymentMethodId = item ? item.id : undefined;
  form.value.paymentMethodName = item ? item.name : '';
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
  return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value || 0);
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
         // Logic already handled in select but double check
         // We can't easily get group name here if we didn't save it, but we have onAccountGroupSelect
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
          id: form.value.saleId,
          clientId: form.value.clientId,
          notes: form.value.description,
          items: saleItems.value.map(item => ({
            id: item.id && typeof item.id === 'number' && item.id > 1700000000000 ? null : item.id, // Skip temporary Date.now() IDs
            type: item.type,
            productId: item.productId,
            serviceId: item.serviceId,
            professionalId: item.professionalId,
            appointmentId: item.appointmentId,
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
      emit('save', {refresh: true}); // Notify parent to refresh list
    } catch (error) {
      console.error('Error launching sale:', error);
      alert('Erro ao lançar venda: ' + (error.response?.data?.message || error.message));
    }
  }
};

// Keep originalAmount in sync when user edits the Valor field
watch(() => form.value.amount, (newVal) => {
  if (props.transaction && form.value.amount !== props.transaction.amount) {
     // User is changing amount manually
     // Maybe we shouldn't sync originalAmount if it's potentially post-discount? 
     // Logic seems to assume manual entry is pre-discount.
     form.value.originalAmount = newVal;
  } else if (!props.transaction.id) {
     form.value.originalAmount = newVal;
  }
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

watch(() => form.value.status, (newVal) => {
  if (newVal !== 'PAID') {
     form.value.paymentMethodId = undefined;
     form.value.paymentMethodName = '';
     selectedPaymentMethod.value = null;
  }
});

// Watchers
watch(launchMode, (newVal) => {
  if (newVal === 'SALE') {
    form.value.nature = 'INCOME';
  } else if (!form.value.accountGroupId) {
    if (!form.value.id) { // Only change default nature for new transactions or if user hasn't set group
       form.value.nature = 'EXPENSE';
    }
  }
});

watch(() => form.value.nature, (newVal) => {
  if (newVal === 'INCOME') {
     form.value.paymentMethodId = undefined;
     form.value.paymentMethodName = '';
     selectedPaymentMethod.value = null;
  }
});

watch(() => form.value.appointmentId, (newVal) => {
  if (newVal) {
    form.value.nature = 'INCOME';
  }
}, {immediate: true});
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

.modal-content {
  background: var(--color-bg-card, #fff);
  padding: 2rem;
  border-radius: var(--radius-md);
  width: 800px;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sale-items-section {
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.items-table-container {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: visible;
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
