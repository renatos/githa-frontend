<template>
  <div class="bg-white dark:bg-[#1E222B] rounded-xl p-6 shadow-lg border border-gray-200 dark:border-slate-800 flex flex-col">
    <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
      <span>⚠️</span> Produtos Estoque Baixo
    </h2>

    <div v-if="loading" class="flex-1 flex items-center justify-center py-8">
      <div class="text-center text-gray-400 dark:text-slate-500 text-sm">
        <i class="fa-solid fa-spinner fa-spin text-2xl mb-2 block"></i>
        Carregando...
      </div>
    </div>

    <div v-else-if="error" class="flex-1 flex items-center justify-center py-8">
      <button @click="fetchLowStockProducts" class="text-sm text-red-500 hover:text-red-400 transition-colors">
        <i class="fa-solid fa-rotate-right mr-1"></i> Tentar novamente
      </button>
    </div>

    <div v-else-if="products.length === 0" class="flex-1 flex items-center justify-center py-8 text-gray-400 dark:text-slate-500 italic text-sm">
      Nenhum produto com estoque crítico.
    </div>

    <div v-else class="space-y-4 text-sm flex-1">
      <div
        v-for="(product, index) in products"
        :key="product.id"
        :class="{ 'pb-3 border-b border-gray-100 dark:border-slate-700/50': index < products.length - 1 }"
      >
        <p class="text-gray-800 dark:text-white mb-1">{{ product.name }} <span class="text-gray-400 dark:text-slate-500">(Cód.: {{ product.code }})</span></p>
        <p class="text-red-600 dark:text-[#EF4444] font-bold text-xs">- ESTOQUE {{ product.stockQuantity || 0 }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../services/api';

const loading = ref(true);
const error = ref(false);
const products = ref([]);
const CRITICAL_STOCK_LEVEL = 5;

const fetchLowStockProducts = async () => {
  loading.value = true;
  error.value = false;
  try {
    const response = await api.get('/products', {
      params: { page: 0, size: 10, sort: 'stockQuantity,asc', 'stockQuantity_lte': CRITICAL_STOCK_LEVEL }
    });
    const content = response?.data?.content || response?.data || [];
    products.value = Array.isArray(content) ? content : [];
  } catch (err) {
    console.error('Failed to fetch low stock products:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLowStockProducts();
});
</script>
