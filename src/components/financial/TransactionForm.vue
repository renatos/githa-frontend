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
    <form class="space-y-8 flex flex-col h-full" @submit.prevent="save">
          
          <!-- Lançamento Mode Selector -->
          <div v-if="!transaction.id" class="flex p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              v-for="mode in [{id:'MANUAL', label:'Lançamento Manual', icon:'fa-keyboard'}, {id:'SALE', label:'Venda de Produtos/Serviços', icon:'fa-cart-shopping'}]"
              :key="mode.id"
              type="button"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-bold transition-all duration-300"
              :class="launchMode === mode.id 
                ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm border border-slate-200/50 dark:border-transparent' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
              @click="launchMode = mode.id"
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

          <!-- Payment Source Selector (only for new EXPENSE + MANUAL) -->
          <div
            v-if="launchMode === 'MANUAL' && form.nature === 'EXPENSE' && !transaction.id"
            class="space-y-3"
          >
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">
              De onde sairá o valor?
            </label>

            <!-- CAIXA option -->
            <button
              type="button"
              class="w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left"
              :class="selectedSourceCardId === null
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
              @click="selectedSourceCardId = null"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="selectedSourceCardId === null ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'"
              >
                <i
                  class="fa-solid fa-building-columns text-base"
                  :class="selectedSourceCardId === null ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold text-sm"
                  :class="selectedSourceCardId === null ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'"
                >
                  Caixa
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Fluxo de caixa da clínica</p>
              </div>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                :class="selectedSourceCardId === null ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'"
              >
                <i v-if="selectedSourceCardId === null" class="fa-solid fa-check text-white text-[10px]" />
              </div>
            </button>

            <!-- Active credit card options -->
            <button
              v-for="card in activeCards"
              :key="card.id"
              type="button"
              class="w-full flex items-center gap-4 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left"
              :class="selectedSourceCardId === card.id
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'"
              @click="selectedSourceCardId = card.id"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="selectedSourceCardId === card.id ? 'bg-indigo-500' : 'bg-slate-100 dark:bg-slate-700'"
              >
                <i
                  class="fa-solid fa-credit-card text-base"
                  :class="selectedSourceCardId === card.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p
                  class="font-semibold text-sm truncate"
                  :class="selectedSourceCardId === card.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'"
                >
                  {{ card.name }}
                </p>
                <div class="flex items-center gap-3 mt-0.5">
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    <i class="fa-solid fa-wallet text-[10px] mr-1" />
                    Disponível: <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ formatCardLimit(card.availableLimit) }}</span>
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">·</span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    <i class="fa-solid fa-calendar-xmark text-[10px] mr-1" />
                    Fecha dia {{ card.closingDay }}
                  </span>
                </div>
              </div>
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                :class="selectedSourceCardId === card.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-600'"
              >
                <i v-if="selectedSourceCardId === card.id" class="fa-solid fa-check text-white text-[10px]" />
              </div>
            </button>

            <!-- Installment count (only when a card is selected) -->
            <div v-if="selectedSourceCardId !== null" class="space-y-2 pt-1">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">
                Nº de Parcelas
              </label>
              <input
                v-model.number="cardInstallmentCount"
                type="number"
                min="1"
                max="48"
                class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              />
            </div>
          </div>

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

          <!-- Single Payment Method (Manual, Edit Mode, or Sale with single payment) -->
          <div v-if="form.nature === 'INCOME' && (launchMode === 'MANUAL' || (transaction.id && !transaction.saleId) || (launchMode === 'SALE' && !isSplitPayment))" class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Forma de Pagamento</label>
              <button
                v-if="launchMode === 'SALE' && canSave"
                type="button"
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1"
                @click="enableSplitPayment"
              >
                <i class="fa-solid fa-code-fork text-[10px] rotate-90"></i>
                Dividir Pagamento
              </button>
            </div>
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

          <!-- Multiple Payment Methods (Sale Launch Mode with multiple payments) -->
          <SplitPaymentSection
            v-if="launchMode === 'SALE' && isSplitPayment"
            :payment-splits="paymentSplits"
            :can-save="canSave"
            :is-splits-balanced="isSplitsBalanced"
            :has-duplicate-payment-methods="hasDuplicatePaymentMethods"
            :splits-sum="splitsSum"
            :splits-diff="splitsDiff"
            :form-amount="form.amount"
            :payment-method-service="paymentMethodService"
            @add-split="addPaymentSplit"
            @remove-split="removePaymentSplit"
            @update-split="(index, item) => { paymentSplits[index].paymentMethodName = item?.name; paymentSplits[index].paymentMethodId = item?.id; paymentSplits[index].discountPercentage = item?.discountPercentage; }"
          />

          <!-- Financial Details Row -->
          <div class="grid grid-cols-1 gap-6" :class="launchMode === 'MANUAL' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'">
             <div v-if="launchMode === 'MANUAL'" class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Natureza</label>
              <div class="form-input flex w-full h-12 mt-1 resize-none overflow-hidden rounded-lg text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 font-semibold items-center gap-2 cursor-not-allowed text-base">
                <i class="fa-solid" :class="form.nature === 'INCOME' ? 'fa-arrow-up text-emerald-600 dark:text-emerald-500' : 'fa-arrow-down text-rose-600 dark:text-rose-500'" />
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

            <!-- Status: hidden when a credit card source is selected -->
            <div v-if="selectedSourceCardId === null" class="space-y-2">
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

            <!-- Card badge shown instead of Status when card is selected -->
            <div v-else class="space-y-2">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-0 ml-1 block">Status</label>
              <div class="form-input flex w-full h-12 mt-1 rounded-lg border border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-semibold cursor-default">
                <i class="fa-solid fa-clock text-amber-500" />
                Pendente (fatura do cartão)
              </div>
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
              class="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              @click="viewAppointment"
            >
              Ver Detalhes
            </button>
          </div>

          <!-- Discount Preview -->
          <TransactionDiscountBadge 
            :amount="form.amount"
            :payment-method="selectedPaymentMethod"
            :payment-splits="paymentSplits"
            :is-split="launchMode === 'SALE' && isSplitPayment"
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
      <div v-show="!isFormValid" class="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
        <i class="fa-solid fa-lock text-rose-500 text-xs"></i>
        <span class="text-[10px] font-bold text-rose-600 dark:text-rose-300 uppercase leading-none">{{ saveTooltip }}</span>
      </div>
      <div v-show="isFormValid" class="hidden sm:block"></div>
      
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <button 
          type="button" 
          class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button 
          :disabled="!isFormValid"
          class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:grayscale"
          @click="save"
        >
          Salvar Transação
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';
import paymentMethodService from '../../services/paymentMethodService';
import { clientService } from '../../services/clientService';
import { serviceService } from '../../services/serviceService';
import { professionalService } from '../../services/professionalService';

// Sub-components
import ManualTransactionSection from './ManualTransactionSection.vue';
import SaleTransactionSection from './SaleTransactionSection.vue';
import TransactionDiscountBadge from './TransactionDiscountBadge.vue';
import SplitPaymentSection from './SplitPaymentSection.vue';

// Composables
import { usePaymentSplits } from '@/composables/usePaymentSplits';
import { useSaleTransaction } from '@/composables/useSaleTransaction';
import { useTransactionForm } from '@/composables/useTransactionForm';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  transaction: { type: Object, default: () => ({}) }
});

const emit = defineEmits(['close', 'save', 'view-appointment']);

// Base Shared Reactive States
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

const selectedPaymentMethod = ref(null);
const saleTransactionRef = ref(null);

// Composables Instantiation
const splits = usePaymentSplits(form, paymentMethodService, selectedPaymentMethod);

const {
  paymentSplits,
  isSplitPayment,
  splitsSum,
  isSplitsBalanced,
  hasDuplicatePaymentMethods,
  splitsDiff,
  enableSplitPayment,
  addPaymentSplit,
  removePaymentSplit
} = splits;

const sale = useSaleTransaction(form, paymentSplits, isSplitPayment, saleTransactionRef, emit);

const {
  saleItems,
  autoFilledMessage,
  addSaleItem,
  removeSaleItem,
  onClientSelect,
  productServiceAdapter
} = sale;

const transactionForm = useTransactionForm(props, emit, form, selectedPaymentMethod, splits, sale);

const {
  isAdmin,
  transactionStatuses,
  activeCards,
  selectedSourceCardId,
  cardInstallmentCount,
  launchMode,
  isAppointmentTransaction,
  canSave,
  isFormValid,
  saveTooltip,
  onAccountGroupSelect,
  onPaymentMethodSelect,
  viewAppointment,
  save,
  accountGroupServiceAdapter,
  saleItemTypes
} = transactionForm;

const formatCardLimit = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};
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
