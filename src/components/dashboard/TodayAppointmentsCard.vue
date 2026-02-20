<template>
  <DashboardCard
    title="Agenda do Dia"
    icon="📅"
    :loading="loading"
    :error="error"
    @retry="fetchAppointments"
  >
    <div v-if="appointments.length === 0 && !loading && !error" class="empty-state">
      <p>Nenhum agendamento para hoje.</p>
    </div>

    <div v-else class="appointments-list">
      <div 
        v-for="appointment in appointments" 
        :key="appointment.id" 
        class="appointment-item clickable"
        @click="goToAppointment(appointment)"
      >
        <div class="time-block">
          <span class="time">{{ formatTime(appointment.startTime) }}</span>
        </div>
        <div class="appointment-details">
          <p class="client-name">{{ appointment.clientName?.split(' ')[0] }}</p>
          <p class="service-name">{{ appointment.serviceName }}</p>
          <span 
            class="status-badge" 
            :class="appointment.status ? appointment.status.toLowerCase() : ''"
          >
            {{ translateStatus(appointment.status) }}
          </span>
        </div>
      </div>
    </div>

    <template #actions>
      <router-link to="/appointments" class="btn-icon" title="Ver Agenda Completa">
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </template>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardCard from './DashboardCard.vue';
import { appointmentService } from '../../services/appointmentService';

const router = useRouter();
const loading = ref(true);
const error = ref(false);
const appointments = ref([]);

const goToAppointment = (appointment) => {
  if (appointment && appointment.id) {
    router.push({
      path: '/appointments',
      query: { highlight: appointment.id }
    });
  }
};

const formatTime = (dateTimeStr) => {
  if (!dateTimeStr) return '';
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const translateStatus = (status) => {
  const map = {
    'SCHEDULED': 'Agendado',
    'CONFIRMED': 'Confirmado',
    'IN_PROGRESS': 'Em Andamento',
    'COMPLETED': 'Concluído',
    'CANCELED': 'Cancelado',
    'NO_SHOW': 'Faltou'
  };
  return map[status] || status;
};

const fetchAppointments = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // Convert to UTC ISO string as expected by the backend DynamicFilter (no Z postfix)
    const startTimeIso = today.toISOString().replace('Z', '');
    const endTimeIso = endOfDay.toISOString().replace('Z', '');
    
    const response = await appointmentService.getAll({
      page: 0,
      size: 50, // Get a reasonable number of today's appointments
      sort: 'startTime,asc',
      'startTime_gte': startTimeIso,
      'startTime_lte': endTimeIso
    });
    
    // Ensure we handle pagination format properly
    const content = response?.data?.content || response?.data || [];
    appointments.value = Array.isArray(content) ? content : [];
    
  } catch (err) {
    console.error('Failed to fetch today appointments:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAppointments();
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

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  max-height: 350px;
  padding-right: var(--spacing-sm);
}

/* Custom scrollbar for inner list */
.appointments-list::-webkit-scrollbar {
  width: 4px;
}

.appointments-list::-webkit-scrollbar-track {
  background: transparent;
}

.appointments-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.appointment-item {
  display: flex;
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  border-left: 3px solid var(--color-primary);
  transition: transform 0.2s, background-color 0.2s;
}

.appointment-item.clickable {
  cursor: pointer;
}

.appointment-item:hover {
  transform: translateX(4px);
  background-color: var(--color-primary-soft);
}

.time-block {
  min-width: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.1rem;
  border-right: 1px dashed var(--color-border);
  margin-right: var(--spacing-sm);
  padding-right: var(--spacing-sm);
}

.appointment-details {
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

.service-name {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.status-badge {
  align-self: flex-start;
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
  border-radius: 4px;
  font-weight: 600;
}

/* Reuse existing status badge colors if possible, else define basic ones */
.status-badge.scheduled { background-color: #e0f2fe; color: #0369a1; }
.status-badge.confirmed { background-color: #dcfce7; color: #166534; }
.status-badge.in_progress { background-color: #fef9c3; color: #854d0e; }
.status-badge.completed { background-color: #f3f4f6; color: #374151; }
.status-badge.canceled, .status-badge.no_show { background-color: #fee2e2; color: #991b1b; }

.btn-icon {
  text-decoration: none;
  color: var(--color-text-muted);
}

.btn-icon:hover {
  color: var(--color-primary);
}
</style>
