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
import { confirmBridge } from './confirmBridge';

const getToast = () => toastBridge.getToast();
let isSessionExpiredAlertOpen = false;

export function resetApiSessionLockForTests() {
    isSessionExpiredAlertOpen = false;
}

api.interceptors.response.use(
    response => {
        stopLoading();
        return response;
    },
    error => {
        stopLoading();
        
        // Skip global error handling for 404 on /professionals/me (ADMIN users without professional record)
        // or when explicitly requested via config.skipGlobalErrorHandler
        const isMeEndpoint = error.config?.url?.includes('/professionals/me');
        const is404 = error.response?.status === 404;
        const skipGlobal = Boolean(error.config?.skipGlobalErrorHandler);

        if (!skipGlobal && !(isMeEndpoint && is404)) {
            const toast = getToast();
            errorHandler.handle(error, toast);
            error._handledGlobally = true;
        }

        // Only 401 (Unauthorized / expired token) should invalidate session; 403 is permission denied
        if (error.response && error.response.status === 401 && !isSessionExpiredAlertOpen) {
            isSessionExpiredAlertOpen = true;
            // Give user a chance to read the error toast or see the modal before redirecting
            setTimeout(() => {
                confirmBridge.alert({
                    title: 'Sessão Expirada',
                    message: 'Sua sessão expirou. Você será redirecionado para o login.',
                    type: 'warning',
                    onConfirm: () => {
                        isSessionExpiredAlertOpen = false;
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                });
            }, 1000);
        }
        return Promise.reject(error);
    }
);

export default api;
