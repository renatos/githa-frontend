import api from './api';

export const appointmentService = {
    getAll: (params) => api.get('/appointments', { params }),
    getById: (id) => api.get(`/appointments/${id}`),
    create: (appointment) => api.post('/appointments', appointment),
    createBatch: (appointments) => api.post('/appointments/batch', appointments),
    update: (id, appointment) => api.put(`/appointments/${id}`, appointment),
    updateGroupStatus: (groupId, status) => api.patch(`/appointments/group/${groupId}/status`, null, { params: { status } }),
    delete: (id) => api.delete(`/appointments/${id}`),
};
