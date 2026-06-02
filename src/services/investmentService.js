import api from './api';

export const investmentService = {
  createInvestment(investment) {
    return api.post('/investments', investment);
  },

  listInvestments() {
    return api.get('/investments');
  },

  updateInvestment(id, investment) {
    return api.put(`/investments/${id}`, investment);
  },

  deleteInvestment(id) {
    return api.delete(`/investments/${id}`);
  },

  getInvestmentMetrics(id, startDate, endDate) {
    const params = { startDate, endDate };
    return api.get(`/investments/${id}/metrics`, { params });
  }
};
