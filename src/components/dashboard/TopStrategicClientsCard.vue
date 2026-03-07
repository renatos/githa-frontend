<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <span>⭐</span> Top Clientes Estratégicos
    </h2>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button @click="fetchTopClients" class="text-sm text-red-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="clients.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum dado estatístico disponível.
    </div>

    <!-- Table format matching Stitch (without Score column) -->
    <div v-else class="overflow-x-auto flex-1">
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-gray-500 dark:text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/30 rounded">
          <tr>
            <th class="px-3 py-2">Rank</th>
            <th class="px-3 py-2">Cliente</th>
            <th class="px-3 py-2 text-right">Gasto Total</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-700/50">
          <tr
            v-for="(stat, index) in clients"
            :key="stat.client?.id"
            @click="goToClient(stat.client)"
            class="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <td class="px-3 py-3 text-gray-400 dark:text-slate-400">#{{ index + 1 }}</td>
            <td class="px-3 py-3 font-medium text-gray-800 dark:text-white uppercase">{{ stat.client?.name }}</td>
            <td class="px-3 py-3 text-right text-gray-800 dark:text-white">{{ formatCurrency(stat.totalSpent) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const clients = ref([]);

const goToClient = (client) => {
  if (!client || !client.id) return;
  router.push({ name: 'client-detail', params: { id: client.id }, query: { from: 'dashboard' } });
};

const fetchTopClients = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await api.get('/reports/client-statistics', {
      params: { page: 0, size: 5, sort: 'calculatedScore,desc' }
    });
    const content = response?.data?.content || response?.data || [];
    clients.value = Array.isArray(content) ? content : [];
  } catch (err) {
    console.error('Failed to fetch top clients:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTopClients();
});
</script>
