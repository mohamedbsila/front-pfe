import { employesClient } from '../services/index.js';
import { wsManager } from '../../shared/services/index.js';

class EmployesStore {
    constructor() {
        this.state = {
            qarEmployees: [],
            arEmployees: [],
            attendance: [],
            loading: false,
            error: null,
            selectedEmployee: null,
            currentMutuelleId: null
        };
        this.listeners = [];
        
        this.initWebSocketListeners();
    }

    initWebSocketListeners() {
        wsManager.on('employee_changed', (data) => {
            console.log('🔌 [Employes Store] Received employee_changed:', data);
            if (this.state.currentMutuelleId) {
                this.loadEmployes(this.state.currentMutuelleId, true);
            }
        });
        
        wsManager.on('refresh_data', (data) => {
            if (data?.entity === 'employees' && this.state.currentMutuelleId) {
                this.loadEmployes(this.state.currentMutuelleId, true);
            }
        });
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(l => l(this.state));
    }

    async loadEmployes(mutuelleId, silent = false) {
        if (!silent) this.setState({ loading: true, error: null });
        this.setState({ currentMutuelleId: mutuelleId });
        try {
            const [qar, ar] = await Promise.all([
                employesClient.getAllQar(mutuelleId),
                employesClient.getAllAr(mutuelleId)
            ]);
            this.setState({
                qarEmployees: qar,
                arEmployees: ar,
                loading: false
            });
        } catch (error) {
            this.setState({ loading: false, error: error.message });
        }
    }

    async addEmployee(mutuelleId, type, data) {
        try {
            let newEmp;
            if (type === 'QAR') {
                newEmp = await employesClient.createQar(mutuelleId, data);
                this.setState({ qarEmployees: [...this.state.qarEmployees, newEmp] });
            } else {
                newEmp = await employesClient.createAr(mutuelleId, data);
                this.setState({ arEmployees: [...this.state.arEmployees, newEmp] });
            }
            return newEmp;
        } catch (error) {
            this.setState({ error: error.message });
            throw error;
        }
    }

    getCombinedEmployees() {
        return [
            ...this.state.qarEmployees.map(e => ({ ...e, type: 'QAR' })),
            ...this.state.arEmployees.map(e => ({ ...e, type: 'AR' }))
        ];
    }
}

export const employesStore = new EmployesStore();
export const useEmployees = () => employesStore;
