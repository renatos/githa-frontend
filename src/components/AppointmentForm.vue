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
                @select="(item) => form.service.name = item?.name"
            />
          </div>

          <div class="form-group">
            <label>Data/Hora Início</label>
            <input v-model="form.startTime" type="datetime-local" required class="form-control" />
          </div>

           <div class="form-group">
            <label>Data/Hora Fim</label>
            <input v-model="form.endTime" type="datetime-local" required class="form-control" />
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

const form = ref({
  client: { id: '', name: '' },
  professional: { id: '', name: '' },
  service: { id: '', name: '' },
  startTime: '',
  endTime: '',
  status: 'SCHEDULED',
  notes: ''
});

onMounted(() => {
  if (props.appointment.id) {
    const apt = { ...props.appointment };
    if (apt.startTime) apt.startTime = apt.startTime.slice(0, 16);
    if (apt.endTime) apt.endTime = apt.endTime.slice(0, 16);
    
    if (!apt.client) apt.client = { id: '', name: '' };
    else if (!apt.client.name) apt.client.name = ''; // handle missing name if lazy (but backend usually eager fetches full obj in DTO)

    if (!apt.professional) apt.professional = { id: '', name: '' };
    if (!apt.service) apt.service = { id: '', name: '' };
    
    form.value = apt;
  }
});

const save = () => {
    // Helper to convert datetime-local string to ISO 8601 with timezone
    const toISOString = (datetimeLocal) => {
        if (!datetimeLocal) return null;
        // datetime-local format: "2026-01-20T10:55"
        // Backend expects: "2026-01-20T10:55:00" (LocalDateTime)
        return datetimeLocal + ':00'; // Add seconds
    };

    // Transform nested objects to flat DTO structure
    const dto = {
        id: form.value.id,
        clientId: form.value.client?.id || null,
        professionalId: form.value.professional?.id || null,
        serviceId: form.value.service?.id || null,
        startTime: toISOString(form.value.startTime),
        endTime: toISOString(form.value.endTime),
        status: form.value.status,
        notes: form.value.notes
    };
    
    console.log('Sending appointment:', dto); // Debug log
    emit('save', dto);
};
</script>

<style scoped>
/* Global modal and form styles are imported in main.js */
</style>
