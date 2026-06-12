<template>
  <div class="flex flex-col gap-6">
    <!-- Filters & Actions Header -->
    <div class="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-slate-300 dark:border-slate-700 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10" style="border-top: 3px solid #6366f1">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Card Selector -->
        <div class="flex flex-col gap-1 min-w-[200px]">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Cartão</span>
          <select 
            v-model="selectedCardId" 
            class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors"
            @change="onCardChange"
          >
            <option :value="null">Todos os Cartões</option>
            <option v-for="card in cards" :key="card.id" :value="card.id">
              {{ card.name }}
            </option>
          </select>
        </div>

        <!-- Year Selector (Only shown if a specific card is selected) -->
        <div v-if="selectedCardId" class="flex flex-col gap-1 min-w-[120px]">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Ano</span>
          <select 
            v-model="selectedYear" 
            class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors"
            @change="loadBills"
          >
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Month & Year Selector (Only shown if "Todos os Cartões" is selected) -->
        <div v-else class="flex items-end gap-3">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Referência</span>
            <div class="flex gap-2">
              <select 
                v-model="summaryMonth" 
                class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors"
                @change="loadSummary"
              >
                <option v-for="(mName, idx) in monthsNames" :key="idx" :value="idx + 1">
                  {{ mName }}
                </option>
              </select>
              <select 
                v-model="summaryYear" 
                class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1.5 text-sm focus:border-indigo-600 focus:ring-indigo-600 transition-colors"
                @change="loadSummary"
              >
                <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button 
          v-if="selectedCardId"
          class="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          @click="showExpenseModal = true"
        >
          <span class="material-symbols-outlined text-[18px] mr-2 font-black">add_card</span>
          Lançar Gasto
        </button>
      </div>
    </div>

    <!-- Layout Grid: Left side list, Right side detail -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- List Column -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden p-6">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {{ selectedCardId ? 'Histórico de Faturas do Cartão' : 'Consolidado do Mês' }}
          </h3>

          <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-slate-500 dark:text-slate-400">Carregando dados...</span>
          </div>

          <div v-else-if="selectedCardId && bills.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
            Nenhuma fatura encontrada para este cartão no ano de {{ selectedYear }}.
          </div>

          <div v-else-if="!selectedCardId && summaryList.length === 0" class="py-12 text-center text-slate-500 dark:text-slate-400">
            Nenhum cartão ativo com faturas no mês selecionado.
          </div>

          <div v-else class="overflow-x-auto">
            <!-- If specific card is selected -->
            <table v-if="selectedCardId" class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <th class="py-3 px-4">Fatura (Competência)</th>
                  <th class="py-3 px-4 text-right">Valor Total</th>
                  <th class="py-3 px-4 text-center">Nº Parcelas</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="bill in bills" 
                  :key="`${bill.billYear}-${bill.billMonth}`"
                  class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                  :class="{ 'bg-indigo-50/30 dark:bg-indigo-500/5': selectedBillKey === `${bill.billYear}-${bill.billMonth}` }"
                  @click="selectBill(bill)"
                >
                  <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {{ monthsNames[bill.billMonth - 1] }} / {{ bill.billYear }}
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {{ formatCurrency(bill.totalAmount) }}
                  </td>
                  <td class="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300">
                    {{ bill.installmentCount }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      :class="bill.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
                    >
                      {{ bill.status === 'PAID' ? 'Pago' : 'Pendente' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <span class="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- If "All Cards" is selected -->
            <table v-else class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  <th class="py-3 px-4">Cartão</th>
                  <th class="py-3 px-4 text-right">Limite Disponível</th>
                  <th class="py-3 px-4 text-right">Valor Pendente (Mês)</th>
                  <th class="py-3 px-4 text-center">Status</th>
                  <th class="py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="sum in summaryList" 
                  :key="sum.cardId"
                  class="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors"
                  :class="{ 'bg-indigo-50/30 dark:bg-indigo-500/5': selectedBillKey === `${sum.billYear}-${sum.billMonth}-${sum.cardId}` }"
                  @click="selectBill(sum)"
                >
                  <td class="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {{ sum.cardName }}
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    {{ formatCurrency(sum.availableLimit) }} / {{ formatCurrency(sum.creditLimit) }}
                  </td>
                  <td class="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {{ formatCurrency(sum.pendingAmount) }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span 
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                      :class="sum.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
                    >
                      {{ sum.status === 'PAID' ? 'Pago' : 'Pendente' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <span class="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Detail Column -->
      <div class="lg:col-span-1 flex flex-col gap-4">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 min-h-[300px] flex flex-col justify-between">
          <div v-if="detailLoading" class="py-12 flex flex-col items-center justify-center gap-3 my-auto">
            <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-slate-500 dark:text-slate-400">Carregando detalhes...</span>
          </div>

          <div v-else-if="!selectedBill" class="text-center text-slate-500 dark:text-slate-400 my-auto py-8">
            <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">info</span>
            <p class="text-sm">Selecione uma fatura na tabela para ver o detalhamento dos lançamentos.</p>
          </div>

          <div v-else class="flex flex-col justify-between h-full gap-6">
            <!-- Details Header -->
            <div>
              <div class="flex justify-between items-start border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-4">
                <div>
                  <h4 class="text-base font-bold text-slate-900 dark:text-white">{{ selectedBill.cardName }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Fatura: {{ monthsNames[selectedBill.billMonth - 1] }} / {{ selectedBill.billYear }}
                  </p>
                </div>
                <span 
                  class="px-2 py-0.5 rounded-full text-xs font-semibold border"
                  :class="selectedBill.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'"
                >
                  {{ selectedBill.status === 'PAID' ? 'Paga' : 'Pendente' }}
                </span>
              </div>

              <!-- Installments List -->
              <div class="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                <div 
                  v-for="inst in billDetails.installments" 
                  :key="inst.id"
                  class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800"
                >
                  <div class="flex flex-col gap-1 max-w-[70%]">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {{ inst.expenseDescription }}
                    </span>
                    <span class="text-[10px] text-slate-500 dark:text-slate-400">
                      Parcela {{ inst.installmentNumber }}/{{ inst.totalInstallments }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="flex flex-col items-end gap-1">
                      <span class="text-sm font-mono font-bold text-slate-900 dark:text-white">
                        {{ formatCurrency(inst.amount) }}
                      </span>
                      <span class="text-[9px] font-semibold" :class="inst.status === 'PAID' ? 'text-emerald-500' : 'text-slate-400'">
                        {{ inst.status === 'PAID' ? 'Paga' : 'Pendente' }}
                      </span>
                    </div>

                    <!-- Actions (only if PENDING) -->
                    <div v-if="inst.status === 'PENDING'" class="flex items-center gap-1">
                      <button 
                        class="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                        title="Editar descrição do gasto"
                        @click.stop="openEditExpense(inst)"
                      >
                        <span class="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button 
                        class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
                        title="Excluir gasto (todas as parcelas)"
                        @click.stop="deleteExpense(inst)"
                      >
                        <span class="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Action & Consolidated -->
            <div class="border-t border-slate-100 dark:border-slate-700/50 pt-4 mt-auto">
              <div class="flex justify-between items-center mb-4">
                <span class="text-sm font-semibold text-slate-500 dark:text-slate-400">Total da Fatura:</span>
                <span class="text-xl font-mono font-black text-slate-900 dark:text-white">
                  {{ formatCurrency(selectedBill.totalAmount || selectedBill.pendingAmount) }}
                </span>
              </div>

              <button 
                v-if="selectedBill.status === 'PENDING' || (selectedBill.pendingAmount && selectedBill.pendingAmount > 0)"
                class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                @click="paySelectedBill"
              >
                <span class="material-symbols-outlined text-[18px] mr-2 font-black">credit_score</span>
                Pagar Fatura
              </button>
              <div 
                v-else 
                class="w-full py-2.5 bg-slate-100 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-center rounded-lg text-sm font-medium"
              >
                Fatura Quitada
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- Create Expense Modal -->
    <CreditCardExpenseForm 
      v-if="showExpenseModal"
      :card-id="selectedCardId"
      @close="showExpenseModal = false"
      @save="onExpenseCreated"
    />

    <!-- Edit Expense Modal -->
    <BaseModal
      v-if="showEditModal"
      :show="true"
      title="Editar Gasto do Cartão"
      icon="fa-solid fa-edit"
      @close="closeEditExpense"
    >
      <form id="editExpenseForm" class="flex flex-col gap-6" @submit.prevent="saveExpenseEdit">
        <!-- Description -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Descrição</label>
          <div class="relative group mt-1">
            <i class="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 group-focus-within:text-indigo-600 transition-colors"></i>
            <input
              v-model="expenseEditForm.description"
              placeholder="Ex: Assinatura Software, Materiais Clínicos..."
              class="form-input flex w-full h-12 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 pl-11 pr-4 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              type="text"
              required
            />
          </div>
        </div>

        <!-- Account Group -->
        <div class="space-y-2">
          <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1">Grupo de Contas (Opcional)</label>
          <div class="h-12 w-full mt-1">
            <BaseLookup
              v-model="expenseEditForm.accountGroupId"
              :initial-description="expenseEditForm.accountGroupName"
              :search-service="accountGroupServiceAdapter"
              placeholder="Ex: Custos de Operação, Investimentos (CAPEX)..."
              @select="onAccountGroupSelect"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Cost / Value -->
          <div class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Valor Total</label>
            <div class="relative group mt-1">
              <CurrencyInput
                v-model="expenseEditForm.totalAmount"
                class="font-black"
                required
              />
            </div>
          </div>

          <!-- Installments -->
          <div class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Nº de Parcelas</label>
            <input
              v-model="expenseEditForm.installmentCount"
              class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              type="number"
              min="1"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Date -->
          <div class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Data da Compra</label>
            <input
              v-model="expenseEditForm.purchaseDate"
              class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              type="date"
              required
            />
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal block ml-1 pb-1">Categoria (Opcional)</label>
            <input
              v-model="expenseEditForm.category"
              class="form-input flex w-full h-12 mt-1 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 placeholder:text-slate-400 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors text-base font-normal"
              type="text"
              placeholder="Ex: Tecnologia"
            />
          </div>
        </div>

        <!-- Hidden submit button to allow "Enter" to submit the form -->
        <button type="submit" class="hidden"></button>
      </form>

      <template #footer>
        <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="closeEditExpense">
          Cancelar
        </button>
        <button form="editExpenseForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
          Salvar
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import creditCardService from '../../services/creditCardService';
import financialService from '../../services/financialService';
import CreditCardExpenseForm from './CreditCardExpenseForm.vue';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import BaseLookup from '../common/BaseLookup.vue';
import { toastBridge } from '../../services/toastBridge';
import { confirmBridge } from '../../services/confirmBridge';

const cards = ref([]);
const selectedCardId = ref(null);
const selectedYear = ref(new Date().getFullYear());
const summaryMonth = ref(new Date().getMonth() + 1);
const summaryYear = ref(new Date().getFullYear());

const loading = ref(false);
const detailLoading = ref(false);
const showExpenseModal = ref(false);
const showEditModal = ref(false);
const expenseEditForm = ref({
  id: null,
  description: '',
  totalAmount: null,
  installmentCount: 1,
  purchaseDate: '',
  category: '',
  accountGroupId: null,
  accountGroupName: ''
});

const bills = ref([]);
const summaryList = ref([]);
const selectedBill = ref(null);
const selectedBillKey = ref(null);
const billDetails = ref({ installments: [] });

const availableYears = [2024, 2025, 2026, 2027, 2028];
const monthsNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

onMounted(async () => {
  await loadCards();
  await loadData();
});

const loadCards = async () => {
  try {
    const response = await creditCardService.getAll();
    cards.value = response.data.filter(c => c.active);
  } catch (error) {
    console.error('Error loading cards:', error);
  }
};

const loadData = async () => {
  if (selectedCardId.value) {
    await loadBills();
  } else {
    await loadSummary();
  }
};

const loadBills = async () => {
  loading.value = true;
  selectedBill.value = null;
  selectedBillKey.value = null;
  try {
    const response = await creditCardService.getBills(selectedCardId.value, { year: selectedYear.value });
    bills.value = response.data;
  } catch (error) {
    console.error('Error loading card bills:', error);
  } finally {
    loading.value = false;
  }
};

const loadSummary = async () => {
  loading.value = true;
  selectedBill.value = null;
  selectedBillKey.value = null;
  try {
    const response = await creditCardService.getBillsSummary({
      month: summaryMonth.value,
      year: summaryYear.value
    });
    summaryList.value = response.data;
  } catch (error) {
    console.error('Error loading summary:', error);
  } finally {
    loading.value = false;
  }
};

const onCardChange = () => {
  loadData();
};

const selectBill = async (bill) => {
  selectedBill.value = bill;
  if (selectedCardId.value) {
    selectedBillKey.value = `${bill.billYear}-${bill.billMonth}`;
  } else {
    selectedBillKey.value = `${bill.billYear}-${bill.billMonth}-${bill.cardId}`;
  }
  
  detailLoading.value = true;
  try {
    const cardId = selectedCardId.value || bill.cardId;
    const response = await creditCardService.getBillDetails(cardId, bill.billYear, bill.billMonth);
    billDetails.value = response.data;
  } catch (error) {
    console.error('Error loading bill details:', error);
  } finally {
    detailLoading.value = false;
  }
};

const paySelectedBill = async () => {
  if (!selectedBill.value) return;

  const cardId = selectedCardId.value || selectedBill.value.cardId;
  const month = selectedBill.value.billMonth;
  const year = selectedBill.value.billYear;
  const mName = monthsNames[month - 1];

  confirmBridge.confirm({
    title: 'Confirmar Pagamento de Fatura',
    message: `Deseja realmente marcar a fatura de ${mName}/${year} do cartão "${selectedBill.value.cardName}" como PAGA? Isso registrará uma saída automática de ${formatCurrency(selectedBill.value.totalAmount || selectedBill.value.pendingAmount)} no fluxo de caixa.`,
    type: 'success',
    onConfirm: async () => {
      try {
        await creditCardService.payBill(cardId, year, month, {});
        toastBridge.getToast().add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Fatura de ${mName}/${year} paga com sucesso!`,
          life: 3000
        });
        await loadData();
      } catch (error) {
        console.error('Error paying bill:', error);
        confirmBridge.alert({
          title: 'Erro ao Pagar Fatura',
          message: error.response?.data?.message || 'Não foi possível realizar o pagamento da fatura.',
          type: 'danger'
        });
      }
    }
  });
};

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

const onAccountGroupSelect = (item) => {
  expenseEditForm.value.accountGroupId = item?.id;
  expenseEditForm.value.accountGroupName = item?.name || '';
  if (item && !expenseEditForm.value.description) {
    expenseEditForm.value.description = item.name;
  }
};

const openEditExpense = async (inst) => {
  try {
    const response = await creditCardService.getExpense(inst.expenseId);
    const expense = response.data;
    expenseEditForm.value = {
      id: expense.id,
      description: expense.description,
      totalAmount: expense.totalAmount,
      installmentCount: expense.installmentCount,
      purchaseDate: expense.purchaseDate,
      category: expense.category || '',
      accountGroupId: expense.accountGroupId || null,
      accountGroupName: expense.accountGroupName || ''
    };
    showEditModal.value = true;
  } catch (error) {
    console.error('Error fetching expense details:', error);
    confirmBridge.alert({
      title: 'Erro ao Carregar Gasto',
      message: error.response?.data?.message || 'Não foi possível carregar os detalhes do gasto.',
      type: 'danger'
    });
  }
};

const closeEditExpense = () => {
  showEditModal.value = false;
  expenseEditForm.value = {
    id: null,
    description: '',
    totalAmount: null,
    installmentCount: 1,
    purchaseDate: '',
    category: '',
    accountGroupId: null,
    accountGroupName: ''
  };
};

const saveExpenseEdit = async () => {
  try {
    await creditCardService.updateExpense(expenseEditForm.value.id, {
      description: expenseEditForm.value.description,
      totalAmount: expenseEditForm.value.totalAmount,
      installmentCount: expenseEditForm.value.installmentCount,
      purchaseDate: expenseEditForm.value.purchaseDate,
      category: expenseEditForm.value.category,
      accountGroupId: expenseEditForm.value.accountGroupId
    });
    toastBridge.getToast().add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Gasto atualizado com sucesso!',
      life: 3000
    });
    closeEditExpense();
    loadData();
    if (selectedBill.value) {
      await selectBill(selectedBill.value);
    }
  } catch (error) {
    console.error('Error updating expense:', error);
    confirmBridge.alert({
      title: 'Erro ao Editar Gasto',
      message: error.response?.data?.message || 'Não foi possível salvar as alterações do gasto.',
      type: 'danger'
    });
  }
};

const deleteExpense = (inst) => {
  confirmBridge.confirm({
    title: 'Excluir Gasto do Cartão',
    message: `Tem certeza que deseja excluir o gasto "${inst.expenseDescription}"? Isso apagará TODAS as parcelas deste gasto (inclusive de faturas futuras) e estornará o limite de crédito do cartão.`,
    type: 'danger',
    confirmLabel: 'Excluir',
    onConfirm: async () => {
      try {
        await creditCardService.deleteExpense(inst.expenseId);
        toastBridge.getToast().add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Gasto excluído com sucesso!',
          life: 3000
        });
        loadData();
        if (selectedBill.value) {
          await selectBill(selectedBill.value);
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
        confirmBridge.alert({
          title: 'Erro ao Excluir Gasto',
          message: error.response?.data?.message || 'Não foi possível excluir o gasto do cartão.',
          type: 'danger'
        });
      }
    }
  });
};

const onExpenseCreated = () => {
  showExpenseModal.value = false;
  toastBridge.getToast().add({
    severity: 'success',
    summary: 'Sucesso',
    detail: 'Gasto lançado com sucesso!',
    life: 3000
  });
  loadData();
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

defineExpose({
  loadCards,
  loadData
});
</script>
