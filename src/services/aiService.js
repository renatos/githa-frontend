import api from './api';

export const aiService = {
    chat: (message, professionalId, sessionId = null) => {
        const params = { professionalId, ...(sessionId ? { sessionId } : {}) };
        return api.post('/ai/chat', { message }, { params });
    },

    getSessions: (professionalId) => {
        return api.get('/ai/sessions', { params: { professionalId } });
    },

    getDashboardInsights: (params) => {
        return api.get('/ai/insights', { params });
    }
};
