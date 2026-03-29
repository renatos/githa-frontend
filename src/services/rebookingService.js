import api from './api';

export const listRebookingReminders = async (status = null, serviceId = null) => {
    const params = {};
    if (status) params.status = status;
    if (serviceId) params.serviceId = serviceId;
    const response = await api.get('/rebooking', { params });
    return response.data;
};

export const updateRebookingReminder = async (id, data) => {
    const response = await api.put(`/rebooking/${id}`, data);
    return response.data;
};
