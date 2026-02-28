import api from './api';

export const anamnesisService = {
    getAllByClient: (clientId, params) =>
        api.get(`/clients/${clientId}/anamneses`, { params }),

    getById: (clientId, id) =>
        api.get(`/clients/${clientId}/anamneses/${id}`),

    create: (clientId, data) =>
        api.post(`/clients/${clientId}/anamneses`, data),

    update: (clientId, id, data) =>
        api.put(`/clients/${clientId}/anamneses/${id}`, data),
};
