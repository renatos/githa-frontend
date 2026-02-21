<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ product.id ? 'Editar Produto' : 'Novo Produto' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <form @submit.prevent="save">
        <div class="form-body">
          <div class="row">
            <div class="form-group" style="flex: 3;">
              <label for="name">Nome</label>
              <input id="name" v-model="form.name" class="form-control" type="text" required />
            </div>
            <div class="form-group" style="flex: 1;">
              <label for="price">Preço</label>
              <CurrencyInput v-model="form.price" class="form-control" required />
            </div>
          </div>

          <div class="form-group">
            <label for="description">Descrição</label>
            <textarea id="description" v-model="form.description" class="form-control" rows="3"></textarea>
          </div>

          <div class="row">
            <div class="form-group" style="flex: 1;">
              <label for="stockQuantity">Quantidade em Estoque</label>
              <input id="stockQuantity" v-model="form.stockQuantity" class="form-control" type="number" min="0" inputmode="numeric" />
            </div>
            <div style="flex: 3;"></div>
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

<script setup>
import { ref, onMounted } from 'vue';
import productService from '@/services/productService';
import { useEscapeKey } from '@/composables/useEscapeKey';
import CurrencyInput from './common/CurrencyInput.vue';

const props = defineProps({
  product: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

useEscapeKey(() => emit('close'));

const form = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  active: true
});

onMounted(() => {
  if (props.product.id) {
    form.value = { ...props.product };
  }
});

const save = async () => {
  try {
    if (props.product.id) {
      await productService.update(props.product.id, form.value);
    } else {
      await productService.create(form.value);
    }
    emit('save');
  } catch (error) {
    console.error('Error saving product:', error);
  }
};
</script>
