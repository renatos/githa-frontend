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
  },

  generateCandidates: async (data = {}) => {
    const response = await api.post('/dispatch-messages/generate-candidates', data);
    return response.data;
  },

  generateFollowUpCandidates: async (data = {}) => {
    const response = await api.post('/dispatch-messages/generate-follow-up-candidates', data);
    return response.data;
  },

  enqueueFromReminder: async (reminderId, data = {}) => {
    const response = await api.post(`/dispatch-messages/from-reminder/${reminderId}`, data);
    return response.data;
  },

  getHistoryByOrigin: async (originType, originId) => {
    const response = await api.get('/dispatch-messages/history', {
      params: { originType, originId }
    });
    return response.data;
  }
};

export default dispatchMessageService;
