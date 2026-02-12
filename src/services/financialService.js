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
     * @param {Number} month - Month (1-12), defaults to current
     * @param {Number} year - Year, defaults to current
     */
    getSummary(month, year) {
        const params = {};
        if (month) params.month = month;
        if (year) params.year = year;
        return api.get(`${resource}/summary`, { params });
    },

    /**
     * Get daily financial summary
     * @param {Number} day - Day of month (1-31)
     * @param {Number} month - Month (1-12)
     * @param {Number} year - Year
     */
    getDailySummary(day, month, year) {
        return api.get(`${resource}/daily-summary`, { params: { day, month, year } });
    },

    // Operating Expenses
    getOperatingExpenses(params) {
        return api.get('/operating-expenses', { params });
    },

    createOperatingExpense(data) {
        return api.post('/operating-expenses', data);
    },

    updateOperatingExpense(id, data) {
        return api.put(`/operating-expenses/${id}`, data);
    },

    deleteOperatingExpense(id) {
        return api.delete(`/operating-expenses/${id}`);
    },

    createAppointmentFromTransaction(id, data) {
        return api.post(`${resource}/transactions/${id}/appointment`, data);
    }
};
