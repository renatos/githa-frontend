<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ feedback.id ? 'Feedback #' + feedback.id : 'Novo Feedback' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <div class="modal-body-scroll">
        <form @submit.prevent="save">
          <div class="form-body">
            <div class="form-group" style="margin-bottom: 8px;">
              <label>Título</label>
              <input v-model="form.title" type="text" required class="form-control" :disabled="!!feedback.id" />
            </div>
             <div class="row">
                <div class="form-group col-12 col-md-4">
                  <label>Tipo</label>
                  <select v-model="form.type" class="form-control" required :disabled="!!feedback.id">
                    <option value="BUG">Erro / Bug</option>
                    <option value="FEATURE">Nova Funcionalidade</option>
                    <option value="IMPROVEMENT">Melhoria</option>
                  </select>
                </div>

                <div class="form-group col-12 col-md-4">
                    <label>Relator (Profissional)</label>
                    <BaseLookup
                      v-model="form.reporterId"
                      :initial-description="form.reporter?.name"
                      :search-service="professionalService"
                      placeholder="Selecione o Relator"
                      :disabled="!!feedback.id"
                    />
                </div>
                
                <div class="form-group col-12 col-md-4" v-if="feedback.id">
                  <label>Status</label>
                   <select v-model="form.status" class="form-control">
                    <option value="NEW">Novo</option>
                    <option value="ACCEPTED">Em Análise</option>
                    <option value="IMPLEMENTED">Concluído</option>
                    <option value="REJECTED">Rejeitado</option>
                  </select>
                </div>
             </div>
            
            <div class="form-group" style="margin-bottom: 8px;">
              <label>Descrição</label>
              <textarea v-model="form.description" class="form-control" rows="4" required :disabled="!!feedback.id"></textarea>
            </div>
            
            <!-- Chat Section -->
            <div v-if="feedback.id" class="chat-section">
                <h4>Comentários e Respostas</h4>
                <div class="chat-messages" ref="chatContainer">
                    <div v-if="localReplies.length === 0" class="no-messages">
                        Nenhum comentário ainda.
                    </div>
                    <div 
                        v-for="reply in localReplies" 
                        :key="reply.id" 
                        class="chat-message"
                        :class="{ 'own': isOwnMessage(reply) }"
                    >
                        <div class="message-header">
                            <span class="author">{{ reply.author?.name }}</span>
                            <span class="date">{{ formatDateTime(reply.createdAt) }}</span>
                        </div>
                        <div class="message-content">
                            {{ reply.message }}
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-area">
                    <div class="reply-author-select">
                        <label>Responder como:</label>
                        <BaseLookup
                            v-model="replyAuthorId"
                            :search-service="professionalService"
                            placeholder="Selecione o Profissional"
                            style="max-width: 400px;"
                        />
                    </div>
                    <div class="chat-input-box">
                        <textarea 
                            v-model="newReply" 
                            placeholder="Escreva uma resposta..." 
                            rows="2"
                            class="form-control"
                            @keydown.ctrl.enter="sendReply"
                        ></textarea>
                        <button type="button" class="btn btn-primary btn-send" @click="sendReply" :disabled="!newReply.trim() || !replyAuthorId || sendingReply">
                            <span v-if="!sendingReply">Enviar</span>
                            <span v-else>...</span>
                        </button>
                    </div>
                </div>
            </div>

          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">Fechar</button>
            <button type="submit" class="btn btn-primary" v-if="canSave">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onMounted, computed, nextTick, watch } from 'vue';
import { feedbackService } from '../services/feedbackService';
import { authService } from '../services/authService';
import { useModal } from '../composables/useModal';
import { useEscapeKey } from '../composables/useEscapeKey';
import { formatDateTime } from '../utils/formatters';

import BaseLookup from './common/BaseLookup.vue';
import { professionalService } from '../services/professionalService';
import { clientService } from '../services/clientService';

const props = defineProps({
  feedback: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['close', 'save']);
useModal(emit);
useEscapeKey(() => emit('close'));

const form = ref({
  title: '',
  description: '',
  type: 'BUG',
  status: 'NEW',
  userId: null,
  user: null,
  reporterId: null,
  reporter: null
});

const localReplies = ref([]);
const newReply = ref('');
const replyAuthorId = ref(null);
const sendingReply = ref(false);
const chatContainer = ref(null);
const currentUser = ref({});

onMounted(() => {
  currentUser.value = authService.getCurrentUser();
  if (props.feedback.id) {
    form.value = { 
        ...props.feedback,
        userId: props.feedback.user?.id,
        user: props.feedback.user,
        reporterId: props.feedback.reporter?.id,
        reporter: props.feedback.reporter
    };
    localReplies.value = props.feedback.replies || [];
    scrollToBottom();
  }
});

const canSave = computed(() => {
    // If it's new, we can save.
    if (!props.feedback.id) return true;
    // If existing, we can save if status changed (implied checks could be stricter)
    // Here we just allow saving the status.
    return true;
});

const isOwnMessage = (reply) => {
    // Cannot determine 'own' easily if decoupled. 
    // Maybe we can highlight if reply.author.id == replyAuthorId?
    // For now, let's rely on name display or remove 'own' styling if not applicable.
    // Or we stick to User email check if the Professional happens to be linked?
    // User said "User has nothing to do with Professional".
    // So we shouldn't rely on auth email.
    // Let's remove 'own' styling or just check if it matches the currently selected professional?
    if (replyAuthorId.value && reply.author?.id === replyAuthorId.value) {
        return true;
    }
    return false;
};

const sendReply = async () => {
    if (!newReply.value.trim() || !replyAuthorId.value) {
        if (!replyAuthorId.value) alert('Selecione o profissional que está respondendo.');
        return;
    }
    
    sendingReply.value = true;
    try {
        const response = await feedbackService.addReply(props.feedback.id, { 
            message: newReply.value,
            authorId: replyAuthorId.value
        });
        // The endpoint returns the created reply
        localReplies.value.push(response.data);
        newReply.value = '';
        scrollToBottom();
    } catch (error) {
        console.error('Failed to send reply', error);
        alert('Erro ao enviar resposta.');
    } finally {
        sendingReply.value = false;
    }
};

const save = () => {
  // We only emit save for the main form fields (status update mostly for existing ones)
  emit('save', form.value);
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
        }
    });
};
</script>

<style scoped>
.modal-content {
    max-width: 700px;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
}

.modal-body-scroll {
    overflow-y: auto;
    flex: 1;
    padding: var(--spacing-md);
}

/* ... existing styles ... */

.chat-input-area {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.reply-author-select {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.reply-author-select label {
    font-size: 0.875rem;
    font-weight: 600;
    white-space: nowrap;
}

.chat-input-box {
    display: flex;
    gap: var(--spacing-sm);
}

.modal-footer {
    flex-shrink: 0;
    padding: var(--spacing-md);
    background: var(--color-bg-body);
    border-top: 1px solid var(--color-border);
}

.feedback-meta {
    display: flex;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
    background: var(--color-bg-body);
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
}

.meta-item {
    display: flex;
    gap: 0.5rem;
}

.meta-item label {
    font-weight: 600;
    color: var(--color-text-muted);
}

.chat-section {
    margin-top: 0;
    border-top: 1px solid var(--color-border);
    padding-top: 4px;
}

.chat-section h4 {
    margin-top: 0;
    margin-bottom: var(--spacing-sm);
    font-size: 1.1rem;
}

.chat-messages {
    background: var(--color-bg-body);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    height: 200px;
    overflow-y: auto;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

.no-messages {
    text-align: center;
    color: var(--color-text-muted);
    font-style: italic;
    margin-top: auto;
    margin-bottom: auto;
}

.chat-message {
    max-width: 80%;
    align-self: flex-start;
    background: white;
    color: #333;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: 12px;
    border-top-left-radius: 2px;
    border: 1px solid var(--color-border);
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.chat-message.own {
    align-self: flex-end;
    background: #eff6ff;
    border-color: #bfdbfe;
    border-radius: 12px;
    border-top-right-radius: 2px;
    border-top-left-radius: 12px;
}

.message-header {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    font-size: 0.75rem;
    margin-bottom: 4px;
    color: var(--color-text-muted);
}

.message-header .author {
    font-weight: 600;
}

.message-header .date {
    font-size: 0.7rem;
}

.chat-input {
    display: flex;
    gap: var(--spacing-sm);
}

.btn-send {
    align-self: flex-end;
}
</style>
