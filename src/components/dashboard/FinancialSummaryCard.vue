<template>
  <DashboardCard
    title="Resumo Financeiro (Mês Atual)"
    icon="💰"
    :loading="loading"
    :error="error"
    @retry="fetchFinancialSummary"
  >
    <div v-if="!summary && !loading && !error" class="empty-state">
      <p>Nenhum dado financeiro disponível para este mês.</p>
    </div>

    <div v-else-if="summary" class="finance-grid">
      <!-- Receitas -->
      <div class="finance-metric income">
        <span class="metric-label">Receitas (Pagas)</span>
        <span class="metric-value">{{ formatCurrency(summary.totalIncome || 0) }}</span>
        <div class="metric-footer">
          <span class="pendings">Pendentes: {{ formatCurrency(summary.totalPendingIncome || 0) }}</span>
        </div>
      </div>

      <!-- Despesas -->
      <div class="finance-metric expense">
        <span class="metric-label">Despesas (Pagas)</span>
        <span class="metric-value">{{ formatCurrency(summary.totalExpenses || 0) }}</span>
        <div class="metric-footer">
          <span class="pendings">Pendentes: {{ formatCurrency(summary.totalPendingExpenses || 0) }}</span>
        </div>
      </div>

      <!-- Saldo -->
      <div class="finance-metric balance" :class="balanceClass">
        <span class="metric-label">Saldo (Recebido - Pago)</span>
        <span class="metric-value">{{ formatCurrency(summary.balance || 0) }}</span>
        <div class="metric-footer">
          <span class="pendings">Margem: {{ calculateMargin(summary.totalIncome, summary.totalExpenses) }}%</span>
        </div>
      </div>
    </div>

    <template #actions>
      <router-link to="/financials" class="btn-icon" title="Abrir Módulo Financeiro">
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </template>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DashboardCard from './DashboardCard.vue';
import financialService from '../../services/financialService';
import { formatCurrency } from '../../utils/formatters';

const loading = ref(true);
const error = ref(false);
const summary = ref(null);

const balanceClass = computed(() => {
  if (!summary.value) return '';
  if (summary.value.balance > 0) return 'positive';
  if (summary.value.balance < 0) return 'negative';
  return 'neutral';
});

const calculateMargin = (income, expense) => {
  if (!income || income === 0) return '0.0';
  const margin = ((income - (expense || 0)) / income) * 100;
  return margin.toFixed(1);
};

const fetchFinancialSummary = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const response = await financialService.getSummary(month, year);
    
    if (response && response.data) {
      // Map properties to match the backend DTO names
      summary.value = {
        totalIncome: response.data.totalIncome || 0,
        totalExpenses: response.data.totalExpense || 0,
        balance: response.data.balance || 0,
        totalPendingIncome: response.data.pendingIncome || 0,
        totalPendingExpenses: response.data.pendingExpense || 0
      };
    } else {
      error.value = true; 
    }
  } catch (err) {
    console.error('Failed to fetch financial summary:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchFinancialSummary();
});
</script>

<style scoped>
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-muted);
  font-style: italic;
}

.finance-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  justify-content: space-around;
}

.finance-metric {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border-left: 4px solid var(--color-border);
  transition: transform 0.2s;
}

.finance-metric:hover {
  transform: translateX(4px);
}

.metric-label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.metric-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin-bottom: var(--spacing-sm);
}

.metric-footer {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  display: flex;
  justify-content: flex-end;
  border-top: 1px dashed var(--color-border);
  padding-top: var(--spacing-xs);
  margin-top: auto;
}

.pendings {
  font-style: italic;
}

/* Specific Styles for Income, Expenses, Balance */
.finance-metric.income {
  border-left-color: var(--color-status-active-bg);
}
.finance-metric.income .metric-value {
  color: #16a34a; /* Green 600 */
}
.finance-metric.income .metric-footer {
  border-top-color: #dcfce7;
}

.finance-metric.expense {
  border-left-color: var(--color-status-risk-bg);
}
.finance-metric.expense .metric-value {
  color: #dc2626; /* Red 600 */
}
.finance-metric.expense .metric-footer {
  border-top-color: #fee2e2;
}

.finance-metric.balance {
  border-left-color: var(--color-primary);
  background-color: var(--color-primary-soft);
}
.finance-metric.balance.positive .metric-value {
  color: #16a34a;
}
.finance-metric.balance.negative .metric-value {
  color: #dc2626;
}
.finance-metric.balance.neutral .metric-value {
  color: var(--color-text-main);
}
.finance-metric.balance .metric-footer {
  border-top-color: rgba(0,0,0,0.05);
}

.btn-icon {
  text-decoration: none;
  color: var(--color-text-muted);
}

.btn-icon:hover {
  color: var(--color-primary);
}
</style>
