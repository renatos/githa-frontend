<template>
  <div class="client-detail-view">
    <div class="page-header" v-if="client.id">
      <div class="header-left">
        <button class="btn-back" @click="$router.push({ name: 'clients' })">←</button>
        <div class="title-section">
          <h1>{{ client.name }}</h1>
          <span :class="['status-badge', client.status ? client.status.toLowerCase() : '']">
            {{ client.status || 'ACTIVE' }}
          </span>
        </div>
      </div>
    </div>

    <div class="loading" v-if="loading">Carregando...</div>

    <div class="content" v-else>
      <div class="tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'info' }]" 
          @click="activeTab = 'info'"
        >
          Dados Cadastrais
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'history' }]" 
          @click="activeTab = 'history'"
        >
          Histórico de Agendamentos
        </button>
      </div>

      <div class="tab-content">
        <!-- Info Tab -->
        <div v-show="activeTab === 'info'" class="info-tab">
          <!-- Reuse form structure or simple display -->
          <div class="info-card">
            <div class="info-row">
              <label>Email:</label> <span>{{ client.email }}</span>
            </div>
            <div class="info-row">
              <label>Telefone:</label> <span>{{ client.phone }}</span>
            </div>
            <div class="info-row">
              <label>Aniversário:</label> <span>{{ formatDate(client.birthday) }}</span>
            </div>
             <div class="info-row" v-if="client.referredByName">
              <label>Indicado Por:</label> <span>{{ client.referredByName }}</span>
            </div>
            <div class="info-row full">
              <label>Notas:</label> 
              <p>{{ client.notes || 'Nenhuma nota.' }}</p>
            </div>
          </div>
          <div class="actions">
             <button class="btn btn-secondary" @click="openEditModal">Editar</button>
          </div>
        </div>

        <!-- History Tab -->
        <div v-show="activeTab === 'history'" class="history-tab">
           <AppointmentList
             ref="historyList"
             :embedded="true"
             :client-id="client.id"
             @edit="editAppointment"
             @delete="deleteAppointment"
             @new="newAppointment"
           />
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ClientForm 
      v-if="showEditModal" 
      :client="client" 
      @close="closeEditModal" 
      @save="onClientSaved" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientService } from '../services/clientService';
import AppointmentList from '../components/AppointmentList.vue';
import ClientForm from '../components/ClientForm.vue';
import { formatDate } from '../utils/formatters';

const route = useRoute();
const router = useRouter();

const client = ref({});
const loading = ref(true);
const activeTab = ref('info');
const showEditModal = ref(false);
const historyList = ref(null);

const loadClient = async () => {
  const id = route.params.id;
  if (!id) return;
  
  loading.value = true;
  try {
    const response = await clientService.getById(id);
    client.value = response.data;
  } catch (error) {
    console.error('Error loading client', error);
    // Handle error
  } finally {
    loading.value = false;
  }
};

const openEditModal = () => showEditModal.value = true;
const closeEditModal = () => showEditModal.value = false;

const onClientSaved = async (data) => {
  // Update local data
  if (data.id === client.value.id) {
    client.value = { ...client.value, ...data };
  }
  closeEditModal();
};

// Appointment List methods (mocked or redirected)
const editAppointment = (appt) => { /* TODO: Open Appointment Modal */ };
const deleteAppointment = (id) => { /* TODO: Delete logic */ };
const newAppointment = () => { /* TODO: New Appointment logic */ };

onMounted(() => {
  loadClient();
});

watch(() => route.params.id, loadClient);
</script>

<style scoped>
.client-detail-view {
  padding: var(--spacing-lg);
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.btn-back {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text-main);
}

.title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.title-section h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-main);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

/* Reusing status colors from global CSS but scoped logic needs care or use classes */
.status-badge.vip { background-color: var(--color-status-vip-bg); color: var(--color-status-vip-text); }
.status-badge.at_risk { background-color: var(--color-status-risk-bg); color: var(--color-status-risk-text); }
.status-badge.new { background-color: var(--color-status-new-bg); color: var(--color-status-new-text); }
.status-badge.active { background-color: var(--color-status-active-bg); color: var(--color-status-active-text); border: 1px solid var(--color-border); }


.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}

.info-card {
  background: var(--color-bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-row.full {
  grid-column: 1 / -1;
}

.info-row label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.info-row span, .info-row p {
  color: var(--color-text-main);
  font-weight: 500;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
