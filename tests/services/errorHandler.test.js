import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../src/services/errorHandler';
import { confirmBridge } from '../../src/services/confirmBridge';

describe('errorHandler service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(confirmBridge, 'alert').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should show warning alert modal when severity is warning in RFC 9457 payload', () => {
        const error = {
            response: {
                status: 422,
                data: {
                    type: 'about:blank',
                    title: 'Regra de Negócio',
                    status: 422,
                    detail: 'Estoque insuficiente para o produto.',
                    severity: 'warning'
                }
            }
        };

        const result = errorHandler.handle(error, null);

        expect(result).toBe('Estoque insuficiente para o produto.');
        expect(confirmBridge.alert).toHaveBeenCalledWith({
            title: 'Regra de Negócio',
            message: 'Estoque insuficiente para o produto.',
            type: 'warning'
        });
    });

    it('should format violations list when present in 422 validation response', () => {
        const error = {
            response: {
                status: 422,
                data: {
                    type: 'about:blank',
                    title: 'Violação de Validação',
                    status: 422,
                    detail: 'Campos inválidos:',
                    severity: 'warning',
                    violations: [
                        { field: 'email', message: 'E-mail inválido' },
                        { field: 'phone', message: 'Telefone obrigatório' }
                    ]
                }
            }
        };

        const result = errorHandler.handle(error, null);

        expect(result).toContain('Campos inválidos:');
        expect(result).toContain('email: E-mail inválido');
        expect(result).toContain('phone: Telefone obrigatório');
        expect(confirmBridge.alert).toHaveBeenCalledWith({
            title: 'Violação de Validação',
            message: expect.stringContaining('email: E-mail inválido'),
            type: 'warning'
        });
    });

    it('should dispatch toast for standard error responses (e.g. 500)', () => {
        const toastMock = { add: vi.fn() };
        const error = {
            response: {
                status: 500,
                data: {
                    type: 'about:blank',
                    title: 'Erro Interno do Servidor',
                    status: 500,
                    detail: 'Ocorreu um erro inesperado no processamento.',
                    severity: 'critical'
                }
            }
        };

        const result = errorHandler.handle(error, toastMock);

        expect(result).toBe('Ocorreu um erro inesperado no processamento.');
        expect(toastMock.add).toHaveBeenCalledWith({
            severity: 'error',
            summary: 'Erro Interno do Servidor',
            detail: 'Ocorreu um erro inesperado no processamento.',
            life: 5000
        });
    });

    it('should fallback to status code message when detail and message are missing', () => {
        const toastMock = { add: vi.fn() };
        const error = {
            response: {
                status: 409,
                data: {}
            }
        };

        const result = errorHandler.handle(error, toastMock);

        expect(result).toContain('Conflito de dados');
        expect(toastMock.add).toHaveBeenCalledWith(expect.objectContaining({
            severity: 'error',
            detail: expect.stringContaining('Conflito de dados')
        }));
    });

    it('should handle network error when response is missing', () => {
        const toastMock = { add: vi.fn() };
        const error = {
            request: {}
        };

        const result = errorHandler.handle(error, toastMock);

        expect(result).toContain('Servidor indisponível');
    });
});
