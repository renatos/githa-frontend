<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-left">
        <h1>Dashboard Principal</h1>
        <p class="subtitle">Bem-vindo(a), acompanhe os indicadores da sua clínica.</p>
      </div>
      <div class="header-actions">
        <!-- Futuros botões de filtro global de data ou personalização -->
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- High Priority Cards First -->
      <FinancialSummaryCard />
      <TodayAppointmentsCard />
      <TopStrategicClientsCard />
      
      <!-- AI & Future Cards -->
      <AiInsightsCard />
      
      <!-- Placeholder for upcoming cards -->
      <TodayBirthdaysCard />
      <LowStockProductsCard />
    </div>
  </div>
</template>

<script setup>
import FinancialSummaryCard from '../components/dashboard/FinancialSummaryCard.vue';
import TodayAppointmentsCard from '../components/dashboard/TodayAppointmentsCard.vue';
import TopStrategicClientsCard from '../components/dashboard/TopStrategicClientsCard.vue';
import AiInsightsCard from '../components/dashboard/AiInsightsCard.vue';
import TodayBirthdaysCard from '../components/dashboard/TodayBirthdaysCard.vue';
import LowStockProductsCard from '../components/dashboard/LowStockProductsCard.vue';
</script>

<style scoped>
.dashboard-view {
  padding: var(--spacing-lg);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
  align-items: stretch;
}

/* Specific responsive adjustments */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1440px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
</style>
