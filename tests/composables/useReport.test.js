import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useReport } from '../../src/composables/useReport';
import { systemParameterService } from '../../src/services/systemParameterService';
import api from '../../src/services/api';

vi.mock('../../src/services/api', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn()
    }
}));

describe('useReport composable & systemParameterService cache', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        systemParameterService.clearCache();
    });

    it('fetches report data, toggles view mode and retries with last params', async () => {
        const { data, loading, error, viewMode, fetchReport, retry, toggleViewMode } = useReport();
        const mockFetch = vi.fn().mockResolvedValue({ data: { totalRevenue: 15000 } });

        expect(viewMode.value).toBe('TABLE');
        toggleViewMode();
        expect(viewMode.value).toBe('CHART');

        await fetchReport(mockFetch, { month: 10, year: 2026 });
        expect(loading.value).toBe(false);
        expect(error.value).toBeNull();
        expect(data.value).toEqual({ totalRevenue: 15000 });

        await retry();
        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(mockFetch).toHaveBeenLastCalledWith({ month: 10, year: 2026 });
    });

    it('captures error message when report fetch fails', async () => {
        const { error, loading, fetchReport } = useReport();
        const failingFetch = vi.fn().mockRejectedValue({
            response: { data: { error: 'Período inválido' } }
        });

        await expect(fetchReport(failingFetch, { month: 99 })).rejects.toBeDefined();
        expect(loading.value).toBe(false);
        expect(error.value).toBe('Período inválido');
    });

    it('caches systemParameterService.getParameterValue in memory and invalidates on update', async () => {
        api.get.mockResolvedValue({ data: { value: '20' } });
        api.put.mockResolvedValue({ data: { value: '50' } });

        const res1 = await systemParameterService.getParameterValue('PAGINATION_SIZE');
        const res2 = await systemParameterService.getParameterValue('PAGINATION_SIZE');

        expect(res1.data.value).toBe('20');
        expect(res2.data.value).toBe('20');
        expect(api.get).toHaveBeenCalledTimes(1);

        await systemParameterService.update(1, '50');
        await systemParameterService.getParameterValue('PAGINATION_SIZE');
        expect(api.get).toHaveBeenCalledTimes(2);
    });
});
