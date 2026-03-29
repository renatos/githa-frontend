<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-semibold uppercase tracking-wider text-slate-500">Itens da Venda</h4>
      <div v-if="autoFilledMessage" class="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg animate-in fade-in slide-in-from-right-2">
        <i class="fa-solid fa-circle-check text-indigo-400 text-[10px]"></i>
        <small class="text-indigo-300 text-[10px] font-medium">{{ autoFilledMessage }}</small>
      </div>
    </div>

    <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--color-bg-body)] dark:bg-slate-900/50 overflow-visible backdrop-blur-sm">
      
      <!-- Header (Desktop Only) -->
      <div class="hidden md:grid grid-cols-[110px_1fr_80px_130px_120px_48px] gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl">
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Tipo</div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Item</div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Qtd</div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Unitário</div>
        <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Total</div>
        <div></div>
      </div>

      <div class="divide-y divide-slate-200 dark:divide-slate-700/50">
        
        <!-- Existing Items -->
        <div 
          v-for="(item, index) in items" 
          :key="item.id || index" 
          class="flex flex-col md:grid md:grid-cols-[110px_1fr_80px_130px_120px_48px] gap-4 p-4 md:items-center group/row hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
        >
          <!-- Mobile header (Tipo + Delete) -->
          <div class="flex items-center justify-between md:hidden pb-3 border-b border-slate-100 dark:border-slate-800/50">
            <div class="flex items-center gap-2">
              <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">
                <i v-if="item.type === 'PRODUCT'" class="fa-solid fa-box text-amber-500/80 text-sm"></i>
                <i v-else class="fa-solid fa-hand-sparkles text-indigo-400 text-sm"></i>
              </div>
              <span class="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                {{ item.type === 'PRODUCT' ? 'Produto' : 'Serviço' }}
              </span>
            </div>
            <button 
              v-if="canSave" 
              class="p-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-500/20 rounded-lg transition-colors"
              @click="$emit('removeItem', index)"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>

          <!-- Desktop icon (Tipo) -->
          <div class="hidden md:flex items-center justify-center">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80">
              <i v-if="item.type === 'PRODUCT'" class="fa-solid fa-box text-amber-500/80 text-lg" title="Produto"></i>
              <i v-else class="fa-solid fa-hand-sparkles text-indigo-400 text-lg" title="Serviço"></i>
            </div>
          </div>

          <!-- Item Description -->
          <div class="flex flex-col">
            <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Item</span>
            <span class="text-slate-900 dark:text-slate-200 font-bold md:font-medium text-sm">
              {{ item.type === 'PRODUCT' ? item.productName : item.serviceName }}
            </span>
            <span v-if="item.professionalName" class="text-slate-500 text-[11px] flex items-center gap-1 mt-1">
              <i class="fa-solid fa-user-tie text-[9px]"></i>
              {{ item.professionalName }}
            </span>
          </div>

          <!-- Qtd -->
          <div class="flex justify-between md:justify-center items-center">
            <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500">Qtd</span>
            <span class="text-slate-700 dark:text-slate-300 text-sm font-medium bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-800">
              {{ item.quantity }}
            </span>
          </div>

          <!-- Unit Price -->
          <div class="flex justify-between md:justify-end items-center text-right">
            <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500">Unitário</span>
            <span class="text-slate-600 dark:text-slate-400 text-sm font-medium">{{ formatCurrency(item.unitPrice) }}</span>
          </div>

          <!-- Total Price -->
          <div class="flex justify-between md:justify-end items-center text-right">
            <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</span>
            <span class="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{{ formatCurrency(item.unitPrice * item.quantity) }}</span>
          </div>

          <!-- Desktop Remove Action -->
          <div v-if="canSave" class="hidden md:flex items-center justify-center">
            <button 
              class="opacity-0 group-hover/row:opacity-100 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
              title="Remover item"
              @click="$emit('removeItem', index)"
            >
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="items.length === 0" class="p-8 text-center text-slate-500 italic text-sm">
          Nenhum item adicionado à venda
        </div>

        <!-- Add New Item Row -->
        <div v-if="canSave" class="flex flex-col md:grid md:grid-cols-[110px_1fr_80px_130px_120px_48px] gap-4 p-4 md:items-center bg-indigo-50/50 dark:bg-indigo-500/5 rounded-b-xl border-t border-indigo-100 dark:border-indigo-500/20">
          
          <!-- Mobile section header -->
          <div class="md:hidden border-b border-indigo-200/50 dark:border-indigo-500/20 pb-2 mb-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Adicionar Item</span>
          </div>

          <!-- Type Select -->
          <div>
            <span class="md:hidden block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Tipo</span>
            <div class="relative group">
              <select 
                v-model="newItem.type" 
                class="appearance-none bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg pl-3 pr-8 py-2 md:py-2.5 text-xs font-bold text-slate-700 dark:text-slate-100 focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none w-full cursor-pointer transition-colors"
                @change="$emit('typeChange', newItem.type)"
              >
                <option v-for="type in saleItemTypes" :key="type.name" :value="type.name">
                  {{ type.name === 'PRODUCT' ? '📦 Produto' : '💇 Serviço' }}
                </option>
              </select>
              <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 pointer-events-none group-hover:text-slate-400"></i>
            </div>
          </div>

          <!-- Item Search -->
          <div>
            <span class="md:hidden block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Item</span>
            <div class="flex flex-col gap-3">
              <BaseLookup
                v-if="newItem.type === 'PRODUCT'"
                v-model="newItem.productId"
                :initial-description="newItem.productName"
                :search-service="productServiceAdapter"
                placeholder="Selecione o produto..."
                hide-id
                @select="onProductSelect"
              />
              <div v-else class="flex flex-col xl:flex-row gap-3">
                <div class="flex-1 min-w-0">
                  <BaseLookup
                    v-model="newItem.serviceId"
                    :initial-description="newItem.serviceName"
                    :search-service="serviceService"
                    placeholder="Serviço..."
                    hide-id
                    @select="onServiceSelect"
                  />
                </div>
                <div v-if="newItem.serviceId" class="w-full xl:w-48 flex-shrink-0 animate-in fade-in slide-in-from-top-1">
                  <BaseLookup
                    v-model="newItem.professionalId"
                    :initial-description="newItem.professionalName"
                    :search-service="professionalService"
                    placeholder="Profissional..."
                    hide-id
                    @select="onProfessionalSelect"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Qtd Input -->
          <div>
            <span class="md:hidden block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Qtd</span>
            <input 
              v-model="newItem.quantity" 
              type="number" 
              min="1" 
              inputmode="numeric"
              class="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 md:p-2.5 text-center text-sm md:text-sm text-indigo-600 dark:text-indigo-400 font-bold focus:ring-1 focus:ring-indigo-500 outline-none transition-colors hover:border-indigo-400"
            >
          </div>

          <!-- Price Input -->
          <div>
            <span class="md:hidden block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Unitário</span>
            <CurrencyInput 
              v-model="newItem.unitPrice" 
              class="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 md:p-2.5 text-right text-sm md:text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
            />
          </div>

          <!-- Total Price -->
          <div class="flex justify-between md:block items-center">
            <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-slate-500">Total</span>
            <div class="text-emerald-600 dark:text-emerald-400 font-bold text-base md:text-sm md:text-right">
              {{ formatCurrency(newItem.unitPrice * newItem.quantity) }}
            </div>
          </div>

          <!-- Add Button -->
          <div class="mt-2 md:mt-0 flex justify-end md:justify-center">
            <button
              :disabled="!isItemValid"
              class="w-full md:w-auto p-3 md:p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-20 disabled:scale-90 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
              title="Adicionar item"
              @click="onAddItem"
            >
              <i class="fa-solid fa-plus"></i>
              <span class="md:hidden font-bold text-sm">Adicionar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseLookup from '../common/BaseLookup.vue';
import CurrencyInput from '../common/CurrencyInput.vue';

const props = defineProps({
  items: { type: Array, required: true },
  canSave: { type: Boolean, default: true },
  saleItemTypes: { type: Array, default: () => [] },
  productServiceAdapter: { type: Object, required: true },
  serviceService: { type: Object, required: true },
  professionalService: { type: Object, required: true },
  autoFilledMessage: { type: String, default: '' }
});

const emit = defineEmits(['addItem', 'removeItem', 'typeChange']);

const newItem = ref({
  type: 'PRODUCT',
  productId: null,
  productName: '',
  serviceId: null,
  serviceName: '',
  unitPrice: 0,
  professionalId: null,
  professionalName: '',
  appointmentId: null,
  quantity: 1
});

const isItemValid = computed(() => {
  if (newItem.value.type === 'PRODUCT') return !!newItem.value.productId;
  if (newItem.value.type === 'SERVICE') return !!newItem.value.serviceId && !!newItem.value.professionalId;
  return false;
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const onProductSelect = (item) => {
  if (!item) return;
  const cleanName = item.name.replace(/ \(Estoque: \d+\)$/, '');
  newItem.value.productId = item.id;
  newItem.value.productName = cleanName;
  newItem.value.unitPrice = item.price || 0;
};

const onServiceSelect = (item) => {
  if (!item) return;
  newItem.value.serviceId = item.id;
  newItem.value.serviceName = item.name;
  newItem.value.unitPrice = item.price || 0;
};

const onProfessionalSelect = (item) => {
  if (!item) return;
  newItem.value.professionalId = item.id;
  newItem.value.professionalName = item.name;
};

const onAddItem = () => {
  emit('addItem', { ...newItem.value });
  resetNewItem();
};

const resetNewItem = () => {
  newItem.value = {
    type: newItem.value.type,
    productId: null,
    productName: '',
    serviceId: null,
    serviceName: '',
    unitPrice: 0,
    professionalId: null,
    professionalName: '',
    appointmentId: null,
    quantity: 1
  };
};

const setItemData = (data) => {
    Object.assign(newItem.value, data);
};

defineExpose({ setItemData });
</script>
