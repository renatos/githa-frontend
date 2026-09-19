import { ref } from 'vue';

const errorState = ref({
    show: false,
    title: 'Erro',
    message: '',
    details: ''
});

export function useErrorHandler() {
    const showError = (error, customTitle = 'Erro') => {
        let message = 'Ocorreu um erro inesperado.';
        let details = '';

        if (error.response) {
            // Backend error response
            const data = error.response.data;

            if (data) {
                if (data.detail) {
                    message = data.detail;
                } else if (data.message) {
                    message = data.message;
                } else if (typeof data === 'string' && data.trim()) {
                    message = data;
                }

                if (data.title && customTitle === 'Erro') {
                    customTitle = data.title;
                }

                if (Array.isArray(data.violations) && data.violations.length > 0) {
                    details = data.violations
                        .map(v => (v.field ? `${v.field}: ${v.message}` : v.message))
                        .filter(Boolean)
                        .join('\n');
                } else if (data.error) {
                    details = `${data.error}`;
                }
            }

            if (error.response.status === 403 && !data?.detail && !data?.message) {
                message = 'Acesso negado. Você não tem permissão para realizar esta ação.';
            } else if (error.response.status === 404 && !data?.detail && !data?.message) {
                message = 'Recurso não encontrado.';
            } else if (error.response.status === 409 && !data?.detail && !data?.message) {
                message = 'Conflito de dados. Já existe um registro ou operação conflitante.';
            } else if (error.response.status === 422 && !data?.detail && !data?.message) {
                message = 'Regra de negócio não atendida.';
            } else if (error.response.status === 500 && !data?.detail && !data?.message) {
                message = 'Erro interno do servidor. Por favor, tente novamente mais tarde.';
            }
        } else if (error.request) {
            message = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        } else if (error.message) {
            message = error.message;
        }

        errorState.value = {
            show: true,
            title: customTitle,
            message,
            details
        };
    };

    const closeError = () => {
        errorState.value.show = false;
    };

    return {
        errorState,
        showError,
        closeError
    };
}
