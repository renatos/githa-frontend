import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios before importing services
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

// Import after mocking
const api = (await import('../../src/services/api')).default;

describe('clientService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should call GET /clients with params', async () => {
        const { clientService } = await import('../../src/services/clientService');
        const params = { page: 0, size: 10 };
        api.get.mockResolvedValue({ data: { content: [] } });

        await clientService.getAll(params);

        expect(api.get).toHaveBeenCalledWith('/clients', { params });
    });

    it('should call GET /clients/:id', async () => {
        const { clientService } = await import('../../src/services/clientService');
        api.get.mockResolvedValue({ data: { id: 1, name: 'Test' } });

        await clientService.getById(1);

        expect(api.get).toHaveBeenCalledWith('/clients/1');
    });

    it('should call POST /clients', async () => {
        const { clientService } = await import('../../src/services/clientService');
        const data = { name: 'New Client' };
        api.post.mockResolvedValue({ data: { id: 1, ...data } });

        await clientService.create(data);

        expect(api.post).toHaveBeenCalledWith('/clients', data);
    });

    it('should call PUT /clients/:id', async () => {
        const { clientService } = await import('../../src/services/clientService');
        const data = { name: 'Updated Client' };
        api.put.mockResolvedValue({ data: { id: 1, ...data } });

        await clientService.update(1, data);

        expect(api.put).toHaveBeenCalledWith('/clients/1', data);
    });

    it('should call DELETE /clients/:id', async () => {
        const { clientService } = await import('../../src/services/clientService');
        api.delete.mockResolvedValue({});

        await clientService.delete(1);

        expect(api.delete).toHaveBeenCalledWith('/clients/1');
    });
});
