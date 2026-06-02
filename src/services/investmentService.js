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
  },

  getInvestmentMetricsHistory(id) {
    return api.get(`/investments/${id}/metrics/history`);
  },

  recalculateInvestmentMetrics(id, year, month) {
    const params = { year, month };
    return api.post(`/investments/${id}/metrics/recalculate`, null, { params });
  },

  getInvestmentMetricsTransactions(id, year, month) {
    const params = { year, month };
    return api.get(`/investments/${id}/metrics/transactions`, { params });
  }
};
