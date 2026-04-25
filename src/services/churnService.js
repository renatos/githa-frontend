import api from './api';

export const churnService = {
  /**
   * Obtém a lista de clientes com risco de churn e suas métricas.
   * @param {Object} filters Filtros dinâmicos (ex: churnProbabilityScore_gte)
   * @param {Number} page Página atual
   * @param {Number} size Tamanho da página
   * @param {String} sort Ordenação
   */
  getChurnRisks(filters = {}, page = 0, size = 20, sort = null) {
    const params = { page, size, sort, ...filters };
    return api.get('/reports/churn-risks', { params });
  },

  /**
   * Dispara manualmente o recálculo dos scores de churn.
   */
  recalculateScores() {
    return api.post('/reports/churn-risks/recalculate');
  },

  /**
   * Dispara manualmente a execução das campanhas de retenção.
   */
  executeRetention() {
    return api.post('/reports/churn-risks/execute-retention');
  }
};
