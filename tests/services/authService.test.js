import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../src/services/authService';

describe('authService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('setSession should store professional data in localStorage', () => {
        const token = 'dummy.eyJncm91cHMiOlsiUk9MRV9BRE1JTiJdfQ.signature';
        const email = 'test@example.com';
        const professionalId = 123;
        const professionalName = 'Dr. House';

        authService.setSession(token, email, professionalId, professionalName);

        const user = JSON.parse(localStorage.getItem('user'));
        expect(user.email).toBe(email);
        expect(user.professionalId).toBe(professionalId);
        expect(user.professionalName).toBe(professionalName);
        expect(user.roles).toContain('ADMIN');
    });

    it('getCurrentUser should return professional data', () => {
        const userData = {
            email: 'test@example.com',
            professionalId: 123,
            professionalName: 'Dr. House',
            roles: ['admin']
        };
        localStorage.setItem('user', JSON.stringify(userData));

        const user = authService.getCurrentUser();
        expect(user.professionalId).toBe(123);
        expect(user.professionalName).toBe('Dr. House');
    });
});
