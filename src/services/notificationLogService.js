import api from './api';

export const notificationLogService = {
    getAll: (params) => api.get('/notifications/logs', { params }),
    getConnections: () => api.get(window.location.origin + '/internal/admin/connections'),
    clearConnections: () => api.delete(window.location.origin + '/internal/admin/connections'),
};
