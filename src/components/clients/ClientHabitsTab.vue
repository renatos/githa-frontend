<template>
  <div class="p-2 grid grid-cols-1 md:grid-cols-2 gap-4">
    <HealthToggle
      v-model="form.personalHabits.sunscreenDaily"
      label="Usa protetor solar diariamente"
    />
    <HealthToggle
      v-model="form.personalHabits.makeupDaily"
      label="Costuma se maquiar todos os dias"
    />
    <HealthToggle
      v-model="form.personalHabits.skincareRoutine"
      label="Tem rotina de skincare"
    />
    <HealthToggle
      v-model="form.personalHabits.prescribedProducts"
      label="Usa prescrição/manipulados"
    />
  </div>
</template>

<script setup>
import HealthToggle from './HealthToggle.vue';

defineProps({
  form: { type: Object, required: true },
});
</script>
