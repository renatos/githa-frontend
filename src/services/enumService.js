import api from './api';

const cache = new Map();

/**
 * Service to fetch enum values and descriptions from the backend.
 * Uses an in-memory cache to avoid redundant API calls.
 */
export const enumService = {
    /**
     * Get all options for a specific enum.
     * @param {string} enumName - The exact class name of the enum (e.g., 'AppointmentStatus')
     * @returns {Promise<Array<{name: string, description: string}>>}
     */
    async getOptions(enumName) {
        if (cache.has(enumName)) {
            return cache.get(enumName);
        }

        try {
            const response = await api.get(`/enums/${enumName}`);
            cache.set(enumName, response.data);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch options for enum ${enumName}:`, error);
            return [];
        }
    },

    /**
     * Get the description for a specific enum value.
     * @param {string} enumName - The exact class name of the enum
     * @param {string} value - The enum value/name (e.g., 'SCHEDULED')
     * @returns {Promise<string>} - The human-readable description
     */
    async getDescription(enumName, value) {
        if (!value) return '';
        const options = await this.getOptions(enumName);
        const option = options.find(opt => opt.name === value);
        return option ? option.description : value;
    }
};
