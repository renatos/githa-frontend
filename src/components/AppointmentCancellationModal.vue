<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Cancelar Agendamento</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-control" required>
              <option v-for="status in cancellationStatuses" :key="status.name" :value="status.name">
                {{ status.description }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Notas (Obrigatório)</label>
            <textarea v-model="form.notes" class="form-control" placeholder="Motivo do cancelamento..." required
                      rows="4"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
          <button class="btn btn-danger" type="submit">Confirmar Cancelamento</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted} from 'vue';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';
import {confirmBridge} from '../services/confirmBridge';
import {enumService} from '../services/enumService';

const props = defineProps({
  appointment: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const form = ref({
  status: 'CANCELED',
  notes: ''
});

const cancellationStatuses = ref([]);

onMounted(async () => {
  if (props.appointment) {
    // Initialize with existing notes if any, generally empty for new cancellation
    if (props.appointment.notes) {
      form.value.notes = props.appointment.notes + '\n\nMotivo do cancelamento: ';
    }
  }

  try {
    const statuses = await enumService.getOptions('AppointmentStatus');
    cancellationStatuses.value = statuses.filter(s => s.name === 'CANCELED' || s.name === 'MISSED');
  } catch (error) {
    console.error('Failed to load cancellation statuses', error);
  }
});

const save = () => {
  if (!form.value.notes || form.value.notes.trim() === '') {
    confirmBridge.alert({
      title: 'Informação Necessária',
      message: 'O preenchimento do motivo do cancelamento no campo Notas é obrigatório.',
      type: 'warning'
    });
    return;
  }

  emit('save', {
    id: props.appointment.id,
    status: form.value.status,
    notes: form.value.notes
  });
};
</script>

<style scoped>
.modal-content {
  max-width: 500px;
}
</style>
