import api from './api';

export const listRebookingReminders = async (status = null, serviceId = null, type = null) => {
    const params = {};
    if (status) params.status = status;
    if (serviceId) params.serviceId = serviceId;
    if (type) params.type = type;
    const response = await api.get('/rebooking', { params });
    return response.data;
};

export const getActiveChurnByClient = async (clientId) => {
    const response = await api.get(`/rebooking/active/churn/${clientId}`);
    return response.data;
};

export const updateRebookingReminder = async (id, data) => {
    const response = await api.put(`/rebooking/${id}`, data);
    return response.data;
};
