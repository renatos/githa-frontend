<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ appointment.id ? 'Editar Agendamento' : 'Novo Agendamento' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save">
        <div class="form-body">
          <div v-if="form.transactionId" class="appointment-link" style="margin-bottom: 1rem; text-align: center;">
                <span class="badge income" style="cursor: pointer; text-decoration: underline;" @click="navigateToTransaction">
                    Vinculado à Transação #{{ form.transactionId }} 🔗
                </span>
          </div>
          <div class="form-group">
            <label>Cliente</label>
            <BaseLookup
                v-model="form.client.id"
                :initial-description="form.client.name"
                :search-service="clientService"
                placeholder="Pesquisar Cliente..."
                @select="(item) => form.client.name = item?.name"
                @edit="onEditClient"
                :disabled="!canSave"
            />
          </div>
          
           <div class="form-group">
            <label>Profissional</label>
            <BaseLookup
                v-model="form.professional.id"
                :initial-description="form.professional.name"
                :search-service="professionalService"
                placeholder="Pesquisar Profissional..."
                @select="(item) => form.professional.name = item?.name"
                @edit="onEditProfessional"
                :disabled="!canSave"
            />
          </div>

           <div class="form-group">
            <label>Serviço</label>
            <BaseLookup
                v-model="form.service.id"
                :initial-description="form.service.name"
                :search-service="serviceService"
                placeholder="Pesquisar Serviço..."
                @select="onServiceSelect"
                @edit="onEditService"
                :disabled="!canSave"
            />
          </div>

          <div class="form-row">
            <div class="form-group price-group">
                <label>Valor</label>
                <CurrencyInput v-model="form.price" :disabled="!canSave" />
            </div>
            <div class="form-group discount-group">
                <label>Desconto (%)</label>
                  <input v-model="form.discount" type="number" step="0.01" class="form-control" placeholder="0" :disabled="!canSave" />
            </div>
             <div class="form-group final-group">
                <label>Valor Final</label>
                   <input :value="formatCurrency(finalPrice)" type="text" disabled class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
                <label>Data</label>
                <input v-model="form.date" type="date" required class="form-control" :disabled="!canSave" />
            </div>
            <div class="form-group">
                <label>Início</label>
                <input v-model="form.start" type="time" required class="form-control" :disabled="!canSave" />
            </div>
            <div class="form-group">
                <label>Fim</label>
                <input v-model="form.end" type="time" required class="form-control" @focus="calculateEndTime" :disabled="!canSave" />
            </div>
          </div>
          
           <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" required class="form-control" :disabled="!canSave">
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="CANCELED">Cancelado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="MISSED">Faltou</option>
            </select>
          </div>

           <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notes" class="form-control" rows="2" :disabled="!canSave"></textarea>
          </div>

        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="!canSave" :title="saveTooltip">Salvar</button>
        </div>
      </form>
    </div>

    <!-- Edit Modals (Stacked) -->
    <ClientForm 
        v-if="showClientForm" 
        :client="editingClient" 
        @close="showClientForm = false" 
        @save="onClientSaved" 
    />
    <ProfessionalForm 
        v-if="showProfessionalForm" 
        :professional="editingProfessional" 
        @close="showProfessionalForm = false" 
        @save="onProfessionalSaved" 
    />
    <ServiceForm 
        v-if="showServiceForm" 
        :service="editingService" 
        @close="showServiceForm = false" 
        @save="onServiceSaved" 
    />
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, watch } from 'vue';
import { appointmentService } from '../services/appointmentService';
import { clientService } from '../services/clientService';
import { professionalService } from '../services/professionalService';
import { serviceService } from '../services/serviceService';
import { authService } from '../services/authService';
import BaseLookup from './common/BaseLookup.vue';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';
import CurrencyInput from './common/CurrencyInput.vue';
import ClientForm from './ClientForm.vue';
import ProfessionalForm from './ProfessionalForm.vue';
import ServiceForm from './ServiceForm.vue';

const props = defineProps({
  appointment: {
    type: Object,
    default: () => ({}),
  },
  clientId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const isAdmin = ref(false);

const form = ref({
  client: { id: '', name: '' },
  professional: { id: '', name: '' },
  service: { id: '', name: '' },
  date: '',
  start: '',
  end: '',
  status: 'SCHEDULED',
  notes: '',
  price: 0,
  discount: 0,
  transactionId: null
});

const originalStatus = ref('');

const checkUserRole = () => {
    const user = authService.getCurrentUser();
    isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

const canSave = computed(() => {
    // If it's a new appointment (no ID), anyone can save
    if (!props.appointment.id) return true;
    
    // If original status was COMPLETED, only ADMIN can save any changes
    if (originalStatus.value === 'COMPLETED' && !isAdmin.value) {
        return false;
    }

    // If current status is COMPLETED (and changing to it), only ADMIN can save (optional, but good)
    if (form.value.status === 'COMPLETED' && !isAdmin.value) {
        return false;
    }
    
    return true;
});

const saveTooltip = computed(() => {
    if (!canSave.value) {
        return 'Atendimento concluído, apenas ADMIN pode salvar alterações.';
    }
    return '';
});

const finalPrice = computed(() => {
    const p = parseFloat(form.value.price) || 0;
    const d = parseFloat(form.value.discount) || 0;
    return p - (p * d / 100);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

onMounted(() => {
  // Allow population if ID exists OR if we have pre-filled data like startTime (from 'add procedure' action)
  if (props.appointment.id || props.appointment.startTime) {
    const apt = { ...props.appointment };
    originalStatus.value = apt.status;
    
    // Split ISO datetime into date and time
    if (apt.startTime) {
        form.value.date = apt.startTime.split('T')[0];
        form.value.start = apt.startTime.split('T')[1].substring(0, 5);
    }
    if (apt.endTime) {
         form.value.end = apt.endTime.split('T')[1].substring(0, 5);
    }
    
    if (!apt.client) apt.client = { id: apt.clientId || '', name: apt.clientName || '' };
    else {
        apt.client.id = apt.clientId || apt.client.id;
        if (!apt.client.name) apt.client.name = apt.clientName || '';
    }

    if (!apt.professional) apt.professional = { id: apt.professionalId || '', name: apt.professionalName || '' };
    else {
        apt.professional.id = apt.professionalId || apt.professional.id;
        if (!apt.professional.name) apt.professional.name = apt.professionalName || '';
    }

    if (!apt.service) apt.service = { id: apt.serviceId || '', name: apt.serviceName || '' };
    else {
        apt.service.id = apt.serviceId || apt.service.id;
        if (!apt.service.name) apt.service.name = apt.serviceName || '';
    }
    
    form.value = { ...form.value, ...apt };
    
    // If it's a new appointment (no ID), ensure status is SCHEDULED
    if (!apt.id) {
        form.value.status = 'SCHEDULED';
        form.value.id = null; // Ensure ID is null
    }
    
    // Ensure nested objects are set if apt has flat IDs but no objects (though logic above handles it)
    if (!form.value.client.id && apt.clientId) form.value.client.id = apt.clientId;
    
    if (apt.transactionId) form.value.transactionId = apt.transactionId;
  }
  
  checkUserRole();
});

const selectedServiceDuration = ref(0);

const calculateEndTime = () => {
  if (!form.value.start || !selectedServiceDuration.value) return;
  
  const [hours, minutes] = form.value.start.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + selectedServiceDuration.value); // Add duration
  
  const endHours = String(date.getHours()).padStart(2, '0');
  const endMinutes = String(date.getMinutes()).padStart(2, '0');
  
  form.value.end = `${endHours}:${endMinutes}`;
};

const onServiceSelect = (item) => {
    form.value.service.name = item?.name;
    selectedServiceDuration.value = item?.durationMinutes || 0;
    if (item && item.price) {
        form.value.price = item.price;
    }
    calculateEndTime();
};

watch(() => form.value.start, () => {
    calculateEndTime();
});

onMounted(async () => {
    if (props.appointment.id) {
         try {
             // Fetch full details to get transactionId and other fields
             const response = await appointmentService.getById(props.appointment.id);
             const fullApt = response.data;
             if (fullApt) {
                 form.value.transactionId = fullApt.transactionId;
                 // We could also update other fields here if we wanted to be sure
             }
         } catch (e) {
             console.error("Failed to fetch appointment details", e);
         }

        // ... existing logic to fetch service duration ...
        if (form.value.service.id) {
            try {
                 const response = await serviceService.getById(form.value.service.id);
                 if (response) {
                     selectedServiceDuration.value = response.durationMinutes || 0;
                 }
            } catch (e) {
                console.error("Failed to fetch service details", e);
            }
        }
    }
});

const save = () => {
    // Helper to convert datetime-local string to ISO 8601 with timezone
    const toISOString = (date, time) => {
        if (!date || !time) return null;
        return `${date}T${time}:00`;
    };

    // Transform nested objects to flat DTO structure
    const dto = {
        id: form.value.id,
        clientId: form.value.client?.id || null,
        professionalId: form.value.professional?.id || null,
        serviceId: form.value.service?.id || null,
        startTime: toISOString(form.value.date, form.value.start),
        endTime: toISOString(form.value.date, form.value.end),
        status: form.value.status,
        notes: form.value.notes,
        price: form.value.price,
        discount: form.value.discount
    };
    
    console.log('Sending appointment:', dto); // Debug log
    emit('save', dto);
};

const viewTransaction = () => {
    if (form.value.transactionId) {
        emit('close'); // Close modal first
        // Assuming we have a router instance or emit an event to navigate
        // Since this is a modal, navigating might be tricky if not using router.push
        // Let's rely on router import
    }
};
// We need router
import { useRouter } from 'vue-router';
const router = useRouter();

const navigateToTransaction = () => {
    if (form.value.transactionId) {
        emit('close');
        router.push({ path: '/financials', query: { highlight: form.value.transactionId } });
    }
};

// --- Edit Modal Logic ---
const showClientForm = ref(false);
const editingClient = ref({});

const showProfessionalForm = ref(false);
const editingProfessional = ref({});

const showServiceForm = ref(false);
const editingService = ref({});

const onEditClient = async (id) => {
    try {
        const response = await clientService.getById(id);
        editingClient.value = response.data;
        showClientForm.value = true;
    } catch (e) {
        console.error("Failed to fetch client for editing", e);
        alert("Erro ao carregar dados do cliente");
    }
};

const onClientSaved = async (updatedClientData) => {
    try {
        // We need to actually save the client changes first? 
        // Wait, the ClientForm emits 'save' with the data. 
        // ClientForm usually calls the API itself? No, looking at ClientForm, it emits 'save' with form data.
        // It does NOT call the API. The parent is responsible for saving.
        // So we must call clientService.save/update here.
        
        const isNew = !updatedClientData.id;
        let savedClient;
        
        if (isNew) {
             const res = await clientService.create(updatedClientData);
             savedClient = res.data;
        } else {
             const res = await clientService.update(updatedClientData.id, updatedClientData);
             savedClient = res.data;
        }
        
        // Update local form state
        form.value.client.name = savedClient.name;
        // If we just created a new one (unlikely path here since we edit existing), we'd update ID too.
        
        showClientForm.value = false;
    } catch (e) {
        console.error("Failed to save client", e);
        alert("Erro ao salvar cliente");
    }
};

const onEditProfessional = async (id) => {
    try {
        const response = await professionalService.getById(id);
        editingProfessional.value = response.data;
        showProfessionalForm.value = true;
    } catch (e) {
        console.error("Failed to fetch professional", e);
        alert("Erro ao carregar dados do profissional");
    }
};

const onProfessionalSaved = async (data) => {
    try {
        const isNew = !data.id;
        let saved;
        if (isNew) {
            const res = await professionalService.create(data);
            saved = res.data;
        } else {
            const res = await professionalService.update(data.id, data);
            saved = res.data;
        }
        form.value.professional.name = saved.name;
        showProfessionalForm.value = false;
    } catch (e) {
         console.error("Failed to save professional", e);
         alert("Erro ao salvar profissional");
    }
};

const onEditService = async (id) => {
    try {
        const response = await serviceService.getById(id);
        editingService.value = response.data;
        showServiceForm.value = true;
    } catch (e) {
        console.error("Failed to fetch service", e);
        alert("Erro ao carregar dados do serviço");
    }
};

const onServiceSaved = async (data) => {
    try {
        const isNew = !data.id;
        let saved;
         if (isNew) {
            const res = await serviceService.create(data);
            saved = res.data;
        } else {
            const res = await serviceService.update(data.id, data);
            saved = res.data;
        }
        
        form.value.service.name = saved.name;
        // Also update price/duration if they changed?
        if (saved.price) form.value.price = saved.price;
        if (saved.durationMinutes) {
             selectedServiceDuration.value = saved.durationMinutes; // Update duration ref for calc
             calculateEndTime(); // Recalc end time
        }
        
        showServiceForm.value = false;
    } catch (e) {
         console.error("Failed to save service", e);
         alert("Erro ao salvar serviço");
    }
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
/* Override specific to this form to avoid scrollbars */
.modal-content {
  max-width: 600px;
}

.form-row {
  display: flex;
  gap: 1rem;
}
.form-row .form-group {
    flex: 1;
    min-width: 0; /* Prevent flex items from overflowing */
}

.form-row .price-group,
.form-row .final-group {
    flex: 2;
}

.form-row .discount-group {
    flex: 1;
}

.input-group {
    display: flex;
    flex-wrap: nowrap; /* Ensure input and span stay on same line */
    width: 100%;
}
.input-group .form-control {
    width: 100%; /* Ensure input takes available space */
    min-width: 0; /* consistent shrinking */
}
.input-group-text {
    white-space: nowrap;
}
</style>
