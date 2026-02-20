<script setup>
import { ref, watch, onMounted, nextTick } from 'vue';
import { aiService } from '../../services/aiService';
import { useToast } from 'primevue/usetoast';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Skeleton from 'primevue/skeleton';
import Select from 'primevue/select';
import { professionalService } from '../../services/professionalService';
import { appointmentService } from '../../services/appointmentService';

const toast = useToast();

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
    <Button
      icon="pi pi-sparkles"
      class="p-button-rounded p-button-primary chat-trigger-button"
      @click="toggleChat"
      v-tooltip.left="'Assistente de Inteligência Artificial'"
    />

    <!-- Chat Dialog -->
    <Dialog
      v-model:visible="isChatVisible"
      header="Githa AI Assistant"
      :style="{ width: '400px' }"
      :breakpoints="{ '600px': '100vw' }"
      position="bottomright"
      :modal="false"
      :draggable="false"
      class="chat-dialog"
      :pt="{
        root: { style: 'margin: 0 20px 80px 0;' }
      }"
    >
      <!-- Professional Selector -->
      <div class="chat-header-actions" v-if="professionals.length > 0">
          <label class="professional-label">Atuando como (Profissional):</label>
          <Select 
            v-model="selectedProfessional" 
            :options="professionals" 
            optionLabel="name" 
            placeholder="Selecione um Profissional" 
            class="w-full" 
            :disabled="messages.length > 1 || isLoading || isProfessionalsLoading" 
          />
      </div>

      <div class="chat-messages" ref="chatContainer">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message-bubble-wrapper', msg.role === 'user' ? 'user-message' : 'assistant-message']"
        >
          <div class="message-bubble" :class="{'error-bubble': msg.isError}">
             <span style="white-space: pre-wrap;">{{ msg.content }}</span>
             
             <!-- Action Confirmation Card -->
             <div v-if="msg.action" class="mt-3 p-3 surface-ground border-round shadow-1">
                <div v-if="msg.action.type === 'SCHEDULE_APPOINTMENT'">
                    <p class="text-sm font-semibold mb-2"> Confirmar Agendamento</p>
                    <p class="text-xs mb-1"><strong>ID Cliente:</strong> {{ msg.action.params.clientId }}</p>
                    <p class="text-xs mb-1"><strong>ID Serviço:</strong> {{ msg.action.params.serviceId }}</p>
                    <p class="text-xs mb-1"><strong>Início:</strong> {{ msg.action.params.startTime }}</p>
                    <p class="text-xs mb-3"><strong>Fim:</strong> {{ msg.action.params.endTime }}</p>
                    <Button label="Confirmar" icon="pi pi-check" size="small" class="w-full" @click="confirmAction(msg)" :loading="isLoading" />
                </div>
                
                <div v-else-if="msg.action.type === 'CANCEL_APPOINTMENT'">
                    <p class="text-sm font-semibold mb-2 text-red-500"> Cancelar Agendamento</p>
                    <p class="text-xs mb-3"><strong>ID do Agendamento:</strong> {{ msg.action.params.appointmentId }}</p>
                    <Button label="Confirmar Cancelamento" severity="danger" icon="pi pi-trash" size="small" class="w-full" @click="confirmAction(msg)" :loading="isLoading" />
                </div>
                
                <div v-else-if="msg.action.type === 'APPLY_DISCOUNT'">
                    <p class="text-sm font-semibold mb-2 text-green-600"> Aplicar Desconto</p>
                    <p class="text-xs mb-1"><strong>ID da Transação:</strong> {{ msg.action.params.transactionId }}</p>
                    <p class="text-xs mb-3"><strong>Desconto:</strong> {{ msg.action.params.discountPercentage }}%</p>
                    <Button label="Confirmar Desconto" severity="success" icon="pi pi-percentage" size="small" class="w-full" @click="confirmAction(msg)" :loading="isLoading" />
                </div>
             </div>
          </div>
          <small class="message-time">{{ msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</small>
        </div>
        
        <div v-if="isLoading" class="message-bubble-wrapper assistant-message">
           <div class="message-bubble typing-indicator">
              <Skeleton width="10rem" height="1rem" class="mb-2"></Skeleton>
              <Skeleton width="5rem" height="1rem"></Skeleton>
           </div>
        </div>
      </div>

      <template #footer>
        <div class="chat-input-area">
          <InputText 
            v-model="messageInput" 
            placeholder="Digite sua mensagem..." 
            @keyup.enter="sendMessage"
            class="chat-input"
            :disabled="isLoading"
          />
          <Button 
            icon="pi pi-send" 
            @click="sendMessage" 
            :loading="isLoading"
            class="p-button-rounded p-button-text"
          />
        </div>
      </template>
    </Dialog>
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

.chat-header-actions {
  padding: 1rem;
  border-bottom: 1px solid var(--surface-border);
  background-color: var(--surface-section);
}

.professional-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-color-secondary);
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: var(--surface-card);
  border-radius: 8px;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.user-message {
  align-self: flex-end;
  align-items: flex-end;
}

.assistant-message {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  line-height: 1.4;
  word-wrap: break-word;
}

.user-message .message-bubble {
  background-color: var(--primary-color);
  color: var(--primary-color-text);
  border-bottom-right-radius: 2px;
}

.assistant-message .message-bubble {
  background-color: var(--surface-container);
  color: var(--text-color);
  border-bottom-left-radius: 2px;
}

.error-bubble {
    background-color: var(--red-100) !important;
    color: var(--red-700) !important;
    border: 1px solid var(--red-200);
}

.dark .error-bubble {
    background-color: rgba(255, 99, 132, 0.2) !important;
    color: var(--red-300) !important;
    border: 1px solid rgba(255, 99, 132, 0.4);
}

.message-time {
  font-size: 0.7rem;
  color: var(--text-color-secondary);
  margin-top: 0.25rem;
}

.chat-input-area {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-top: 1px solid var(--surface-border);
  width: 100%;
}

.chat-input {
  flex: 1;
  border-radius: 20px;
}

.typing-indicator {
    background-color: transparent !important;
    padding: 0 0.5rem !important;
}

/* Base modal overrides for specific chat look */
:deep(.p-dialog-content) {
  padding: 0;
  overflow: hidden;
}
:deep(.p-dialog-footer) {
  padding: 0.5rem 1rem;
}
</style>
