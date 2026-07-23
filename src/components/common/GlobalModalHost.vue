<template>
  <div v-if="activeComponent && activeData">
    <component
      :is="activeComponent"
      v-bind="componentProps"
      @close="closeModal"
      @save="onSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resolveModalConfig } from '@/composables/useDeepLinkModal';

const route = useRoute();
const router = useRouter();

const activeComponent = ref(null);
const activeData = ref(null);
const activePropName = ref('');
const loading = ref(false);

const componentProps = computed(() => {
  if (!activePropName.value || !activeData.value) return {};
  return {
    [activePropName.value]: activeData.value
  };
});

const loadModal = async (modalType, modalId) => {
  if (!modalType || !modalId) {
    activeComponent.value = null;
    activeData.value = null;
    activePropName.value = '';
    return;
  }

  loading.value = true;
  try {
    const config = resolveModalConfig(modalType);
    if (!config) {
      console.warn(`[GlobalModalHost] Unknown modal type: ${modalType}`);
      return;
    }

    // Load data and component concurrently
    const [fetchedData, loadedModule] = await Promise.all([
      config.fetcher(modalId),
      config.componentLoader()
    ]);

    activeData.value = fetchedData;
    activePropName.value = config.propName;
    activeComponent.value = loadedModule.default || loadedModule;
  } catch (err) {
    console.error(`[GlobalModalHost] Failed to load modal for type ${modalType} id ${modalId}:`, err);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  activeComponent.value = null;
  activeData.value = null;
  activePropName.value = '';

  const newQuery = { ...route.query };
  delete newQuery.modal;
  delete newQuery.modalId;
  router.replace({ path: route.path, query: newQuery });
};

const onSave = () => {
  closeModal();
};

watch(
  () => [route.query.modal, route.query.modalId],
  ([newModal, newModalId]) => {
    if (newModal && newModalId) {
      loadModal(newModal, newModalId);
    } else {
      activeComponent.value = null;
      activeData.value = null;
      activePropName.value = '';
    }
  },
  { immediate: true }
);
</script>
