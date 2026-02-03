<template>
  <div class="financial-dashboard">
    <h2>Dashboard Financeiro</h2>
    
    <div class="summary-cards">
      <div class="card income">
        <h3>Receitas</h3>
        <div class="amount">{{ formatCurrency(summary.totalIncome) }}</div>
      </div>
      
      <div class="card expense">
        <h3>Despesas</h3>
        <div class="amount">{{ formatCurrency(summary.totalExpense) }}</div>
      </div>
      
      <div class="card balance" :class="{ negative: summary.balance < 0 }">
        <h3>Saldo</h3>
        <div class="amount">{{ formatCurrency(summary.balance) }}</div>
      </div>
    </div>

    <!-- Here we embed the transaction list -->
    <div class="recent-transactions">
        <TransactionList />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import financialService from '../../services/financialService';
import TransactionList from './TransactionList.vue';

const summary = ref({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0
});

onMounted(async () => {
  await loadSummary();
});

const loadSummary = async () => {
  try {
    const response = await financialService.getSummary();
    summary.value = response.data;
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
</script>

<style scoped>
.financial-dashboard {
  padding: 1rem;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: var(--color-bg-card, #fff);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-left: 5px solid transparent;
}

.card.income {
  border-left-color: var(--color-success, #16a34a);
}

.card.expense {
  border-left-color: var(--color-error, #dc2626);
}

.card.balance {
  border-left-color: var(--color-primary, #2563eb);
}
.card.balance.negative {
    border-left-color: var(--color-error, #dc2626);
}

.card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.card .amount {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.card.income .amount {
    color: var(--color-success, #16a34a);
}

.card.expense .amount {
    color: var(--color-error, #dc2626);
}

.card.balance.negative .amount {
    color: var(--color-error, #dc2626);
}

.recent-transactions {
    background: var(--color-bg-card, #fff);
    border-radius: var(--radius-md);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem;
}
</style>
