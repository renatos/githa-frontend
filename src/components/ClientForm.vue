<template>
  <BaseModal
    :show="true"
    title="Cliente"
    @close="$emit('close')"
    maxWidth="max-w-4xl"
    :bodyPadding="false"
  >
    <template #header-content>
      <div class="flex items-center gap-4 min-w-0">
        <span class="material-symbols-outlined text-[24px] shrink-0"
              :class="form.personalData?.gender === 'FEMALE' ? 'text-pink-400' : form.personalData?.gender === 'MALE' ? 'text-blue-400' : 'text-slate-900 dark:text-slate-100'">person_edit</span>
        <div class="min-w-0">
          <h2 class="text-lg font-bold leading-tight tracking-[-0.015em] m-0 text-slate-900 dark:text-slate-100 truncate">
            {{ form.id ? firstName : 'Novo Cliente' }}
          </h2>
          <div v-if="form.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span v-if="clientAge" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">cake</span>
              {{ clientAge }} anos
            </span>
            <span v-if="clientSince" class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">calendar_month</span>
              Cliente desde {{ clientSince }}
            </span>
            <span v-if="form.status" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                  :class="headerStatusClass">
              <span class="w-1.5 h-1.5 rounded-full" :class="headerStatusDotClass"></span>
              {{ headerStatusLabel }}
            </span>
          </div>
        </div>
      </div>
    </template>

    <template #sub-header>
      <!-- Tabs Navigation -->
      <div class="border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div class="flex flex-wrap px-4 md:px-6 gap-1 md:gap-6">
          <a v-for="(tab, index) in tabs" :key="index"
             @click.prevent="!tab.disabled && (activeTab = index)"
             :title="tab.disabled ? 'Salve o cliente primeiro para acessar esta aba' : ''"
             :class="[
               tab.disabled
                 ? 'border-b-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                 : activeTab === index 
                   ? 'border-b-indigo-600 text-slate-900 dark:text-slate-100' 
                   : 'border-b-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
               'flex items-center justify-center border-b-[3px] px-3 md:px-1 pb-3 pt-4 transition-colors whitespace-nowrap',
               tab.disabled ? '' : 'cursor-pointer'
             ]">
            <p class="text-xs md:text-sm font-bold leading-normal tracking-[0.015em] flex items-center gap-1">
              {{ tab.label }}
              <span v-if="tab.disabled" class="material-symbols-outlined text-[14px]">lock</span>
            </p>
          </a>
        </div>
      </div>
    </template>

    <form @submit.prevent="save" id="clientForm" class="flex flex-col h-full">
          
          
          <!-- Tab Content -->
          <div class="p-6 flex-1 bg-transparent dark:bg-slate-900/50">
            <!-- Tab 0: Dados Gerais -->
            <div v-show="activeTab === 0" class="pb-32">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label class="flex flex-col autocomplete-container md:col-span-2">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Nome</p>
                  <input v-model="form.name" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" required type="text"
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
                </label>

                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Email</p>
                  <input v-model="form.email" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" type="email" inputmode="email"/>
                </label>

                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Telefone</p>
                  <input v-model="form.phone" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" maxlength="15" placeholder="(DD) 99999-9999"
                         type="tel" inputmode="tel" @input="onPhoneInput"/>
                </label>

                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Data de Nascimento</p>
                  <input v-model="form.birthday" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" type="date" :max="maxDate"/>
                </label>

                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Observações</p>
                  <input v-model="form.notes" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" type="text"/>
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
            </div>
            
            <!-- Tab 1: Dados Pessoais -->
            <div v-show="activeTab === 1">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Gênero</p>
                  <select v-model="form.personalData.gender" class="form-select flex w-full max-w-full truncate resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors">
                    <option :value="null">Selecione</option>
                    <option v-for="gender in genders" :key="gender.name" :value="gender.name">
                      {{ gender.description }}
                    </option>
                  </select>
                </label>
                
                <label class="flex flex-col">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Objetivo Principal</p>
                  <select v-model="form.personalData.primaryObjective" class="form-select flex w-full max-w-full truncate resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" :class="{ 'mb-2': form.personalData.primaryObjective === 'OTHER' }">
                    <option :value="null">Selecione o objetivo</option>
                    <option v-for="objective in primaryObjectives" :key="objective.name" :value="objective.name">
                      {{ objective.description }}
                    </option>
                  </select>
                  <input v-if="form.personalData.primaryObjective === 'OTHER'" 
                         v-model="form.personalData.primaryObjectiveOtherDetails" 
                         class="form-input flex w-full resize-none overflow-hidden mt-3 rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" 
                         type="text" 
                         placeholder="Descreva qual o objetivo principal"/>
                </label>

                <label class="flex flex-col md:col-span-2">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal pb-2">Endereço Completo</p>
                  <input v-model="form.personalData.address" class="form-input flex w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 h-12 px-4 py-3 text-base font-normal leading-normal transition-colors" type="text" placeholder="Insira o endereço completo"/>
                </label>
              </div>
            </div>

            
            <!-- Tab 2: Condições de Saúde -->
            <div v-show="activeTab === 2">
              <div class="p-2 grid grid-cols-1 gap-4">
                
                <!-- Está grávida ou amamentando? -->
                <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
                     :class="form.healthConditions.pregnantOrNursing ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Está grávida ou amamentando?</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="pregnantOrNursing" v-model="form.healthConditions.pregnantOrNursing" />
                  </label>
                </div>

                <!-- Alergias -->
                <div class="flex flex-col gap-3 p-4 rounded-lg transition-colors border"
                     :class="form.healthConditions.hasAllergies ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 border-l-4 border-l-indigo-600' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Possui alergias conhecidas?</p>
                    <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                      <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                      <input class="invisible absolute" type="checkbox" id="hasAllergies" v-model="form.healthConditions.hasAllergies" />
                    </label>
                  </div>
                  <div class="w-full mt-1" v-if="form.healthConditions.hasAllergies">
                    <input v-model="form.healthConditions.allergiesDetails" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow" type="text" placeholder="Descreva as alergias..."/>
                  </div>
                </div>

                <!-- Problemas de pele -->
                <div class="flex flex-col gap-3 p-4 rounded-lg transition-colors border"
                     :class="form.healthConditions.hasSkinConditions ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 border-l-4 border-l-indigo-600' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Possui problemas de pele (rosácea, dermatite, psoríase, etc.)?</p>
                    <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                      <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                      <input class="invisible absolute" type="checkbox" id="hasSkinConditions" v-model="form.healthConditions.hasSkinConditions" />
                    </label>
                  </div>
                  <div class="w-full mt-1" v-if="form.healthConditions.hasSkinConditions">
                    <input v-model="form.healthConditions.skinConditionsDetails" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow" type="text" placeholder="Quais?"/>
                  </div>
                </div>

                <!-- Doenças crônicas -->
                <div class="flex items-center justify-between gap-4 p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Tem diabetes, hipertensão ou outra condição crônica?</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="hasChronicConditions" v-model="form.healthConditions.hasChronicConditions" />
                  </label>
                </div>

                <!-- Medicamentos contínuos -->
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" :class="{ 'border-l-4 border-l-indigo-600': form.healthConditions.usesContinuousMedication }">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Faz uso de medicamentos contínuos?</p>
                    <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                      <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                      <input class="invisible absolute" type="checkbox" id="usesContinuousMedication" v-model="form.healthConditions.usesContinuousMedication" />
                    </label>
                  </div>
                  <div class="w-full mt-1" v-if="form.healthConditions.usesContinuousMedication">
                    <input v-model="form.healthConditions.continuousMedicationDetails" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow" type="text" placeholder="Quais?"/>
                  </div>
                </div>

                <!-- Ácidos e Antibióticos -->
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" :class="{ 'border-l-4 border-l-indigo-600': form.healthConditions.usesAcidsOrAntibiotics }">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Está usando ácidos, antibióticos ou isotretinoína (Roacutan)?</p>
                    <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                      <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                      <input class="invisible absolute" type="checkbox" id="usesAcidsOrAntibiotics" v-model="form.healthConditions.usesAcidsOrAntibiotics" />
                    </label>
                  </div>
                  <div class="w-full mt-1" v-if="form.healthConditions.usesAcidsOrAntibiotics">
                    <input v-model="form.healthConditions.acidsOrAntibioticsDetails" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow" type="text" placeholder="Quais?"/>
                  </div>
                </div>

                <!-- Cirurgias Recentes -->
                <div class="flex flex-col gap-3 p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700" :class="{ 'border-l-4 border-l-indigo-600': form.healthConditions.hadRecentProcedures }">
                  <div class="flex items-center justify-between gap-4">
                    <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Realizou cirurgias ou procedimentos estéticos recentes?</p>
                    <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                      <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                      <input class="invisible absolute" type="checkbox" id="hadRecentProcedures" v-model="form.healthConditions.hadRecentProcedures" />
                    </label>
                  </div>
                  <div class="w-full mt-1" v-if="form.healthConditions.hadRecentProcedures">
                    <input v-model="form.healthConditions.recentProceduresDetails" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-1 focus:ring-indigo-600 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 h-10 placeholder:text-slate-400 px-3 text-sm font-normal leading-normal transition-shadow" type="text" placeholder="Quais?"/>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 3: Hábitos -->
            <div v-show="activeTab === 3">
              <div class="p-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
                     :class="form.personalHabits.sunscreenDaily ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Usa protetor solar diariamente</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="sunscreenDaily" v-model="form.personalHabits.sunscreenDaily" />
                  </label>
                </div>

                <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
                     :class="form.personalHabits.makeupDaily ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Costuma se maquiar todos os dias</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="makeupDaily" v-model="form.personalHabits.makeupDaily" />
                  </label>
                </div>

                <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
                     :class="form.personalHabits.skincareRoutine ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Tem rotina de skincare</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="skincareRoutine" v-model="form.personalHabits.skincareRoutine" />
                  </label>
                </div>

                <div class="flex items-center justify-between gap-4 p-4 rounded-lg transition-colors border"
                     :class="form.personalHabits.prescribedProducts ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700' : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'">
                  <p class="text-slate-900 dark:text-slate-100 text-sm font-medium leading-normal">Usa prescrição/manipulados</p>
                  <label class="relative flex h-6 w-11 cursor-pointer items-center rounded-full border-none bg-slate-300 dark:bg-slate-600 p-1 has-[:checked]:justify-end has-[:checked]:bg-indigo-600 transition-colors">
                    <div class="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"></div>
                    <input class="invisible absolute" type="checkbox" id="prescribedProducts" v-model="form.personalHabits.prescribedProducts" />
                  </label>
                </div>
              </div>
            </div>

            <!-- Tab 4: Anamneses -->
            <div v-if="form.id" v-show="activeTab === 4">
              <div class="anamneses-tab">
                <AnamnesisList
                  ref="anamnesesList"
                  :client-id="form.id"
                  :client-data="form"
                  @new="(cData) => openAnamnesisModal(null, false, cData)"
                  @view="(entity) => openAnamnesisModal(entity, true)"
                />
              </div>
            </div>

            <!-- Tab 5: Histórico -->
            <div v-if="form.id" v-show="activeTab === 5">
              <div class="history-tab">
                <SaleList :client-id="form.id" :embedded="true"/>
              </div>
            </div>
          </div>
          
        </form>

      <template #footer>
        <button class="px-5 py-2.5 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-500" type="button" @click="$emit('close')">
          Cancelar
        </button>
        <button form="clientForm" class="px-5 py-2.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" type="submit">
          Salvar
        </button>
      </template>
    </BaseModal>

    <!-- Modals -->
    <AnamnesisFormModal
      v-if="showAnamnesisModal"
      :client-id="form.id"
      :entity="editingAnamnesis"
      :client-data="anamnesisClientData"
      :readonly="readonlyAnamnesis"
      @close="closeAnamnesisModal"
      @save="onAnamnesisSaved"
    />
</template>

<script setup>
import {ref, onMounted, computed} from 'vue';
import BaseModal from './common/BaseModal.vue';
import BaseLookup from './common/BaseLookup.vue';
import SaleList from './SaleList.vue';
import AnamnesisList from './anamnesis/AnamnesisList.vue';
import AnamnesisFormModal from './anamnesis/AnamnesisFormModal.vue';
import {clientService} from '../services/clientService';
import {enumService} from '../services/enumService';
import {useModal} from '../composables/useModal';
import {useEscapeKey} from '../composables/useEscapeKey';
import {formatPhone} from '../utils/formatters';

const activeTab = ref(0);

const tabs = computed(() => {
  const isNew = !form.value.id;
  return [
    { label: 'Dados Gerais' },
    { label: 'Dados Pessoais' },
    { label: 'Condições de Saúde' },
    { label: 'Hábitos' },
    { label: 'Anamneses', disabled: isNew },
    { label: 'Histórico', disabled: isNew }
  ];
});

const props = defineProps({
  client: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);

const maxDate = new Date().toISOString().split('T')[0];

const firstName = computed(() => {
  if (!form.value.name) return 'Editar Cliente';
  return form.value.name.split(' ')[0];
});

const clientAge = computed(() => {
  if (!form.value.birthday) return null;
  const birth = new Date(form.value.birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
});

const clientSince = computed(() => {
  const d = form.value.createdAt;
  if (!d) return null;
  const date = new Date(d);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${months[date.getMonth()]}/${date.getFullYear()}`;
});

const headerStatusClass = computed(() => {
  const map = {
    VIP: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    AT_RISK: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    NEW: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
  };
  return map[form.value.status] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
});

const headerStatusDotClass = computed(() => {
  const map = { VIP: 'bg-emerald-500', AT_RISK: 'bg-red-500', NEW: 'bg-sky-500' };
  return map[form.value.status] || 'bg-slate-400';
});

const headerStatusLabel = computed(() => {
  const map = { VIP: 'VIP', AT_RISK: 'Em Risco', NEW: 'Novo', ACTIVE: 'Ativo' };
  return map[form.value.status] || form.value.status;
});

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

// Anamnesis Modal State
const anamnesesList = ref(null);
const showAnamnesisModal = ref(false);
const editingAnamnesis = ref(null);
const readonlyAnamnesis = ref(false);
const anamnesisClientData = ref(null);

const genders = ref([]);
const primaryObjectives = ref([]);

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

onMounted(async () => {
  try {
    genders.value = await enumService.getOptions('Gender');
    primaryObjectives.value = await enumService.getOptions('PrimaryObjective');
  } catch (error) {
    console.error('Failed to load enum options', error);
  }

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

// Anamnesis methods
const openAnamnesisModal = (entity = null, readonly = false, clientDataArg = null) => {
  editingAnamnesis.value = entity;
  readonlyAnamnesis.value = readonly;
  // If no clientDataArg is passed but we have form.value, use form.value
  anamnesisClientData.value = clientDataArg || form.value;
  showAnamnesisModal.value = true;
};

const closeAnamnesisModal = () => {
  showAnamnesisModal.value = false;
  editingAnamnesis.value = null;
  readonlyAnamnesis.value = false;
};

const onAnamnesisSaved = () => {
  closeAnamnesisModal();
  if (anamnesesList.value) {
    anamnesesList.value.refresh();
  }
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
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

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

.lookup-item:hover {
  background-color: #f8fafc;
}

:global(.dark) .lookup-item:hover {
  background-color: #334155;
}

.item-name {
  font-weight: 500;
  color: #0f172a;
}

:global(.dark) .item-name {
  color: #f8fafc;
}

.item-phone {
  font-size: 0.85rem;
  color: #64748b;
}

:global(.dark) .item-phone {
  color: #94a3b8;
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
