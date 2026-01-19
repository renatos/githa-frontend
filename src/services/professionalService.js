import api from './api';

export const professionalService = {
    getAll: (params) => api.get('/professionals', { params }),
    getById: (id) => api.get(`/professionals/${id}`),
    create: (professional) => api.post('/professionals', professional),
    update: (id, professional) => api.put(`/professionals/${id}`, professional),
    delete: (id) => api.delete(`/professionals/${id}`),
};
