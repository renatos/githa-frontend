import api from './api';

export const configService = {
    async loadConfig() {
        try {
            const response = await api.get('/parameters/public');
            localStorage.setItem('appConfig', JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.warn('Failed to load system config, using defaults', error);
            return {};
        }
    },

    get(key, defaultValue) {
        try {
            const config = JSON.parse(localStorage.getItem('appConfig') || '{}');
            return config[key] !== undefined ? config[key] : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }
};
