import api from './api';

const RESOURCE = '/payment-methods';

export default {
    getAll(params) {
        return api.get(RESOURCE, { params });
    },

    getById(id) {
        return api.get(`${RESOURCE}/${id}`);
    },

    create(data) {
        return api.post(RESOURCE, data);
    },

    update(id, data) {
        return api.put(`${RESOURCE}/${id}`, data);
    },

    delete(id) {
        return api.delete(`${RESOURCE}/${id}`);
    }
};
