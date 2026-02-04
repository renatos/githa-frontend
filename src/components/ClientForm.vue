<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ client.id ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body-tabs">
        <TabView>
            <TabPanel header="Dados Gerais">
              <form @submit.prevent="save">
                <div class="form-body">
                  <div class="form-group">
                    <label>Nome</label>
                    <input v-model="form.name" type="text" required class="form-control" />
                  </div>
                  
                  <div class="form-group">
                    <label>Email</label>
                    <input v-model="form.email" type="email" class="form-control" />
                  </div>
                  
                  <div class="form-group">
                    <label>Telefone</label>
                    <input v-model="form.phone" type="tel" class="form-control" />
                  </div>
        
                   <div class="form-group">
                    <label>Data de Nascimento</label>
                    <input v-model="form.dateOfBirth" type="date" class="form-control" />
                  </div>
                   
                   <div class="form-group">
                    <label>Endereço</label>
                    <input v-model="form.address" type="text" class="form-control" />
                  </div>
                   
                   <div class="form-group">
                    <label>Indicado Por</label>
                    <BaseLookup
                      v-model="form.referredById"
                      :initial-description="form.referredByName"
                      :search-service="clientService"
                      placeholder="Selecione o cliente que indicou"
                    />
                  </div>
                </div>
                
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" @click="$emit('close')">Cancelar</button>
                  <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
              </form>
            </TabPanel>
            
            <TabPanel header="Histórico" v-if="client.id">
                <div class="history-tab">
                    <AppointmentList :client-id="client.id" :embedded="true" />
                </div>
            </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import BaseLookup from './common/BaseLookup.vue';
import AppointmentList from './AppointmentList.vue';
import { clientService } from '../services/clientService';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  address: '',
  referredById: null,
});

onMounted(() => {
  if (props.client.id) {
    form.value = { ...props.client };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>

<style scoped>
/* Component-specific overrides and layout */
.modal-content {
  max-width: 800px;
  max-height: 90vh;
}

.modal-body-tabs {
    flex: 1;
    overflow-y: auto;
}

.history-tab {
    padding-top: var(--spacing-md);
}
</style>
