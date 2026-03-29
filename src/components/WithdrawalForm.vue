<template>
  <BaseModal
    :show="true"
    title="Sacar Comissão"
    :subtitle="professionalName"
    max-width="max-w-md"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="flex items-center gap-3 min-w-0">
        <div class="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-xl shrink-0">
          <span class="material-symbols-outlined text-rose-600 dark:text-rose-400">payments</span>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
            Sacar Comissão
          </h2>
          <p class="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5 truncate">
            {{ professionalName }}
          </p>
        </div>
      </div>
    </template>

    <!-- Body -->
    <div class="space-y-5">
      <!-- Saldo disponível -->
      <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
        <div>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Saldo Líquido Disponível
          </p>
          <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {{ formatCurrency(netAmount) }}
          </p>
        </div>
        <span class="material-symbols-outlined text-3xl text-emerald-500/40">savings</span>
      </div>

      <!-- Input de valor -->
      <div class="space-y-1.5">
        <label for="withdrawal-amount" class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          Valor do Saque <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">R$</span>
          <input
            id="withdrawal-amount"
            v-model="amount"
            type="number"
            step="0.01"
            min="1"
            :max="netAmount"
            placeholder="0,00"
            class="w-full pl-9 pr-4 py-3 rounded-xl border text-slate-800 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all text-base font-medium"
            :class="amountError ? 'border-rose-400 dark:border-rose-500' : 'border-slate-300 dark:border-slate-600'"
            @input="validate"
          />
        </div>
        <p v-if="amountError" class="text-xs text-rose-500 flex items-center gap-1 mt-1">
          <span class="material-symbols-outlined text-xs">error</span>
          {{ amountError }}
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500">
          Informe um valor entre {{ formatCurrency(1) }} e {{ formatCurrency(netAmount) }}
        </p>
      </div>

      <!-- Atalho: saldo total -->
      <div class="flex flex-col gap-4">
        <button
          type="button"
          class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1 w-fit"
          @click="useTotal"
        >
          <span class="material-symbols-outlined text-xs">auto_fix_high</span>
          Usar saldo total ({{ formatCurrency(netAmount) }})
        </button>

        <!-- Aviso de processamento -->
        <div class="flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm mt-0.5">info</span>
          <p class="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300 font-medium">
            O valor sacado aparecerá em instantes na lista de <span class="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-tighter">Retiradas Realizadas</span>. 
            Aguarde alguns segundos e a tela será atualizada automaticamente.
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <button
        type="button"
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        type="button"
        :disabled="saving || !!amountError || !amount"
        class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        @click="confirm"
      >
        <i v-if="saving" class="fa-solid fa-circle-notch fa-spin"></i>
        <i v-else class="fa-solid fa-check"></i>
        {{ saving ? 'Processando...' : 'Confirmar Saque' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import BaseModal from './common/BaseModal.vue';
import { professionalService } from '../services/professionalService';
import { toastBridge } from '../services/toastBridge';

const props = defineProps({
  professionalId: { type: [String, Number], required: true },
  professionalName: { type: String, required: true },
  netAmount: { type: Number, required: true },
  withdrawalAccountGroupId: { type: Number, required: true },
  referenceMonth: { type: Number, required: true },
  referenceYear: { type: Number, required: true },
});

const emit = defineEmits(['close', 'saved']);

const amount = ref(null);
const amountError = ref('');
const saving = ref(false);

onMounted(() => {
  amount.value = Number(props.netAmount);
});

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const validate = () => {
  const val = Number(amount.value);
  const max = Number(props.netAmount);
  if (!val || val <= 0) {
    amountError.value = 'Informe um valor maior que zero.';
  } else if (val < 1) {
    amountError.value = 'O valor mínimo de saque é R$ 1,00.';
  } else if (val > max) {
    amountError.value = `O valor máximo é ${formatCurrency(max)}.`;
  } else {
    amountError.value = '';
  }
};

const useTotal = () => {
  amount.value = Number(props.netAmount);
  validate();
};

const confirm = async () => {
  validate();
  if (amountError.value) return;

  saving.value = true;
  try {
    await professionalService.withdrawCommission(props.professionalId, {
      amount: Number(amount.value),
      referenceMonth: props.referenceMonth,
      referenceYear: props.referenceYear,
      notes: `Saque de comissão - ${props.professionalName}`,
    });

    toastBridge.getToast()?.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Saque registrado com sucesso!',
      life: 3000,
    });

    emit('saved');
  } catch (error) {
    console.error('Erro ao registrar saque:', error);
    toastBridge.getToast()?.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Não foi possível registrar o saque.',
      life: 4000,
    });
  } finally {
    saving.value = false;
  }
};
</script>
