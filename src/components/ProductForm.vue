<template>
  <BaseModal
    :show="true"
    :title="product.id ? 'Editar Produto' : 'Novo Produto'"
    icon="fa-solid fa-box"
    @close="$emit('close')"
  >
    <form @submit.prevent="save" id="productForm" class="flex flex-col gap-6">
      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Nome</p>
        <input v-model="form.name" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" required type="text" />
      </label>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Preço de Venda</p>
          <div class="h-11 flex w-full">
            <CurrencyInput v-model="form.price" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 text-base transition-colors" required />
          </div>
        </label>
        <label class="flex flex-col">
          <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Estoque Inicial</p>
          <input v-model="form.stockQuantity" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors" min="0" required type="number" />
        </label>
      </div>

      <label class="flex flex-col">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Descrição</p>
        <textarea v-model="form.description" class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 p-4 text-base transition-colors" rows="3"></textarea>
      </label>

      <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
           :class="form.active ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
        <p class="text-slate-900 dark:text-slate-100 text-sm font-medium">Ativo</p>
        <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
          <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
          <input class="invisible absolute" type="checkbox" v-model="form.active" />
        </label>
      </div>

      <button type="submit" class="hidden"></button>
    </form>

    <template #footer>
      <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
        Cancelar
      </button>
      <button form="productForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
        Salvar
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import productService from '../services/productService';
import BaseModal from './common/BaseModal.vue';
import CurrencyInput from './common/CurrencyInput.vue';

const props = defineProps({
  product: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'save']);

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
