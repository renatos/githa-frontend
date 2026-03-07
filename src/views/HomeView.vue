<template>
  <div class="p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">Dashboard Principal</h1>
      <p class="text-gray-500 dark:text-slate-400">Bem-vindo(a), acompanhe os indicadores da sua clínica.</p>
    </header>

    <!-- Stitch Dark Mode: 3-column grid on desktop, single column on mobile -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
      <!-- COLUMN 1: Financial + AI -->
      <div class="space-y-6">
        <FinancialSummaryCard />
        <AiInsightsCard />
      </div>

      <!-- COLUMN 2: Appointments + Top Clients -->
      <div class="space-y-6">
        <TodayAppointmentsCard />
        <TopStrategicClientsCard />
      </div>

      <!-- COLUMN 3: Birthdays + Low Stock -->
      <div class="space-y-6">
        <TodayBirthdaysCard />
        <LowStockProductsCard />
      </div>
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
