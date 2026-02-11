<template>
  <div class="feedback-view">
    <FeedbackList
      ref="listRef"
      @new="openForm"
      @edit="openForm"
    />

    <FeedbackForm
      v-if="showForm"
      :feedback="editingItem"
      @close="closeForm"
      @save="saveItem"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import FeedbackList from '../components/FeedbackList.vue';
import FeedbackForm from '../components/FeedbackForm.vue';
import { useCrudView } from '../composables/useCrudView';
import { feedbackService } from '../services/feedbackService';

const {
  listRef,
  showForm,
  editingItem,
  openForm,
  closeForm,
  saveItem,
  refreshList
} = useCrudView(feedbackService, { singular: 'Feedback', plural: 'Feedbacks' });

// Override openForm to ensure we fetch fresh data including replies?
// useCrudView usually sets editingItem = item.
// If item from list has everything, fine.
// Backend getAll returns full object with replies list.
// So no override needed.

</script>
