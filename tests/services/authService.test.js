import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../src/services/authService';
import { professionalService } from '../../src/services/professionalService';

vi.mock('../../src/services/professionalService', () => ({
    professionalService: {
        getMe: vi.fn(() => Promise.resolve({ data: { id: 123, name: 'Dr. House' } }))
    }
}));

describe('authService', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('setSession should store professional data in localStorage', async () => {
        const token = 'dummy.eyJncm91cHMiOlsiUk9MRV9BRE1JTiJdfQ.signature';
        const email = 'test@example.com';

        authService.setSession(token, email, true, true);
        await authService.fetchProfessionalProfile();

        const user = JSON.parse(localStorage.getItem('user'));
        expect(user.email).toBe(email);
        expect(user.professionalId).toBe(123);
        expect(user.professionalName).toBe('Dr. House');
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

    describe('isTokenActive', () => {
        it('should return false if there is no token', () => {
            expect(authService.isTokenActive()).toBe(false);
        });

        it('should return false if the token is invalid/malformed', () => {
            localStorage.setItem('token', 'invalid-token-format');
            expect(authService.isTokenActive()).toBe(false);
        });

        it('should return true if the token is valid and active (exp in the future)', () => {
            // Token payload: {"groups":["ROLE_ADMIN"],"exp":1924953600} (Dec 31, 2030)
            const token = 'header.eyJncm91cHMiOlsiUk9MRV9BRE1JTiJdLCJleHAiOjE5MjQ5NTM2MDB9.signature';
            localStorage.setItem('token', token);
            expect(authService.isTokenActive()).toBe(true);
        });

        it('should return false if the token is expired (exp in the past)', () => {
            // Token payload: {"groups":["ROLE_ADMIN"],"exp":1578028800} (Jan 3, 2020)
            const token = 'header.eyJncm91cHMiOlsiUk9MRV9BRE1JTiJdLCJleHAiOjE1NzgwMjg4MDB9.signature';
            localStorage.setItem('token', token);
            expect(authService.isTokenActive()).toBe(false);
        });

        it('should return true if the token has no exp claim', () => {
            // Token payload: {"groups":["ROLE_ADMIN"]}
            const token = 'header.eyJncm91cHMiOlsiUk9MRV9BRE1JTiJdfQ.signature';
            localStorage.setItem('token', token);
            expect(authService.isTokenActive()).toBe(true);
        });
    });
});
