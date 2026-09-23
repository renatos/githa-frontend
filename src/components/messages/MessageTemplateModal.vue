<template>
  <BaseModal
    :show="show"
    :title="isEditing ? 'Editar Template de Mensagem' : 'Novo Template de Mensagem'"
    :subtitle="isEditing ? 'Ajuste os dados e o conteúdo do modelo' : 'Cadastre um novo modelo de mensagem'"
    max-width="max-w-4xl"
    @close="$emit('close')"
  >
    <form class="p-6 space-y-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Nome do Template -->
        <div class="md:col-span-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Nome do Template *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Ex: Lembrete de Rebooking Personalizado"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <!-- Origem -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Origem da Mensagem *
          </label>
          <select
            v-model="form.originType"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="REBOOKING">Rebooking (Retorno de Clientes)</option>
            <option value="LEAD">Leads (Captação e Boas-Vindas)</option>
            <option value="APPOINTMENT">Agendamentos (Lembretes e Confirmações)</option>
            <option value="SYSTEM">Sistema (Avisos Operacionais)</option>
          </select>
        </div>

        <!-- Audiência -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Público-Alvo *
          </label>
          <select
            v-model="form.audienceType"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="CLIENT">Clientes</option>
            <option value="LEAD">Leads</option>
            <option value="PROFESSIONAL">Profissionais do Estúdio</option>
          </select>
        </div>

        <!-- Descrição -->
        <div class="md:col-span-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Descrição (Opcional)
          </label>
          <input
            v-model="form.description"
            type="text"
            placeholder="Ex: Utilizado para clientes com mais de 30 dias sem visita"
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Paleta de Variáveis Clicáveis -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Variáveis Dinâmicas Disponíveis
          </label>
          <span class="text-xs text-slate-500">Clique na tag para inserir no texto</span>
        </div>
        <div class="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            v-for="v in availableVariables"
            :key="v.tag"
            type="button"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
            :title="v.desc"
            @click="insertVariable(v.tag)"
          >
            <span class="font-mono font-bold">{{ v.tag }}</span>
            <span class="text-[10px] text-slate-500 dark:text-slate-400">({{ v.label }})</span>
          </button>
        </div>
      </div>

      <!-- Grid com Editor e Preview do WhatsApp -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Textarea Editor -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Conteúdo do Template *
          </label>
          <textarea
            ref="textareaRef"
            v-model="form.content"
            required
            rows="8"
            placeholder="Digite o texto da mensagem..."
            class="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans leading-relaxed"
          ></textarea>
          <div class="flex justify-between items-center text-xs text-slate-400 mt-1">
            <span>{{ form.content ? form.content.length : 0 }} caracteres</span>
            <span>Quebras de linha são preservadas</span>
          </div>
        </div>

        <!-- WhatsApp Live Preview -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pré-visualização (Simulador WhatsApp)
          </label>
          <div class="h-[210px] p-4 bg-[#e5ddd5] dark:bg-[#0b141a] rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col justify-end overflow-y-auto">
            <div class="self-end max-w-[90%] bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-slate-100 text-sm px-3.5 py-2.5 rounded-lg rounded-tr-none shadow-sm relative leading-relaxed whitespace-pre-wrap break-words">
              {{ renderedPreview || 'A pré-visualização aparecerá aqui conforme você digita...' }}
              <div class="text-[10px] text-slate-500 dark:text-emerald-200/70 text-right mt-1.5 flex items-center justify-end gap-1">
                <span>{{ currentTime }}</span>
                <span class="text-xs">✓✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkboxes -->
      <div class="flex flex-wrap gap-6 pt-2 border-t border-slate-200 dark:border-slate-700">
        <label class="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            v-model="form.isDefault"
            type="checkbox"
            class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>Definir como template padrão para esta origem e canal</span>
        </label>

        <label class="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            v-model="form.active"
            type="checkbox"
            class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          <span>Template ativo</span>
        </label>
      </div>

      <!-- Footer Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          class="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          @click="$emit('close')"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <span v-if="submitting">Salvando...</span>
          <span v-else>{{ isEditing ? 'Salvar Alterações' : 'Criar Template' }}</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import BaseModal from '../common/BaseModal.vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'save']);

const textareaRef = ref(null);
const submitting = ref(false);

const form = ref({
  name: '',
  originType: 'REBOOKING',
  channel: 'WHATSAPP',
  audienceType: 'CLIENT',
  content: '',
  description: '',
  isDefault: false,
  active: true
});

const isEditing = computed(() => !!props.template?.id);

watch(
  () => props.template,
  (val) => {
    if (val) {
      form.value = {
        id: val.id,
        name: val.name || '',
        originType: val.originType || 'REBOOKING',
        channel: val.channel || 'WHATSAPP',
        audienceType: val.audienceType || 'CLIENT',
        content: val.content || '',
        description: val.description || '',
        isDefault: Boolean(val.isDefault),
        active: val.active !== false
      };
    } else {
      form.value = {
        name: '',
        originType: 'REBOOKING',
        channel: 'WHATSAPP',
        audienceType: 'CLIENT',
        content: 'Olá {nome}, tudo bem?\nVamos agendar seu {servico}?\nMe fala o dia e horário melhor para vc que confiro a disponibilidade na nossa agenda.',
        description: '',
        isDefault: false,
        active: true
      };
    }
  },
  { immediate: true }
);

const availableVariables = computed(() => {
  switch (form.value.originType) {
    case 'REBOOKING':
      return [
        { tag: '{nome}', label: 'Nome do Cliente', desc: 'Nome ou nome composto' },
        { tag: '{servico}', label: 'Procedimento', desc: 'Nome do serviço a retornar' },
        { tag: '{seu_sua}', label: 'Pronome', desc: 'Resolve para "seu" ou "sua" conforme o gênero do procedimento' },
        { tag: '{artigo}', label: 'Artigo', desc: 'Resolve para "o" ou "a" conforme o gênero do procedimento' },
        { tag: '{do_da}', label: 'Contração do/da', desc: 'Resolve para "do" ou "da"' },
        { tag: '{ao_a}', label: 'Contração ao/à', desc: 'Resolve para "ao" ou "à"' }
      ];
    case 'LEAD':
      return [
        { tag: '{nome}', label: 'Nome do Lead', desc: 'Nome da pessoa interessada' },
        { tag: '{origem}', label: 'Canal de Origem', desc: 'Instagram, Indicação, etc.' }
      ];
    case 'APPOINTMENT':
      return [
        { tag: '{nome}', label: 'Nome do Cliente', desc: 'Nome do cliente' },
        { tag: '{servico}', label: 'Procedimento', desc: 'Nome do procedimento' },
        { tag: '{data}', label: 'Data', desc: 'Data do agendamento' },
        { tag: '{horario}', label: 'Horário', desc: 'Horário do agendamento' },
        { tag: '{profissional}', label: 'Profissional', desc: 'Profissional responsável' }
      ];
    default:
      return [
        { tag: '{nome}', label: 'Nome', desc: 'Nome do destinatário' }
      ];
  }
});

const insertVariable = (tag) => {
  const textarea = textareaRef.value;
  if (!textarea) {
    form.value.content += tag;
    return;
  }
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || 0;
  const current = form.value.content || '';
  form.value.content = current.substring(0, start) + tag + current.substring(end);

  // Restore cursor position right after the inserted tag
  setTimeout(() => {
    textarea.focus();
    const newPos = start + tag.length;
    textarea.setSelectionRange(newPos, newPos);
  }, 0);
};

const renderedPreview = computed(() => {
  if (!form.value.content) return '';
  return form.value.content
    .replace(/\{nome\}/g, 'Ana Paula')
    .replace(/\{servico\}/g, 'design de sobrancelhas')
    .replace(/\{seu_sua\}/g, 'seu')
    .replace(/\{artigo\}/g, 'o')
    .replace(/\{do_da\}/g, 'do')
    .replace(/\{ao_a\}/g, 'ao')
    .replace(/\{no_na\}/g, 'no')
    .replace(/\{data\}/g, '25/09/2026')
    .replace(/\{horario\}/g, '14:30')
    .replace(/\{profissional\}/g, 'Dra. Camila')
    .replace(/\{origem\}/g, 'Instagram');
});

const currentTime = computed(() => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
});

const handleSubmit = async () => {
  submitting.value = true;
  try {
    emit('save', { ...form.value });
  } finally {
    submitting.value = false;
  }
};
</script>
