import { apiClient } from '../../shared/services/index.js';

export class MutuelleClient {
    async getAll() {
        return apiClient.get('/mutuelles');
    }

    async getById(id) {
        return apiClient.get(`/mutuelles/${id}`);
    }

    async create(data) {
        return apiClient.post('/mutuelles', data);
    }

    async createWithFiles(formData) {
        return apiClient.postFormData('/mutuelles', formData);
    }

    async update(id, data) {
        return apiClient.patch(`/mutuelles/${id}`, data);
    }

    async delete(id) {
        return apiClient.delete(`/mutuelles/${id}`);
    }
}

export const mutuelleClient = new MutuelleClient();

// Member (Mutadhid) operations
export class MembersApi {
    async getAll(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/mutadhid`);
    }

    async create(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/mutadhid`, data);
    }

    async update(mutuelleId, memberId, data) {
        return apiClient.put(`/mutuelles/${mutuelleId}/mutadhid/${memberId}`, data);
    }

    async delete(mutuelleId, memberId) {
        return apiClient.delete(`/mutuelles/${mutuelleId}/mutadhid/${memberId}`);
    }
}

export const membersApi = new MembersApi();

// Employee QAR (Employee Quadrant AR) operations
export class EmployeeQarApi {
    async getAll(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/employee-qar`);
    }

    async create(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-qar`, data);
    }

    async update(mutuelleId, employeeId, data) {
        return apiClient.put(`/mutuelles/${mutuelleId}/employee-qar/${employeeId}`, data);
    }

    async delete(mutuelleId, employeeId) {
        return apiClient.delete(`/mutuelles/${mutuelleId}/employee-qar/${employeeId}`);
    }
}

export const employeeQarApi = new EmployeeQarApi();

// Employee AR operations
export class EmployeeArApi {
    async getAll(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/employee-ar`);
    }

    async create(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-ar`, data);
    }

    async update(mutuelleId, employeeId, data) {
        return apiClient.put(`/mutuelles/${mutuelleId}/employee-ar/${employeeId}`, data);
    }

    async delete(mutuelleId, employeeId) {
        return apiClient.delete(`/mutuelles/${mutuelleId}/employee-ar/${employeeId}`);
    }
}

export const employeeArApi = new EmployeeArApi();

// Labor Data operations
export class LaborDataApi {
    async getByYear(mutuelleId, year) {
        return apiClient.get(`/mutuelles/${mutuelleId}/labor-data?year=${year}`);
    }

    async getAvailableYears(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/labor-data/years`);
    }

    async create(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/labor-data`, data);
    }

    async update(mutuelleId, dataId, data) {
        return apiClient.put(`/mutuelles/${mutuelleId}/labor-data/${dataId}`, data);
    }

    async delete(mutuelleId, dataId) {
        return apiClient.delete(`/mutuelles/${mutuelleId}/labor-data/${dataId}`);
    }
}

export const laborDataApi = new LaborDataApi();

// Workshop Data operations
export class WorkshopDataApi {
    async getByYear(mutuelleId, year) {
        return apiClient.get(`/mutuelles/${mutuelleId}/workshop-data?year=${year}`);
    }

    async getAvailableYears(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/workshop-data/years`);
    }

    async create(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/workshop-data`, data);
    }

    async update(mutuelleId, dataId, data) {
        return apiClient.put(`/mutuelles/${mutuelleId}/workshop-data/${dataId}`, data);
    }

    async delete(mutuelleId, dataId) {
        return apiClient.delete(`/mutuelles/${mutuelleId}/workshop-data/${dataId}`);
    }
}

export const workshopDataApi = new WorkshopDataApi();