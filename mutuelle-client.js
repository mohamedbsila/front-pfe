/**
 * Mutuelle API Client
 */
const mutuelleClient = {
    async getAll() {
        return apiClient.get('/mutuelles');
    },

    async getById(id) {
        return apiClient.get(`/mutuelles/${id}`);
    },

    async create(data) {
        return apiClient.post('/mutuelles', data);
    },

    async createWithFiles(formData) {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${apiClient.baseURL}/mutuelles`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        
        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                console.error('Backend error:', errorData);
                errorMessage = errorData.message || errorData.error || errorMessage;
                if (Array.isArray(errorMessage)) {
                    errorMessage = errorMessage.join(', ');
                }
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        return await response.json();
    },

    async update(id, data) {
        return apiClient.patch(`/mutuelles/${id}`, data);
    },

    async delete(id) {
        return apiClient.delete(`/mutuelles/${id}`);
    },

    // Members/Employees
    async getMutadhids(id) {
        return apiClient.get(`/mutuelles/${id}/mutadhid`);
    },

    async addMutadhid(id, data) {
        return apiClient.post(`/mutuelles/${id}/mutadhid`, data);
    },

    async getEmployeeQars(id) {
        return apiClient.get(`/mutuelles/${id}/employee-qar`);
    },

    async addEmployeeQar(id, data) {
        return apiClient.post(`/mutuelles/${id}/employee-qar`, data);
    },

    async getEmployeeArs(id) {
        return apiClient.get(`/mutuelles/${id}/employee-ar`);
    },

    async addEmployeeAr(id, data) {
        return apiClient.post(`/mutuelles/${id}/employee-ar`, data);
    },

    async addLaborData(mutuelleId, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/labor-data`, data);
    },

    async updateEmployeeQar(mutuelleId, id, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-qar/${id}`, data);
    },

    async updateEmployeeAr(mutuelleId, id, data) {
        return apiClient.post(`/mutuelles/${mutuelleId}/employee-ar/${id}`, data);
    }
};
