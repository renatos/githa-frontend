import api from './api';

const resource = '/financials';

export default {
    /**
     * List transactions with filters
     * @param {Object} filters { startDate, endDate, type, status }
     */
    getTransactions(filters) {
        return api.get(`${resource}/transactions`, { params: filters });
    },

    /**
     * Create a new transaction
     * @param {Object} transaction 
     */
    createTransaction(transaction) {
        return api.post(`${resource}/transactions`, transaction);
    },

    /**
     * Update an existing transaction
     * @param {Long} id 
     * @param {Object} transaction 
     */
    updateTransaction(id, transaction) {
        return api.put(`${resource}/transactions/${id}`, transaction);
    },

    /**
     * Delete a transaction
     * @param {Long} id 
     */
    deleteTransaction(id) {
        return api.delete(`${resource}/transactions/${id}`);
    },

    /**
     * Get financial summary (totals)
     */
    getSummary() {
        return api.get(`${resource}/summary`);
    },

    // Bank Accounts
    getAccounts() {
        return api.get('/bank-accounts');
    },

    createAccount(account) {
        return api.post('/bank-accounts', account);
    },

    updateAccount(id, account) {
        return api.put(`/bank-accounts/${id}`, account);
    },

    deleteAccount(id) {
        return api.delete(`/bank-accounts/${id}`);
    }
};
