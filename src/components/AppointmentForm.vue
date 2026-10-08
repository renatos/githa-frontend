<template>
  <BaseModal
    :show="true"
    max-width="max-w-4xl"
    :body-padding="false"
    :z-index="zIndex"
    @close="$emit('close')"
  >
    <template #header-content>
      <div class="flex items-center gap-4 min-w-0">
        <span class="material-symbols-outlined text-[24px] shrink-0 text-slate-900 dark:text-slate-100">calendar_month</span>
        <div class="min-w-0">
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
            {{ form.id ? 'Editar Agendamento' : 'Novo Agendamento' }}
          </h2>
          <p v-if="subtitleTimestamp" class="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1 capitalize">
            {{ subtitleTimestamp }}
          </p>
        </div>
      </div>
    </template>

    <div class="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-6">
      <form class="flex flex-col gap-6" @submit.prevent="save">

        <!-- Transaction link badge -->
        <div v-if="form.transactionId" class="flex justify-center -mb-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors cursor-pointer"
            @click="navigateToTransaction"
          >
            <span class="material-symbols-outlined text-[14px]">link</span>
            Vinculado à Transação #{{ form.transactionId }}
          </button>
        </div>
        
        <!-- Header da Sessão: Cliente e Data -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
          <!-- Cliente -->
          <div class="md:col-span-2 flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Cliente</p>
            <BaseLookup
              v-model="form.client.id"
              :disabled="!canSave"
              :initial-description="form.client.name"
              :search-service="clientService"
              placeholder="Pesquisar Cliente..."
              @edit="onEditClient"
              @select="(item) => form.client.name = item?.name"
            />
          </div>

          <!-- Data da Sessão -->
          <div class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Data</p>
            <input
              v-model="form.date"
              :disabled="!canSave"
              class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
              required
              type="date"
            />
          </div>
        </div>

        <!-- TABELA DE PROCEDIMENTOS DA SESSÃO -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Procedimentos da Sessão ({{ procedures.length }})
            </h4>
            <span v-if="totalDurationFormatted" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
              <i class="fa-regular fa-clock mr-1"></i> Duração: {{ totalDurationFormatted }}
            </span>
          </div>

          <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-xs">
            <!-- Header Desktop -->
            <div class="hidden md:grid grid-cols-[1fr_180px_160px_130px_48px] gap-3 p-3 bg-slate-100 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <div>Serviço / Profissional</div>
              <div>Profissional</div>
              <div>Horário (Início - Fim)</div>
              <div class="text-right">Valor</div>
              <div></div>
            </div>

            <!-- Lista de Procedimentos Adicionados -->
            <div class="divide-y divide-slate-100 dark:divide-slate-700/50">
              <div
                v-for="(proc, index) in procedures"
                :key="proc.tempId || proc.id || index"
                class="flex flex-col md:grid md:grid-cols-[1fr_180px_160px_130px_48px] gap-3 p-3 items-center group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <!-- Serviço -->
                <div class="flex items-center gap-2.5 min-w-0 w-full">
                  <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-hand-sparkles text-xs"></i>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{{ proc.service.name }}</p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 md:hidden">{{ proc.professional.name || 'Sem profissional' }}</p>
                  </div>
                </div>

                <!-- Profissional (Desktop) -->
                <div class="hidden md:flex items-center min-w-0">
                  <span class="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                    <i class="fa-solid fa-user-tie text-[10px] text-slate-400 mr-1"></i>
                    {{ proc.professional.name || 'Padrão' }}
                  </span>
                </div>

                <!-- Horário com Início e Fim editáveis -->
                <div class="flex items-center gap-1.5 w-full md:w-auto">
                  <input
                    v-model="proc.start"
                    type="text"
                    maxlength="5"
                    placeholder="HH:MM"
                    :disabled="!canSave"
                    class="form-input w-20 text-center rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-8 px-1 text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none disabled:opacity-60"
                    @input="e => { proc.start = maskTime(e); recalculateItemEnd(proc); }"
                  />
                  <span class="text-slate-400 text-xs font-bold">-</span>
                  <input
                    v-model="proc.end"
                    type="text"
                    maxlength="5"
                    placeholder="HH:MM"
                    :disabled="!canSave"
                    class="form-input w-20 text-center rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-8 px-1 text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none disabled:opacity-60"
                    @input="e => proc.end = maskTime(e)"
                  />
                </div>

                <!-- Preço e Desconto -->
                <div class="flex md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto text-right">
                  <span v-if="proc.discountAmount && proc.discountAmount > 0" class="text-[10px] text-slate-400 line-through">
                    {{ formatCurrency(proc.price) }}
                  </span>
                  <span class="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {{ formatCurrency(proc.netAmount !== undefined ? proc.netAmount : (proc.price - (proc.discountAmount || 0))) }}
                  </span>
                </div>

                <!-- Ação Remover -->
                <div class="flex justify-end md:justify-center">
                  <button
                    v-if="canSave && (procedures.length > 1 || !form.id)"
                    type="button"
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remover procedimento"
                    @click="removeProcedure(index)"
                  >
                    <i class="fa-solid fa-trash-can text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Estado Vazio -->
              <div v-if="procedures.length === 0" class="p-6 text-center text-slate-500 italic text-sm">
                Nenhum procedimento adicionado à sessão
              </div>
            </div>

            <!-- LINHA DE ADIÇÃO RÁPIDA DE NOVO PROCEDIMENTO -->
            <div v-if="canSave" class="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/40 flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <!-- Lookup de Serviço -->
              <div class="flex-1 min-w-0">
                <BaseLookup
                  v-model="newProcedure.service.id"
                  :initial-description="newProcedure.service.name"
                  :search-service="serviceService"
                  placeholder="Selecione o serviço..."
                  hide-id
                  @select="onNewServiceSelect"
                />
              </div>

              <!-- Lookup de Profissional -->
              <div class="w-full md:w-48 shrink-0">
                <BaseLookup
                  v-model="newProcedure.professional.id"
                  :initial-description="newProcedure.professional.name"
                  :search-service="professionalService"
                  placeholder="Profissional..."
                  hide-id
                  @select="(item) => newProcedure.professional.name = item?.name"
                />
              </div>

              <!-- Horário Início / Fim -->
              <div class="flex items-center gap-1.5 shrink-0 justify-center">
                <input
                  v-model="newProcedure.start"
                  type="text"
                  maxlength="5"
                  placeholder="Início"
                  class="form-input w-20 text-center rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-9 px-1 text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none"
                  @input="e => { newProcedure.start = maskTime(e); calculateNewProcedureEnd(); }"
                />
                <span class="text-slate-400 text-xs font-bold">-</span>
                <input
                  v-model="newProcedure.end"
                  type="text"
                  maxlength="5"
                  placeholder="Fim"
                  class="form-input w-20 text-center rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-9 px-1 text-slate-900 dark:text-slate-100 focus:border-indigo-600 outline-none"
                  @input="e => newProcedure.end = maskTime(e)"
                />
              </div>

              <!-- Botão Adicionar -->
              <div class="shrink-0 flex justify-end">
                <button
                  type="button"
                  :disabled="!newProcedure.service.id"
                  class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
                  @click="addProcedure"
                >
                  <i class="fa-solid fa-plus text-[10px]"></i>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SEÇÃO DE DESCONTOS (MOTOR UNIFICADO) -->
        <div v-if="procedures.length > 0" class="pt-1">
          <!-- Estado 1: Sem desconto aplicado -->
          <div v-if="!discountSummary || discountSummary.totalDiscountAmount <= 0" class="flex justify-end">
            <button
              v-if="canModifyDiscount"
              type="button"
              class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/20 transition-all cursor-pointer shadow-xs active:scale-95"
              @click="isDiscountModalOpen = true"
            >
              <i class="fa-solid fa-tag text-[11px]"></i>
              Aplicar Desconto
            </button>
          </div>

          <!-- Estado 2: Desconto aplicado -->
          <div v-else class="p-3.5 bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-200/80 dark:border-indigo-500/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1">
            <div class="flex items-center gap-3 min-w-0">
              <div class="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                <i class="fa-solid fa-tag text-sm"></i>
              </div>
              <div class="min-w-0">
                <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 block leading-tight">
                  Desconto Concedido
                </span>
                <span class="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 truncate block mt-0.5">
                  - {{ formatCurrency(discountSummary.totalDiscountAmount) }}
                  <span v-if="discountSummary.totalDiscountPercentage > 0" class="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">
                    ({{ discountSummary.totalDiscountPercentage.toFixed(2) }}% • {{ discountSummary.mode === 'ITEM' ? 'Por Item' : 'No Total' }})
                  </span>
                </span>
              </div>
            </div>
            <div v-if="canModifyDiscount" class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                class="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-lg transition-colors cursor-pointer"
                @click="isDiscountModalOpen = true"
              >
                <i class="fa-solid fa-pen-to-square mr-1"></i>
                Editar
              </button>
              <button
                type="button"
                class="p-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Remover Desconto"
                @click="removeDiscount"
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- TOTALIZADORES GERAIS DA SESSÃO -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Subtotal dos Procedimentos</span>
            <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ formatCurrency(grossSessionTotal) }}</span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Desconto da Sessão</span>
            <span class="text-sm font-bold text-rose-600 dark:text-rose-400">
              - {{ formatCurrency(discountSummary?.totalDiscountAmount || 0) }}
            </span>
          </div>
          <div>
            <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Total Geral Líquido</span>
            <span class="text-base font-black text-emerald-600 dark:text-emerald-400">{{ formatCurrency(netSessionTotal) }}</span>
          </div>
        </div>

        <!-- Status e Notas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">{{ form.id ? 'Status' : 'Status Inicial' }}</p>
            <select
              v-model="form.status"
              :disabled="!canSave"
              class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
              required
            >
              <option v-for="status in appointmentStatuses" :key="status.name" :value="status.name">
                {{ status.description }}
              </option>
            </select>
          </label>

          <label class="flex flex-col">
            <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">{{ form.id ? 'Notas' : 'Notas Gerais da Sessão' }}</p>
            <textarea
              v-model="form.notes"
              :disabled="!canSave"
              class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-2 text-base transition-colors disabled:opacity-60 resize-none h-11"
              rows="1"
            ></textarea>
          </label>
        </div>
      </form>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <button
        class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors"
        type="button"
        @click="$emit('close')"
      >
        Cancelar
      </button>
      <button
        :disabled="!canSave"
        :title="saveTooltip"
        class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        @click="save"
      >
        {{ procedures.length > 1 ? `Salvar (${procedures.length} Procedimentos)` : 'Salvar' }}
      </button>
    </template>
  </BaseModal>

  <!-- Modal de Descontos Unificado -->
  <TransactionDiscountModal
    v-if="isDiscountModalOpen"
    :show="isDiscountModalOpen"
    :items="procedureItemsForDiscount"
    :current-discount="discountSummary"
    subtitle="Sessão de Procedimentos"
    :z-index="12000"
    @close="isDiscountModalOpen = false"
    @apply="applyDiscount"
    @remove="removeDiscount"
    @clear="removeDiscount"
  />

  <!-- Edit Modals (Stacked) -->
  <ClientForm
    v-if="showClientForm"
    :client="editingClient"
    :z-index="11000"
    @close="showClientForm = false"
    @save="onClientSaved"
  />
  <ProfessionalForm
    v-if="showProfessionalForm"
    :professional="editingProfessional"
    :z-index="11000"
    @close="showProfessionalForm = false"
    @save="onProfessionalSaved"
  />
  <ServiceForm
    v-if="showServiceForm"
    :service="editingService"
    :z-index="11000"
    @close="showServiceForm = false"
    @save="onServiceSaved"
  />

  <!-- Modal de Opção de Atualização de Status da Sessão -->
  <AppointmentGroupStatusModal
    :show="showGroupStatusModal"
    :new-status="form.status"
    :z-index="12500"
    @close="showGroupStatusModal = false"
    @choose="handleGroupStatusChoice"
  />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseModal from './common/BaseModal.vue';
import { appointmentService } from '../services/appointmentService';
import { clientService } from '../services/clientService';
import { professionalService } from '../services/professionalService';
import { serviceService } from '../services/serviceService';
import { authService } from '../services/authService';
import { enumService } from '../services/enumService';
import BaseLookup from './common/BaseLookup.vue';
import { confirmBridge } from '../services/confirmBridge';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';
import TransactionDiscountModal from './financial/TransactionDiscountModal.vue';
import ClientForm from './ClientForm.vue';
import ProfessionalForm from './ProfessionalForm.vue';
import ServiceForm from './ServiceForm.vue';
import AppointmentGroupStatusModal from './AppointmentGroupStatusModal.vue';
import { formatCurrency, round2 } from '@/utils/formatters';

const props = defineProps({
  appointment: {
    type: Object,
    default: () => ({}),
  },
  clientId: { type: Number, default: null },
  zIndex: { type: Number, default: 10000 }
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const router = useRouter();
const isAdmin = ref(false);

const form = ref({
  id: null,
  client: { id: '', name: '' },
  professional: { id: '', name: '' },
  service: { id: '', name: '' },
  date: '',
  start: '',
  end: '',
  status: 'SCHEDULED',
  notes: '',
  price: 0,
  discount: 0,
  discountAmount: 0,
  netAmount: 0,
  transactionId: null
});

// Lista de procedimentos para a sessão
const procedures = ref([]);
const deletedProcedureIds = ref([]);

// Linha de novo procedimento
const newProcedure = ref({
  service: { id: '', name: '', durationMinutes: 30, price: 0 },
  professional: { id: '', name: '' },
  start: '',
  end: ''
});

// Gestão de descontos unificados
const isDiscountModalOpen = ref(false);
const discountSummary = ref(null);

const originalStatus = ref('');
const appointmentStatuses = ref([]);
const selectedServiceDuration = ref(0);
const showGroupStatusModal = ref(false);

const checkUserRole = () => {
  const user = authService.getCurrentUser();
  isAdmin.value = (user.roles && user.roles.includes('ADMIN')) || user.email === 'admin@githa.com';
};

const canSave = computed(() => {
  if (!props.appointment.id) return true;
  if (originalStatus.value === 'COMPLETED' && !isAdmin.value) return false;
  if (form.value.status === 'COMPLETED' && !isAdmin.value) return false;
  return true;
});

const saveTooltip = computed(() => {
  if (!canSave.value) return 'Atendimento concluído, apenas ADMIN pode salvar alterações.';
  return '';
});

const canModifyDiscount = computed(() => {
  if (!canSave.value) return false;
  if (originalStatus.value === 'COMPLETED' || form.value.status === 'COMPLETED') return false;
  return !form.value.status || form.value.status === 'SCHEDULED';
});

// Totalizadores para modo multi-procedimento
const grossSessionTotal = computed(() => {
  return round2(procedures.value.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0));
});

const netSessionTotal = computed(() => {
  if (discountSummary.value && discountSummary.value.totalDiscountAmount > 0) {
    return Math.max(0, round2(grossSessionTotal.value - discountSummary.value.totalDiscountAmount));
  }
  return round2(procedures.value.reduce((sum, item) => {
    const net = item.netAmount !== undefined ? item.netAmount : (item.price - (item.discountAmount || 0));
    return sum + (parseFloat(net) || 0);
  }, 0));
});

const totalDurationFormatted = computed(() => {
  if (procedures.value.length === 0) return '';
  let totalMin = 0;
  procedures.value.forEach(p => {
    if (p.start && p.end) {
      const [sh, sm] = p.start.split(':').map(Number);
      const [eh, em] = p.end.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) totalMin += diff;
    }
  });
  if (totalMin <= 0) return '';
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return hours > 0 ? `${hours}h ${mins > 0 ? mins + 'min' : ''}` : `${mins}min`;
});

const subtitleTimestamp = computed(() => {
  if (!form.value.date || !form.value.start) return '';
  try {
    const [year, month, day] = form.value.date.split('-');
    const [hour, minute] = form.value.start.split(':');
    const dateObj = new Date(year, month - 1, day, hour, minute);
    const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dateObj);
    return `${dayOfWeek.replace('-feira', ' feira')} às ${hour}:${minute}`;
  } catch (e) {
    return '';
  }
});

// Adaptação dos procedimentos para o TransactionDiscountModal
const procedureItemsForDiscount = computed(() => {
  return procedures.value.map((p, idx) => ({
    id: p.tempId || idx + 1,
    type: 'SERVICE',
    serviceName: p.service.name || `Procedimento ${idx + 1}`,
    quantity: 1,
    unitPrice: p.price || 0,
    subtotal: p.price || 0,
    discountAmount: p.discountAmount || 0,
    netAmount: p.netAmount !== undefined ? p.netAmount : (p.price - (p.discountAmount || 0))
  }));
});

const applyDiscount = (discountData) => {
  discountSummary.value = discountData;
  if (discountData.itemsWithDiscount && discountData.itemsWithDiscount.length > 0) {
    discountData.itemsWithDiscount.forEach((updatedItem, index) => {
      const target = procedures.value.find((p, idx) => (p.tempId || idx + 1) === updatedItem.id) || procedures.value[index];
      if (target) {
        target.discountAmount = updatedItem.discountAmount;
        target.netAmount = updatedItem.netAmount;
      }
    });
  }
};

const removeDiscount = () => {
  discountSummary.value = null;
  procedures.value.forEach(p => {
    p.discountAmount = 0;
    p.netAmount = p.price;
  });
};

// Automação em cascata para horários
const calculateNewProcedureEnd = () => {
  if (!newProcedure.value.start || newProcedure.value.start.length !== 5) return;
  const [hours, minutes] = newProcedure.value.start.split(':').map(Number);
  const duration = newProcedure.value.service.durationMinutes || 30;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + duration);
  const endHours = String(date.getHours()).padStart(2, '0');
  const endMinutes = String(date.getMinutes()).padStart(2, '0');
  newProcedure.value.end = `${endHours}:${endMinutes}`;
};

const recalculateItemEnd = (item) => {
  if (!item.start || item.start.length !== 5) return;
  const [hours, minutes] = item.start.split(':').map(Number);
  const duration = item.service.durationMinutes || 30;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + duration);
  const endHours = String(date.getHours()).padStart(2, '0');
  const endMinutes = String(date.getMinutes()).padStart(2, '0');
  item.end = `${endHours}:${endMinutes}`;
};

const onNewServiceSelect = (item) => {
  newProcedure.value.service.name = item?.name;
  newProcedure.value.service.durationMinutes = item?.durationMinutes || 30;
  newProcedure.value.service.price = item?.price || 0;

  // Se o início estiver vazio, sugere o fim do procedimento anterior ou o horário do formulário
  if (!newProcedure.value.start) {
    if (procedures.value.length > 0) {
      newProcedure.value.start = procedures.value[procedures.value.length - 1].end;
    } else if (form.value.start) {
      newProcedure.value.start = form.value.start;
    } else {
      newProcedure.value.start = '09:00';
    }
  }

  // Se o profissional estiver vazio, herda do anterior ou do form
  if (!newProcedure.value.professional.id) {
    if (procedures.value.length > 0 && procedures.value[procedures.value.length - 1].professional.id) {
      newProcedure.value.professional = { ...procedures.value[procedures.value.length - 1].professional };
    } else if (form.value.professional.id) {
      newProcedure.value.professional = { ...form.value.professional };
    }
  }

  calculateNewProcedureEnd();
};

const toMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const addProcedure = async () => {
  if (!newProcedure.value.service.id) {
    confirmBridge.alert({
      title: 'Serviço obrigatório',
      message: 'Selecione um serviço para adicionar à sessão.',
      type: 'warning'
    });
    return;
  }

  if (!form.value.date) {
    confirmBridge.alert({
      title: 'Data obrigatória',
      message: 'Por favor, selecione a data da sessão antes de adicionar procedimentos.',
      type: 'warning'
    });
    return;
  }

  if (!newProcedure.value.professional?.id) {
    confirmBridge.alert({
      title: 'Profissional obrigatório',
      message: 'Selecione um profissional para o procedimento.',
      type: 'warning'
    });
    return;
  }

  if (!newProcedure.value.start || !newProcedure.value.end) {
    confirmBridge.alert({
      title: 'Horário incompleto',
      message: 'Informe os horários de início e término do procedimento.',
      type: 'warning'
    });
    return;
  }

  const newStartMin = toMinutes(newProcedure.value.start);
  const newEndMin = toMinutes(newProcedure.value.end);

  if (newEndMin <= newStartMin) {
    confirmBridge.alert({
      title: 'Horário inválido',
      message: 'O horário de término deve ser posterior ao horário de início.',
      type: 'warning'
    });
    return;
  }

  const profId = newProcedure.value.professional.id;
  const profName = newProcedure.value.professional.name || 'esse profissional';

  // 1. Validação local: conflito com outros procedimentos da mesma sessão
  const localConflict = procedures.value.find(p => {
    if (p.professional?.id === profId) {
      const pStart = toMinutes(p.start);
      const pEnd = toMinutes(p.end);
      return newStartMin < pEnd && newEndMin > pStart;
    }
    return false;
  });

  if (localConflict) {
    confirmBridge.alert({
      title: 'Conflito de Horário na Sessão',
      message: `A profissional ${profName} já possui o procedimento "${localConflict.service.name}" agendado das ${localConflict.start} às ${localConflict.end} nesta mesma sessão.`,
      type: 'warning'
    });
    return;
  }

  // 2. Validação remota: conflito com agendamentos já salvos no banco de dados para a profissional naquela data
  try {
    const res = await appointmentService.getAll({
      'professional.id': profId,
      date: form.value.date,
      size: 100
    });
    const existingList = res.data?.content || res.data || [];

    const remoteConflict = existingList.find(apt => {
      if (props.appointment?.id && apt.id === props.appointment.id) return false;
      if (apt.status === 'CANCELED' || apt.status === 'MISSED') return false;

      if (!apt.startTime || !apt.endTime) return false;
      const aptStartStr = apt.startTime.split('T')[1].substring(0, 5);
      const aptEndStr = apt.endTime.split('T')[1].substring(0, 5);
      const aStart = toMinutes(aptStartStr);
      const aEnd = toMinutes(aptEndStr);

      return newStartMin < aEnd && newEndMin > aStart;
    });

    if (remoteConflict) {
      const clientName = remoteConflict.clientName || remoteConflict.client?.name || 'Cliente';
      const serviceName = remoteConflict.serviceName || remoteConflict.service?.name || 'Procedimento';
      const aptStartStr = remoteConflict.startTime.split('T')[1].substring(0, 5);
      const aptEndStr = remoteConflict.endTime.split('T')[1].substring(0, 5);

      confirmBridge.alert({
        title: 'Conflito de Horário',
        message: `Já existe um agendamento para ${profName}:\n${clientName} (${serviceName}) das ${aptStartStr} às ${aptEndStr}.`,
        type: 'warning'
      });
      return;
    }
  } catch (err) {
    console.error('Erro ao verificar disponibilidade do profissional:', err);
  }

  const itemPrice = newProcedure.value.service.price || 0;
  procedures.value.push({
    tempId: Date.now() + Math.random(),
    service: { ...newProcedure.value.service },
    professional: { ...newProcedure.value.professional },
    start: newProcedure.value.start || '09:00',
    end: newProcedure.value.end || '10:00',
    price: itemPrice,
    discountAmount: 0,
    netAmount: itemPrice
  });

  // Prepara o próximo slot em cascata
  const lastEnd = newProcedure.value.end;
  newProcedure.value = {
    service: { id: '', name: '', durationMinutes: 30, price: 0 },
    professional: { ...newProcedure.value.professional },
    start: lastEnd,
    end: ''
  };

  if (discountSummary.value) {
    // Se havia desconto aplicado, remove para reavaliação
    removeDiscount();
  }
};

const removeProcedure = async (index) => {
  const target = procedures.value[index];
  if (target && target.id) {
    const confirmed = await confirmBridge.confirm({
      title: 'Remover Procedimento',
      message: `Deseja realmente remover o procedimento "${target.service?.name || ''}" da sessão? Ele será excluído ao salvar.`,
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      type: 'danger'
    });
    if (!confirmed) return;
    deletedProcedureIds.value.push(target.id);
  }
  procedures.value.splice(index, 1);
  if (discountSummary.value) {
    removeDiscount();
  }
};

onMounted(() => {
  if (props.appointment && Object.keys(props.appointment).length > 0) {
    const apt = { ...props.appointment };
    originalStatus.value = apt.status;

    if (apt.startTime) {
      form.value.date = apt.startTime.split('T')[0];
      form.value.start = apt.startTime.split('T')[1].substring(0, 5);
    }
    if (apt.endTime) {
      form.value.end = apt.endTime.split('T')[1].substring(0, 5);
    }

    if (!apt.client) apt.client = { id: apt.clientId || '', name: apt.clientName || '' };
    else {
      apt.client.id = apt.clientId || apt.client.id;
      if (!apt.client.name) apt.client.name = apt.clientName || '';
    }

    if (!apt.professional) apt.professional = { id: apt.professionalId || '', name: apt.professionalName || '' };
    else {
      apt.professional.id = apt.professionalId || apt.professional.id;
      if (!apt.professional.name) apt.professional.name = apt.professionalName || '';
    }

    if (!apt.service) apt.service = { id: apt.serviceId || '', name: apt.serviceName || '' };
    else {
      apt.service.id = apt.serviceId || apt.service.id;
      if (!apt.service.name) apt.service.name = apt.serviceName || '';
    }

    form.value = { ...form.value, ...apt };

    if (!apt.id) {
      form.value.status = 'SCHEDULED';
      form.value.id = null;
    }

    if (!form.value.client.id && apt.clientId) form.value.client.id = apt.clientId;
    if (apt.transactionId) form.value.transactionId = apt.transactionId;

    // Popula procedimentos para o novo form unificado (seja edição ou criação com pré-seleção)
    if (form.value.service?.id) {
      const itemPrice = parseFloat(form.value.price) || 0;
      const itemDiscount = parseFloat(form.value.discount) || 0;
      const itemDiscountAmount = parseFloat(form.value.discountAmount) || (itemDiscount > 0 ? (itemPrice * itemDiscount / 100) : 0);
      const itemNet = form.value.netAmount !== undefined && form.value.netAmount !== null
        ? parseFloat(form.value.netAmount)
        : (itemPrice - itemDiscountAmount);

      procedures.value = [{
        id: form.value.id || null,
        tempId: form.value.id || Date.now(),
        service: {
          id: form.value.service.id,
          name: form.value.service.name,
          durationMinutes: selectedServiceDuration.value || 30,
          price: itemPrice
        },
        professional: {
          id: form.value.professional.id,
          name: form.value.professional.name
        },
        start: form.value.start || '09:00',
        end: form.value.end || '10:00',
        price: itemPrice,
        discount: itemDiscount,
        discountAmount: itemDiscountAmount,
        netAmount: itemNet,
        status: form.value.status
      }];

      if (itemDiscountAmount > 0) {
        discountSummary.value = {
          mode: 'TOTAL',
          totalDiscountAmount: itemDiscountAmount,
          totalDiscountPercentage: itemPrice > 0 ? (itemDiscountAmount / itemPrice) * 100 : 0,
          itemsWithDiscount: [{
            id: form.value.id || procedures.value[0].tempId,
            discountAmount: itemDiscountAmount,
            netAmount: itemNet
          }]
        };
      }
    }
  }

  // Preenche profissional default a partir do usuário logado se não houver
  if (!form.value.professional.id) {
    const currentUser = authService.getCurrentUser();
    if (currentUser.professionalId) {
      form.value.professional = {
        id: currentUser.professionalId,
        name: currentUser.professionalName
      };
      newProcedure.value.professional = { ...form.value.professional };
    }
  }

  // Define data padrão de hoje se vazio
  if (!form.value.date) {
    form.value.date = new Date().toISOString().split('T')[0];
  }

  checkUserRole();
  loadStatuses();
});

onMounted(async () => {
  if (props.appointment.id || form.value.service?.id) {
    if (props.appointment.id) {
      try {
        const response = await appointmentService.getById(props.appointment.id);
        const fullApt = response.data;
        if (fullApt) {
          form.value.transactionId = fullApt.transactionId;
          if (fullApt.groupId) {
            form.value.groupId = fullApt.groupId;

            // Busca os demais agendamentos da sessão (mesmo groupId)
            try {
              const resGroup = await appointmentService.getAll({
                date: form.value.date,
                'client.id': form.value.client.id,
                size: 100
              });
              const allItems = resGroup.data?.content || resGroup.data || [];
              const groupItems = allItems.filter(item => item.groupId === fullApt.groupId && item.status !== 'CANCELED');
              if (groupItems.length > 0) {
                groupItems.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
                procedures.value = groupItems.map(item => {
                  const pPrice = parseFloat(item.price) || 0;
                  const pDisc = parseFloat(item.discount) || 0;
                  const pDiscAmount = parseFloat(item.discountAmount) || (pDisc > 0 ? (pPrice * pDisc / 100) : 0);
                  const pNet = item.netAmount !== undefined && item.netAmount !== null
                    ? parseFloat(item.netAmount)
                    : (pPrice - pDiscAmount);

                  return {
                    id: item.id,
                    tempId: item.id,
                    service: {
                      id: item.serviceId || item.service?.id,
                      name: item.serviceName || item.service?.name,
                      price: pPrice,
                      durationMinutes: 30
                    },
                    professional: {
                      id: item.professionalId || item.professional?.id,
                      name: item.professionalName || item.professional?.name
                    },
                    start: item.startTime ? item.startTime.split('T')[1].substring(0, 5) : '',
                    end: item.endTime ? item.endTime.split('T')[1].substring(0, 5) : '',
                    price: pPrice,
                    discount: pDisc,
                    discountAmount: pDiscAmount,
                    netAmount: pNet,
                    status: item.status
                  };
                });

                const totalDisc = procedures.value.reduce((acc, p) => acc + (p.discountAmount || 0), 0);
                if (totalDisc > 0) {
                  discountSummary.value = {
                    mode: 'ITEM',
                    totalDiscountAmount: totalDisc,
                    totalDiscountPercentage: grossSessionTotal.value > 0 ? (totalDisc / grossSessionTotal.value) * 100 : 0,
                    itemsWithDiscount: procedures.value.filter(p => p.discountAmount > 0).map(p => ({
                      id: p.id,
                      discountAmount: p.discountAmount,
                      netAmount: p.netAmount
                    }))
                  };
                }
              }
            } catch (errGroup) {
              console.error('Falha ao buscar agendamentos da sessão:', errGroup);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch appointment details", e);
      }
    }

    if (form.value.service.id) {
      try {
        const response = await serviceService.getById(form.value.service.id);
        const s = response.data || response;
        if (s) {
          selectedServiceDuration.value = s.durationMinutes || 0;
          if (!form.value.price) form.value.price = s.price || 0;
          calculateEndTime();
        }
      } catch (e) {
        console.error("Failed to fetch service details", e);
      }
    }
  }
});

const loadStatuses = async () => {
  appointmentStatuses.value = await enumService.getOptions('AppointmentStatus');
};

const calculateEndTime = () => {
  if (!form.value.start || !form.value.service || form.value.start.length !== 5) return;
  const [hours, minutes] = form.value.start.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + selectedServiceDuration.value);
  const endHours = String(date.getHours()).padStart(2, '0');
  const endMinutes = String(date.getMinutes()).padStart(2, '0');
  form.value.end = `${endHours}:${endMinutes}`;
};

const onServiceSelect = (item) => {
  form.value.service.name = item?.name;
  selectedServiceDuration.value = item?.durationMinutes || 0;
  if (item && item.price) {
    form.value.price = item.price;
  }
  calculateEndTime();
};

const maskTime = (e) => {
  let v = e.target.value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) v = v.substring(0, 2) + ':' + v.substring(2);
  e.target.value = v;
  return v;
};

const save = () => {
  if (!form.value.client.id) {
    confirmBridge.alert({
      title: 'Cliente obrigatório',
      message: 'Por favor, selecione um cliente para o agendamento.',
      type: 'warning'
    });
    return;
  }

  if (procedures.value.length === 0) {
    confirmBridge.alert({
      title: 'Nenhum procedimento',
      message: 'Adicione pelo menos um procedimento à sessão.',
      type: 'warning'
    });
    return;
  }

  // Validação de horários
  for (const proc of procedures.value) {
    if (!proc.start || !proc.end) {
      confirmBridge.alert({
        title: 'Horário incompleto',
        message: `O procedimento ${proc.service.name || ''} possui horários incompletos.`,
        type: 'warning'
      });
      return;
    }
    const [sh, sm] = proc.start.split(':').map(Number);
    const [eh, em] = proc.end.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) {
      confirmBridge.alert({
        title: 'Horário inválido',
        message: `No procedimento ${proc.service.name || ''}, o término deve ser posterior ao início.`,
        type: 'warning'
      });
      return;
    }
  }

  // Validação de sobreposição entre procedimentos da própria sessão
  for (let i = 0; i < procedures.value.length; i++) {
    const p1 = procedures.value[i];
    const p1Start = toMinutes(p1.start);
    const p1End = toMinutes(p1.end);

    for (let j = i + 1; j < procedures.value.length; j++) {
      const p2 = procedures.value[j];
      if (p1.professional?.id && p2.professional?.id && p1.professional.id === p2.professional.id) {
        const p2Start = toMinutes(p2.start);
        const p2End = toMinutes(p2.end);
        if (p1Start < p2End && p1End > p2Start) {
          confirmBridge.alert({
            title: 'Conflito de Horário na Sessão',
            message: `Os procedimentos "${p1.service.name}" e "${p2.service.name}" possuem horários sobrepostos para o(a) mesmo(a) profissional.`,
            type: 'warning'
          });
          return;
        }
      }
    }
  }

  // Se o agendamento pertence a uma sessão com múltiplos procedimentos e o status foi alterado, pergunta se aplica a toda a sessão
  if (form.value.groupId && procedures.value.length > 1 && form.value.status !== originalStatus.value) {
    showGroupStatusModal.value = true;
    return;
  }

  executeSave(false);
};

const handleGroupStatusChoice = (choice) => {
  showGroupStatusModal.value = false;
  executeSave(choice === 'ALL');
};

const executeSave = (updateAllInGroup = false) => {
  const toISOString = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  // Criação (sem ID)
  if (!form.value.id) {
    if (procedures.value.length === 1) {
      const proc = procedures.value[0];
      const singleDto = {
        clientId: form.value.client.id,
        professionalId: proc.professional?.id || form.value.professional?.id || null,
        serviceId: proc.service.id,
        startTime: toISOString(form.value.date, proc.start),
        endTime: toISOString(form.value.date, proc.end),
        status: form.value.status || 'SCHEDULED',
        notes: form.value.notes,
        price: proc.price,
        discount: proc.discount || 0,
        discountAmount: proc.discountAmount || 0,
        netAmount: proc.netAmount !== undefined ? proc.netAmount : (proc.price - (proc.discountAmount || 0))
      };
      emit('save', singleDto);
      return;
    }

    const batchDtos = procedures.value.map(proc => ({
      clientId: form.value.client.id,
      professionalId: proc.professional?.id || form.value.professional?.id || null,
      serviceId: proc.service.id,
      startTime: toISOString(form.value.date, proc.start),
      endTime: toISOString(form.value.date, proc.end),
      status: form.value.status || 'SCHEDULED',
      notes: form.value.notes,
      price: proc.price,
      discountAmount: proc.discountAmount || 0,
      netAmount: proc.netAmount !== undefined ? proc.netAmount : (proc.price - (proc.discountAmount || 0))
    }));
    emit('save', batchDtos);
    return;
  }

  // Edição com apenas 1 procedimento original e sem exclusões
  if (procedures.value.length === 1 && deletedProcedureIds.value.length === 0 && procedures.value[0].id === form.value.id) {
    const proc = procedures.value[0];
    const dto = {
      id: form.value.id,
      groupId: form.value.groupId || null,
      clientId: form.value.client?.id || null,
      professionalId: proc.professional?.id || null,
      serviceId: proc.service?.id || null,
      startTime: toISOString(form.value.date, proc.start),
      endTime: toISOString(form.value.date, proc.end),
      status: form.value.status,
      notes: form.value.notes,
      price: proc.price,
      discount: proc.discount || 0,
      discountAmount: proc.discountAmount || 0,
      netAmount: proc.netAmount !== undefined ? proc.netAmount : (proc.price - (proc.discountAmount || 0)),
      updateAllInGroup
    };
    emit('save', dto);
    return;
  }

  // Edição com múltiplos procedimentos ou alterações estruturais na sessão
  const dtos = procedures.value.map(proc => ({
    id: proc.id || null,
    groupId: form.value.groupId || null,
    clientId: form.value.client.id,
    professionalId: proc.professional?.id || form.value.professional?.id || null,
    serviceId: proc.service.id,
    startTime: toISOString(form.value.date, proc.start),
    endTime: toISOString(form.value.date, proc.end),
    status: form.value.status || 'SCHEDULED',
    notes: form.value.notes,
    price: proc.price,
    discountAmount: proc.discountAmount || 0,
    netAmount: proc.netAmount !== undefined ? proc.netAmount : (proc.price - (proc.discountAmount || 0)),
    updateAllInGroup
  }));

  emit('save', {
    items: dtos,
    deletedIds: deletedProcedureIds.value,
    updateAllInGroup,
    groupId: form.value.groupId
  });
};

const navigateToTransaction = () => {
  if (form.value.transactionId) {
    emit('close');
    router.push({ path: '/financials', query: { highlight: form.value.transactionId } });
  }
};

// --- Edit Modal Logic ---
const showClientForm = ref(false);
const editingClient = ref({});

const showProfessionalForm = ref(false);
const editingProfessional = ref({});

const showServiceForm = ref(false);
const editingService = ref({});

const onEditClient = async (id) => {
  try {
    const response = await clientService.getById(id);
    editingClient.value = response.data;
    showClientForm.value = true;
  } catch (e) {
    console.error("Failed to fetch client for editing", e);
    confirmBridge.alert({
      title: 'Erro ao Carregar',
      message: 'Não foi possível carregar os dados do cliente.',
      type: 'danger'
    });
  }
};

const onClientSaved = async (updatedClientData) => {
  try {
    const isNew = !updatedClientData.id;
    let savedClient;
    if (isNew) {
      const res = await clientService.create(updatedClientData);
      savedClient = res.data;
    } else {
      const res = await clientService.update(updatedClientData.id, updatedClientData);
      savedClient = res.data;
    }
    form.value.client.name = savedClient.name;
    showClientForm.value = false;
  } catch (e) {
    console.error("Failed to save client", e);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Não foi possível salvar os dados do cliente.',
      type: 'danger'
    });
  }
};

const onEditProfessional = async (id) => {
  try {
    const response = await professionalService.getById(id);
    editingProfessional.value = response.data;
    showProfessionalForm.value = true;
  } catch (e) {
    console.error("Failed to fetch professional", e);
    confirmBridge.alert({
      title: 'Erro ao Carregar',
      message: 'Não foi possível carregar os dados do profissional.',
      type: 'danger'
    });
  }
};

const onProfessionalSaved = async (data) => {
  try {
    const isNew = !data.id;
    let saved;
    if (isNew) {
      const res = await professionalService.create(data);
      saved = res.data;
    } else {
      const res = await professionalService.update(data.id, data);
      saved = res.data;
    }
    form.value.professional.name = saved.name;
    showProfessionalForm.value = false;
  } catch (e) {
    console.error("Failed to save professional", e);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Não foi possível salvar os dados do profissional.',
      type: 'danger'
    });
  }
};

const onEditService = async (id) => {
  try {
    const response = await serviceService.getById(id);
    editingService.value = response.data;
    showServiceForm.value = true;
  } catch (e) {
    console.error("Failed to fetch service", e);
    confirmBridge.alert({
      title: 'Erro ao Carregar',
      message: 'Não foi possível carregar os dados do serviço.',
      type: 'danger'
    });
  }
};

const onServiceSaved = async (data) => {
  try {
    const isNew = !data.id;
    let saved;
    if (isNew) {
      const res = await serviceService.create(data);
      saved = res.data;
    } else {
      const res = await serviceService.update(data.id, data);
      saved = res.data;
    }
    form.value.service.name = saved.name;
    if (saved.price) form.value.price = saved.price;
    if (saved.durationMinutes) {
      selectedServiceDuration.value = saved.durationMinutes;
      calculateEndTime();
    }
    showServiceForm.value = false;
  } catch (e) {
    console.error("Failed to save service", e);
    confirmBridge.alert({
      title: 'Erro ao Salvar',
      message: 'Não foi possível salvar os dados do serviço.',
      type: 'danger'
    });
  }
};
</script>
