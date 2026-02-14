<template>
  <div class="user-view">
    <AlertMessage
        v-if="alert.message"
        :message="alert.message"
        :type="alert.type"
        @dismiss="alert.message = ''"
    />

    <UserList
        ref="listRef"
        @delete="deleteItem"
        @edit="openForm"
        @new="openForm()"
    />

    <UserForm
        v-if="showForm"
        :user="editingItem"
        @close="closeForm"
        @save="saveItem"
    />
  </div>
</template>

<script setup>
import UserList from '../components/UserList.vue';
import UserForm from '../components/UserForm.vue';
import AlertMessage from '../components/common/AlertMessage.vue';
import {userService} from '../services/userService';
import {useCrudView} from '../composables/useCrudView';

const {
  listRef, showForm, editingItem, alert,
  showAlert, openForm, closeForm, saveItem: baseSave, deleteItem,
} = useCrudView(userService, {singular: 'Usuário', plural: 'Usuários'});

// Override save to handle password stripping
const saveItem = async (userData) => {
  if (userData.id && !userData.password) {
    delete userData.password;
  }
  await baseSave(userData);
};
</script>
