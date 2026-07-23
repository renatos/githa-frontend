<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
    <div v-if="loading" class="text-center space-y-4">
      <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">Carregando formulário...</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400">Aguarde enquanto preparamos as informações.</p>
    </div>

    <div v-else-if="error" class="text-center space-y-4 max-w-md bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div class="w-12 h-12 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white">Link inválido ou expirado</h2>
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ error }}</p>
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
        @click="goHome"
      >
        Ir para o Início
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import linkService from '@/services/linkService';
import { resolveModalConfig } from '@/composables/useDeepLinkModal';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref('');

const resolveAndRedirect = async () => {
  const code = route.params.code;
  if (!code) {
    error.value = 'Código do link não foi informado.';
    loading.value = false;
    return;
  }

  try {
    const linkData = await linkService.resolveLink(code);
    const config = resolveModalConfig(linkData.targetType);

    const targetPath = config ? config.route : '/';

    router.replace({
      path: targetPath,
      query: {
        modal: linkData.targetType,
        modalId: linkData.targetId
      }
    });
  } catch (err) {
    console.error('[LinkResolverView] Error resolving link code:', code, err);
    if (err.response && err.response.status === 404) {
      error.value = 'O link solicitado não foi encontrado ou não está mais disponível.';
    } else {
      error.value = 'Ocorreu um erro ao carregar o link. Verifique sua conexão e tente novamente.';
    }
    loading.value = false;
  }
};

const goHome = () => {
  router.push('/');
};

onMounted(() => {
  resolveAndRedirect();
});
</script>
