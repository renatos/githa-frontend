import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            authService.setSession(response.data.token, response.data.email);
        }
        return response.data;
    },

    async loginWithGoogle(token) {
        const response = await api.post('/auth/google', { token });
        if (response.data.token) {
            authService.setSession(response.data.token, response.data.email);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    setSession: (token, email) => {
        localStorage.setItem('token', token);
        const roles = authService.extractRoles(token);
        localStorage.setItem('user', JSON.stringify({ email, roles }));
    },

    extractRoles: (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const payload = JSON.parse(jsonPayload);
            const groups = payload.groups || [];
            // Handle both "ADMIN" and "ROLE_ADMIN" formats
            return groups.map(g => g.startsWith('ROLE_') ? g.replace('ROLE_', '') : g);
        } catch (e) {
            console.error('Failed to parse token roles', e);
            return [];
        }
    },

    getToken: () => localStorage.getItem('token'),

    isAuthenticated: () => !!localStorage.getItem('token'),

    getUser: () => JSON.parse(localStorage.getItem('user') || '{}'),

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return {};

        const user = JSON.parse(userStr);
        // Auto-fix for existing sessions missing roles
        if (!user.roles || user.roles.length === 0) {
            const token = localStorage.getItem('token');
            if (token) {
                user.roles = authService.extractRoles(token);
                localStorage.setItem('user', JSON.stringify(user));
            }
        }

        // Ensure roles are clean (handle stale data with ROLE_ prefix)
        if (user.roles && user.roles.length > 0) {
            user.roles = user.roles.map(r => r.replace('ROLE_', ''));
        }

        return user;
    },
};
