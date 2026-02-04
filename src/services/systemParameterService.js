import api from './api';

export const systemParameterService = {
    getAll() {
        return api.get('/parameters');
    },

    update(id, value) {
        return api.put(`/parameters/${id}`, { value });
    },

    getPublicParams() {
        return api.get('/parameters/public');
    },

    getParameterValue(key) {
        return api.get(`/parameters/value/${key}`);
    }
};
