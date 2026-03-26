import { apiClient } from '../../shared/services/index.js';

export class EmployesClient {
    // QAR Employees
    async getAllQar(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/employee-qar`);
    }

    async createQar(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-qar`, data);
    }

    async updateQar(mutuelleId, empId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-qar/${empId}`, data);
    }

    // AR Employees
    async getAllAr(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/employee-ar`);
    }

    async createAr(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-ar`, data);
    }

    async updateAr(mutuelleId, empId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-ar/${empId}`, data);
    }

    // Attendance
    async updateAttendance(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/attendance`, data);
    }

    async getAttendance(mutuelleId, date) {
        const query = date ? `?date=${date}` : '';
        return apiClient.get(`/mutuelles/${mutuelleId}/attendance${query}`);
    }

    // Face Recognition
    async enrollFace(mutuelleId, empId, empType, base64Image) {
        return apiClient.post(`/mutuelles/${mutuelleId}/face-enroll/${empId}/${empType}`, {
            image: base64Image
        });
    }

    async verifyFace(mutuelleId, base64Image) {
        return apiClient.post(`/mutuelles/${mutuelleId}/face-verify`, {
            image: base64Image
        });
    }
}

export const employesClient = new EmployesClient();
