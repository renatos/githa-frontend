import api from './api';

export const dispatchMessageService = {
  getAll: async (params = {}) => {
    const response = await api.get('/dispatch-messages', { params });
    return response.data;
  },

  getQueue: async (params = {}) => {
    const response = await api.get('/dispatch-messages/queue', { params });
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get('/dispatch-messages/history', { params });
    return response.data;
  },

  approve: async (id, data = {}) => {
    const response = await api.post(`/dispatch-messages/${id}/approve`, data);
    return response.data;
  },

  reject: async (id) => {
    const response = await api.post(`/dispatch-messages/${id}/reject`);
    return response.data;
  },

  unapprove: async (id) => {
    const response = await api.post(`/dispatch-messages/${id}/unapprove`);
    return response.data;
  },

  getEntityHistory: async (targetType, targetId) => {
    const response = await api.get('/dispatch-messages/history', {
      params: { targetType, targetId }
    });
    return response.data;
  }
};

export default dispatchMessageService;
