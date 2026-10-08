<template>
  <BaseModal
    :show="show"
    title="Aplicar Desconto"
    subtitle="Venda de Produtos e Serviços"
    icon="fa-solid fa-tag"
    max-width="max-w-2xl"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <!-- Mode Tabs: Total vs Item -->
      <div class="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
          :class="discountMode === 'TOTAL'
            ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="discountMode = 'TOTAL'"
        >
          <i class="fa-solid fa-receipt"></i>
          Desconto no Total
        </button>
        <button
          type="button"
          class="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200"
          :class="discountMode === 'ITEM'
            ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          @click="discountMode = 'ITEM'"
        >
          <i class="fa-solid fa-list-check"></i>
          Desconto por Item
        </button>
      </div>

      <!-- MODE 1: Desconto no Total -->
      <div v-if="discountMode === 'TOTAL'" class="space-y-4">
        <div class="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-4">
          <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Valor do Desconto Geral
          </label>

          <div class="flex items-center gap-3">
            <!-- Toggle R$ vs % -->
            <div class="flex bg-slate-200 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                :class="totalDiscountType === 'CURRENCY'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                @click="setTotalDiscountType('CURRENCY')"
              >
                R$
              </button>
              <button
                type="button"
                class="px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                :class="totalDiscountType === 'PERCENTAGE'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                @click="setTotalDiscountType('PERCENTAGE')"
              >
                %
              </button>
            </div>

            <!-- Input Value -->
            <div class="flex-1">
              <CurrencyInput
                v-if="totalDiscountType === 'CURRENCY'"
                v-model="totalCurrencyValue"
                placeholder="0,00"
                class="h-11 font-black text-slate-900 dark:text-slate-100"
              />
              <div v-else class="relative">
                <input
                  v-model.number="totalPercentageValue"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  class="form-input flex w-full h-11 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-right font-black outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pointer-events-none">%</span>
              </div>
            </div>
          </div>

          <!-- Conversion indicator -->
          <div v-if="computedTotalDiscountAmount > 0" class="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
            <span>Equivalente:</span>
            <span class="font-semibold text-indigo-600 dark:text-indigo-400">
              {{ totalDiscountType === 'CURRENCY' 
                ? `${computedTotalDiscountPercentage.toFixed(2)}% de desconto`
                : `${formatCurrency(computedTotalDiscountAmount)} de abatimento` 
              }}
            </span>
          </div>
        </div>

        <p class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <i class="fa-solid fa-circle-info text-indigo-500 text-xs"></i>
          O desconto total será rateado proporcionalmente entre os itens para apuração das comissões.
        </p>
      </div>

      <!-- MODE 2: Desconto por Item -->
      <div v-else class="space-y-3">
        <div class="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div
            v-for="(item, idx) in itemRows"
            :key="item.id || idx"
            class="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <i
                  class="fa-solid text-xs"
                  :class="item.type === 'PRODUCT' ? 'fa-box text-amber-500' : 'fa-hand-sparkles text-indigo-400'"
                ></i>
                <span class="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                  {{ item.type === 'PRODUCT' ? item.productName : item.serviceName }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ item.quantity }}x {{ formatCurrency(item.unitPrice) }} = 
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ formatCurrency(item.subtotal) }}</span>
              </div>
            </div>

            <!-- Discount Input for this item -->
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex bg-slate-200 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  class="px-2 py-1 rounded text-[10px] font-bold"
                  :class="item.discountType === 'CURRENCY'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'"
                  @click="setItemDiscountType(idx, 'CURRENCY')"
                >
                  R$
                </button>
                <button
                  type="button"
                  class="px-2 py-1 rounded text-[10px] font-bold"
                  :class="item.discountType === 'PERCENTAGE'
                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'"
                  @click="setItemDiscountType(idx, 'PERCENTAGE')"
                >
                  %
                </button>
              </div>

              <div class="w-28">
                <CurrencyInput
                  v-if="item.discountType === 'CURRENCY'"
                  v-model="item.currencyValue"
                  placeholder="0,00"
                  class="h-9 text-xs text-right font-bold"
                />
                <input
                  v-else
                  v-model.number="item.percentageValue"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  class="form-input flex w-full h-9 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-2 py-1 text-right text-xs font-bold outline-none focus:border-indigo-600"
                />
              </div>

              <!-- Item Net Preview -->
              <div class="text-right w-20">
                <span class="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Líquido</span>
                <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(getItemNetAmount(item)) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUMMARY CARD -->
      <div class="bg-indigo-50/50 dark:bg-slate-900/60 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 space-y-2">
        <div class="flex justify-between items-center text-xs">
          <span class="text-slate-600 dark:text-slate-400">Subtotal Original</span>
          <span class="font-semibold text-slate-800 dark:text-slate-200">{{ formatCurrency(grossTotal) }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-slate-600 dark:text-slate-400">Desconto Concedido</span>
          <span class="font-bold text-rose-600 dark:text-rose-400">
            - {{ formatCurrency(computedTotalDiscountAmount) }} 
            <span v-if="computedTotalDiscountPercentage > 0" class="text-[10px] text-slate-500">
              ({{ computedTotalDiscountPercentage.toFixed(2) }}%)
            </span>
          </span>
        </div>
        <div class="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
          <span class="text-xs uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">Total Líquido da Venda</span>
          <span class="text-lg font-black text-emerald-600 dark:text-emerald-400">
            {{ formatCurrency(computedFinalAmount) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="flex items-center justify-between w-full">
        <div>
          <button
            v-if="hasAnyDiscountApplied"
            type="button"
            class="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:underline flex items-center gap-1.5 px-2 py-1 rounded"
            @click="clearDiscount"
          >
            <i class="fa-solid fa-trash-can text-[10px]"></i>
            Remover Desconto
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-xs transition-colors"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs transition-colors shadow-sm"
            @click="apply"
          >
            Aplicar Desconto
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import CurrencyInput from '../common/CurrencyInput.vue';
import { formatCurrency } from '@/utils/formatters';
import { Money } from '@/utils/Money';

const props = defineProps({
  show: { type: Boolean, default: true },
  items: { type: Array, default: () => [] },
  currentDiscount: { type: Object, default: () => null },
  zIndex: { type: Number, default: 10050 }
});

const emit = defineEmits(['close', 'apply', 'remove']);

const discountMode = ref('TOTAL'); // 'TOTAL' | 'ITEM'
const totalDiscountType = ref('CURRENCY'); // 'CURRENCY' | 'PERCENTAGE'
const totalCurrencyValue = ref(0);
const totalPercentageValue = ref(0);

const itemRows = ref([]);

// Initialize state
const initData = () => {
  itemRows.value = props.items.map(it => {
    const unitPrice = Money.of(it.unitPrice);
    const subtotal = unitPrice.times(it.quantity || 1);
    const initialDiscount = Money.of(it.discountAmount);
    const initialPct = subtotal.calculateDiscountPercentage(initialDiscount);

    return {
      id: it.id,
      type: it.type,
      productName: it.productName,
      serviceName: it.serviceName,
      quantity: it.quantity || 1,
      unitPrice: unitPrice.toNumber(),
      subtotal: subtotal.toNumber(),
      discountType: it.discountType || 'CURRENCY',
      currencyValue: initialDiscount.toNumber(),
      percentageValue: initialPct
    };
  });

  if (props.currentDiscount) {
    discountMode.value = props.currentDiscount.mode || 'TOTAL';
    if (props.currentDiscount.mode === 'TOTAL') {
      totalDiscountType.value = props.currentDiscount.type || 'CURRENCY';
      if (totalDiscountType.value === 'CURRENCY') {
        totalCurrencyValue.value = props.currentDiscount.value !== undefined ? props.currentDiscount.value : (props.currentDiscount.totalDiscountAmount || 0);
      } else {
        totalPercentageValue.value = props.currentDiscount.value !== undefined ? props.currentDiscount.value : (props.currentDiscount.totalDiscountPercentage || 0);
      }
    } else if (props.currentDiscount.mode === 'ITEM' && props.currentDiscount.itemsWithDiscount) {
      props.currentDiscount.itemsWithDiscount.forEach(discItem => {
        const row = itemRows.value.find(r => r.id === discItem.id);
        if (row) {
          row.discountType = discItem.discountType || 'CURRENCY';
          row.currencyValue = discItem.currencyValue !== undefined ? discItem.currencyValue : (discItem.discountAmount || 0);
          row.percentageValue = discItem.percentageValue !== undefined ? discItem.percentageValue : (discItem.discountPercentage || 0);
        }
      });
    }
  } else {
    // If some items already have discountAmount set, default to ITEM mode
    const hasItemDiscount = props.items.some(i => i.discountAmount && Money.of(i.discountAmount).isPositive());
    if (hasItemDiscount) {
      discountMode.value = 'ITEM';
    } else {
      discountMode.value = 'TOTAL';
      totalCurrencyValue.value = 0;
      totalPercentageValue.value = 0;
    }
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) initData();
}, { immediate: true });

const grossTotal = computed(() => {
  return itemRows.value.reduce((acc, it) => acc.plus(it.subtotal), Money.zero()).toNumber();
});

const setTotalDiscountType = (type) => {
  if (totalDiscountType.value === type) return;
  const currentGross = Money.of(grossTotal.value);
  if (type === 'PERCENTAGE') {
    if (currentGross.isPositive() && totalCurrencyValue.value > 0) {
      totalPercentageValue.value = currentGross.calculateDiscountPercentage(totalCurrencyValue.value);
    } else {
      totalPercentageValue.value = 0;
    }
  } else {
    if (currentGross.isPositive() && totalPercentageValue.value > 0) {
      totalCurrencyValue.value = currentGross.discountAmount(totalPercentageValue.value).toNumber();
    } else {
      totalCurrencyValue.value = 0;
    }
  }
  totalDiscountType.value = type;
};

const setItemDiscountType = (idx, type) => {
  const item = itemRows.value[idx];
  if (!item || item.discountType === type) return;
  const subtotal = Money.of(item.subtotal);
  if (type === 'PERCENTAGE') {
    if (subtotal.isPositive() && item.currencyValue > 0) {
      item.percentageValue = subtotal.calculateDiscountPercentage(item.currencyValue);
    } else {
      item.percentageValue = 0;
    }
  } else {
    if (subtotal.isPositive() && item.percentageValue > 0) {
      item.currencyValue = subtotal.discountAmount(item.percentageValue).toNumber();
    } else {
      item.currencyValue = 0;
    }
  }
  item.discountType = type;
};

const getItemDiscountAmount = (item) => {
  const subtotal = Money.of(item.subtotal);
  if (item.discountType === 'CURRENCY') {
    const disc = Money.of(item.currencyValue);
    return (subtotal.isGreaterThan(disc) ? disc : subtotal).toNumber();
  }
  return subtotal.discountAmount(item.percentageValue).toNumber();
};

const getItemNetAmount = (item) => {
  const subtotal = Money.of(item.subtotal);
  if (item.discountType === 'CURRENCY') {
    return subtotal.applyDiscount(Money.of(item.currencyValue)).toNumber();
  }
  return subtotal.applyDiscount(item.percentageValue).toNumber();
};

const computedTotalDiscountAmount = computed(() => {
  const gross = Money.of(grossTotal.value);
  if (discountMode.value === 'TOTAL') {
    if (totalDiscountType.value === 'CURRENCY') {
      const disc = Money.of(totalCurrencyValue.value);
      return (gross.isGreaterThan(disc) ? disc : gross).toNumber();
    }
    return gross.discountAmount(totalPercentageValue.value).toNumber();
  }
  // Mode ITEM
  return itemRows.value.reduce((acc, it) => acc.plus(getItemDiscountAmount(it)), Money.zero()).toNumber();
});

const computedTotalDiscountPercentage = computed(() => {
  const gross = Money.of(grossTotal.value);
  const discount = Money.of(computedTotalDiscountAmount.value);
  return gross.calculateDiscountPercentage(discount);
});

const computedFinalAmount = computed(() => {
  const gross = Money.of(grossTotal.value);
  const discount = Money.of(computedTotalDiscountAmount.value);
  return gross.applyDiscount(discount).toNumber();
});

const hasAnyDiscountApplied = computed(() => {
  return computedTotalDiscountAmount.value > 0;
});

const clearDiscount = () => {
  totalCurrencyValue.value = 0;
  totalPercentageValue.value = 0;
  itemRows.value.forEach(it => {
    it.currencyValue = 0;
    it.percentageValue = 0;
  });
  emit('remove');
  emit('close');
};

const apply = () => {
  const totalAmount = computedTotalDiscountAmount.value;
  const totalPct = computedTotalDiscountPercentage.value;
  const gross = Money.of(grossTotal.value);

  // Build items with their individual discounts
  const itemsWithDiscount = itemRows.value.map(it => {
    let itemDiscount = Money.zero();
    if (discountMode.value === 'ITEM') {
      itemDiscount = Money.of(getItemDiscountAmount(it));
    } else {
      // Pro-rata based on subtotal proportion
      if (gross.isPositive() && totalAmount > 0) {
        const ratio = it.subtotal / gross.toNumber();
        itemDiscount = Money.of(totalAmount).times(ratio);
      }
    }
    const itemSubtotal = Money.of(it.subtotal);
    const net = itemSubtotal.applyDiscount(itemDiscount);
    return {
      ...it,
      discountAmount: itemDiscount.toNumber(),
      netAmount: net.toNumber()
    };
  });

  emit('apply', {
    mode: discountMode.value,
    type: totalDiscountType.value,
    value: totalDiscountType.value === 'CURRENCY' ? totalCurrencyValue.value : totalPercentageValue.value,
    totalDiscountAmount: totalAmount,
    totalDiscountPercentage: totalPct,
    itemsWithDiscount,
    finalAmount: computedFinalAmount.value
  });
  emit('close');
};
</script>
