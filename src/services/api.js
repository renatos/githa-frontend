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
import { toastBridge } from './toastBridge';

const getToast = () => toastBridge.getToast();

api.interceptors.response.use(
    response => response,
    error => {
        const toast = getToast();
        errorHandler.handle(error, toast);

        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
            // Give user a chance to read the error toast or see the modal before redirecting
            setTimeout(() => {
                alert('Sessão expirada ou sem permissão. Você será redirecionado para o login.');
                localStorage.removeItem('token');
                window.location.href = '/login';
            }, 1000);
        }
        return Promise.reject(error);
    }
);

export default api;
