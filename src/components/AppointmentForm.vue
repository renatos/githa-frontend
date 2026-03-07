<template>
  <div class="fixed inset-0 z-[1050] bg-slate-900/50 flex items-center justify-center p-4 backdrop-blur-sm" @click.self="$emit('close')">
    <div class="bg-[var(--color-bg-card)] dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-[640px] flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 dark:border-slate-700">

      <header class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex-shrink-0 bg-[var(--color-bg-body)] dark:bg-slate-800/50">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[24px] text-slate-900 dark:text-slate-100">calendar_month</span>
          <div class="flex flex-col">
            <h2 class="text-lg font-bold leading-tight m-0 text-slate-900 dark:text-slate-100">
              {{ appointment.id ? 'Editar Agendamento' : 'Novo Agendamento' }}
            </h2>
            <span v-if="subtitleTimestamp" class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
              {{ subtitleTimestamp }}
            </span>
          </div>
        </div>
        <button class="flex cursor-pointer items-center justify-center rounded-lg w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors" @click="$emit('close')">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </header>

      <div class="flex flex-col flex-1 overflow-hidden">
        <form @submit.prevent="save" class="flex flex-col h-full">
          <div class="overflow-y-auto px-6 py-6 pb-8 flex-1 bg-transparent dark:bg-slate-900/50">
            <div class="flex flex-col gap-4">

              <!-- Transaction link badge -->
              <div v-if="form.transactionId" class="flex justify-center">
                <button type="button"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors cursor-pointer"
                        @click="navigateToTransaction">
                  <span class="material-symbols-outlined text-[14px]">link</span>
                  Vinculado à Transação #{{ form.transactionId }}
                </button>
              </div>

              <!-- Cliente / Profissional / Serviço -->
              <label class="flex flex-col">
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
              </label>

              <div class="flex flex-col gap-5">
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Profissional</p>
                  <BaseLookup
                      v-model="form.professional.id"
                      :disabled="!canSave"
                      :initial-description="form.professional.name"
                      :search-service="professionalService"
                      placeholder="Pesquisar Profissional..."
                      @edit="onEditProfessional"
                      @select="(item) => form.professional.name = item?.name"
                  />
                </label>

                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Serviço</p>
                  <BaseLookup
                      v-model="form.service.id"
                      :disabled="!canSave"
                      :initial-description="form.service.name"
                      :search-service="serviceService"
                      placeholder="Pesquisar Serviço..."
                      @edit="onEditService"
                      @select="onServiceSelect"
                  />
                </label>
              </div>

              <!-- Valor / Desconto / Valor Final -->
              <div class="grid grid-cols-3 gap-4">
                <label class="flex flex-col col-span-1">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Valor</p>
                  <CurrencyInput v-model="form.price" :disabled="!canSave"/>
                </label>
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Desconto (%)</p>
                  <input v-model="form.discount" :disabled="!canSave"
                         class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
                         placeholder="0" step="0.01" type="number"/>
                </label>
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Valor Final</p>
                  <input :value="formatCurrency(finalPrice)"
                         class="form-input flex w-full rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 h-11 px-4 text-base"
                         disabled type="text"/>
                </label>
              </div>

              <!-- Data / Início / Fim -->
              <div class="grid grid-cols-3 gap-4">
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Data</p>
                  <input v-model="form.date" :disabled="!canSave"
                         class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
                         required type="date"/>
                </label>
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Início</p>
                  <input v-model="form.start" :disabled="!canSave"
                         class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
                         required type="time"/>
                </label>
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Fim</p>
                  <input v-model="form.end" :disabled="!canSave"
                         class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
                         required type="time" @focus="calculateEndTime"/>
                </label>
              </div>

              <!-- Status -->
              <label class="flex flex-col">
                <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Status</p>
                <select v-model="form.status" :disabled="!canSave"
                        class="form-select flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-11 px-4 text-base transition-colors disabled:opacity-60"
                        required>
                  <option v-for="status in appointmentStatuses" :key="status.name" :value="status.name">
                    {{ status.description }}
                  </option>
                </select>
              </label>

              <!-- Notas -->
              <label class="flex flex-col">
                <p class="text-slate-900 dark:text-slate-100 text-sm font-medium pb-2">Notas</p>
                <textarea v-model="form.notes" :disabled="!canSave"
                          class="form-input flex w-full rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 px-4 py-2 text-base transition-colors disabled:opacity-60 resize-none h-16"
                          rows="2"></textarea>
              </label>

            </div>
          </div>

          <footer class="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-[var(--color-bg-body)] dark:bg-slate-800 flex-shrink-0">
            <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500"
                    type="button" @click="$emit('close')">
              Cancelar
            </button>
            <button :disabled="!canSave" :title="saveTooltip"
                    class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    type="submit">
              Salvar
            </button>
          </footer>
        </form>
      </div>

    </div>

    <!-- Edit Modals (Stacked) -->
    <ClientForm
        v-if="showClientForm"
        :client="editingClient"
        @close="showClientForm = false"
        @save="onClientSaved"
    />
    <ProfessionalForm
        v-if="showProfessionalForm"
        :professional="editingProfessional"
        @close="showProfessionalForm = false"
        @save="onProfessionalSaved"
    />
    <ServiceForm
        v-if="showServiceForm"
        :service="editingService"
        @close="showServiceForm = false"
        @save="onServiceSaved"
    />
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted, computed, watch} from 'vue';
import {useRouter} from 'vue-router';
import {appointmentService} from '../services/appointmentService';
import {clientService} from '../services/clientService';
import {professionalService} from '../services/professionalService';
import {serviceService} from '../services/serviceService';
import {authService} from '../services/authService';
import {enumService} from '../services/enumService';
import BaseLookup from './common/BaseLookup.vue';
import { confirmBridge } from '../services/confirmBridge';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';
import CurrencyInput from './common/CurrencyInput.vue';
import ClientForm from './ClientForm.vue';
import ProfessionalForm from './ProfessionalForm.vue';
import ServiceForm from './ServiceForm.vue';

const props = defineProps({
  appointment: {
    type: Object,
    default: () => ({}),
  },
  clientId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const router = useRouter();
const isAdmin = ref(false);

const form = ref({
  client: {id: '', name: ''},
  professional: {id: '', name: ''},
  service: {id: '', name: ''},
  date: '',
  start: '',
  end: '',
  status: 'SCHEDULED',
  notes: '',
  price: 0,
  discount: 0,
  transactionId: null
});

const originalStatus = ref('');
const appointmentStatuses = ref([]);

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

const finalPrice = computed(() => {
  const p = parseFloat(form.value.price) || 0;
  const d = parseFloat(form.value.discount) || 0;
  return p - (p * d / 100);
});

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(value);
};

const subtitleTimestamp = computed(() => {
  if (!form.value.date || !form.value.start) return '';
  try {
    const [year, month, day] = form.value.date.split('-');
    const [hour, minute] = form.value.start.split(':');
    const dateObj = new Date(year, month - 1, day, hour, minute);
    
    // Create 'quinta-feira'
    const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dateObj);
    return `${dayOfWeek.replace('-feira', ' feira')} às ${hour}:${minute}`;
  } catch (e) {
    return '';
  }
});

onMounted(() => {
  if (props.appointment.id || props.appointment.startTime) {
    const apt = {...props.appointment};
    originalStatus.value = apt.status;

    if (apt.startTime) {
      form.value.date = apt.startTime.split('T')[0];
      form.value.start = apt.startTime.split('T')[1].substring(0, 5);
    }
    if (apt.endTime) {
      form.value.end = apt.endTime.split('T')[1].substring(0, 5);
    }

    if (!apt.client) apt.client = {id: apt.clientId || '', name: apt.clientName || ''};
    else {
      apt.client.id = apt.clientId || apt.client.id;
      if (!apt.client.name) apt.client.name = apt.clientName || '';
    }

    if (!apt.professional) apt.professional = {id: apt.professionalId || '', name: apt.professionalName || ''};
    else {
      apt.professional.id = apt.professionalId || apt.professional.id;
      if (!apt.professional.name) apt.professional.name = apt.professionalName || '';
    }

    if (!apt.service) apt.service = {id: apt.serviceId || '', name: apt.serviceName || ''};
    else {
      apt.service.id = apt.serviceId || apt.service.id;
      if (!apt.service.name) apt.service.name = apt.serviceName || '';
    }

    form.value = {...form.value, ...apt};

    if (!apt.id) {
      form.value.status = 'SCHEDULED';
      form.value.id = null;
    }

    if (!form.value.client.id && apt.clientId) form.value.client.id = apt.clientId;
    if (apt.transactionId) form.value.transactionId = apt.transactionId;
  }

  checkUserRole();
  loadStatuses();
});

onMounted(async () => {
  if (props.appointment.id) {
    try {
      const response = await appointmentService.getById(props.appointment.id);
      const fullApt = response.data;
      if (fullApt) {
        form.value.transactionId = fullApt.transactionId;
      }
    } catch (e) {
      console.error("Failed to fetch appointment details", e);
    }

    if (form.value.service.id) {
      try {
        const response = await serviceService.getById(form.value.service.id);
        if (response) {
          selectedServiceDuration.value = response.durationMinutes || 0;
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

const selectedServiceDuration = ref(0);

const calculateEndTime = () => {
  if (!form.value.start || !selectedServiceDuration.value) return;
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

watch(() => form.value.start, () => {
  calculateEndTime();
});

const save = () => {
  const toISOString = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };
  const dto = {
    id: form.value.id,
    clientId: form.value.client?.id || null,
    professionalId: form.value.professional?.id || null,
    serviceId: form.value.service?.id || null,
    startTime: toISOString(form.value.date, form.value.start),
    endTime: toISOString(form.value.date, form.value.end),
    status: form.value.status,
    notes: form.value.notes,
    price: form.value.price,
    discount: form.value.discount
  };
  emit('save', dto);
};

const navigateToTransaction = () => {
  if (form.value.transactionId) {
    emit('close');
    router.push({path: '/financials', query: {highlight: form.value.transactionId}});
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
