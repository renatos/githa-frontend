import { describe, it, expect, vi, beforeEach } from 'vitest';
import { anamnesisService } from '../../src/services/anamnesisService';
import api from '../../src/services/api';

vi.mock('../../src/services/api');

describe('anamnesisService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch all anamneses for a client', async () => {
        const mockData = { content: [{ id: 1, type: 'FACIAL' }], totalElements: 1 };
        api.get.mockResolvedValueOnce({ data: mockData });

        const result = await anamnesisService.getAllByClient(123, { page: 0 });

        expect(api.get).toHaveBeenCalledWith('/clients/123/anamneses', { params: { page: 0 } });
        expect(result.data).toEqual(mockData);
    });

    it('should create an anamnesis', async () => {
        const mockData = { id: 1, type: 'EYELASH_EXTENSION' };
        api.post.mockResolvedValueOnce({ data: mockData });

        const payload = { type: 'EYELASH_EXTENSION', attendanceDate: '2026-02-28' };
        const result = await anamnesisService.create(123, payload);

        expect(api.post).toHaveBeenCalledWith('/clients/123/anamneses', payload);
        expect(result.data).toEqual(mockData);
    });
});
