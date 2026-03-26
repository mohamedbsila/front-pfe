import { apiClient } from '../../shared/services/index.js';

export class PlantsApi {
    async getAll() {
        return apiClient.get('/plants');
    }

    async getById(id) {
        return apiClient.get(`/plants/${id}`);
    }

    async create(plantData) {
        return apiClient.post('/plants', plantData);
    }

    async update(id, plantData) {
        return apiClient.patch(`/plants/${id}`, plantData);
    }

    async delete(id) {
        return apiClient.delete(`/plants/${id}`);
    }
}

export const plantsApi = new PlantsApi();

export class PlantVarietiesApi {
    async getAll() {
        return apiClient.get('/plant-varieties');
    }

    async getByPlantId(plantId) {
        return apiClient.get(`/plant-varieties/plant/${plantId}`);
    }

    async getById(id) {
        return apiClient.get(`/plant-varieties/${id}`);
    }

    async create(varietyData) {
        return apiClient.post('/plant-varieties', varietyData);
    }

    async update(id, varietyData) {
        return apiClient.patch(`/plant-varieties/${id}`, varietyData);
    }

    async delete(id) {
        return apiClient.delete(`/plant-varieties/${id}`);
    }
}

export const plantVarietiesApi = new PlantVarietiesApi();

export class ProductionRecordsApi {
    async getByMutuelle(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/production-records`);
    }

    async getByMutuelleAndSeason(mutuelleId, season) {
        return apiClient.get(`/mutuelles/${mutuelleId}/production-records/season/${season}`);
    }

    async getStats(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/production-records/stats`);
    }

    async getSeasons(mutuelleId) {
        return apiClient.get(`/mutuelles/${mutuelleId}/production-records/seasons`);
    }

    async getById(id) {
        return apiClient.get(`/production-records/${id}`);
    }

    async create(mutuelleId, recordData) {
        return apiClient.post(`/mutuelles/${mutuelleId}/production-records`, recordData);
    }

    async update(id, recordData) {
        return apiClient.patch(`/production-records/${id}`, recordData);
    }

    async delete(id) {
        return apiClient.delete(`/production-records/${id}`);
    }
}

export const productionRecordsApi = new ProductionRecordsApi();