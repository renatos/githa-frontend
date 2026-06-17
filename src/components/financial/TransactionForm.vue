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
          <div v-if="launchMode === 'SALE' && isSplitPayment" class="space-y-4 border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
            <div class="flex items-center justify-between">
              <label class="text-slate-900 dark:text-slate-100 text-sm font-bold block ml-1">Formas de Pagamento (Divisão de Valores)</label>
              <button
                v-if="canSave"
                type="button"
                class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline flex items-center gap-1"
                @click="addPaymentSplit"
              >
                <i class="fa-solid fa-plus text-[10px]"></i>
                Adicionar Forma
              </button>
            </div>

            <div class="space-y-3">
              <div
                v-for="(split, index) in paymentSplits"
                :key="index"
                class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <!-- Method Lookup -->
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Forma</span>
                  <div class="h-10 w-full">
                    <BaseLookup
                      v-model="split.paymentMethodId"
                      :disabled="!canSave"
                      :initial-description="split.paymentMethodName"
                      :search-service="paymentMethodService"
                      placeholder="Selecione o método..."
                      @select="(item) => { split.paymentMethodName = item?.name; split.paymentMethodId = item?.id; split.discountPercentage = item?.discountPercentage; }"
                    />
                  </div>
                </div>

                <!-- Split Amount -->
                <div class="w-full sm:w-36">
                  <span class="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Valor</span>
                  <div class="h-10 w-full">
                    <CurrencyInput
                      v-model="split.amount"
                      :disabled="!canSave"
                      class="h-10 text-sm font-bold"
                    />
                  </div>
                </div>

                <!-- Action Button -->
                <div class="flex items-end justify-center h-10 pt-4 sm:pt-0">
                  <button
                    type="button"
                    :disabled="!canSave"
                    class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg disabled:opacity-30 transition-colors"
                    title="Remover"
                    @click="removePaymentSplit(index)"
                  >
                    <i class="fa-solid fa-trash-can text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Splits Validation Summary -->
            <div
              class="flex items-center gap-3 p-3 rounded-lg border text-xs font-semibold mt-3"
              :class="isSplitsBalanced && !hasDuplicatePaymentMethods
                ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400'"
            >
              <i class="fa-solid" :class="isSplitsBalanced && !hasDuplicatePaymentMethods ? 'fa-circle-check text-emerald-500' : 'fa-triangle-exclamation text-amber-500'"></i>
              <div class="flex-1 min-w-0">
                <span v-if="isSplitsBalanced && !hasDuplicatePaymentMethods">
                  Valores conciliados com sucesso! Total: {{ formatCurrency(form.amount) }}
                </span>
                <span v-else-if="hasDuplicatePaymentMethods">
                  Existem formas de pagamento duplicadas na lista de divisão.
                </span>
                <span v-else>
                  A soma das formas de pagamento ({{ formatCurrency(splitsSum) }}) não corresponde ao total da venda ({{ formatCurrency(form.amount) }}). Diferença: {{ formatCurrency(splitsDiff) }}.
                </span>
              </div>
            </div>
          </div>

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
import creditCardService from '../../services/creditCardService';

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

// Credit card source selection (null = CAIXA, number = cardId)
const activeCards = ref([]);
const selectedSourceCardId = ref(null);
const cardInstallmentCount = ref(1);

const checkUserRole = () => {
  const user = authService.getCurrentUser();
  isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

const launchMode = ref('SALE'); // 'MANUAL' or 'SALE'
const isSplitPayment = ref(false);

const paymentSplits = ref([
  { paymentMethodId: undefined, paymentMethodName: '', amount: 0, status: 'PAID' }
]);

const round2 = (val) => Math.round((val || 0) * 100) / 100;

let isUpdatingSplits = false;
let previousAmounts = [];

const updatePreviousAmounts = () => {
  previousAmounts = paymentSplits.value.map(s => round2(s.amount));
};

const splitsDiff = computed(() => {
  return round2(Math.abs(round2(form.value.amount) - round2(splitsSum.value)));
});

const enableSplitPayment = () => {
  isUpdatingSplits = true;
  isSplitPayment.value = true;
  if (paymentSplits.value.length === 1) {
    paymentSplits.value[0].paymentMethodId = form.value.paymentMethodId;
    paymentSplits.value[0].paymentMethodName = form.value.paymentMethodName;
    paymentSplits.value[0].amount = round2(form.value.amount);
    
    paymentSplits.value.push({
      paymentMethodId: undefined,
      paymentMethodName: '',
      amount: 0,
      status: 'PAID'
    });
  }
  updatePreviousAmounts();
  isUpdatingSplits = false;
};

const splitsSum = computed(() => {
  return round2(paymentSplits.value.reduce((sum, s) => sum + round2(s.amount), 0));
});

const isSplitsBalanced = computed(() => {
  return round2(splitsSum.value) === round2(form.value.amount);
});

const hasDuplicatePaymentMethods = computed(() => {
  if (!isSplitPayment.value) return false;
  const ids = paymentSplits.value
    .map(s => s.paymentMethodId)
    .filter(id => id !== undefined && id !== null);
  return new Set(ids).size !== ids.length;
});

const addPaymentSplit = () => {
  isUpdatingSplits = true;
  const currentSum = splitsSum.value;
  const remaining = Math.max(0, round2(form.value.amount - currentSum));
  paymentSplits.value.push({
    paymentMethodId: undefined,
    paymentMethodName: '',
    amount: remaining,
    status: 'PAID'
  });
  updatePreviousAmounts();
  isUpdatingSplits = false;
};

const removePaymentSplit = (index) => {
  isUpdatingSplits = true;
  if (paymentSplits.value.length > 1) {
    const removedAmount = round2(paymentSplits.value[index].amount || 0);
    paymentSplits.value.splice(index, 1);
    
    if (paymentSplits.value.length > 0) {
      const recipientIndex = index > 0 ? index - 1 : 0;
      paymentSplits.value[recipientIndex].amount = round2((paymentSplits.value[recipientIndex].amount || 0) + removedAmount);
    }
  }
  
  if (paymentSplits.value.length === 1) {
    isSplitPayment.value = false;
    const remaining = paymentSplits.value[0];
    form.value.paymentMethodId = remaining.paymentMethodId;
    form.value.paymentMethodName = remaining.paymentMethodName;
    remaining.amount = round2(form.value.amount);
    
    if (remaining.paymentMethodId) {
      paymentMethodService.getById(remaining.paymentMethodId).then(res => {
        if (res.data) {
          selectedPaymentMethod.value = res.data;
        }
      }).catch(err => {
        console.error('Error fetching payment method:', err);
      });
    } else {
      selectedPaymentMethod.value = null;
    }
  }
  updatePreviousAmounts();
  isUpdatingSplits = false;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

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
    let data = response.data.filter(group => group.active && group.classification !== 'CREDIT_CARD');
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

const isFormValid = computed(() => {
  if (!canSave.value) return false;
  if (launchMode.value === 'SALE') {
    if (isSplitPayment.value) {
      if (!isSplitsBalanced.value || hasDuplicatePaymentMethods.value) return false;
      if (paymentSplits.value.some(s => !s.paymentMethodId)) return false;
    } else {
      if (form.value.status === 'PAID' && !form.value.paymentMethodId) return false;
    }
  }
  if (launchMode.value === 'MANUAL') {
    if (!form.value.description) return false;
  }
  return true;
});

const saveTooltip = computed(() => {
  if (!canSave.value) {
    return 'Transação paga, apenas ADMIN pode salvar alterações.';
  }
  if (!isFormValid.value) {
    if (launchMode.value === 'SALE') {
      if (isSplitPayment.value) {
        if (!isSplitsBalanced.value) {
          return `A soma das formas de pagamento (${formatCurrency(splitsSum.value)}) não corresponde ao total da venda (${formatCurrency(form.value.amount || 0)}).`;
        }
        if (hasDuplicatePaymentMethods.value) {
          return 'Existem formas de pagamento duplicadas.';
        }
        if (paymentSplits.value.some(s => !s.paymentMethodId)) {
          return 'Selecione a forma de pagamento para todas as divisões.';
        }
      } else {
        if (form.value.status === 'PAID' && !form.value.paymentMethodId) {
          return 'Selecione a forma de pagamento para a transação paga.';
        }
      }
    }
    if (launchMode.value === 'MANUAL' && !form.value.description) {
      return 'A descrição é obrigatória para lançamentos manuais.';
    }
  }
  return '';
});

onMounted(async () => {
  checkUserRole();
  transactionStatuses.value = await enumService.getOptions('TransactionStatus');
  saleItemTypes.value = await enumService.getOptions('SaleItemType');
  accountNatures.value = await enumService.getOptions('AccountNature');

  const groupsResponse = await financialService.getAccountGroups();
  accountGroups.value = groupsResponse.data.filter(g => g.active && g.classification !== 'CREDIT_CARD');

  try {
    const cardsRes = await creditCardService.getAll();
    activeCards.value = (cardsRes.data || []).filter(c => c.active);
  } catch {
    activeCards.value = [];
  }

  if (props.transaction?.id) {
    form.value = {...props.transaction};
    originalStatus.value = props.transaction.status;

    // Clean up payment method name in brackets from the end of the description
    if (form.value.description) {
      form.value.description = form.value.description.replace(/\s*\[[^\]]+\]\s*$/, '').trim();
    }

    if (props.transaction.saleId || props.transaction.sale) {
      launchMode.value = 'SALE';
      if (props.transaction.sale?.items) {
          saleItems.value = props.transaction.sale.items.map(item => ({
              ...item,
              type: item.type || (item.productId ? 'PRODUCT' : 'SERVICE')
          }));
      }

      const sId = props.transaction.saleId || props.transaction.sale?.id;
      if (sId) {
          try {
              const res = await financialService.getTransactionsBySaleId(sId);
              if (res.data && res.data.length > 0) {
                  const splits = res.data.map(tx => ({
                      id: tx.id,
                      paymentMethodId: tx.paymentMethodId,
                      paymentMethodName: tx.paymentMethodName,
                      amount: tx.amount,
                      discountPercentage: tx.discountPercentage
                  }));
                  
                  for (const split of splits) {
                      if (split.paymentMethodId && (split.discountPercentage === undefined || split.discountPercentage === null)) {
                          try {
                              const pmRes = await paymentMethodService.getById(split.paymentMethodId);
                              if (pmRes.data) {
                                  split.discountPercentage = pmRes.data.discountPercentage;
                              }
                          } catch (err) {
                              console.error('Error fetching payment method for split:', err);
                          }
                      }
                  }
                  
                  isUpdatingSplits = true;
                  paymentSplits.value = splits;
                  
                  if (paymentSplits.value.length > 1) {
                      isSplitPayment.value = true;
                  } else {
                      isSplitPayment.value = false;
                      const single = paymentSplits.value[0];
                      if (single.paymentMethodId && !form.value.paymentMethodId) {
                          form.value.paymentMethodId = single.paymentMethodId;
                          form.value.paymentMethodName = single.paymentMethodName;
                      }
                  }
                  updatePreviousAmounts();
                  isUpdatingSplits = false;
              }
          } catch (err) {
              console.error('Error loading payment splits:', err);
          }
      }
    } else {
      launchMode.value = 'MANUAL';
    }

    if (form.value.saleId && form.value.saleTotal) {
      form.value.amount = form.value.saleTotal;
    } else if (form.value.originalAmount) {
      form.value.amount = form.value.originalAmount;
    }
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

  if (!props.transaction?.id) {
    isUpdatingSplits = true;
    paymentSplits.value[0].amount = round2(form.value.amount);
    updatePreviousAmounts();
    isUpdatingSplits = false;
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
  
  if (paymentSplits.value.length === 1) {
    paymentSplits.value[0].paymentMethodId = item?.id;
    paymentSplits.value[0].paymentMethodName = item?.name || '';
    paymentSplits.value[0].amount = form.value.amount;
    paymentSplits.value[0].discountPercentage = item?.discountPercentage;
  }
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

  const isPaidSaleEdit = props.transaction?.id && (props.transaction.saleId || props.transaction.sale) && originalStatus.value === 'PAID';

  // If manual, manual edit, or a paid sale edit (which cannot go through launchSale due to lock), save individual transaction directly
  if (launchMode.value === 'MANUAL' || (props.transaction?.id && !props.transaction.saleId) || isPaidSaleEdit) {
    if (launchMode.value === 'MANUAL' && !form.value.description) {
      confirmBridge.alert({
        title: 'Descrição Obrigatória',
        message: 'A descrição é obrigatória para lançamentos manuais.',
        type: 'warning'
      });
      return;
    }

    // Route to credit card expense when a card source is selected
    if (selectedSourceCardId.value !== null && form.value.nature === 'EXPENSE') {
      try {
        const purchaseDate = form.value.paymentDate
          ? form.value.paymentDate.substring(0, 10)
          : new Date().toISOString().substring(0, 10);
        await creditCardService.createExpense(selectedSourceCardId.value, {
          description: form.value.description,
          totalAmount: form.value.amount,
          installmentCount: cardInstallmentCount.value || 1,
          purchaseDate,
          category: form.value.category || null,
          accountGroupId: form.value.accountGroupId || null,
        });
        emit('save', { refresh: true });
      } catch (error) {
        confirmBridge.alert({
          title: 'Erro ao Lançar no Cartão',
          message: error.response?.data?.message || 'Não foi possível lançar o gasto no cartão.',
          type: 'danger'
        });
      }
      return;
    }

    if (form.value.status === 'PAID' && !form.value.accountGroupId && !form.value.appointmentId) {
      confirmBridge.alert({
        title: 'Grupo de Contas Obrigatório',
        message: 'Selecione um Grupo de Contas para transações Pagas.',
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
          id: form.value.saleId || props.transaction?.saleId || props.transaction?.sale?.id,
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
        transactions: paymentSplits.value.map(split => {
          let baseDesc = form.value.description || `Venda para ${form.value.clientName}`;
          // Clean up any existing payment method tag from the end to avoid duplication
          baseDesc = baseDesc.replace(/\s*\[[^\]]+\]\s*$/, '').trim();

          return {
            ...form.value,
            id: split.id || null,
            description: baseDesc,
            nature: 'INCOME',
            paymentMethodId: split.paymentMethodId,
            paymentMethodName: split.paymentMethodName,
            amount: split.amount,
            originalAmount: split.amount,
            status: form.value.status
          };
        })
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
  const roundedNewVal = round2(newVal);
  if (!props.transaction?.id || roundedNewVal !== round2(props.transaction.amount)) {
     form.value.originalAmount = roundedNewVal;
  }
  if (paymentSplits.value.length === 1) {
    isUpdatingSplits = true;
    paymentSplits.value[0].amount = roundedNewVal;
    updatePreviousAmounts();
    isUpdatingSplits = false;
  } else if (paymentSplits.value.length > 1) {
    isUpdatingSplits = true;
    const sumExceptLast = paymentSplits.value.slice(0, -1).reduce((sum, s) => sum + round2(s.amount), 0);
    const roundedSumExceptLast = round2(sumExceptLast);
    const remaining = Math.max(0, round2(roundedNewVal - roundedSumExceptLast));
    paymentSplits.value[paymentSplits.value.length - 1].amount = remaining;
    updatePreviousAmounts();
    isUpdatingSplits = false;
  }
});

const viewAppointment = () => {
  if (form.value.appointmentId) emit('view-appointment', form.value.appointmentId);
}

const isAppointmentTransaction = computed(() => !!form.value.appointmentId);

watch(() => form.value.status, (newVal) => {
  if (launchMode.value === 'MANUAL' && newVal !== 'PAID') {
     form.value.paymentMethodId = undefined;
     form.value.paymentMethodName = '';
     selectedPaymentMethod.value = null;
  }
});

watch(() => form.value.paymentMethodId, (newId) => {
  if (!isSplitPayment.value && paymentSplits.value.length === 1) {
    paymentSplits.value[0].paymentMethodId = newId;
    paymentSplits.value[0].paymentMethodName = form.value.paymentMethodName;
  }
});

watch(paymentSplits, (newSplits) => {
  if (isUpdatingSplits) return;
  if (!isSplitPayment.value || newSplits.length <= 1) {
    updatePreviousAmounts();
    return;
  }

  isUpdatingSplits = true;
  try {
    const totalAmount = round2(form.value.amount);
    
    let modifiedIndex = -1;
    for (let i = 0; i < newSplits.length; i++) {
      const currentVal = round2(newSplits[i]?.amount);
      const prevVal = previousAmounts[i] !== undefined ? previousAmounts[i] : 0;
      if (currentVal !== prevVal) {
        modifiedIndex = i;
        break;
      }
    }

    if (modifiedIndex !== -1) {
      const lastIndex = newSplits.length - 1;
      
      if (modifiedIndex === lastIndex) {
        const currentLastVal = round2(newSplits[lastIndex].amount);
        const prevLastVal = previousAmounts[lastIndex] !== undefined ? previousAmounts[lastIndex] : 0;
        
        if (currentLastVal < prevLastVal) {
          const currentSum = round2(newSplits.reduce((sum, s) => sum + round2(s.amount), 0));
          if (currentSum < totalAmount) {
            const remaining = round2(totalAmount - currentSum);
            newSplits.push({
              paymentMethodId: undefined,
              paymentMethodName: '',
              amount: remaining,
              status: 'PAID'
            });
          }
        }
      } else {
        const sumExceptLast = newSplits.slice(0, -1).reduce((sum, s) => sum + round2(s.amount), 0);
        const roundedSumExceptLast = round2(sumExceptLast);
        const remaining = Math.max(0, round2(totalAmount - roundedSumExceptLast));
        
        newSplits[lastIndex].amount = remaining;
      }
    }
  } finally {
    updatePreviousAmounts();
    isUpdatingSplits = false;
  }
}, { deep: true });

const formatCardLimit = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

watch(launchMode, (newVal) => {
  if (newVal === 'SALE') {
    form.value.nature = 'INCOME';
    isSplitPayment.value = false;
  }
  else if (!form.value.accountGroupId && !form.value.id) form.value.nature = 'EXPENSE';
  selectedSourceCardId.value = null;
  cardInstallmentCount.value = 1;
});

watch(() => form.value.nature, (newVal) => {
  selectedSourceCardId.value = null;
  cardInstallmentCount.value = 1;
  if (newVal === 'INCOME') {
    form.value.paymentMethodId = undefined;
    form.value.paymentMethodName = '';
    selectedPaymentMethod.value = null;
  }
});

watch(() => form.value.appointmentId, (newVal) => {
  if (newVal) form.value.nature = 'INCOME';
}, {immediate: true});

watch([() => form.value.clientName, () => paymentSplits.value.length], ([clientName, splitsCount]) => {
  if (launchMode.value === 'SALE' && clientName) {
    const defaultPattern = new RegExp(`^Venda para ${clientName}( com \\d+ formas? de pgto)?$`);
    if (!form.value.description || defaultPattern.test(form.value.description)) {
      if (splitsCount > 1) {
        form.value.description = `Venda para ${clientName} com ${splitsCount} formas de pgto`;
      } else {
        form.value.description = `Venda para ${clientName}`;
      }
    }
  }
}, { immediate: true, deep: true });
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
