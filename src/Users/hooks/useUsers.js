import { usersApi } from '../services/index.js';
import { formatDate, escapeHtml } from '../../shared/utils/index.js';

export function createUsersStore() {
    let state = {
        users: [],
        isLoading: false,
        error: null,
        currentEditingId: null,
        selectedIds: new Set(),
        sort: { field: 'createdAt', direction: 'desc' },
        filters: {
            search: '',
            status: 'all',
            role: 'all'
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

    const loadUsers = async (silent = false) => {
        if (!silent) setState({ isLoading: true, error: null });
        
        try {
            const users = await usersApi.getAll();
            setState({ users, isLoading: false });
            return users;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const getUserById = async (id) => {
        return await usersApi.getById(id);
    };

    const createUser = async (userData) => {
        setState({ isLoading: true });
        try {
            const result = await usersApi.create(userData);
            await loadUsers();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const updateUser = async (id, userData) => {
        setState({ isLoading: true });
        try {
            const result = await usersApi.update(id, userData);
            await loadUsers();
            return result;
        } finally {
            setState({ isLoading: false });
        }
    };

    const deleteUser = async (id) => {
        setState({ isLoading: true });
        try {
            await usersApi.delete(id);
            await loadUsers();
        } finally {
            setState({ isLoading: false });
        }
    };

    const bulkDeactivate = async () => {
        const ids = Array.from(state.selectedIds);
        setState({ isLoading: true });
        try {
            await Promise.all(ids.map(id => usersApi.update(id, { isActive: false })));
            setState({ selectedIds: new Set() });
            await loadUsers();
        } finally {
            setState({ isLoading: false });
        }
    };

    const bulkDelete = async () => {
        const ids = Array.from(state.selectedIds);
        setState({ isLoading: true });
        try {
            await Promise.all(ids.map(id => usersApi.delete(id)));
            setState({ selectedIds: new Set() });
            await loadUsers();
        } finally {
            setState({ isLoading: false });
        }
    };

    const setCurrentEditing = (id) => {
        setState({ currentEditingId: id });
    };

    const toggleSelection = (id) => {
        const newSelected = new Set(state.selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setState({ selectedIds: newSelected });
    };

    const selectAll = (ids) => {
        setState({ selectedIds: new Set(ids) });
    };

    const clearSelection = () => {
        setState({ selectedIds: new Set() });
    };

    const setSort = (field) => {
        const currentSort = state.sort;
        const newDirection = currentSort.field === field 
            ? (currentSort.direction === 'asc' ? 'desc' : 'asc')
            : 'asc';
        setState({ sort: { field, direction: newDirection } });
    };

    const setFilters = (filters) => {
        setState({ filters: { ...state.filters, ...filters } });
    };

    const getFilteredUsers = () => {
        let filtered = [...state.users];
        const { search, status, role } = state.filters;
        const currentSort = state.sort;

        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        if (status !== 'all') {
            if (status === 'active') filtered = filtered.filter(u => u.isActive);
            else if (status === 'inactive') filtered = filtered.filter(u => !u.isActive);
            else if (status === 'online') filtered = filtered.filter(u => u.isOnline);
        }

        if (role !== 'all') {
            filtered = filtered.filter(u => u.role === role);
        }

        filtered.sort((a, b) => {
            let valA = a[currentSort.field];
            let valB = b[currentSort.field];

            if (currentSort.field === 'lastActive') {
                valA = a.isOnline ? 2 : (a.loginHistory?.length ? 1 : 0);
                valB = b.isOnline ? 2 : (b.loginHistory?.length ? 1 : 0);
            }

            if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    };

    const getStats = () => {
        const users = state.users;
        return {
            total: users.length,
            active: users.filter(u => u.isActive).length,
            online: users.filter(u => u.isOnline).length
        };
    };

    return {
        getState,
        subscribe,
        loadUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        bulkDeactivate,
        bulkDelete,
        setCurrentEditing,
        toggleSelection,
        selectAll,
        clearSelection,
        setSort,
        setFilters,
        getFilteredUsers,
        getStats,
        formatDate,
        escapeHtml
    };
}

export const usersStore = createUsersStore();

export function useUsers() {
    return usersStore;
}