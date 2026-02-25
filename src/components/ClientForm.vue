<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ form.id ? 'Editar Cliente' : 'Novo Cliente' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body-tabs">
        <form @submit.prevent="save">
          <TabView>
            <TabPanel header="Dados Gerais">
              <div class="form-body">
                <div class="form-group autocomplete-container">
                  <label>Nome</label>
                  <input v-model="form.name" class="form-control" required type="text"
                         autocomplete="off"
                         @input="onNameInput"
                         @focus="() => { if(searchQueryResults.length > 0) showSearchResults = true; }"
                         @blur="hideSearchResults"/>
                  
                  <!-- Dropdown Results -->
                  <div v-if="showSearchResults && searchQueryResults.length > 0" class="lookup-results">
                    <div v-for="item in searchQueryResults" :key="item.id" 
                         class="lookup-item" 
                         @mousedown.prevent="selectExistingClient(item)">
                      <span class="item-name">{{ item.name }}</span>
                      <span class="item-phone" v-if="item.phone">{{ formatPhone(item.phone) }}</span>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Email</label>
                  <input v-model="form.email" class="form-control" type="email" inputmode="email"/>
                </div>

                <div class="form-group">
                  <label>Telefone</label>
                  <input v-model="form.phone" class="form-control" maxlength="15" placeholder="(DD) 99999-9999"
                         type="tel" inputmode="tel" @input="onPhoneInput"/>
                </div>

                <div class="form-group">
                  <label>Data de Nascimento</label>
                  <input v-model="form.birthday" class="form-control" type="date" :max="maxDate"/>
                </div>

                <div class="form-group">
                  <label>Observações</label>
                  <input v-model="form.notes" class="form-control" type="text"/>
                </div>

                <div class="form-group">
                  <label>Indicado Por</label>
                  <BaseLookup
                      v-model="form.referredById"
                      :initial-description="form.referredByName"
                      :search-service="clientService"
                      placeholder="Selecione o cliente que indicou"
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Dados Pessoais">
              <div class="form-body">
                <div class="form-group">
                  <label>Gênero</label>
                  <select v-model="form.personalData.gender" class="form-control">
                    <option :value="null">Selecione</option>
                    <option value="FEMALE">Feminino</option>
                    <option value="MALE">Masculino</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Endereço Completo</label>
                  <input v-model="form.personalData.address" class="form-control" type="text"/>
                </div>
                <div class="form-group">
                  <label>Objetivo Principal</label>
                  <select v-model="form.personalData.primaryObjective" class="form-control mb-2">
                    <option :value="null">Selecione o objetivo</option>
                    <option value="SKIN_CLEANING">Limpeza de Pele</option>
                    <option value="EYEBROW_DESIGN">Design de Sobrancelhas</option>
                    <option value="MICROPIGMENTATION">Micropigmentação (Lábios / Olhos / Sobrancelhas)</option>
                    <option value="PEELING">Peeling</option>
                    <option value="BROW_LAMINATION">Brow Lamination</option>
                    <option value="LASH_LIFTING">Lash Lifting</option>
                    <option value="MICRONEEDLING">Microagulhamento</option>
                    <option value="OTHER">Outro</option>
                  </select>
                  <input v-if="form.personalData.primaryObjective === 'OTHER'" 
                         v-model="form.personalData.primaryObjectiveOtherDetails" 
                         class="form-control" 
                         type="text" 
                         placeholder="Descreva qual o objetivo principal"/>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Condições de Saúde">
              <div class="form-body p-4 grid gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="pregnantOrNursing" v-model="form.healthConditions.pregnantOrNursing" />
                  <label for="pregnantOrNursing">Está grávida ou amamentando?</label>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="hasAllergies" v-model="form.healthConditions.hasAllergies" />
                    <label for="hasAllergies">Possui alergias conhecidas?</label>
                  </div>
                  <input v-if="form.healthConditions.hasAllergies" v-model="form.healthConditions.allergiesDetails" class="form-control ml-6" type="text" placeholder="Quais?"/>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="hasSkinConditions" v-model="form.healthConditions.hasSkinConditions" />
                    <label for="hasSkinConditions">Possui problemas de pele (rosácea, dermatite, psoríase, etc.)?</label>
                  </div>
                  <input v-if="form.healthConditions.hasSkinConditions" v-model="form.healthConditions.skinConditionsDetails" class="form-control ml-6" type="text" placeholder="Quais?"/>
                </div>

                <div class="flex items-center gap-2">
                  <input type="checkbox" id="hasChronicConditions" v-model="form.healthConditions.hasChronicConditions" />
                  <label for="hasChronicConditions">Tem diabetes, hipertensão ou outra condição crônica?</label>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="usesContinuousMedication" v-model="form.healthConditions.usesContinuousMedication" />
                    <label for="usesContinuousMedication">Faz uso de medicamentos contínuos?</label>
                  </div>
                  <input v-if="form.healthConditions.usesContinuousMedication" v-model="form.healthConditions.continuousMedicationDetails" class="form-control ml-6" type="text" placeholder="Quais?"/>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="usesAcidsOrAntibiotics" v-model="form.healthConditions.usesAcidsOrAntibiotics" />
                    <label for="usesAcidsOrAntibiotics">Está usando ácidos, antibióticos ou isotretinoína (Roacutan)?</label>
                  </div>
                  <input v-if="form.healthConditions.usesAcidsOrAntibiotics" v-model="form.healthConditions.acidsOrAntibioticsDetails" class="form-control ml-6" type="text" placeholder="Quais?"/>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" id="hadRecentProcedures" v-model="form.healthConditions.hadRecentProcedures" />
                    <label for="hadRecentProcedures">Realizou cirurgias ou procedimentos estéticos recentes?</label>
                  </div>
                  <input v-if="form.healthConditions.hadRecentProcedures" v-model="form.healthConditions.recentProceduresDetails" class="form-control ml-6" type="text" placeholder="Quais?"/>
                </div>
              </div>
            </TabPanel>

            <TabPanel header="Hábitos">
              <div class="form-body p-4 grid gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="sunscreenDaily" v-model="form.personalHabits.sunscreenDaily" />
                  <label for="sunscreenDaily">Usa protetor solar diariamente</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="makeupDaily" v-model="form.personalHabits.makeupDaily" />
                  <label for="makeupDaily">Costuma se maquiar todos os dias</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="skincareRoutine" v-model="form.personalHabits.skincareRoutine" />
                  <label for="skincareRoutine">Tem rotina de skincare (limpeza, hidratação, etc.)</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" id="prescribedProducts" v-model="form.personalHabits.prescribedProducts" />
                  <label for="prescribedProducts">Usa produtos manipulados ou prescritos por dermatologista</label>
                </div>
              </div>
            </TabPanel>

            <TabPanel v-if="form.id" header="Histórico">
              <div class="history-tab">
                <SaleList :client-id="form.id" :embedded="true"/>
              </div>
            </TabPanel>
          </TabView>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="$emit('close')">Cancelar</button>
            <button class="btn btn-primary" type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, defineProps, defineEmits, onMounted} from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import BaseLookup from './common/BaseLookup.vue';
import SaleList from './SaleList.vue';
import {clientService} from '../services/clientService';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';
import {formatPhone} from '../utils/formatters';

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const maxDate = new Date().toISOString().split('T')[0];

const form = ref({
  id: null,
  name: '',
  email: '',
  phone: '',
  birthday: '',
  notes: '',
  referredById: null,
  personalData: {
    gender: null,
    address: '',
    primaryObjective: null,
    primaryObjectiveOtherDetails: '',
  },
  healthConditions: {
    pregnantOrNursing: false,
    hasAllergies: false,
    allergiesDetails: '',
    hasSkinConditions: false,
    skinConditionsDetails: '',
    hasChronicConditions: false,
    usesContinuousMedication: false,
    continuousMedicationDetails: '',
    usesAcidsOrAntibiotics: false,
    acidsOrAntibioticsDetails: '',
    hadRecentProcedures: false,
    recentProceduresDetails: '',
  },
  personalHabits: {
    sunscreenDaily: false,
    makeupDaily: false,
    skincareRoutine: false,
    prescribedProducts: false,
  },
});

// Auto-complete logic
const searchQueryResults = ref([]);
const showSearchResults = ref(false);
let searchTimeout = null;

const onNameInput = () => {
  if (form.value.id) return; // Only search in new mode
  
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (!form.value.name || form.value.name.length < 2) {
    searchQueryResults.value = [];
    showSearchResults.value = false;
    return;
  }

  showSearchResults.value = true;
  searchTimeout = setTimeout(async () => {
    try {
      const response = await clientService.getAll({ page: 0, size: 5, name: form.value.name });
      if (response.data && response.data.content) {
         searchQueryResults.value = response.data.content;
      }
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  }, 300);
};

const hideSearchResults = () => {
  setTimeout(() => { showSearchResults.value = false; }, 200);
};

const selectExistingClient = async (item) => {
  try {
    const response = await clientService.getById(item.id);
    if (response.data) {
       populateForm({...response.data});
    }
  } catch(e) {
    console.error('Failed to load full client:', e);
  } finally {
    showSearchResults.value = false;
    searchQueryResults.value = [];
  }
};

const populateForm = (clientData) => {
  let initialPrimaryObjective = null;
  let initialPrimaryObjectiveOtherDetails = '';

  if (clientData.personalData?.primaryObjective) {
    const validEnums = [
      'SKIN_CLEANING', 'EYEBROW_DESIGN', 'MICROPIGMENTATION',
      'PEELING', 'BROW_LAMINATION', 'LASH_LIFTING', 'MICRONEEDLING'
    ];
    
    if (validEnums.includes(clientData.personalData.primaryObjective)) {
      initialPrimaryObjective = clientData.personalData.primaryObjective;
    } else {
      initialPrimaryObjective = 'OTHER';
      initialPrimaryObjectiveOtherDetails = clientData.personalData.primaryObjective;
    }
  }

  form.value = {
    ...clientData,
    birthday: clientData.birthday || '',
    personalData: {
      address: clientData.personalData?.address || '',
      gender: clientData.personalData?.gender || null,
      primaryObjective: initialPrimaryObjective,
      primaryObjectiveOtherDetails: initialPrimaryObjectiveOtherDetails,
    },
    healthConditions: clientData.healthConditions || {
      pregnantOrNursing: false,
      hasAllergies: false,
      allergiesDetails: '',
      hasSkinConditions: false,
      skinConditionsDetails: '',
      hasChronicConditions: false,
      usesContinuousMedication: false,
      continuousMedicationDetails: '',
      usesAcidsOrAntibiotics: false,
      acidsOrAntibioticsDetails: '',
      hadRecentProcedures: false,
      recentProceduresDetails: '',
    },
    personalHabits: clientData.personalHabits || {
      sunscreenDaily: false,
      makeupDaily: false,
      skincareRoutine: false,
      prescribedProducts: false,
    },
  };
};

onMounted(() => {
  if (props.client.id) {
    populateForm(props.client);
  }
});

const save = () => {
  const payload = { ...form.value };
  
  if (payload.personalData.primaryObjective === 'OTHER') {
    payload.personalData.primaryObjective = payload.personalData.primaryObjectiveOtherDetails;
  }
  
  // Clean up the temporary UI-only variable before sending to API
  delete payload.personalData.primaryObjectiveOtherDetails;

  emit('save', payload);
};

const onPhoneInput = (event) => {
  const formatted = formatPhone(event.target.value);
  form.value.phone = formatted;
  // Force update in case v-model hasn't caught up because value didn't change enough?
  // Actually v-model should handle it if we update form.value.phone,
  // but sometimes input cursor jumps.
  // For direct input control:
  event.target.value = formatted;
};
</script>

<style scoped>
/* Component-specific overrides and layout */
.modal-content {
  max-width: 800px;
  max-height: 90vh;
}

.autocomplete-container {
  position: relative;
}

.lookup-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 4px;
}

.lookup-item {
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--color-text-main);
}

.lookup-item:hover {
  background-color: var(--color-bg-body);
}

.item-name {
  font-weight: 500;
}

.item-phone {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.modal-body-tabs {
  flex: 1;
  overflow-y: auto;
}

.history-tab {
  padding-top: var(--spacing-md);
}
</style>
