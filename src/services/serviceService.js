import api from './api';

export const serviceService = {
    getAll: (params) => api.get('/services', { params }),
    getById: (id) => api.get(`/services/${id}`),
    create: (service) => api.post('/services', service),
    update: (id, service) => api.put(`/services/${id}`, service),
    delete: (id) => api.delete(`/services/${id}`),
};
