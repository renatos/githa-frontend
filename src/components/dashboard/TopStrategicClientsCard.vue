<template>
  <DashboardCard
    title="Top Clientes Estratégicos"
    icon="🌟"
    :loading="loading"
    :error="error"
    @retry="fetchTopClients"
  >
    <div v-if="clients.length === 0 && !loading && !error" class="empty-state">
      <p>Nenhum dado estatístico disponível.</p>
    </div>

    <div v-else class="clients-list">
      <div 
        v-for="(stat, index) in clients" 
        :key="stat.client?.id" 
        class="client-item"
        @click="goToClient(stat.client)"
      >
        <div class="rank-block" :class="`rank-${index + 1}`">
          #{{ index + 1 }}
        </div>
        <div class="client-details">
          <p class="client-name">{{ stat.client?.name }}</p>
          <div class="client-metrics">
            <span class="score" title="Score">⭐ {{ stat.calculatedScore }}</span>
            <span class="spent" title="Total Gasto">💰 {{ formatCurrency(stat.totalSpent) }}</span>
          </div>
        </div>
        <div class="status-indicator">
          <span :class="['status-dot', stat.client?.status ? stat.client.status.toLowerCase() : '']" :title="stat.client?.status"></span>
        </div>
      </div>
    </div>

    <template #actions>
      <router-link to="/strategic-clients" class="btn-icon" title="Ver Todos">
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </template>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardCard from './DashboardCard.vue';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const clients = ref([]);

const fetchTopClients = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    // Fetch top 5 clients sorted by score descending
    const response = await api.get('/reports/client-statistics', {
      params: {
        page: 0,
        size: 5,
        sort: 'calculatedScore,desc'
      }
    });
    
    const content = response?.data?.content || response?.data || [];
    clients.value = Array.isArray(content) ? content : [];
    
  } catch (err) {
    console.error('Failed to fetch top strategic clients:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const goToClient = (client) => {
  if (!client || !client.id) return;
  router.push({
    name: 'client-detail',
    params: { id: client.id },
    query: { from: 'dashboard' }
  });
};

onMounted(() => {
  fetchTopClients();
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

.clients-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  max-height: 350px;
  padding-right: var(--spacing-sm);
}

.clients-list::-webkit-scrollbar {
  width: 4px;
}

.clients-list::-webkit-scrollbar-track {
  background: transparent;
}

.clients-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.client-item {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.client-item:hover {
  background-color: var(--color-primary-soft);
  border-color: var(--color-primary-soft);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.rank-block {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--color-text-muted);
  font-size: 1.1rem;
  background-color: var(--color-bg-card);
  border-radius: 50%;
  margin-right: var(--spacing-md);
  border: 2px solid var(--color-border);
}

.rank-1 {
  color: #fbbf24; /* Gold */
  border-color: #fef3c7;
  background-color: #fffbeb;
}

.rank-2 {
  color: #9ca3af; /* Silver */
  border-color: #f3f4f6;
  background-color: #f9fafb;
}

.rank-3 {
  color: #b45309; /* Bronze */
  border-color: #fef3c7;
  background-color: #fff7ed;
}

.client-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.client-name {
  margin: 0;
  font-weight: 600;
  color: var(--color-text-main);
}

.client-metrics {
  display: flex;
  gap: var(--spacing-md);
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.score, .spent {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--spacing-sm);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-border);
}

.status-dot.vip { background-color: var(--color-status-vip-bg); border: 1px solid var(--color-status-vip-text); }
.status-dot.at_risk { background-color: var(--color-status-risk-bg); border: 1px solid var(--color-status-risk-text); }
.status-dot.new { background-color: var(--color-status-new-bg); border: 1px solid var(--color-status-new-text); }
.status-dot.active { background-color: var(--color-status-active-bg); border: 1px solid var(--color-text-muted); }

.btn-icon {
  text-decoration: none;
  color: var(--color-text-muted);
}

.btn-icon:hover {
  color: var(--color-primary);
}
</style>
