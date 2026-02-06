import api from './api';

export const userService = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (user) => api.post('/users', user),
    update: (id, user) => api.put(`/users/${id}`, user),
    delete: (id) => api.delete(`/users/${id}`),
    getInactive: () => api.get('/users/inactive'),
    reactivate: (id) => api.put(`/users/${id}/reactivate`),
};
