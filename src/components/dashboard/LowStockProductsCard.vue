<template>
  <DashboardCard
    title="Estoque Baixo"
    icon="⚠️"
    :loading="loading"
    :error="error"
    @retry="fetchLowStockProducts"
  >
    <div v-if="products.length === 0 && !loading && !error" class="empty-state">
      <p>Nenhum produto com estoque crítico.</p>
    </div>

    <div v-else class="products-list">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-item"
      >
        <div class="product-details">
          <p class="product-name">{{ product.name }}</p>
          <p class="product-code">Cód: {{ product.code }}</p>
        </div>
        <div class="stock-block" :class="getStockClass(product)">
          <span class="stock-label">Estoque</span>
          <span class="stock-value">{{ product.stockQuantity || 0 }}</span>
        </div>
      </div>
    </div>

    <template #actions>
      <router-link to="/products" class="btn-icon" title="Gerenciar Produtos">
        <i class="pi pi-arrow-right"></i>
      </router-link>
    </template>
  </DashboardCard>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DashboardCard from './DashboardCard.vue';
import api from '../../services/api';

const loading = ref(true);
const error = ref(false);
const products = ref([]);

// We consider 5 or less as critical stock for the dashboard display
const CRITICAL_STOCK_LEVEL = 5;

const getStockClass = (product) => {
  const stock = product.stockQuantity || 0;
  if (stock <= 0) return 'stock-out';
  if (stock <= CRITICAL_STOCK_LEVEL) return 'stock-critical';
  return 'stock-warning';
};

const fetchLowStockProducts = async () => {
  loading.value = true;
  error.value = false;
  
  try {
    const response = await api.get('/products', {
      params: {
        page: 0,
        size: 10,
        sort: 'stockQuantity,asc',
        'stockQuantity_lte': CRITICAL_STOCK_LEVEL
      }
    });
    
    // Support correct pagination structure from our recent backend refactoring
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

<style scoped>
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: var(--color-text-muted);
  font-style: italic;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  overflow-y: auto;
  max-height: 350px;
  padding-right: var(--spacing-sm);
}

.products-list::-webkit-scrollbar {
  width: 4px;
}

.products-list::-webkit-scrollbar-track {
  background: transparent;
}

.products-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-bg-body);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-left: 3px solid transparent;
  transition: transform 0.2s;
}

.product-item:hover {
  transform: translateX(4px);
  background-color: var(--color-primary-soft);
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex-grow: 1;
}

.product-name {
  margin: 0;
  font-weight: 600;
  color: var(--color-text-main);
  font-size: 0.95rem;
}

.product-code {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-family: monospace;
}

.stock-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
}

.stock-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.stock-value {
  font-weight: 800;
  font-size: 1.2rem;
}

/* Stock Status Colors */
.stock-out {
  border-color: #dc2626; /* Red 600 */
}
.stock-out .stock-value { color: #dc2626; }
.stock-out .stock-label { color: #f87171; }

.stock-critical {
  border-color: #f59e0b; /* Amber 500 */
}
.stock-critical .stock-value { color: #d97706; }
.stock-critical .stock-label { color: #fbbf24; }

.stock-warning {
  border-color: #facc15; /* Yellow 400 */
}
.stock-warning .stock-value { color: #eab308; }
.stock-warning .stock-label { color: #fde047; }

.btn-icon {
  text-decoration: none;
  color: var(--color-text-muted);
}

.btn-icon:hover {
  color: var(--color-primary);
}
</style>
