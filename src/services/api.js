import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

import { errorHandler } from './errorHandler';

// Helper to get toast instance - simple version using window for now until we have a better service locator
const getToast = () => window.$toast;

api.interceptors.response.use(
    response => response,
    error => {
        const toast = getToast();
        errorHandler.handle(error, toast);

        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
