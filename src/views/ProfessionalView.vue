<template>
  <div class="professional-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <ProfessionalList 
      ref="listRef"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteItem"
    />
    
    <ProfessionalForm 
      v-if="showForm" 
      :professional="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import ProfessionalList from '../components/ProfessionalList.vue';
import ProfessionalForm from '../components/ProfessionalForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { professionalService } from '../services/professionalService';
import { useCrudView } from '../composables/useCrudView';

const {
  listRef, showForm, editingItem, alert,
  openForm, closeForm, saveItem, deleteItem,
} = useCrudView(professionalService, { singular: 'Profissional', plural: 'Profissionais' });
</script>
