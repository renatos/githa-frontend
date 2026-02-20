<template>
  <DashboardCard
    title="Aniversariantes (Mês Atual)"
    icon="🎂"
    :loading="loading"
    :error="error"
    @retry="fetchBirthdays"
  >
    <div v-if="clients.length === 0 && !loading && !error" class="empty-state">
      <p>Nenhum aniversariante este mês.</p>
    </div>

    <div v-else class="birthdays-list">
      <div 
        v-for="client in clients" 
        :key="client.id" 
        class="birthday-item"
        @click="goToClient(client)"
      >
        <div class="calendar-icon">
          <span class="month">{{ extractMonth(client.birthday) }}</span>
          <strong class="day">{{ extractDay(client.birthday) }}</strong>
        </div>
        
        <div class="client-details">
          <p class="client-name">
            {{ client.name }} 
            <span v-if="isToday(client.birthday)" class="today-badge">Hoje! 🎉</span>
          </p>
          <div class="contact-info">
            <span v-if="client.phone" title="WhatsApp" class="phone-block">
               <i class="pi pi-whatsapp"></i> {{ formatPhone(client.phone) }}
            </span>
            <span v-else class="no-contact text-muted">Sem telefone</span>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <router-link to="/clients" class="btn-icon" title="Ver Clientes">
        <i class="pi pi-users"></i>
      </router-link>
    </template>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardCard from './DashboardCard.vue';
import api from '../../services/api';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const clients = ref([]);

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const extractDay = (dateStr) => {
  if (!dateStr) return '';
  // Format is typically YYYY-MM-DD
  const parts = dateStr.split('-');
  return parts.length === 3 ? parts[2] : '';
};

const extractMonth = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const monthIndex = parseInt(parts[1], 10) - 1;
    return monthNames[monthIndex];
  }
  return '';
};

const isToday = (dateStr) => {
  if (!dateStr) return false;
  const today = new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return parseInt(parts[1], 10) === today.getMonth() + 1 && 
           parseInt(parts[2], 10) === today.getDate();
  }
  return false;
};

const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

const fetchBirthdays = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const currentMonth = new Date().getMonth() + 1;
    
    // Atualmente, a busca baseia-se em trazer todos e filtrar no frontend
    // Ideal: o backend prover um endpoint /api/clients/birthdays?month=X
    // Como workaround, pegamos os 100 últimos clientes ordenados por data de criação / id
    // e filtramos. Se a carteira for gigante, isso precisará de refactor backend.
    
    const response = await api.get('/clients', {
      params: { size: 200, sort: 'name,asc' } 
    });
    
    const content = response?.data?.content || response?.data || [];
    const allClients = Array.isArray(content) ? content : [];
    
    // Frontend Filter
    const birthdaysThisMonth = allClients.filter(client => {
      if (!client.birthday) return false;
      const parts = client.birthday.split('-');
      if (parts.length === 3) {
        return parseInt(parts[1], 10) === currentMonth;
      }
      return false;
    });

    // Sort by day
    birthdaysThisMonth.sort((a, b) => {
       const dayA = parseInt(a.birthday.split('-')[2], 10);
       const dayB = parseInt(b.birthday.split('-')[2], 10);
       return dayA - dayB;
    });

    clients.value = birthdaysThisMonth.slice(0, 10); // Take top 10 to avoid huge card
    
  } catch (err) {
    console.error('Failed to fetch birthdays:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const goToClient = (client) => {
    if (!client || !client.id) return;
    router.push({
      name: 'client-detail',
      params: { id: client.id }
    });
};

onMounted(() => {
  fetchBirthdays();
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

.birthdays-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  max-height: 350px;
  padding-right: var(--spacing-sm);
}

.birthdays-list::-webkit-scrollbar {
  width: 4px;
}
.birthdays-list::-webkit-scrollbar-track {
  background: transparent;
}
.birthdays-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.birthday-item {
  display: flex;
  align-items: center;
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.birthday-item:hover {
  background-color: var(--color-primary-soft);
  border-color: var(--color-primary-soft);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.calendar-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  margin-right: var(--spacing-md);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.calendar-icon .month {
  background-color: #ef4444; /* Red Header */
  color: white;
  width: 100%;
  text-align: center;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 0;
}

.calendar-icon .day {
  color: #1e293b; /* Dark text consistently due to #fff background */
  font-size: 1.2rem;
  line-height: 1.2;
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
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.today-badge {
  font-size: 0.65rem;
  background-color: #fef08a;
  color: #854d0e;
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.contact-info {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.phone-block {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #16a34a; /* WhatsApp Green */
}

.btn-icon {
  text-decoration: none;
  color: var(--color-text-muted);
}

.btn-icon:hover {
  color: var(--color-primary);
}
</style>
