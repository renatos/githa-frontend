<template>
  <BaseModal
    :show="true"
    max-width="max-w-4xl"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
        <i class="fa-solid fa-money-bill-transfer text-indigo-600 dark:text-indigo-400 text-lg"></i>
      </div>
      <div class="min-w-0">
        <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
          {{ transaction.id ? 'Editar Transação' : 'Nova Transação' }}
        </h2>
        <p v-if="transaction.id" class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Ref: {{ transaction.id }}
        </p>
      </div>
    </template>
    <form @submit.prevent="save" class="space-y-8 flex flex-col h-full">
          
          <!-- Lançamento Mode Selector -->
          <div v-if="!transaction.id" class="flex p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              v-for="mode in [{id:'MANUAL', label:'Lançamento Manual', icon:'fa-keyboard'}, {id:'SALE', label:'Venda de Produtos/Serviços', icon:'fa-cart-shopping'}]"
              :key="mode.id"
              type="button"
              @click="launchMode = mode.id"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition-all duration-300"
              :class="launchMode === mode.id 
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200/50 dark:border-transparent' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
            >
              <i class="fa-solid" :class="mode.icon"></i>
              {{ mode.label }}
            </button>
          </div>

          <!-- Manual Mode Section -->
          <ManualTransactionSection
            v-if="launchMode === 'MANUAL'"
            :form="form"
            :can-save="canSave"
            :is-appointment-transaction="isAppointmentTransaction"
            :account-group-service-adapter="accountGroupServiceAdapter"
            @account-group-select="onAccountGroupSelect"
          />

          <!-- Sale Mode Section -->
          <SaleTransactionSection
            v-if="launchMode === 'SALE'"
            ref="saleTransactionRef"
            :form="form"
            :can-save="canSave"
            :sale-items="saleItems"
            :sale-item-types="saleItemTypes"
            :auto-filled-message="autoFilledMessage"
            :client-service="clientService"
            :product-service-adapter="productServiceAdapter"
            :service-service="serviceService"
            :professional-service="professionalService"
            @client-select="onClientSelect"
            @add-item="addSaleItem"
            @remove-item="removeSaleItem"
          />



          <div v-if="form.nature === 'INCOME'" class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Forma de Pagamento</label>
            <div class="h-12 w-full mt-1">
              <BaseLookup
                v-model="form.paymentMethodId"
                :disabled="!canSave"
                :initial-description="form.paymentMethodName"
                :search-service="paymentMethodService"
                placeholder="Selecione o método..."
                @select="onPaymentMethodSelect"
              />
            </div>
          </div>

          <!-- Financial Details Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div v-if="launchMode === 'MANUAL'" class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Natureza</label>
              <div class="form-input flex w-full h-12 mt-1 resize-none overflow-hidden rounded-lg text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 font-semibold items-center gap-2 cursor-not-allowed text-base">
                <i class="fa-solid" :class="form.nature === 'INCOME' ? 'fa-arrow-up text-emerald-600 dark:text-emerald-500' : 'fa-arrow-down text-rose-600 dark:text-rose-500'"></i>
                {{ form.nature === 'INCOME' ? 'Receita' : 'Despesa' }}
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Valor Total</label>
              <div class="relative group mt-1">
                <CurrencyInput 
                  v-model="form.amount" 
                  :disabled="!canSave" 
                  class="font-black"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-0 ml-1 block">Status</label>
              <select 
                v-model="form.status" 
                :disabled="!canSave"
                class="form-select flex w-full h-12 mt-1 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors cursor-pointer text-base font-normal"
              >
                <option v-for="status in transactionStatuses" :key="status.name" :value="status.name">
                  {{ status.description }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linked Appointment Info -->
          <div v-if="isAppointmentTransaction" class="bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <i class="fa-solid fa-calendar-check text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 block">Vínculo</span>
                <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Vinculado ao Agendamento #{{ form.appointmentId }}</span>
              </div>
            </div>
            <button 
              type="button" 
              @click="viewAppointment"
              class="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
            >
              Ver Detalhes
            </button>
          </div>

          <!-- Discount Preview -->
          <TransactionDiscountBadge 
            v-if="selectedPaymentMethod"
            :amount="form.amount"
            :payment-method="selectedPaymentMethod"
          />

          <!-- Secondary Details Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Categoria (Opcional)</label>
              <input 
                v-model="form.category" 
                :disabled="!canSave"
                placeholder="Ex: Hardware, Freelance..."
                class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              />
            </div>

            <div class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Data da Transação</label>
              <input 
                v-model="form.paymentDate" 
                :disabled="!canSave" 
                type="datetime-local" 
                step="1"
                class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <!-- Description (Always visible for SALE, optional or notes) -->
          <div class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Observações / Notas</label>
            <textarea 
              v-model="form.description" 
              :disabled="!canSave"
              rows="3"
              placeholder="Notas adicionais sobre esta transação..."
              class="form-input flex w-full mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal resize-none"
            ></textarea>
          </div>
    </form>

    <template #footer>
      <div v-show="!canSave" class="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
        <i class="fa-solid fa-lock text-rose-500 text-xs"></i>
        <span class="text-[10px] font-bold text-rose-600 dark:text-rose-300 uppercase leading-none">{{ saveTooltip }}</span>
      </div>
      <div v-show="canSave" class="hidden sm:block"></div>
      
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          type="button" 
          @click="$emit('close')"
          class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
        >
          Cancelar
        </button>
        <button 
          @click="save"
          :disabled="!canSave"
          class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:grayscale"
        >
          Salvar Transação
        </button>
      </div>
    </template>
  </BaseModal>
</template>


<script setup>
import {ref, defineProps, defineEmits, onMounted, computed, watch} from 'vue';
import BaseModal from '../common/BaseModal.vue';
import financialService from '../../services/financialService';
import {authService} from '../../services/authService';
import { confirmBridge } from '../../services/confirmBridge';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';
import paymentMethodService from '../../services/paymentMethodService';
import {clientService} from '../../services/clientService';
import productService from '../../services/productService';
import {appointmentService} from '../../services/appointmentService';
import {enumService} from '../../services/enumService';
import {serviceService} from '../../services/serviceService';
import {professionalService} from '../../services/professionalService';
import {saleService} from '../../services/saleService';

// Sub-components
import ManualTransactionSection from './ManualTransactionSection.vue';
import SaleTransactionSection from './SaleTransactionSection.vue';
import TransactionDiscountBadge from './TransactionDiscountBadge.vue';

const props = defineProps({
  transaction: {type: Object, default: () => ({})}
});

const emit = defineEmits(['close', 'save', 'view-appointment']);

const isAdmin = ref(false);
const originalStatus = ref('');
const transactionStatuses = ref([]);
const saleItemTypes = ref([]);
const accountNatures = ref([]);
const saleTransactionRef = ref(null);

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
const autoFilledMessage = ref('');
const selectedPaymentMethod = ref(null);
const accountGroups = ref([]);

// Product lookup adapter
const productServiceAdapter = {
  getAll: async (params) => {
    const response = await productService.getAll(params);
    let data = Array.isArray(response.data) ? response.data : (response.data?.content ?? []);
    data = data.filter(p => p.active);
    if (params?.name) {
      const lower = params.name.toLowerCase();
      data = data.filter(p => p.name.toLowerCase().includes(lower));
    }
    const enriched = data.map(p => ({
      ...p,
      name: `${p.name} (Estoque: ${p.stockQuantity ?? 0})`
    }));
    return { data: { content: enriched, totalElements: enriched.length } };
  },
  getById: async (id) => {
    const response = await productService.getById(id);
    const p = response.data;
    if (p) p.name = `${p.name} (Estoque: ${p.stockQuantity ?? 0})`;
    return { data: p };
  }
};

// Account group adapter
const accountGroupServiceAdapter = {
  getAll: async (params) => {
    const response = await financialService.getAccountGroups();
    let data = response.data.filter(group => group.active);
    if (params.name) {
      data = data.filter(g => g.name.toLowerCase().includes(params.name.toLowerCase()));
    }
    return { data: { content: data, totalElements: data.length } };
  },
  getById: async (id) => {
    const response = await financialService.getAccountGroups();
    return { data: response.data.find(g => g.id == id) };
  }
};

const canSave = computed(() => {
  if (!props.transaction.id) return true;
  if (originalStatus.value === 'PAID' && !isAdmin.value) return false;
  return true;
});

const saveTooltip = computed(() => {
  return !canSave.value ? 'Transação paga, apenas ADMIN pode salvar alterações.' : '';
});

onMounted(async () => {
  checkUserRole();
  transactionStatuses.value = await enumService.getOptions('TransactionStatus');
  saleItemTypes.value = await enumService.getOptions('SaleItemType');
  accountNatures.value = await enumService.getOptions('AccountNature');
  
  const groupsResponse = await financialService.getAccountGroups();
  accountGroups.value = groupsResponse.data.filter(g => g.active);

  if (props.transaction?.id) {
    form.value = {...props.transaction};
    originalStatus.value = props.transaction.status;

    if (props.transaction.saleId || props.transaction.sale) {
      launchMode.value = 'SALE';
      if (props.transaction.sale?.items) {
          saleItems.value = props.transaction.sale.items.map(item => ({
              ...item,
              type: item.type || (item.productId ? 'PRODUCT' : 'SERVICE')
          }));
      }
    } else {
      launchMode.value = 'MANUAL';
    }

    if (form.value.originalAmount) form.value.amount = form.value.originalAmount;
    if (form.value.paymentDate?.length > 16) form.value.paymentDate = form.value.paymentDate.substring(0, 19);
    
    // Recovery of names for lookups
    if (form.value.paymentMethodId) {
       const pmRes = await paymentMethodService.getById(form.value.paymentMethodId);
       if (pmRes.data) {
         selectedPaymentMethod.value = pmRes.data;
         form.value.paymentMethodName = pmRes.data.name;
       }
    }

    if (form.value.accountGroupId) {
       const group = accountGroups.value.find(g => g.id === form.value.accountGroupId);
       if (group) form.value.accountGroupName = group.name;
    }
  } else {
    // Default date — usar horário local (toISOString retornaria UTC, causando shift de +3h no Brasil)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    form.value.paymentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
});

const addSaleItem = (item) => {
  saleItems.value.push({...item, id: Date.now()});
  autoFilledMessage.value = '';
  calculateAmountFromItems();
};

const removeSaleItem = (index) => {
  saleItems.value.splice(index, 1);
  calculateAmountFromItems();
};

const calculateAmountFromItems = () => {
  const total = saleItems.value.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  form.value.amount = total;
  form.value.originalAmount = total;
};

const onClientSelect = (item) => {
  form.value.clientId = item.id;
  form.value.clientName = item.name;
  if (!form.value.description) form.value.description = `Venda para ${item.name}`;
  checkForUnbilledAppointments();
};

const checkForUnbilledAppointments = async () => {
    autoFilledMessage.value = '';
    if (launchMode.value === 'SALE' && form.value.clientId) {
        try {
            const response = await appointmentService.getAll({ 
                'client.id': form.value.clientId, 
                status: 'COMPLETED',
                size: 50
            });
            const unbilled = response.data.content.filter(apt => 
                !apt.transactionId && !saleItems.value.some(added => added.appointmentId === apt.id)
            );

            if (unbilled.length > 0) {
                const apt = unbilled[0];
                saleTransactionRef.value?.saleItemsTableRef?.setItemData({
                  type: 'SERVICE',
                  serviceId: apt.serviceId,
                  serviceName: apt.serviceName,
                  professionalId: apt.professionalId,
                  professionalName: apt.professionalName,
                  unitPrice: apt.price || apt.servicePrice || 0,
                  appointmentId: apt.id
                });
                autoFilledMessage.value = `Dados preenchidos automaticamente referentes a um agendamento para ${form.value.clientName.split(' ')[0]}.`;
            }
        } catch (error) { console.error(error); }
    }
};

const onAccountGroupSelect = (item) => {
  form.value.accountGroupId = item?.id;
  form.value.accountGroupName = item?.name || '';
  if (item?.nature) form.value.nature = item.nature;
  if (item && !form.value.description) form.value.description = item.name;
};

const onPaymentMethodSelect = (item) => {
  selectedPaymentMethod.value = item;
  form.value.paymentMethodId = item?.id;
  form.value.paymentMethodName = item?.name || '';
};

const save = async () => {
  if (form.value.status === 'PAID' && !form.value.accountGroupId && !form.value.appointmentId && launchMode.value === 'MANUAL') {
    confirmBridge.alert({
      title: 'Grupo de Contas Obrigatório',
      message: 'Selecione um Grupo de Contas para transações Pagas.',
      type: 'warning'
    });
    return;
  }

  if (launchMode.value === 'MANUAL') {
    if (!form.value.description) {
      confirmBridge.alert({
        title: 'Descrição Obrigatória',
        message: 'A descrição é obrigatória para lançamentos manuais.',
        type: 'warning'
      });
      return;
    }
    emit('save', form.value);
    return;
  }

  if (launchMode.value === 'SALE') {
    if (!form.value.clientId) { 
      confirmBridge.alert({ title: 'Campo Obrigatório', message: 'O cliente é obrigatório para realizar uma venda.', type: 'warning' }); 
      return; 
    }
    if (saleItems.value.length === 0) { 
      confirmBridge.alert({ title: 'Nenhum Item Adicionado', message: 'Adicione pelo menos um produto ou serviço à venda.', type: 'warning' }); 
      return; 
    }

    try {
      const payload = {
        sale: {
          id: form.value.saleId,
          clientId: form.value.clientId,
          notes: form.value.description,
          items: saleItems.value.map(item => ({
            id: typeof item.id === 'number' && item.id > 1700000000000 ? null : item.id,
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
      emit('save', {refresh: true});
    } catch (error) {
      confirmBridge.alert({
        title: 'Erro ao Lançar Venda',
        message: error.response?.data?.message || error.message,
        type: 'danger'
      });
    }
  }
};

watch(() => form.value.amount, (newVal) => {
  if (!props.transaction?.id || form.value.amount !== props.transaction.amount) {
     form.value.originalAmount = newVal;
  }
});

const viewAppointment = () => {
  if (form.value.appointmentId) emit('view-appointment', form.value.appointmentId);
}

const isAppointmentTransaction = computed(() => !!form.value.appointmentId);

watch(() => form.value.status, (newVal) => {
  if (newVal !== 'PAID') {
     form.value.paymentMethodId = undefined;
     form.value.paymentMethodName = '';
     selectedPaymentMethod.value = null;
  }
});

watch(launchMode, (newVal) => {
  if (newVal === 'SALE') form.value.nature = 'INCOME';
  else if (!form.value.accountGroupId && !form.value.id) form.value.nature = 'EXPENSE';
});

watch(() => form.value.nature, (newVal) => {
  if (newVal === 'INCOME') {
     form.value.paymentMethodId = undefined;
     form.value.paymentMethodName = '';
     selectedPaymentMethod.value = null;
  }
});

watch(() => form.value.appointmentId, (newVal) => {
  if (newVal) form.value.nature = 'INCOME';
}, {immediate: true});
</script>

<style scoped>
/* Legado CSS removido em favor do Tailwind CSS para manter consistência com o Design Stitch Dark Mode Premium */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
