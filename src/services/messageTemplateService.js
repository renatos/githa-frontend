import api from './api';

export const messageTemplateService = {
  getAll: async (params = {}) => {
    const response = await api.get('/message-templates', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/message-templates/${id}`);
    return response.data;
  },

  getDefault: async (params = {}) => {
    const response = await api.get('/message-templates/default', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/message-templates', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/message-templates/${id}`, data);
    return response.data;
  },

  toggleActive: async (id) => {
    const response = await api.patch(`/message-templates/${id}/toggle-active`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/message-templates/${id}`);
    return response.data;
  }
};

export default messageTemplateService;
