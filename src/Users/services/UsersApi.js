import { apiClient } from '../../shared/services/index.js';

export class UsersApi {
    async getAll() {
        return apiClient.get('/users');
    }

    async getById(id) {
        return apiClient.get(`/users/${id}`);
    }

    async create(userData) {
        return apiClient.post('/users', userData);
    }

    async update(id, userData) {
        return apiClient.put(`/users/${id}`, userData);
    }

    async delete(id) {
        return apiClient.delete(`/users/${id}`);
    }

    async getAuditHistory(userId) {
        return apiClient.request(`/users/${userId}/audit`);
    }
}

export const usersApi = new UsersApi();