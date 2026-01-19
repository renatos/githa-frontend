import api from './api';

export const appointmentService = {
    getAll: (params) => api.get('/appointments', { params }),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (appointment) => api.post('/appointments', appointment),
    update: (id, appointment) => api.put(`/appointments/${id}`, appointment),
    delete: (id) => api.delete(`/appointments/${id}`),
};
