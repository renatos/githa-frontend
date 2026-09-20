import api from './api';

export const leadService = {
    getAll: (params) => api.get('/leads', { params }),
    getById: (id) => api.get(`/leads/${id}`),
    create: (lead) => api.post('/leads', lead),
    update: (id, lead) => api.put(`/leads/${id}`, lead),
    discard: (id, data) => api.put(`/leads/${id}/discard`, data),
    updateOptOut: (id, optOut) => api.put(`/leads/${id}/opt-out`, { optOut }),
    convert: (id, clientId) => api.put(`/leads/${id}/convert`, { clientId }),
    bulkNotify: (data) => api.post('/leads/bulk-processes', data),
    getBulkProcesses: (params) => api.get('/leads/bulk-processes', { params }),
    getBulkProcess: (id) => api.get(`/leads/bulk-processes/${id}`),
    cancelBulkProcess: (id) => api.put(`/leads/bulk-processes/${id}/cancel`),
};
