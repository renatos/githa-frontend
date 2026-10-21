import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api, { resetApiSessionLockForTests } from '../../src/services/api';
import { errorHandler } from '../../src/services/errorHandler';
import { confirmBridge } from '../../src/services/confirmBridge';

describe('api response interceptor — 401 vs 403 & global error deduplication', () => {
    const responseRejectedInterceptor = api.interceptors.response.handlers[0].rejected;

    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
        resetApiSessionLockForTests();
        vi.restoreAllMocks();
        vi.spyOn(errorHandler, 'handle').mockImplementation(() => 'Handled');
        vi.spyOn(confirmBridge, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('marks error._handledGlobally = true and does NOT trigger session expired alert on 403 Forbidden', async () => {
        localStorage.setItem('token', 'valid-token');
        const error = {
            config: { url: '/reports/dre' },
            response: { status: 403, data: { detail: 'Acesso negado' } }
        };

        await expect(responseRejectedInterceptor(error)).rejects.toBe(error);

        expect(errorHandler.handle).toHaveBeenCalledTimes(1);
        expect(error._handledGlobally).toBe(true);

        vi.advanceTimersByTime(1500);
        expect(confirmBridge.alert).not.toHaveBeenCalled();
        expect(localStorage.getItem('token')).toBe('valid-token');
    });

    it('triggers session expired alert on 401 Unauthorized and deduplicates concurrent 401s', async () => {
        localStorage.setItem('token', 'expired-token');
        localStorage.setItem('user', JSON.stringify({ email: 'user@githa.com' }));

        const error1 = {
            config: { url: '/clients' },
            response: { status: 401, data: {} }
        };
        const error2 = {
            config: { url: '/appointments' },
            response: { status: 401, data: {} }
        };

        await expect(responseRejectedInterceptor(error1)).rejects.toBe(error1);
        await expect(responseRejectedInterceptor(error2)).rejects.toBe(error2);

        vi.advanceTimersByTime(1500);

        expect(confirmBridge.alert).toHaveBeenCalledTimes(1);
        expect(confirmBridge.alert).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Sessão Expirada',
                type: 'warning'
            })
        );
    });

    it('skips errorHandler.handle when config.skipGlobalErrorHandler is true', async () => {
        const error = {
            config: { url: '/custom', skipGlobalErrorHandler: true },
            response: { status: 500, data: {} }
        };

        await expect(responseRejectedInterceptor(error)).rejects.toBe(error);
        expect(errorHandler.handle).not.toHaveBeenCalled();
        expect(error._handledGlobally).toBeUndefined();
    });
});
