<template>
  <div class="p-4 md:p-6 flex flex-col gap-6 animate-fade-in">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-xs font-semibold text-indigo-500/80 uppercase tracking-widest px-1">
      <router-link to="/professionals" class="hover:text-indigo-400 transition-colors flex items-center gap-1">
        <span class="material-symbols-outlined text-sm">arrow_back</span>
        Profissionais
      </router-link>
      <span class="text-slate-600">/</span>
      <span class="text-slate-500">Extrato de Comissões</span>
    </div>

    <!-- Standard Header Box -->
    <PageHeader
      :title="`Extrato: ${balanceData.professionalName || '...'}`"
      subtitle="Consulte o detalhamento de ganhos e retiradas do profissional."
      icon="account_balance_wallet"
    >
      <template #actions>
        <PeriodSelector
          v-model:month="selectedMonth"
          v-model:year="selectedYear"
          :show-mode-toggle="false"
        />
        <button
          class="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-rose-300/50 active:scale-95"
          :title="!isCurrentMonth ? 'Só é possível sacar comissões do mês vigente' : ''"
          :disabled="!balanceData.withdrawalAccountGroupId || balanceData.netAmountToReceive <= 0 || !isCurrentMonth"
          @click="openWithdrawalForm"
        >
          <span class="material-symbols-outlined text-base">payments</span>
          Sacar Comissão
        </button>
      </template>
    </PageHeader>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="card in summaryCards"
        :key="card.label"
        class="relative group overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:-translate-y-1"
      >
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative flex flex-col items-start gap-4">
          <div :class="card.iconBg" class="p-3 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-current/20">
            <span class="material-symbols-outlined">{{ card.icon }}</span>
          </div>
          <div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{{ card.label }}</p>
            <p v-if="card.label === 'Vendas Líquidas'" class="text-[11px] text-slate-400 dark:text-slate-500 mb-1 font-medium leading-tight italic">
              Bruto: {{ formatCurrency(balanceData.totalSalesAmount) }}
            </p>
            <p v-if="card.label === 'Saldo Líquido'" class="text-[11px] text-slate-400 dark:text-slate-500 mb-1 font-medium leading-tight">
              ({{ formatCurrency(balanceData.commissionAmount) }} - {{ formatCurrency(balanceData.totalWithdrawalsAmount) }})
              {{ balanceData.previousMonthBalance >= 0 ? '+' : '-' }} {{ formatCurrency(Math.abs(balanceData.previousMonthBalance)) }} =
            </p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ formatCurrency(card.value) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Section -->
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
      <!-- Commissions Detail -->
      <section class="xl:col-span-9 space-y-4">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-500">receipt_long</span>
          Detalhamento de Comissões
        </h2>
        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <GenericTable :columns="commissionColumns" :items="balanceData.commissionItems">
            <template #cell-calculatedCommissionAmount="{ value }">
              <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ formatCurrency(value) }}</span>
            </template>
            <template #cell-paymentDate="{ value }">
              <span class="text-slate-500">{{ formatDate(value) }}</span>
            </template>
            <template #cell-itemNetAmount="{ value }">
              <span class="text-slate-600 dark:text-slate-300">{{ formatCurrency(value) }}</span>
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 italic">event_busy</span>
                <p>Nenhuma comissão registrada neste período.</p>
              </div>
            </template>
          </GenericTable>
        </div>
      </section>

      <!-- Withdrawals Detail -->
      <section class="xl:col-span-3 space-y-4">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span class="material-symbols-outlined text-rose-500">payments</span>
          Retiradas Realizadas
        </h2>
        <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <GenericTable :columns="withdrawalColumns" :items="balanceData.withdrawalItems">
            <template #cell-withdrawalAmount="{ item, value }">
              <div class="relative group cursor-help inline-flex items-center justify-end w-full">
                <span class="font-bold text-rose-600 dark:text-rose-400">- {{ formatCurrency(value) }}</span>
                <div v-if="item.notes" class="absolute bottom-full right-0 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
                  <div class="bg-slate-900 dark:bg-slate-700 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-2xl border border-slate-700 whitespace-nowrap">
                    <div class="flex items-center gap-1.5 font-medium">
                      <span class="material-symbols-outlined text-xs text-rose-400">info</span>
                      {{ item.notes }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <template #cell-paymentDate="{ value }">
              <span class="text-slate-500">{{ formatDate(value) }}</span>
            </template>
            <template #empty>
              <div class="py-12 flex flex-col items-center text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2 italic">money_off</span>
                <p>Nenhuma retirada realizada neste período.</p>
              </div>
            </template>
          </GenericTable>
        </div>
      </section>
    </div>
  </div>

  <!-- Withdrawal Form Component (seguindo padrão AppointmentForm) -->
  <WithdrawalForm
    v-if="showWithdrawalForm"
    :professional-id="professionalId"
    :professional-name="balanceData.professionalName"
    :net-amount="Number(balanceData.netAmountToReceive)"
    :withdrawal-account-group-id="balanceData.withdrawalAccountGroupId"
    :reference-month="selectedMonth"
    :reference-year="selectedYear"
    @close="closeWithdrawalForm"
    @saved="onWithdrawalSaved"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { professionalService } from '../../services/professionalService';
import GenericTable from '../../components/common/GenericTable.vue';
import PeriodSelector from '../../components/common/PeriodSelector.vue';
import PageHeader from '../../components/common/PageHeader.vue';
import WithdrawalForm from '../../components/WithdrawalForm.vue';

const route = useRoute();
const professionalId = route.params.id;

// Filter State
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const isCurrentMonth = computed(() => {
  const now = new Date();
  return selectedMonth.value === now.getMonth() + 1 && selectedYear.value === now.getFullYear();
});

// Withdrawal Form State
const showWithdrawalForm = ref(false);

const balanceData = ref({
  professionalId: null,
  professionalName: '',
  commissionAmount: 0,
  totalSalesAmount: 0,
  totalNetSalesAmount: 0,
  totalWithdrawalsAmount: 0,
  previousMonthBalance: 0,
  netAmountToReceive: 0,
  withdrawalAccountGroupId: null,
  commissionItems: [],
  withdrawalItems: [],
});

const summaryCards = computed(() => [
  {
    label: 'Vendas Líquidas',
    value: balanceData.value.totalNetSalesAmount,
    icon: 'moving',
    iconBg: 'bg-emerald-500',
  },
  {
    label: 'Comissão Bruta',
    value: balanceData.value.commissionAmount,
    icon: 'star',
    iconBg: 'bg-indigo-500',
  },
  {
    label: 'Total Retiradas',
    value: balanceData.value.totalWithdrawalsAmount,
    icon: 'output',
    iconBg: 'bg-rose-500',
  },
  {
    label: 'Saldo Líquido',
    value: balanceData.value.netAmountToReceive,
    icon: 'savings',
    iconBg: 'bg-amber-500',
  },
]);

const commissionColumns = [
  { key: 'paymentDate', label: 'Data', width: '120px' },
  { key: 'clientName', label: 'Cliente' },
  { key: 'itemDescription', label: 'Serviço' },
  { key: 'itemNetAmount', label: 'Valor', align: 'right', width: '140px' },
  { key: 'calculatedCommissionAmount', label: 'Comissão', align: 'right', width: '120px' },
];

const withdrawalColumns = [
  { key: 'paymentDate', label: 'Data', width: '120px' },
  { key: 'withdrawalAmount', label: 'Valor', align: 'right' },
];

const fetchBalance = async () => {
  try {
    const response = await professionalService.getCommissionBalance(
      professionalId,
      selectedMonth.value,
      selectedYear.value,
    );
    balanceData.value = response.data;
  } catch (error) {
    console.error('Erro ao buscar extrato:', error);
  }
};

const openWithdrawalForm = () => {
  showWithdrawalForm.value = true;
};

const closeWithdrawalForm = () => {
  showWithdrawalForm.value = false;
};

const onWithdrawalSaved = async () => {
  showWithdrawalForm.value = false;
  // Pequeno delay para garantir que o backend processe a transação e atualize o Read Model
  setTimeout(async () => {
    await fetchBalance();
  }, 5500);
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

watch([selectedMonth, selectedYear], fetchBalance);
onMounted(fetchBalance);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
