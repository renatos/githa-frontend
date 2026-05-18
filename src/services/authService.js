import api from './api';
import { professionalService } from './professionalService';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            authService.setSession(
                response.data.token, 
                response.data.email, 
                response.data.calendarSyncEnabled, 
                response.data.contactsSyncEnabled
            );
            await authService.fetchProfessionalProfile();
        }
        return response.data;
    },

    async loginWithGoogle(code, state) {
        const response = await api.get('/auth/google/callback', { params: { code, state } });
        if (response.data.token) {
            authService.setSession(
                response.data.token, 
                response.data.email, 
                response.data.calendarSyncEnabled, 
                response.data.contactsSyncEnabled
            );
            await authService.fetchProfessionalProfile();
        }
        return response.data;
    },

    mockLogin: async () => {
        const response = await api.post('/auth/mock-login');
        if (response.data.token) {
            authService.setSession(
                response.data.token, 
                response.data.email, 
                response.data.calendarSyncEnabled, 
                response.data.contactsSyncEnabled
            );
            await authService.fetchProfessionalProfile();
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    setSession: (token, email, calendarSyncEnabled, contactsSyncEnabled) => {
        localStorage.setItem('token', token);
        const roles = authService.extractRoles(token);
        localStorage.setItem('user', JSON.stringify({ 
            email, 
            roles, 
            calendarSyncEnabled, 
            contactsSyncEnabled
        }));
    },

    fetchProfessionalProfile: async () => {
        try {
            const response = await professionalService.getMe();
            if (response.data) {
                authService.updateSessionProperty('professionalId', response.data.id);
                authService.updateSessionProperty('professionalName', response.data.name);
                return response.data;
            }
        } catch (error) {
            // Silence 404 errors as ADMIN users might not have a professional associated
            if (error.response?.status !== 404) {
                console.error('Failed to fetch professional profile', error);
            }
        }
        return null;
    },

    updateSessionProperty: (key, value) => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            user[key] = value;
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    refreshSession: async () => {
        if (!authService.isAuthenticated()) return;
        try {
            const response = await api.get('/auth/session');
            if (response.data) {
                const user = authService.getCurrentUser();
                user.calendarSyncEnabled = response.data.calendarSyncEnabled;
                user.contactsSyncEnabled = response.data.contactsSyncEnabled;
                localStorage.setItem('user', JSON.stringify(user));
                
                // Refresh full professional profile
                await authService.fetchProfessionalProfile();
            }
        } catch (error) {
            console.error('Failed to refresh session', error);
        }
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

    isTokenActive: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            if (payload.exp) {
                return Date.now() < payload.exp * 1000;
            }
            return true;
        } catch (e) {
            return false;
        }
    },

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
