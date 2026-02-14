<template>
  <div>
    <div class="mb-4">
      <h2>{{ isEditing ? 'Editar Produto' : 'Novo Produto' }}</h2>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="save">
          <div class="row">
            <div class="mb-3" style="flex: 3;">
              <div class="form-group">
                <label for="name">Nome</label>
                <input id="name" v-model="form.name" class="form-control" type="text" required>
              </div>
            </div>
            <div class="mb-3" style="flex: 1;">
              <div class="form-group">
                <label for="price">Preço</label>
                <CurrencyInput v-model="form.price" class="form-control" required/>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <div class="form-group">
              <label for="description">Descrição</label>
              <textarea id="description" v-model="form.description" class="form-control" rows="3"></textarea>
            </div>
          </div>

          <div class="row">
            <div class="mb-3" style="flex: 1;">
              <div class="form-group">
                <label for="stockQuantity">Quantidade em Estoque</label>
                <input id="stockQuantity" v-model="form.stockQuantity" class="form-control" type="number"
                       min="0">
              </div>
            </div>
            <div style="flex: 3;"></div>
          </div>

          <div class="mb-3 form-check">
            <input id="active" v-model="form.active" class="form-check-input" type="checkbox">
            <label class="form-check-label" for="active">Ativo</label>
          </div>

          <div class="d-flex justify-content-end gap-3 pt-4 mt-4" style="border-top: 1px solid var(--color-border);">
            <button class="btn btn-secondary" type="button" @click="$router.push('/products')">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import productService from '@/services/productService';
import {useEscapeKey} from '@/composables/useEscapeKey';
import CurrencyInput from './common/CurrencyInput.vue';

const route = useRoute();
const router = useRouter();

useEscapeKey(() => router.push('/products'));

const form = ref({
  name: '',
  description: '',
  price: 0,
  stockQuantity: 0,
  active: true
});

const isEditing = computed(() => !!route.params.id);

onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await productService.getById(route.params.id);
      form.value = response.data;
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/products');
    }
  }
});

const save = async () => {
  try {
    if (isEditing.value) {
      await productService.update(route.params.id, form.value);
    } else {
      await productService.create(form.value);
    }
    router.push('/products');
  } catch (error) {
    console.error('Error saving product:', error);
  }
};
</script>

<style scoped>
</style>
