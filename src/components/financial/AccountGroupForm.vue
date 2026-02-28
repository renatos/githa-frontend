<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ accountGroup.id ? 'Editar Grupo' : 'Novo Grupo' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-body">
          <div class="form-group">
            <label for="name">Nome</label>
            <input id="name" v-model="form.name" class="form-control" type="text" required />
          </div>

          <div class="form-group">
            <label for="nature">Natureza</label>
            <select id="nature" v-model="form.nature" class="form-control" required>
              <option v-for="nature in accountNatures" :key="nature.name" :value="nature.name">
                {{ nature.description }}
              </option>
            </select>
          </div>

          <div class="form-check">
            <input id="active" v-model="form.active" class="form-check-input" type="checkbox" />
            <label class="form-check-label" for="active">Ativo</label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
          <button class="btn btn-primary" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import financialService from '../../services/financialService';
import { enumService } from '../../services/enumService';
import { useEscapeKey } from '../../composables/useEscapeKey';

export default {
  name: 'AccountGroupForm',
  emits: ['close', 'save'],
  props: {
    accountGroup: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const isEditing = ref(false);
    const accountNatures = ref([]);

    useEscapeKey(() => emit('close'));

    const form = ref({
      name: '',
      nature: 'EXPENSE',
      active: true
    });

    const init = async () => {
      try {
        accountNatures.value = await enumService.getOptions('AccountNature');
      } catch (e) {
        console.error("Failed to load account natures", e);
        alert("Erro ao carregar naturezas de conta.");
      }
      if (props.accountGroup.id) {
        isEditing.value = true;
        form.value = { ...props.accountGroup };
      }
    };

    onMounted(() => {
      init();
    });

    const save = async () => {
      try {
        if (props.accountGroup.id) {
          await financialService.updateAccountGroup(props.accountGroup.id, form.value);
        } else {
          await financialService.createAccountGroup(form.value);
        }
        emit('save');
      } catch (error) {
        console.error('Error saving account group:', error);
        alert('Erro ao salvar grupo.');
      }
    };

    return {
      form,
      isEditing,
      accountNatures,
      save,
      emit
    };
  }
};
</script>
