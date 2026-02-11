<template>
  <div class="service-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <ServiceList 
      ref="listRef"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteItem"
    />
    
    <ServiceForm 
      v-if="showForm" 
      :service="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import ServiceList from '../components/ServiceList.vue';
import ServiceForm from '../components/ServiceForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { serviceService } from '../services/serviceService';
import { useCrudView } from '../composables/useCrudView';

const {
  listRef, showForm, editingItem, alert,
  openForm, closeForm, saveItem, deleteItem,
} = useCrudView(serviceService, { singular: 'Procedimento', plural: 'Procedimentos' });
</script>
