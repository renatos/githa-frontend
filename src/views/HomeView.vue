<template>
  <div class="p-8">
    <header class="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        {{ professionalName ? `Olá, ${professionalName}! 👋` : 'Dashboard Principal' }}
      </h1>
      <p class="text-gray-500 dark:text-slate-400">Acompanhe os indicadores da sua clínica em tempo real.</p>
    </header>

    <!-- Stitch Dark Mode: 3-column grid on desktop, single column on mobile -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
      <!-- COLUMN 1: Financial + AI -->
      <div class="space-y-6">
        <FinancialSummaryCard />
        <AiInsightsCard />
      </div>

      <!-- COLUMN 2: Appointments + Rebooking + Top Clients -->
      <div class="space-y-6">
        <TodayAppointmentsCard />
        <RebookingCard @select-client="openClientForm" />
        <TopStrategicClientsCard @select-client="openClientForm" />
      </div>

      <!-- COLUMN 3: Birthdays + Low Stock -->
      <div class="space-y-6">
        <TodayBirthdaysCard @select-client="openClientForm" />
        <LowStockProductsCard />
      </div>
    </div>

    <!-- Client Detail Modal -->
    <ClientForm
      v-if="editingClient"
      :client="editingClient"
      :z-index="11000"
      @close="closeClientForm"
      @save="saveClient"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FinancialSummaryCard from '../components/dashboard/FinancialSummaryCard.vue';
import TodayAppointmentsCard from '../components/dashboard/TodayAppointmentsCard.vue';
import RebookingCard from '../components/dashboard/RebookingCard.vue';
import TopStrategicClientsCard from '../components/dashboard/TopStrategicClientsCard.vue';
import AiInsightsCard from '../components/dashboard/AiInsightsCard.vue';
import TodayBirthdaysCard from '../components/dashboard/TodayBirthdaysCard.vue';
import LowStockProductsCard from '../components/dashboard/LowStockProductsCard.vue';
import ClientForm from '../components/ClientForm.vue';
import { clientService } from '../services/clientService';
import { toastBridge } from '../services/toastBridge';
import { authService } from '../services/authService';

const editingClient = ref(null);
const professionalName = ref('');

onMounted(() => {
  const user = authService.getCurrentUser();
  if (user && user.professionalName) {
    professionalName.value = user.professionalName;
  }
});

const openClientForm = async (client) => {
  try {
    // Load full client details to ensure everything is in the form
    const response = await clientService.getById(client.id);
    editingClient.value = response.data;
  } catch (error) {
    console.error('Error loading client details:', error);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível carregar os detalhes do cliente.',
      life: 3000
    });
  }
};

const closeClientForm = () => {
  editingClient.value = null;
};

const saveClient = async (clientData) => {
  try {
    await clientService.update(clientData.id, clientData);
    toastBridge.getToast().add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Cliente atualizado com sucesso!',
      life: 3000
    });
    
    // Notify globally so components like RebookingCard can sync data seamlessly
    window.dispatchEvent(new CustomEvent('client-updated', { detail: clientData }));
    
    closeClientForm();
  } catch (error) {
    console.error('Error saving client:', error);
    toastBridge.getToast().add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível salvar as alterações.',
      life: 3000
    });
  }
};
</script>
