import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('axios', () => {
    const mockAxios = {
        create: vi.fn(() => mockAxios),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    };
    return { default: mockAxios };
});

const api = (await import('../../src/services/api')).default;

describe('enumService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should deduplicate concurrent requests for the same enum', async () => {
        const { enumService } = await import('../../src/services/enumService');
        const mockData = [
            { name: 'REBOOKING', description: 'Retorno / Rebooking' },
            { name: 'CHURN', description: 'Recuperação de Evasão' }
        ];

        let resolvePromise;
        const delayedPromise = new Promise(resolve => {
            resolvePromise = () => resolve({ data: mockData });
        });
        api.get.mockImplementation(() => delayedPromise);

        const p1 = enumService.getOptions('MessageOriginTypeTest');
        const p2 = enumService.getOptions('MessageOriginTypeTest');
        const p3 = enumService.getDescription('MessageOriginTypeTest', 'REBOOKING');

        resolvePromise();

        const [res1, res2, desc3] = await Promise.all([p1, p2, p3]);

        expect(api.get).toHaveBeenCalledTimes(1);
        expect(api.get).toHaveBeenCalledWith('/enums/MessageOriginTypeTest');
        expect(res1).toEqual(mockData);
        expect(res2).toEqual(mockData);
        expect(desc3).toBe('Retorno / Rebooking');

        const cachedRes = await enumService.getOptions('MessageOriginTypeTest');
        expect(api.get).toHaveBeenCalledTimes(1);
        expect(cachedRes).toEqual(mockData);
    });
});
