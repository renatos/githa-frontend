import { confirmBridge } from './confirmBridge';

const ERROR_MESSAGES = {
    400: 'Dados inválidos. Verifique as informações e tente novamente.',
    401: 'Sessão expirada. Por favor, faça login novamente.',
    403: 'Você não tem permissão para realizar esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito de dados. Já existe um registro ou operação conflitante.',
    422: 'Regra de negócio ou validação não atendida.',
    500: 'Erro interno do servidor. Tente novamente mais tarde.',
    default: 'Ocorreu um erro inesperado.'
};

let lastError = null;
let lastErrorTime = 0;
const DEDUPLICATION_INTERVAL = 3000; // 3 seconds

export const errorHandler = {
    handle(error, toast) {
        console.error('API Error:', error);

        let message = ERROR_MESSAGES.default;
        let severity = 'error';

        if (error.response) {
            const status = error.response.status;
            message = ERROR_MESSAGES[status] || message;
            const data = error.response.data;

            if (data) {
                // 1. Prioritize RFC 9457 detail field, then legacy message/error/string
                if (data.detail) {
                    message = data.detail;
                } else if (data.message) {
                    message = data.message;
                } else if (data.error) {
                    message = data.error;
                } else if (typeof data === 'string' && data.trim()) {
                    message = data;
                }

                // 2. Append validation violations if present
                if (Array.isArray(data.violations) && data.violations.length > 0) {
                    const violationLines = data.violations
                        .map(v => (v.field ? `${v.field}: ${v.message}` : v.message))
                        .filter(Boolean);
                    if (violationLines.length > 0) {
                        message = `${message}\n${violationLines.join('\n')}`;
                    }
                }

                // 3. Check for business/warning severity (RFC 9457 Githa extension or legacy warning type)
                const isWarning = (data.severity && String(data.severity).toLowerCase() === 'warning') || data.type === 'warning';
                if (isWarning) {
                    const title = data.title || 'Aviso';
                    confirmBridge.alert({
                        title: title,
                        message: message,
                        type: 'warning'
                    });
                    return message;
                }
            }
        } else if (error.request) {
            message = 'Servidor indisponível. Verifique se o backend está rodando.';
        }

        const now = Date.now();
        if (lastError === message && (now - lastErrorTime) < DEDUPLICATION_INTERVAL) {
            // Deduplicate: same message within short interval
            return message;
        }

        lastError = message;
        lastErrorTime = now;

        const summary = (error.response?.data?.title) || 'Erro';

        if (toast) {
            toast.add({
                severity: severity,
                summary: summary,
                detail: message,
                life: 5000
            });
        } else {
            // Fallback if toast is not available (e.g. during boot)
            confirmBridge.alert({
                title: summary,
                message: message,
                type: 'danger'
            });
        }

        return message;
    }
};
