<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ appointment.id ? 'Editar Agendamento' : 'Novo Agendamento' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label>Cliente</label>
            <BaseLookup
                v-model="form.client.id"
                :initial-description="form.client.name"
                :search-service="clientService"
                placeholder="Pesquisar Cliente..."
                @select="(item) => form.client.name = item?.name"
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
            />
          </div>

          <div class="form-row">
            <div class="form-group price-group">
                <label>Preço (R$)</label>
                <div class="input-group">
                  <input v-model="form.price" type="number" step="0.01" class="form-control" placeholder="0.00" />
                </div>
            </div>
            <div class="form-group discount-group">
                <label>Desconto (%)</label>
                <div class="input-group">
                  <input v-model="form.discount" type="number" step="0.01" class="form-control" placeholder="0" />
                </div>
            </div>
             <div class="form-group final-group">
                <label>Valor Final (R$)</label>
                <div class="input-group">
                   <input :value="finalPrice" type="text" disabled class="form-control" />
                </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
                <label>Data</label>
                <input v-model="form.date" type="date" required class="form-control" />
            </div>
            <div class="form-group">
                <label>Início</label>
                <input v-model="form.start" type="time" required class="form-control" />
            </div>
            <div class="form-group">
                <label>Fim</label>
                <input v-model="form.end" type="time" required class="form-control" @focus="calculateEndTime" />
            </div>
          </div>
          
           <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" required class="form-control">
                <option value="SCHEDULED">Agendado</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="CANCELED">Cancelado</option>
                <option value="COMPLETED">Concluído</option>
                <option value="MISSED">Faltou</option>
            </select>
          </div>

           <div class="form-group">
            <label>Notas</label>
            <textarea v-model="form.notes" class="form-control" rows="2"></textarea>
          </div>

        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, watch } from 'vue';
import { appointmentService } from '../services/appointmentService';
import { clientService } from '../services/clientService';
import { professionalService } from '../services/professionalService';
import { serviceService } from '../services/serviceService';
import BaseLookup from './common/BaseLookup.vue';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';

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
  discount: 0
});

const finalPrice = computed(() => {
    const p = parseFloat(form.value.price) || 0;
    const d = parseFloat(form.value.discount) || 0;
    return (p - (p * d / 100)).toFixed(2);
});

onMounted(() => {
  if (props.appointment.id) {
    const apt = { ...props.appointment };
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
    
    // Ensure nested objects are set if apt has flat IDs but no objects (though logic above handles it)
    if (!form.value.client.id && apt.clientId) form.value.client.id = apt.clientId;
  }
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
        // ... existing logic ...
        
        // Fetch service duration for existing appointment if needed, 
        // OR rely on user re-selecting if they want auto-calc.
        // For now, let's try to fetch if we have ID but no duration.
        // But BaseLookup doesn't expose the item directly unless fetched.
        // If we want this to work on edit load, we might need to fetch service details.
        // However, usually "edit" keeps existing times unless changed.
        // Let's just focus on "change" events for now as per requirement "o campo deve ficar aberto".
        // If user changes start time on Edit, it will only auto-calc if we have duration.
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
