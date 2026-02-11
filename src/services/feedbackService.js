import api from './api';

export const feedbackService = {
    getAll: (params) => api.get('/feedbacks', { params }),
    getById: (id) => api.get(`/feedbacks/${id}`),
    create: (data) => api.post('/feedbacks', data),
    update: (id, data) => api.put(`/feedbacks/${id}`, data),
    addReply: (id, data) => api.post(`/feedbacks/${id}/replies`, data),
    // No delete endpoint in backend yet, but good to have the placeholder if needed
    // delete: (id) => api.delete(`/feedbacks/${id}`),
};
