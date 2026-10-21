import api from './api';

const parameterValueCache = new Map();

export const systemParameterService = {
    getAll() {
        return api.get('/parameters');
    },

    update(id, value) {
        parameterValueCache.clear();
        return api.put(`/parameters/${id}`, { value });
    },

    getPublicParams() {
        return api.get('/parameters/public');
    },

    getParameterValue(key) {
        if (parameterValueCache.has(key)) {
            return parameterValueCache.get(key);
        }
        const requestPromise = api.get(`/parameters/value/${key}`).catch((err) => {
            parameterValueCache.delete(key);
            throw err;
        });
        parameterValueCache.set(key, requestPromise);
        return requestPromise;
    },

    clearCache() {
        parameterValueCache.clear();
    }
};
