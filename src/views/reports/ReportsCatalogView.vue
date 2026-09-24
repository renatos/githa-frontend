<template>
  <div class="space-y-6">
    <!-- Header with PageHeader pattern -->
    <PageHeader
      title="Central de Relatórios"
      subtitle="Inteligência analítica e acompanhamento financeiro e operacional da clínica."
    >
      <template #actions>
        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar relatórios (ex: DRE, taxas)..."
            class="w-full pl-10 pr-8 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
            title="Limpar busca"
            @click="searchQuery = ''"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </template>
    </PageHeader>

    <!-- Category Tabs Navigation -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="cat in REPORT_CATEGORIES"
        :key="cat.id"
        @click="selectedCategory = cat.id"
        class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm"
        :class="selectedCategory === cat.id
          ? 'bg-indigo-600 text-white shadow-indigo-500/20'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700'"
      >
        <i :class="cat.icon"></i>
        <span>{{ cat.label }}</span>
        <span
          class="ml-1 text-[11px] px-1.5 py-0.5 rounded-full"
          :class="selectedCategory === cat.id
            ? 'bg-white/20 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
        >
          {{ countByCategory(cat.id) }}
        </span>
      </button>
    </div>

    <!-- Reports Grid -->
    <div v-if="filteredReports.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="report in filteredReports"
        :key="report.id"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all group"
      >
        <div>
          <!-- Card Header with Icon and Badge -->
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-inner group-hover:scale-105 transition-transform">
              <i :class="report.icon"></i>
            </div>
            <span
              class="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]"
              :class="report.isAvailable
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-gray-100 dark:bg-gray-700/60 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'"
            >
              {{ report.badge }}
            </span>
          </div>

          <!-- Card Content -->
          <h2 class="text-base font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {{ report.title }}
          </h2>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed line-clamp-3">
            {{ report.description }}
          </p>
        </div>

        <!-- Card Footer -->
        <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <span class="text-[11px] text-gray-400 font-medium">
            {{ report.category === 'FINANCIAL' ? 'Financeiro' : report.category === 'OPERATIONAL' ? 'Operacional' : 'Clientes' }}
          </span>

          <router-link
            v-if="report.isAvailable"
            :to="report.route"
            class="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 group-hover:translate-x-0.5 transition"
          >
            Visualizar Relatório
            <i class="fa-solid fa-arrow-right text-[11px]"></i>
          </router-link>

          <span
            v-else
            class="text-xs text-gray-400 dark:text-gray-500 font-medium cursor-not-allowed"
          >
            Em desenvolvimento
          </span>
        </div>
      </div>
    </div>

    <!-- Empty Search State -->
    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center"
    >
      <div class="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-3">
        <i class="fa-solid fa-magnifying-glass text-lg"></i>
      </div>
      <h3 class="text-base font-bold text-gray-800 dark:text-gray-200">Nenhum relatório encontrado</h3>
      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
        Não encontramos nenhum relatório que corresponda a "{{ searchQuery }}". Tente buscar por outros termos como "DRE", "cartão" ou "lucro".
      </p>
      <button
        @click="searchQuery = ''; selectedCategory = 'ALL'"
        class="mt-4 px-4 py-2 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
      >
        Limpar Filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { REPORT_CATEGORIES, REPORTS_REGISTRY } from './reportsRegistry';

const searchQuery = ref('');
const selectedCategory = ref('ALL');

const countByCategory = (categoryId) => {
  if (categoryId === 'ALL') {
    return REPORTS_REGISTRY.length;
  }
  return REPORTS_REGISTRY.filter((r) => r.category === categoryId).length;
};

const filteredReports = computed(() => {
  let list = REPORTS_REGISTRY;

  if (selectedCategory.value !== 'ALL') {
    list = list.filter((r) => r.category === selectedCategory.value);
  }

  if (searchQuery.value && searchQuery.value.trim() !== '') {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter((r) => {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchDesc = r.description.toLowerCase().includes(q);
      const matchTags = r.tags && r.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTags;
    });
  }

  return list;
});
</script>
