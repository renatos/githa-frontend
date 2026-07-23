import api from './api';

export const linkService = {
    /**
     * Resolve a short link code (e.g., 'a3Fx9kLp')
     * @param {string} code
     * @returns {Promise<{ id: number, code: string, targetType: string, targetId: number, createdAt: string }>}
     */
    resolveLink: async (code) => {
        const response = await api.get(`/v1/links/${code}`);
        return response.data;
    },

    /**
     * Create a new short link
     * @param {string} targetType - Entity type string (e.g. 'REMINDER', 'CLIENT', 'APPOINTMENT')
     * @param {number} targetId - Entity ID
     * @returns {Promise<{ id: number, code: string, targetType: string, targetId: number }>}
     */
    createLink: async (targetType, targetId) => {
        const response = await api.post('/v1/links', { targetType, targetId });
        return response.data;
    }
};

export default linkService;
