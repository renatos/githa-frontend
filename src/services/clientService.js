import api from './api';

export const clientService = {
    getAll: (params) => api.get('/clients', { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (client) => api.post('/clients', client),
    createBatch: (clients) => api.post('/clients/batch', clients),
    update: (id, client) => api.put(`/clients/${id}`, client),
    delete: (id) => api.delete(`/clients/${id}`),
};
