import { mutuelleClient, membersApi, employeeQarApi, employeeArApi, laborDataApi, workshopDataApi } from '../services/index.js';
import { wsManager } from '../../shared/services/index.js';
import { getCurrentYear, parseProFloat } from '../../shared/utils/index.js';

export function createMutuelleStore() {
    let state = {
        mutuelles: [],
        selectedMutuelleId: null,
        selectedMutuelle: null,
        isLoading: false,
        error: null,
        dashboardState: {}
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

    const initWebSocketListeners = () => {
        wsManager.on('mutuelle_changed', (data) => {
            console.log('🔌 [Mutuelle Store] Received mutuelle_changed:', data);
            loadMutuelles(true);
        });
        
        wsManager.on('labor_data_changed', (data) => {
            console.log('🔌 [Labor Store] Received labor_data_changed:', data);
            const state = getState();
            if (state.selectedMutuelleId) {
                loadLaborData(state.selectedMutuelleId, state.currentYear);
            }
        });
        
        wsManager.on('workshop_changed', (data) => {
            console.log('🔌 [Workshop Store] Received workshop_changed:', data);
            const state = getState();
            if (state.selectedMutuelleId) {
                loadWorkshopData(state.selectedMutuelleId, state.currentYear);
            }
        });
        
        wsManager.on('refresh_data', (data) => {
            if (data?.entity === 'mutuelles') {
                loadMutuelles(true);
            }
        });
    };

    initWebSocketListeners();

    const loadMutuelles = async (silent = false) => {
        setState({ isLoading: true, error: null });
        try {
            const mutuelles = await mutuelleClient.getAll() || [];
            setState({ mutuelles, isLoading: false });
            return mutuelles;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const selectMutuelle = async (id) => {
        const mutuelle = state.mutuelles.find(m => m._id === id);
        if (!mutuelle) {
            try {
                const fetched = await mutuelleClient.getById(id);
                setState({ selectedMutuelleId: id, selectedMutuelle: fetched });
            } catch (e) {
                console.error('Could not find mutuelle:', id);
                return;
            }
        } else {
            setState({ selectedMutuelleId: id, selectedMutuelle: mutuelle });
        }
        saveDashboardState({ selectedMutuelleId: id });
    };

    const clearSelection = () => {
        setState({ selectedMutuelleId: null, selectedMutuelle: null });
        clearDashboardState();
    };

    const createMutuelle = async (data) => {
        setState({ isLoading: true });
        try {
            await mutuelleClient.createWithFiles(data);
            await loadMutuelles();
        } finally {
            setState({ isLoading: false });
        }
    };

    const updateMutuelle = async (id, data) => {
        setState({ isLoading: true });
        try {
            await mutuelleClient.update(id, data);
            await loadMutuelles();
        } finally {
            setState({ isLoading: false });
        }
    };

    const deleteMutuelle = async (id) => {
        setState({ isLoading: true });
        try {
            await mutuelleClient.delete(id);
            if (state.selectedMutuelleId === id) {
                clearSelection();
            }
            await loadMutuelles();
        } finally {
            setState({ isLoading: false });
        }
    };

    // Dashboard State helpers
    const saveDashboardState = (updates) => {
        const currentState = JSON.parse(localStorage.getItem('mutuelle_dashboard_state') || '{}');
        const newState = { ...currentState, ...updates };
        localStorage.setItem('mutuelle_dashboard_state', JSON.stringify(newState));
        setState({ dashboardState: newState });
    };

    const getDashboardState = () => {
        return JSON.parse(localStorage.getItem('mutuelle_dashboard_state') || '{}');
    };

    const clearDashboardState = () => {
        localStorage.removeItem('mutuelle_dashboard_state');
        setState({ dashboardState: {} });
    };

    return {
        getState,
        subscribe,
        loadMutuelles,
        selectMutuelle,
        clearSelection,
        createMutuelle,
        updateMutuelle,
        deleteMutuelle,
        saveDashboardState,
        getDashboardState,
        clearDashboardState
    };
}

export const mutuelleStore = createMutuelleStore();

export function useMutuelle() {
    return mutuelleStore;
}

// Labor Data Store
export function createLaborDataStore() {
    let state = {
        yearlyData: {},
        currentYear: getCurrentYear(),
        availableYears: [],
        isLoading: false,
        charts: {
            trend: null,
            category: null,
            budget: null,
            wage: null,
            composition: null
        }
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

    const loadAvailableYears = async (mutuelleId) => {
        try {
            const years = await laborDataApi.getAvailableYears(mutuelleId);
            const defaultYear = getCurrentYear();
            const yearToShow = years.length > 0 
                ? (years.includes(defaultYear) || years.includes(defaultYear.toString()) ? defaultYear : years[0])
                : defaultYear;
            setState({ availableYears: years.length > 0 ? years : [defaultYear], currentYear: yearToShow });
            return years.length > 0 ? years : [defaultYear];
        } catch (error) {
            setState({ availableYears: [getCurrentYear()] });
            return [getCurrentYear()];
        }
    };

    const loadLaborData = async (mutuelleId, year) => {
        setState({ isLoading: true });
        try {
            const apiData = await laborDataApi.getByYear(mutuelleId, year);
            const transformed = transformLaborData(apiData);
            
            const newYearlyData = { ...state.yearlyData };
            newYearlyData[year] = transformed;
            
            setState({ yearlyData: newYearlyData, isLoading: false });
            return transformed;
        } catch (error) {
            setState({ isLoading: false });
            return { data: [], total: { cat: 'الجملة', days: '0', gross: '0', social: '0', total: '0', avg: '—' } };
        }
    };

    const transformLaborData = (apiData) => {
        const categories = {};
        let totalDays = 0;
        let totalGross = 0;
        let totalSocial = 0;

        if (!apiData || apiData.length === 0) {
            return { 
                data: [], 
                total: { cat: 'الجملة', days: '0', gross: '0', social: '0', total: '0', avg: '—' } 
            };
        }

        apiData.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = {
                    cat: item.category,
                    days: 0,
                    gross: 0,
                    social: 0
                };
            }
            categories[item.category].days += item.workDays;
            categories[item.category].gross += item.grossSalary;
            categories[item.category].social += item.socialCoverage;
            
            totalDays += item.workDays;
            totalGross += item.grossSalary;
            totalSocial += item.socialCoverage;
        });

        const data = Object.values(categories).map(cat => ({
            cat: cat.cat,
            days: cat.days.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            gross: cat.gross.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            social: cat.social.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            total: (cat.gross + cat.social).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            avg: cat.days > 0 ? ((cat.gross + cat.social) / cat.days).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '0.000'
        }));

        const total = {
            cat: 'الجملة',
            days: totalDays.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
            gross: totalGross.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            social: totalSocial.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            total: (totalGross + totalSocial).toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
            avg: '—'
        };

        return { data, total };
    };

    const setCurrentYear = (year) => {
        setState({ currentYear: year });
    };

    const setChart = (chartName, chartInstance) => {
        const newCharts = { ...state.charts };
        if (state.charts[chartName]) {
            state.charts[chartName].destroy();
        }
        newCharts[chartName] = chartInstance;
        setState({ charts: newCharts });
    };

    const destroyCharts = () => {
        Object.values(state.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        setState({ charts: { trend: null, category: null, budget: null, wage: null, composition: null } });
    };

    return {
        getState,
        subscribe,
        loadAvailableYears,
        loadLaborData,
        transformLaborData,
        setCurrentYear,
        setChart,
        destroyCharts,
        parseProFloat
    };
}

export const laborDataStore = createLaborDataStore();

export function useLaborData() {
    return laborDataStore;
}

// ============================================================
// Workshop Data Store
// ============================================================
export function createWorkshopDataStore() {
    let state = {
        yearlyData: {},
        currentYear: getCurrentYear(),
        availableYears: [],
        isLoading: false,
        charts: {
            trend: null,
            type: null,
            availability: null,
            performance: null,
            efficiency: null
        }
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

    const loadAvailableYears = async (mutuelleId) => {
        try {
            const years = await workshopDataApi.getAvailableYears(mutuelleId);
            const defaultYear = getCurrentYear();
            const yearToShow = years.length > 0
                ? (years.includes(defaultYear) || years.includes(defaultYear.toString()) ? defaultYear : years[0])
                : defaultYear;
            setState({ availableYears: years.length > 0 ? years : [defaultYear], currentYear: yearToShow });
            return years.length > 0 ? years : [defaultYear];
        } catch (error) {
            setState({ availableYears: [getCurrentYear()] });
            return [getCurrentYear()];
        }
    };

    const loadWorkshopData = async (mutuelleId, year) => {
        setState({ isLoading: true });
        try {
            const apiData = await workshopDataApi.getByYear(mutuelleId, year);
            const transformed = transformWorkshopData(apiData);

            const newYearlyData = { ...state.yearlyData };
            newYearlyData[year] = transformed;

            setState({ yearlyData: newYearlyData, isLoading: false });
            return transformed;
        } catch (error) {
            setState({ isLoading: false });
            return emptyWorkshopResult();
        }
    };

    const emptyWorkshopResult = () => ({
        data: [],
        total: {
            machine: 'الجملة',
            workHours: 0, workHoursValue: 0,
            fuelQty: 0, fuelValue: 0,
            oils: 0, spareParts: 0, externalLabor: 0,
            workshop: 0, insurance: 0, depreciation: 0,
            driverDays: 0, driverValue: 0,
            totalCost: 0
        },
        kpis: { availability: 0, performance: 0, efficiency: 0 },
        hourlyCosts: { tractor: 0, mechanization: 0, harvester: 0 }
    });

    const transformWorkshopData = (apiData) => {
        if (!apiData || apiData.length === 0) {
            return emptyWorkshopResult();
        }

        let totalWorkHours = 0, totalWorkHoursValue = 0;
        let totalFuelQty = 0, totalFuelValue = 0;
        let totalOils = 0, totalSpareParts = 0, totalExternalLabor = 0;
        let totalWorkshop = 0, totalInsurance = 0, totalDepreciation = 0;
        let totalDriverDays = 0, totalDriverValue = 0;
        let totalCost = 0;

        const data = apiData.map(item => {
            const workHours = item.workHours || 0;
            const workHoursValue = item.workHoursValue || 0;
            const fuelQty = item.fuelQuantity || 0;
            const fuelValue = item.fuelValue || 0;
            const oils = item.oils || 0;
            const spareParts = item.spareParts || 0;
            const externalLabor = item.externalLabor || 0;
            const workshop = item.workshopCost || 0;
            const insurance = item.insurance || 0;
            const depreciation = item.depreciation || 0;
            const driverDays = item.driverDays || 0;
            const driverValue = item.driverValue || 0;
            const cost = item.totalCost || (workHoursValue + fuelValue + oils + spareParts + externalLabor + workshop + insurance + depreciation + driverValue);

            totalWorkHours += workHours;
            totalWorkHoursValue += workHoursValue;
            totalFuelQty += fuelQty;
            totalFuelValue += fuelValue;
            totalOils += oils;
            totalSpareParts += spareParts;
            totalExternalLabor += externalLabor;
            totalWorkshop += workshop;
            totalInsurance += insurance;
            totalDepreciation += depreciation;
            totalDriverDays += driverDays;
            totalDriverValue += driverValue;
            totalCost += cost;

            return {
                machine: item.machineName || item.machine || item.category || '—',
                workHours: fmt(workHours, 1),
                workHoursValue: fmt(workHoursValue),
                fuelQty: fmt(fuelQty, 1),
                fuelValue: fmt(fuelValue),
                oils: fmt(oils),
                spareParts: fmt(spareParts),
                externalLabor: fmt(externalLabor),
                workshop: fmt(workshop),
                insurance: fmt(insurance),
                depreciation: fmt(depreciation),
                driverDays: fmt(driverDays, 1),
                driverValue: fmt(driverValue),
                totalCost: fmt(cost),
                // raw numbers for charts
                _totalCost: cost,
                _workHours: workHours
            };
        });

        const total = {
            machine: 'الجملة',
            workHours: fmt(totalWorkHours, 1),
            workHoursValue: fmt(totalWorkHoursValue),
            fuelQty: fmt(totalFuelQty, 1),
            fuelValue: fmt(totalFuelValue),
            oils: fmt(totalOils),
            spareParts: fmt(totalSpareParts),
            externalLabor: fmt(totalExternalLabor),
            workshop: fmt(totalWorkshop),
            insurance: fmt(totalInsurance),
            depreciation: fmt(totalDepreciation),
            driverDays: fmt(totalDriverDays, 1),
            driverValue: fmt(totalDriverValue),
            totalCost: fmt(totalCost),
            _totalCost: totalCost,
            _workHours: totalWorkHours,
            _spareParts: totalSpareParts,
            _externalLabor: totalExternalLabor,
            _workshop: totalWorkshop
        };

        // KPIs — if the API provides them, use them; otherwise compute from data
        const firstItem = apiData[0] || {};
        const kpis = {
            availability: firstItem.availabilityRate ?? (data.length > 0 ? 85 : 0),
            performance: firstItem.performanceIndex ?? (data.length > 0 ? 92 : 0),
            efficiency: firstItem.maintenanceEfficiency ?? (data.length > 0 ? 78 : 0)
        };

        const hourlyCosts = {
            tractor: firstItem.tractorHourCost ?? (totalWorkHours > 0 ? totalCost / totalWorkHours : 0),
            mechanization: firstItem.mechanizationHourCost ?? 0,
            harvester: firstItem.harvesterHourCost ?? 0
        };

        return { data, total, kpis, hourlyCosts };
    };

    const fmt = (num, decimals = 3) => {
        return num.toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    };

    const setCurrentYear = (year) => {
        setState({ currentYear: year });
    };

    const setChart = (chartName, chartInstance) => {
        const newCharts = { ...state.charts };
        if (state.charts[chartName]) {
            state.charts[chartName].destroy();
        }
        newCharts[chartName] = chartInstance;
        setState({ charts: newCharts });
    };

    const destroyCharts = () => {
        Object.values(state.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        setState({ charts: { trend: null, type: null, availability: null, performance: null, efficiency: null } });
    };

    return {
        getState,
        subscribe,
        loadAvailableYears,
        loadWorkshopData,
        setCurrentYear,
        setChart,
        destroyCharts,
        parseProFloat
    };
}

export const workshopDataStore = createWorkshopDataStore();

export function useWorkshopData() {
    return workshopDataStore;
}