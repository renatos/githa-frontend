import api from './api';

const RESOURCE = '/sales';

export const saleService = {
    getAll(params) {
        return api.get(RESOURCE, { params });
    },

    getById(id) {
        return api.get(`${RESOURCE}/${id}`);
    },

    create(data) {
        return api.post(RESOURCE, data);
    },

    delete(id) {
        return api.delete(`${RESOURCE}/${id}`);
    },

    launchSale(data) {
        return api.post(`${RESOURCE}/launch`, data);
    }
};
