<template>
  <div class="user-view">
    <AlertMessage 
      v-if="alert.message" 
      :type="alert.type" 
      :message="alert.message" 
      @dismiss="alert.message = ''"
    />

    <UserList 
      ref="userList"
      @new="openForm()"
      @edit="openForm"
      @delete="deleteUser"
    />
    
    <UserForm 
      v-if="showForm" 
      :user="editingUser"
      @close="closeForm"
      @save="saveUser"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserList from '../components/UserList.vue';
import UserForm from '../components/UserForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import { userService } from '../services/userService';

const userList = ref(null);
const showForm = ref(false);
const editingUser = ref({});
const alert = ref({ type: 'info', message: '' });

const showAlert = (type, message) => {
  alert.value = { type, message };
  setTimeout(() => alert.value.message = '', 3000);
};

const openForm = (user = {}) => {
  editingUser.value = { ...user };
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  editingUser.value = {};
};

const saveUser = async (userData) => {
  try {
    if (userData.id) {
      if (!userData.password) delete userData.password; // Don't send empty password
      await userService.update(userData.id, userData);
      showAlert('success', 'Usuário atualizado com sucesso!');
    } else {
      await userService.create(userData);
      showAlert('success', 'Usuário criado com sucesso!');
    }
    userList.value?.refresh();
    closeForm();
  } catch (error) {
    console.error('Error saving user:', error);
    showAlert('error', 'Erro ao salvar usuário.');
  }
};

const deleteUser = async (id) => {
  if (confirm('Tem certeza que deseja excluir este usuário?')) {
    try {
      await userService.delete(id);
      showAlert('success', 'Usuário excluído com sucesso!');
      userList.value?.refresh();
    } catch (error) {
      console.error('Error deleting user:', error);
      showAlert('error', 'Erro ao excluir usuário.');
    }
  }
};
</script>
