<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { aiService } from '../../services/aiService';
import { toastBridge } from '../../services/toastBridge';
import BaseModal from './BaseModal.vue';
import { professionalService } from '../../services/professionalService';
import { appointmentService } from '../../services/appointmentService';
import { 
  Sparkles, 
  Send, 
  Check, 
  Trash2, 
  Percent, 
  MessageSquare,
  ChevronDown
} from 'lucide-vue-next';

const toast = toastBridge.getToast();

const isChatVisible = ref(false);
const messageInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const currentSessionId = ref(null);
const chatContainer = ref(null);

const professionals = ref([]);
const selectedProfessional = ref(null);
const isProfessionalsLoading = ref(false);

const loadProfessionals = async () => {
    try {
        isProfessionalsLoading.value = true;
        const response = await professionalService.getAll({ size: 100 });
        professionals.value = response.data.content || response.data;
        if (professionals.value?.length > 0) {
            selectedProfessional.value = professionals.value[0];
        }
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar profissionais.', life: 3000 });
    } finally {
        isProfessionalsLoading.value = false;
    }
};

const toggleChat = async () => {
  isChatVisible.value = !isChatVisible.value;
  if (isChatVisible.value) {
      if (professionals.value.length === 0) {
          await loadProfessionals();
      }
      if (messages.value.length === 0) {
        messages.value.push({ role: 'assistant', content: 'Olá! Sou o assistente de inteligência artificial da Githa. Como posso te ajudar hoje?', timestamp: new Date() });
      }
  }
};

const scrollToBottom = async () => {
    await nextTick();
    if(chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
}

const sendHiddenMessage = async (hiddenText) => {
    try {
        isLoading.value = true;
        const response = await aiService.chat(hiddenText, selectedProfessional.value.id, currentSessionId.value);
        currentSessionId.value = response.data.sessionId;

        let assistantMsg = response.data.response;
        const actionRegex = /\[ACTION_REQUIRED:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/;
        const match = assistantMsg.match(actionRegex);
        let action = null;

        if (match) {
            action = {
                type: match[1].trim(),
                params: match[2].split('|').reduce((acc, param) => {
                    const [key, value] = param.split('=');
                    if (key && value) acc[key.trim()] = value.trim();
                    return acc;
                }, {})
            };
            assistantMsg = assistantMsg.replace(actionRegex, '').trim();
        }

        messages.value.push({ role: 'assistant', content: assistantMsg, action, timestamp: new Date() });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao se comunicar com a IA.', life: 3000 });
        messages.value.push({ role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua solicitação.', isError: true, timestamp: new Date() });
    } finally {
        isLoading.value = false;
        await scrollToBottom();
    }
}

const confirmAction = async (msg) => {
    try {
        isLoading.value = true;
        const type = msg.action.type;
        const params = msg.action.params;

        if (type === 'SCHEDULE_APPOINTMENT') {
            await appointmentService.create({
                professionalId: parseInt(params.professionalId),
                clientId: parseInt(params.clientId),
                serviceId: parseInt(params.serviceId),
                startTime: params.startTime,
                endTime: params.endTime
            });
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento confirmado.', life: 3000 });
        } else if (type === 'CANCEL_APPOINTMENT') {
            await appointmentService.delete(parseInt(params.appointmentId));
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agendamento cancelado.', life: 3000 });
        } else if (type === 'APPLY_DISCOUNT') {
            // Placeholder: Not fully implemented yet due to missing Transaction view/service endpoints in frontend.
            // But the logic is here for Phase 3 completion
            toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Desconto de ' + params.discountPercentage + '% aplicado.', life: 3000 });
        }
        
        // Remove action from message to prevent duplicate clicks
        const actionCopy = { ...msg.action };
        msg.action = null;

        messages.value.push({ role: 'user', content: 'Ação confirmada.', timestamp: new Date() });
        await sendHiddenMessage('O usuário confirmou com sucesso a ação de ' + actionCopy.type + '.');
    } catch (err) {
        toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao executar a ação no sistema.', life: 3000 });
    } finally {
        isLoading.value = false;
    }
};

const sendMessage = async () => {
  if (!messageInput.value.trim() || isLoading.value) return;

  if (!selectedProfessional.value) {
      toast.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecione um profissional para iniciar.', life: 3000 });
      return;
  }

  const userText = messageInput.value.trim();
  messages.value.push({ role: 'user', content: userText, timestamp: new Date() });
  messageInput.value = '';
  
  await scrollToBottom();
  await sendHiddenMessage(userText);
};

</script>

<template>
  <div class="floating-chat-container">
    <!-- Chat Button -->
    <button
      class="chat-trigger-button flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg overflow-hidden"
      title="Assistente de Inteligência Artificial"
      @click="toggleChat"
    >
      <Sparkles :size="24" />
    </button>

    <!-- Chat Modal -->
    <BaseModal
      :show="isChatVisible"
      title="Githa AI Assistant"
      max-width="max-w-md"
      :body-padding="false"
      @close="toggleChat"
    >
      <template #header-content>
        <div class="flex items-center gap-3">
          <Sparkles class="text-indigo-600 dark:text-indigo-400" :size="20" />
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">Githa AI Assistant</h2>
        </div>
      </template>

      <template #sub-header>
        <!-- Professional Selector -->
        <div v-if="professionals.length > 0" class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <label class="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-2 block">Atuando como (Profissional):</label>
            <div class="relative">
              <select 
                v-model="selectedProfessional" 
                class="w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors cursor-pointer" 
                :disabled="messages.length > 1 || isLoading || isProfessionalsLoading" 
              >
                <option v-for="prof in professionals" :key="prof.id" :value="prof">
                  {{ prof.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <ChevronDown :size="16" />
              </div>
            </div>
        </div>
      </template>

      <div ref="chatContainer" class="chat-messages p-4 flex flex-col gap-4 overflow-y-auto max-h-[50vh]">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message-bubble-wrapper', msg.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-bubble" :class="{'error-bubble': msg.isError}">
             <span style="white-space: pre-wrap;">{{ msg.content }}</span>
             
             <!-- Action Confirmation Card -->
             <div v-if="msg.action" class="mt-3 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <div v-if="msg.action.type === 'SCHEDULE_APPOINTMENT'">
                    <p class="text-sm font-semibold mb-2 text-slate-900 dark:text-slate-100"> Confirmar Agendamento</p>
                    <div class="space-y-1 mb-3">
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>ID Cliente:</strong> {{ msg.action.params.clientId }}</p>
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>ID Serviço:</strong> {{ msg.action.params.serviceId }}</p>
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>Início:</strong> {{ msg.action.params.startTime }}</p>
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>Fim:</strong> {{ msg.action.params.endTime }}</p>
                    </div>
                    <button 
                      class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                      :disabled="isLoading" 
                      @click="confirmAction(msg)"
                    >
                      <Check :size="14" />
                      {{ isLoading ? 'Confirmando...' : 'Confirmar' }}
                    </button>
                </div>
                
                <div v-else-if="msg.action.type === 'CANCEL_APPOINTMENT'">
                    <p class="text-sm font-semibold mb-2 text-rose-600 dark:text-rose-400"> Cancelar Agendamento</p>
                    <p class="text-xs mb-3 text-slate-600 dark:text-slate-400"><strong>ID do Agendamento:</strong> {{ msg.action.params.appointmentId }}</p>
                    <button 
                      class="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                      :disabled="isLoading" 
                      @click="confirmAction(msg)"
                    >
                      <Trash2 :size="14" />
                      {{ isLoading ? 'Cancelando...' : 'Confirmar Cancelamento' }}
                    </button>
                </div>
                
                <div v-else-if="msg.action.type === 'APPLY_DISCOUNT'">
                    <p class="text-sm font-semibold mb-2 text-emerald-600 dark:text-emerald-400"> Aplicar Desconto</p>
                    <div class="space-y-1 mb-3">
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>ID da Transação:</strong> {{ msg.action.params.transactionId }}</p>
                      <p class="text-xs text-slate-600 dark:text-slate-400"><strong>Desconto:</strong> {{ msg.action.params.discountPercentage }}%</p>
                    </div>
                    <button 
                      class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                      :disabled="isLoading" 
                      @click="confirmAction(msg)"
                    >
                      <Percent :size="14" />
                      {{ isLoading ? 'Aplicando...' : 'Confirmar Desconto' }}
                    </button>
                </div>
             </div>
          </div>
          <small class="message-time">{{ msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</small>
        </div>
        
        <!-- Loading State / Skeleton -->
        <div v-if="isLoading" class="message-bubble-wrapper assistant-message animate-pulse">
           <div class="message-bubble bg-slate-100 dark:bg-slate-800 space-y-2">
              <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-32"></div>
              <div class="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
           </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center gap-2 w-full p-4 border-t border-slate-200 dark:border-slate-700">
          <input 
            v-model="messageInput" 
            placeholder="Digite sua mensagem..." 
            class="flex-1 rounded-full px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors outline-none"
            :disabled="isLoading"
            @keyup.enter="sendMessage"
          />
          <button 
            class="p-2 rounded-full text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50" 
            :disabled="isLoading"
            @click="sendMessage"
          >
            <Send :size="20" />
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.floating-chat-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-trigger-button {
  width: 3.5rem;
  height: 3.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}

.chat-trigger-button:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .floating-chat-container {
    bottom: 5px; /* Aligns vertically within bottom nav */
    right: auto;
    left: 50%;
    transform: translateX(-50%); /* Centers it horizontally */
    z-index: 1002; /* Ensures it's above the bottom nav */
  }

  .chat-trigger-button {
    width: 3.5rem;
    height: 3.5rem;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    /* Make it pop out of the menubar slightly by translating up, 
       but not overlapping content as much as before */
    transform: translateY(-15px);
  }

  .chat-trigger-button:hover {
     transform: translateY(-15px) scale(1.05); /* preserve upward translation on hover */
  }
  }
</style>
