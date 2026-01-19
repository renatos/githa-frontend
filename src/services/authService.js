import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({ email: response.data.email }));
        }
        return response.data;
    },

    async loginWithGoogle(token) {
        const response = await api.post('/auth/google', { token });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({ email: response.data.email }));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getToken: () => localStorage.getItem('token'),

    isAuthenticated: () => !!localStorage.getItem('token'),

    getUser: () => JSON.parse(localStorage.getItem('user') || '{}'),

    getCurrentUser: () => JSON.parse(localStorage.getItem('user') || '{}'),
};
