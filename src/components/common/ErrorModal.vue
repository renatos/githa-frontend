<template>
  <BaseModal
    :show="show"
    :title="title"
    icon="fa-solid fa-triangle-exclamation"
    :z-index="10001"
    @close="close"
  >
    <div class="modal-body p-2">
      <p class="text-slate-900 dark:text-slate-100 text-base leading-relaxed mb-4">{{ message }}</p>
      <div v-if="details" class="p-4 bg-slate-50 dark:bg-slate-900/50 border-l-4 border-red-500 rounded-r-lg">
        <p class="text-xs font-mono text-slate-500 dark:text-slate-400 break-words">{{ details }}</p>
      </div>
    </div>

    <template #footer>
      <button class="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-medium transition-colors" @click="close">
        OK
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue';

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Erro'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>

</style>
