import { ref } from 'vue';

export function useReport() {
  const data = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const viewMode = ref('TABLE'); // 'CHART' | 'TABLE'

  let lastFetchFn = null;
  let lastParams = null;

  const fetchReport = async (fetchFn, params = {}) => {
    lastFetchFn = fetchFn;
    lastParams = params;
    loading.value = true;
    error.value = null;

    try {
      const response = await fetchFn(params);
      data.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err?.response?.data?.error || err.message || 'Falha ao carregar relatório';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const retry = async () => {
    if (lastFetchFn) {
      return fetchReport(lastFetchFn, lastParams);
    }
  };

  const toggleViewMode = () => {
    viewMode.value = viewMode.value === 'CHART' ? 'TABLE' : 'CHART';
  };

  return {
    data,
    loading,
    error,
    viewMode,
    fetchReport,
    retry,
    toggleViewMode
  };
}
