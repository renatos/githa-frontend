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
                  <input v-model="form.name" class="form-control" required type="text"/>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input v-model="form.email" class="form-control" type="email"/>
                </div>

                <div class="form-group">
                  <label>Telefone</label>
                  <input v-model="form.phone" class="form-control" maxlength="15" placeholder="(DD) 99999-9999"
                         type="tel" @input="onPhoneInput"/>
                </div>

                <div class="form-group">
                  <label>Data de Nascimento</label>
                  <input v-model="form.birthday" class="form-control" type="date"/>
                </div>

                <div class="form-group">
                  <label>Endereço</label>
                  <input v-model="form.address" class="form-control" type="text"/>
                </div>

                <div class="form-group">
                  <label>Observações</label>
                  <input v-model="form.notes" class="form-control" type="text"/>
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
                <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
                <button class="btn btn-primary" type="submit">Salvar</button>
              </div>
            </form>
          </TabPanel>

          <TabPanel v-if="client.id" header="Histórico">
            <div class="history-tab">
              <SaleList :client-id="client.id" :embedded="true"/>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted} from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import BaseLookup from './common/BaseLookup.vue';
import SaleList from './SaleList.vue';
import {clientService} from '../services/clientService';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';
import {formatPhone} from '../utils/formatters';

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
  birthday: '',
  address: '',
  notes: '',
  referredById: null,
});

onMounted(() => {
  if (props.client.id) {
    form.value = {...props.client};
  }
});

const save = () => {
  emit('save', form.value);
};

const onPhoneInput = (event) => {
  const formatted = formatPhone(event.target.value);
  form.value.phone = formatted;
  // Force update in case v-model hasn't caught up because value didn't change enough?
  // Actually v-model should handle it if we update form.value.phone,
  // but sometimes input cursor jumps.
  // For direct input control:
  event.target.value = formatted;
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
