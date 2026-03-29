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
      <PhoneInput v-model="form.phone" />
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
  </div>
</template>

<script setup>
import BaseLookup from '../common/BaseLookup.vue';
import PhoneInput from '../common/PhoneInput.vue';
import { formatPhone } from '../../utils/formatters';

defineProps({
  form: { type: Object, required: true },
  clientService: { type: Object, required: true },
  showSearchResults: { type: Boolean, default: false },
  searchResults: { type: Array, default: () => [] },
  maxDate: { type: String, default: '' },
});

defineEmits(['name-input', 'focus-name', 'blur-name', 'select-client']);
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
