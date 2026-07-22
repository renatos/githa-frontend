import api from './api';

export const listReminders = async (status = null, serviceId = null, type = null) => {
    const params = {};
    if (status) params.status = status;
    if (serviceId) params.serviceId = serviceId;
    if (type) params.type = type;
    const response = await api.get('/reminders', { params });
    return response.data;
};

export const getActiveChurnByClient = async (clientId) => {
    const response = await api.get(`/reminders/active/churn/${clientId}`);
    return response.data;
};

export const updateReminder = async (id, data) => {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
};

// Aliases for compatibility during transition
export const listRebookingReminders = listReminders;
export const updateRebookingReminder = updateReminder;
