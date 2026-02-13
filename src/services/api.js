import axios from 'axios';
import { loadingState } from './loadingState';

let pendingRequests = 0;
let loadingTimeout = null;

const startLoading = () => {
    pendingRequests++;
    if (pendingRequests === 1) {
        loadingTimeout = setTimeout(() => {
            if (pendingRequests > 0) {
                loadingState.setLoading(true);
            }
        }, 800);
    }
};

const stopLoading = () => {
    pendingRequests--;
    if (pendingRequests <= 0) {
        pendingRequests = 0;
        if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
        }
        loadingState.setLoading(false);
    }
};

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(config => {
    startLoading();
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    stopLoading();
    return Promise.reject(error);
});

import { errorHandler } from './errorHandler';
import { toastBridge } from './toastBridge';

const getToast = () => toastBridge.getToast();

api.interceptors.response.use(
    response => {
        stopLoading();
        return response;
    },
    error => {
        stopLoading();
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
