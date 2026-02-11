import { describe, it, expect } from 'vitest';
import { useErrorHandler } from '../../src/composables/useErrorHandler';

describe('useErrorHandler', () => {
    it('should initialize with hidden error state', () => {
        const { errorState } = useErrorHandler();

        expect(errorState.value.show).toBe(false);
        expect(errorState.value.message).toBe('');
    });

    it('should show error with backend message', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            response: {
                status: 400,
                data: { message: 'Dados inválidos' },
            },
        };

        showError(error, 'Erro de Validação');

        expect(errorState.value.show).toBe(true);
        expect(errorState.value.title).toBe('Erro de Validação');
        expect(errorState.value.message).toBe('Dados inválidos');
    });

    it('should show 403 message for forbidden errors', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            response: {
                status: 403,
                data: {},
            },
        };

        showError(error);

        expect(errorState.value.show).toBe(true);
        expect(errorState.value.message).toContain('permissão');
    });

    it('should show 404 message for not found errors', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            response: {
                status: 404,
                data: {},
            },
        };

        showError(error);

        expect(errorState.value.message).toContain('não encontrado');
    });

    it('should show 500 message for server errors', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            response: {
                status: 500,
                data: {},
            },
        };

        showError(error);

        expect(errorState.value.message).toContain('servidor');
    });

    it('should show network error message when no response', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            request: {},
        };

        showError(error);

        expect(errorState.value.message).toContain('conectar');
    });

    it('should show generic error message for unknown errors', () => {
        const { showError, errorState } = useErrorHandler();

        const error = {
            message: 'Something broke',
        };

        showError(error);

        expect(errorState.value.message).toBe('Something broke');
    });

    it('closeError should hide the error', () => {
        const { showError, closeError, errorState } = useErrorHandler();

        showError({ response: { status: 500, data: {} } });
        expect(errorState.value.show).toBe(true);

        closeError();
        expect(errorState.value.show).toBe(false);
    });
});
