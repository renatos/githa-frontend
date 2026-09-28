<template>
  <BaseModal
    :show="true"
    title="Corrigir Celular do Cliente"
    max-width="max-w-md"
    :z-index="11000"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="flex items-center gap-3 min-w-0">
        <span class="material-symbols-outlined text-[24px] text-amber-500 shrink-0">
          phone_iphone
        </span>
        <div class="min-w-0">
          <h2 class="text-base font-bold leading-tight text-slate-900 dark:text-slate-100 truncate">
            Corrigir Celular
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {{ clientName }}
          </p>
        </div>
      </div>
    </template>

    <div class="p-6 flex flex-col gap-4">
      <div class="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
        <i class="fa-solid fa-triangle-exclamation text-amber-500 text-sm shrink-0 mt-0.5"></i>
        <div>
          O telefone cadastrado atualmente é inválido para envio no WhatsApp. Corrija o número abaixo para prosseguir com a aprovação.
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Novo Celular (com DDD)
        </label>
        <PhoneInput
          v-model="phone"
          :disabled="saving"
          autofocus
        />
        <p v-if="phone && !isValid" class="text-[11px] text-red-500 flex items-center gap-1 mt-0.5">
          <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
          Informe um DDD + celular válido (10 ou 11 dígitos)
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          :disabled="saving"
          class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="!isValid || saving"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          @click="saveAndApprove"
        >
          <i v-if="saving" class="fa-solid fa-spinner fa-spin"></i>
          <i v-else class="fa-solid fa-check"></i>
          <span>{{ saving ? 'Salvando...' : 'Salvar e Aprovar' }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import PhoneInput from '../common/PhoneInput.vue';
import { clientService } from '../../services/clientService';
import { toastBridge } from '../../services/toastBridge';
import { isValidBrazilianPhone } from '../../utils/formatters';
import { useModal } from '../../composables/useModal';

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  currentPhone: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['close', 'saved']);
useModal(emit);

const phone = ref(props.currentPhone || '');
const saving = ref(false);

const isValid = computed(() => isValidBrazilianPhone(phone.value));

const saveAndApprove = async () => {
  if (!isValid.value || saving.value) return;

  saving.value = true;
  try {
    // 1. Fetch full client details to preserve existing data
    const res = await clientService.getById(props.clientId);
    const clientData = res.data;

    // 2. Update phone
    clientData.phone = phone.value;

    // 3. Persist client update
    await clientService.update(props.clientId, clientData);

    toastBridge.success('Sucesso', 'Telefone do cliente atualizado com sucesso!');
    window.dispatchEvent(new CustomEvent('client-updated', { detail: clientData }));

    // 4. Notify parent to proceed with approval
    emit('saved', phone.value);
  } catch (error) {
    console.error('Erro ao atualizar telefone do cliente:', error);
    const msg = error.response?.data?.message || 'Erro ao salvar novo telefone do cliente.';
    toastBridge.error('Erro', msg);
  } finally {
    saving.value = false;
  }
};
</script>
