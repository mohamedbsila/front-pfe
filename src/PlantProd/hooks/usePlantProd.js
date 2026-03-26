import { plantsApi, plantVarietiesApi, productionRecordsApi } from '../services/index.js';
import { formatDate, escapeHtml } from '../../shared/utils/index.js';

export function createPlantProdStore() {
    let state = {
        plants: [],
        varieties: [],
        productionRecords: [],
        stats: null,
        seasons: [],
        currentMutuelleId: null,
        currentSeason: null,
        isLoading: false,
        error: null,
        currentEditingId: null,
    };

    const listeners = new Set();

    const getState = () => state;

    const setState = (updates) => {
        state = { ...state, ...updates };
        listeners.forEach(listener => listener(state));
    };

    const subscribe = (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    const loadPlants = async () => {
        setState({ isLoading: true, error: null });
        try {
            const plants = await plantsApi.getAll();
            setState({ plants, isLoading: false });
            return plants;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const getPlantById = async (id) => {
        return await plantsApi.getById(id);
    };

    const createPlant = async (plantData) => {
        setState({ isLoading: true });
        try {
            const result = await plantsApi.create(plantData);
            await loadPlants();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const updatePlant = async (id, plantData) => {
        setState({ isLoading: true });
        try {
            const result = await plantsApi.update(id, plantData);
            await loadPlants();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const deletePlant = async (id) => {
        setState({ isLoading: true });
        try {
            await plantsApi.delete(id);
            await loadPlants();
        } finally {
            setState({ isLoading: false });
        }
    };

    const loadVarieties = async () => {
        setState({ isLoading: true, error: null });
        try {
            const varieties = await plantVarietiesApi.getAll();
            setState({ varieties, isLoading: false });
            return varieties;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const loadVarietiesByPlant = async (plantId) => {
        setState({ isLoading: true, error: null });
        try {
            const varieties = await plantVarietiesApi.getByPlantId(plantId);
            setState({ varieties, isLoading: false });
            return varieties;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const createVariety = async (varietyData) => {
        setState({ isLoading: true });
        try {
            const result = await plantVarietiesApi.create(varietyData);
            await loadVarieties();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const updateVariety = async (id, varietyData) => {
        setState({ isLoading: true });
        try {
            const result = await plantVarietiesApi.update(id, varietyData);
            await loadVarieties();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const deleteVariety = async (id) => {
        setState({ isLoading: true });
        try {
            await plantVarietiesApi.delete(id);
            await loadVarieties();
        } finally {
            setState({ isLoading: false });
        }
    };

    const loadProductionRecords = async (mutuelleId, silent = false) => {
        if (!silent) setState({ isLoading: true, error: null });
        try {
            const records = await productionRecordsApi.getByMutuelle(mutuelleId);
            setState({ productionRecords: records, currentMutuelleId: mutuelleId, isLoading: false });
            return records;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const loadProductionRecordsBySeason = async (mutuelleId, season) => {
        setState({ isLoading: true, error: null, currentSeason: season });
        try {
            const records = await productionRecordsApi.getByMutuelleAndSeason(mutuelleId, season);
            setState({ productionRecords: records, isLoading: false });
            return records;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const loadStats = async (mutuelleId) => {
        try {
            const stats = await productionRecordsApi.getStats(mutuelleId);
            setState({ stats });
            return stats;
        } catch (error) {
            setState({ error: error.message });
            throw error;
        }
    };

    const loadSeasons = async (mutuelleId) => {
        try {
            const seasons = await productionRecordsApi.getSeasons(mutuelleId);
            setState({ seasons });
            return seasons;
        } catch (error) {
            setState({ error: error.message });
            throw error;
        }
    };

    const createProductionRecord = async (mutuelleId, recordData) => {
        setState({ isLoading: true });
        try {
            const result = await productionRecordsApi.create(mutuelleId, recordData);
            await loadProductionRecords(mutuelleId);
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const updateProductionRecord = async (id, recordData) => {
        setState({ isLoading: true });
        try {
            const result = await productionRecordsApi.update(id, recordData);
            if (state.currentMutuelleId) {
                await loadProductionRecords(state.currentMutuelleId);
            }
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const deleteProductionRecord = async (id) => {
        setState({ isLoading: true });
        try {
            await productionRecordsApi.delete(id);
            if (state.currentMutuelleId) {
                await loadProductionRecords(state.currentMutuelleId);
            }
        } finally {
            setState({ isLoading: false });
        }
    };

    const setCurrentEditing = (id) => {
        setState({ currentEditingId: id });
    };

    const setCurrentMutuelle = (mutuelleId) => {
        setState({ currentMutuelleId: mutuelleId });
    };

    const setCurrentSeason = (season) => {
        setState({ currentSeason: season });
    };

    const clearState = () => {
        setState({
            productionRecords: [],
            stats: null,
            seasons: [],
            currentMutuelleId: null,
            currentSeason: null,
            currentEditingId: null,
        });
    };

    const getVarietiesByPlant = (plantId) => {
        return state.varieties.filter(v => v.plantId === plantId || v.plantId?._id === plantId);
    };

    const getRecordsBySeason = (season) => {
        return state.productionRecords.filter(r => r.season === season);
    };

    return {
        getState,
        subscribe,
        loadPlants,
        getPlantById,
        createPlant,
        updatePlant,
        deletePlant,
        loadVarieties,
        loadVarietiesByPlant,
        createVariety,
        updateVariety,
        deleteVariety,
        loadProductionRecords,
        loadProductionRecordsBySeason,
        loadStats,
        loadSeasons,
        createProductionRecord,
        updateProductionRecord,
        deleteProductionRecord,
        setCurrentEditing,
        setCurrentMutuelle,
        setCurrentSeason,
        clearState,
        getVarietiesByPlant,
        getRecordsBySeason,
        formatDate,
        escapeHtml
    };
}

export const plantProdStore = createPlantProdStore();

export function usePlantProd() {
    return plantProdStore;
}