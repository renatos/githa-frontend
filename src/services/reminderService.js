import api from './api';

export const reminderService = {
    getAll: async (status = null, serviceId = null, type = null) => {
        const params = {};
        if (status) params.status = status;
        if (serviceId) params.serviceId = serviceId;
        if (type) {
            params.type = Array.isArray(type) ? type.join(',') : type;
        }
        const response = await api.get('/reminders', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/reminders/${id}`);
        return response.data;
    },

    getActiveChurnByClient: async (clientId) => {
        const response = await api.get(`/reminders/active/churn/${clientId}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/reminders/${id}`, data);
        return response.data;
    }
};

// Aliases for compatibility
export const listReminders = reminderService.getAll;
export const getActiveChurnByClient = reminderService.getActiveChurnByClient;
export const updateReminder = reminderService.update;
export const listRebookingReminders = reminderService.getAll;
export const updateRebookingReminder = reminderService.update;

export default reminderService;
