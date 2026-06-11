import api from './api';

export const auditService = {
    getEntities: () => api.get('/audit/entities'),
    getByEntity: (entityName, params) => api.get(`/audit/${entityName}`, { params }),
};
