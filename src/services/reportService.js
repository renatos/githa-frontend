import api from './api';

export const reportService = {
  getDre(params = {}) {
    return api.get('/v1/reports/dre', { params });
  },

  getBillingByPaymentMethod(params = {}) {
    return api.get('/v1/reports/billing-by-payment-method', { params });
  },

  getSalesPerformance(params = {}) {
    return api.get('/v1/reports/sales-performance', { params });
  }
};

export default reportService;
