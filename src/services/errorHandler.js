
const ERROR_MESSAGES = {
    400: 'Dados inválidos. Verifique as informações e tente novamente.',
    401: 'Sessão expirada. Por favor, faça login novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Recurso não encontrado.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
    default: 'Ocorreu um erro inesperado.'
};

export const errorHandler = {
    handle(error, toast) {
        console.error('API Error:', error);

        let message = ERROR_MESSAGES.default;
        let severity = 'error';

        if (error.response) {
            const status = error.response.status;
            message = ERROR_MESSAGES[status] || message;

            // If backend sends a specific error message, use it
            if (error.response.data && error.response.data.message) {
                message = error.response.data.message;
            } else if (error.response.data && error.response.data.error) {
                message = error.response.data.error;
            }
        } else if (error.request) {
            message = 'Erro de conexão. Verifique sua internet.';
        }

        if (toast) {
            toast.add({
                severity: severity,
                summary: 'Erro',
                detail: message,
                life: 5000
            });
        } else {
            // Fallback if toast is not available (e.g. during boot)
            alert(message);
        }

        return message;
    }
};
