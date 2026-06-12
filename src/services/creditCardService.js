import api from './api';

const RESOURCE = '/credit-cards';

export default {
    getAll() {
        return api.get(RESOURCE);
    },

    create(data) {
        return api.post(RESOURCE, data);
    },

    update(id, data) {
        return api.put(`${RESOURCE}/${id}`, data);
    },

    delete(id) {
        return api.delete(`${RESOURCE}/${id}`);
    },

    getExpenses(cardId) {
        return api.get(`${RESOURCE}/${cardId}/expenses`);
    },

    createExpense(cardId, data) {
        return api.post(`${RESOURCE}/${cardId}/expenses`, data);
    },

    getBills(cardId, params) {
        return api.get(`${RESOURCE}/${cardId}/bills`, { params });
    },

    getBillDetails(cardId, year, month) {
        return api.get(`${RESOURCE}/${cardId}/bills/${year}/${month}`);
    },

    payBill(cardId, year, month, data) {
        return api.post(`${RESOURCE}/${cardId}/bills/${year}/${month}/pay`, data || {});
    },

    getBillsSummary(params) {
        return api.get(`${RESOURCE}/bills/summary`, { params });
    },

    getExpense(expenseId) {
        return api.get(`${RESOURCE}/expenses/${expenseId}`);
    },

    updateExpense(expenseId, data) {
        return api.put(`${RESOURCE}/expenses/${expenseId}`, data);
    },

    deleteExpense(expenseId) {
        return api.delete(`${RESOURCE}/expenses/${expenseId}`);
    }
};
