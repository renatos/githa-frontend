<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Name with autocomplete -->
    <label class="flex flex-col autocomplete-container md:col-span-2">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Nome</p>
      <input
        v-model="form.name"
        class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        required
        type="text"
        autocomplete="off"
        @input="$emit('name-input')"
        @focus="$emit('focus-name')"
        @blur="$emit('blur-name')"
      />

      <!-- Dropdown Results -->
      <div v-if="showSearchResults && searchResults.length > 0" class="lookup-results">
        <div
          v-for="item in searchResults"
          :key="item.id"
          class="lookup-item"
          @mousedown.prevent="$emit('select-client', item)"
        >
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.phone" class="item-phone">{{ formatPhone(item.phone) }}</span>
        </div>
      </div>
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Email</p>
      <input
        v-model="form.email"
        class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        type="email"
        inputmode="email"
      />
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Telefone</p>
      <div class="flex gap-2">
        <PhoneInput v-model="form.phone" class="flex-1" />
        <BaseWhatsAppButton
          v-if="form.phone && form.id"
          size="sm"
          variant="primary"
          :href="getWhatsappLink(form.phone)"
          title="Abrir no WhatsApp"
        />
      </div>
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Data de Nascimento</p>
      <input
        v-model="form.birthday"
        class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        type="date"
        :max="maxDate"
      />
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Observações</p>
      <input
        v-model="form.notes"
        class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors"
        type="text"
      />
    </label>

    <label class="flex flex-col">
      <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Indicado Por</p>
      <div class="h-12 w-full">
        <BaseLookup
          v-model="form.referredById"
          :initial-description="form.referredByName"
          :search-service="clientService"
          placeholder="Selecione o cliente que indicou"
        />
      </div>
    </label>

    <!-- Preferências de Mensagens e Notificações -->
    <div class="md:col-span-2 mt-2 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-slate-500 text-[20px]">mark_chat_unread</span>
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">Preferências de Mensagens Automáticas</h3>
        </div>
        <span
          v-if="form.messagingPreferences?.allBlocked"
          class="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-medium"
        >
          <span class="material-symbols-outlined text-[13px]">block</span>
          Todas Bloqueadas
        </span>
      </div>

      <!-- Toggle Mestre -->
      <div
        class="flex items-center justify-between p-3.5 rounded-lg border transition-colors"
        :class="form.messagingPreferences?.allBlocked
          ? 'bg-red-50/50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : 'bg-emerald-50/40 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'"
      >
        <div class="pr-4">
          <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
            {{ form.messagingPreferences?.allBlocked ? 'Mensagens automáticas bloqueadas' : 'Permitir envio de mensagens automáticas' }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ form.messagingPreferences?.allBlocked
              ? 'Nenhuma mensagem automatizada será gerada ou enviada para este cliente.'
              : 'O cliente pode receber mensagens de acordo com os tipos permitidos abaixo.' }}
          </p>
        </div>
        <label
          class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none p-1 transition-colors shrink-0"
          :class="!form.messagingPreferences?.allBlocked ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'"
        >
          <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
          <input
            class="invisible absolute"
            type="checkbox"
            :checked="!form.messagingPreferences?.allBlocked"
            @change="toggleMasterAllowed($event.target.checked)"
          />
        </label>
      </div>

      <!-- Toggles Individuais (ativos quando allBlocked = false) -->
      <div
        class="grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity"
        :class="form.messagingPreferences?.allBlocked ? 'opacity-40 pointer-events-none' : ''"
      >
        <!-- Retorno / Rebooking -->
        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="min-w-0 pr-2">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Retorno / Rebooking</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block truncate">Ciclo do procedimento</span>
          </div>
          <label
            class="relative flex h-5 w-9 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors shrink-0"
            :class="isTypeAllowed('REBOOKING') ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'"
          >
            <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
            <input
              class="invisible absolute"
              type="checkbox"
              :checked="isTypeAllowed('REBOOKING')"
              @change="toggleTypeAllowed('REBOOKING', $event.target.checked)"
            />
          </label>
        </div>

        <!-- Acompanhamento / Follow-Up -->
        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="min-w-0 pr-2">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Acompanhamento</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block truncate">Follow-up pós-sessão</span>
          </div>
          <label
            class="relative flex h-5 w-9 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors shrink-0"
            :class="isTypeAllowed('FOLLOW_UP') ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'"
          >
            <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
            <input
              class="invisible absolute"
              type="checkbox"
              :checked="isTypeAllowed('FOLLOW_UP')"
              @change="toggleTypeAllowed('FOLLOW_UP', $event.target.checked)"
            />
          </label>
        </div>

        <!-- Evasão / Churn -->
        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div class="min-w-0 pr-2">
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">Recuperação Evasão</span>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block truncate">Prevenção de abandono</span>
          </div>
          <label
            class="relative flex h-5 w-9 cursor-pointer items-center rounded-full border-none p-0.5 transition-colors shrink-0"
            :class="isTypeAllowed('CHURN') ? 'bg-indigo-600 justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'"
          >
            <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
            <input
              class="invisible absolute"
              type="checkbox"
              :checked="isTypeAllowed('CHURN')"
              @change="toggleTypeAllowed('CHURN', $event.target.checked)"
            />
          </label>
        </div>
      </div>

      <!-- Histórico de Alterações -->
      <div v-if="preferenceHistory.length > 0" class="mt-1">
        <button
          type="button"
          class="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          @click="showHistory = !showHistory"
        >
          <span class="material-symbols-outlined text-[14px]">
            {{ showHistory ? 'expand_less' : 'history' }}
          </span>
          {{ showHistory ? 'Ocultar histórico de preferências' : `Ver histórico de preferências (${preferenceHistory.length})` }}
        </button>

        <div v-if="showHistory" class="mt-2 space-y-1.5 max-h-36 overflow-y-auto p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <div
            v-for="(item, idx) in preferenceHistory"
            :key="idx"
            class="flex items-start justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5 last:border-b-0 last:pb-0"
          >
            <div>
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ item.description || 'Alteração de preferências' }}</span>
              <span class="text-slate-400 dark:text-slate-500 block text-[11px]">por {{ item.changedBy || 'sistema' }}</span>
            </div>
            <span class="text-slate-400 text-[11px] shrink-0 whitespace-nowrap">{{ formatDateTime(item.changedAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseLookup from '../common/BaseLookup.vue';
import PhoneInput from '../common/PhoneInput.vue';
import BaseWhatsAppButton from '../common/BaseWhatsAppButton.vue';
import { formatPhone, formatDateTime } from '../../utils/formatters';
import { getWhatsappLink } from '../../utils/whatsappHelper';

const props = defineProps({
  form: { type: Object, required: true },
  clientService: { type: Object, required: true },
  showSearchResults: { type: Boolean, default: false },
  searchResults: { type: Array, default: () => [] },
  maxDate: { type: String, default: '' },
});

defineEmits(['name-input', 'focus-name', 'blur-name', 'select-client']);

const showHistory = ref(false);

const ensurePreferences = () => {
  if (!props.form.messagingPreferences) {
    props.form.messagingPreferences = {
      allBlocked: false,
      blockedTypes: [],
      history: []
    };
  }
  if (!Array.isArray(props.form.messagingPreferences.blockedTypes)) {
    props.form.messagingPreferences.blockedTypes = [];
  }
};

const preferenceHistory = computed(() => {
  return props.form.messagingPreferences?.history || [];
});

const toggleMasterAllowed = (allowed) => {
  ensurePreferences();
  props.form.messagingPreferences.allBlocked = !allowed;
};

const isTypeAllowed = (type) => {
  ensurePreferences();
  if (props.form.messagingPreferences.allBlocked) return false;
  return !props.form.messagingPreferences.blockedTypes.includes(type);
};

const toggleTypeAllowed = (type, allowed) => {
  ensurePreferences();
  const list = props.form.messagingPreferences.blockedTypes;
  if (allowed) {
    const idx = list.indexOf(type);
    if (idx !== -1) list.splice(idx, 1);
  } else {
    if (!list.includes(type)) list.push(type);
  }
};
</script>

<style scoped>
.autocomplete-container {
  position: relative;
}

.lookup-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

:global(.dark) .lookup-results {
  background: #1e293b;
  border-color: #334155;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

.lookup-item {
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

:global(.dark) .lookup-item {
  border-bottom-color: #334155;
}

.lookup-item:hover { background-color: #f8fafc; }
:global(.dark) .lookup-item:hover { background-color: #334155; }

.item-name { font-weight: 500; color: #0f172a; }
:global(.dark) .item-name { color: #f8fafc; }
.item-phone { font-size: 0.85rem; color: #64748b; }
:global(.dark) .item-phone { color: #94a3b8; }
</style>
