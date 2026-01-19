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

            if (data.message) {
                message = data.message;
            } else if (typeof data === 'string') {
                message = data;
            }

            if (data.error) {
                details = `${data.error}`;
            }

            if (error.response.status === 403) {
                message = 'Acesso negado. Você não tem permissão para realizar esta ação.';
            } else if (error.response.status === 404) {
                message = 'Recurso não encontrado.';
            } else if (error.response.status === 500) {
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
