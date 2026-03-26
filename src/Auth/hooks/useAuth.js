import { authService } from '../services/index.js';

export function useAuth() {
    const login = async (email, password) => {
        return await authService.login(email, password);
    };

    const register = async (name, email, password) => {
        return await authService.register(name, email, password);
    };

    const logout = async () => {
        return await authService.logout();
    };

    const isAuthenticated = () => {
        return authService.isAuthenticated();
    };

    const getUserRole = () => {
        return authService.getUserRole();
    };

    const getUserEmail = () => {
        return authService.getUserEmail();
    };

    const getUserName = () => {
        return authService.getUserName();
    };

    return {
        login,
        register,
        logout,
        isAuthenticated,
        getUserRole,
        getUserEmail,
        getUserName,
    };
}

export function createAuthStore() {
    let state = {
        isAuthenticated: authService.isAuthenticated(),
        userEmail: authService.getUserEmail(),
        userName: authService.getUserName(),
        userRole: authService.getUserRole(),
        isLoading: false,
        error: null,
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

    const login = async (email, password) => {
        setState({ isLoading: true, error: null });
        try {
            await authService.login(email, password);
            setState({
                isAuthenticated: true,
                userEmail: email,
                userName: authService.getUserName(),
                userRole: authService.getUserRole(),
                isLoading: false,
            });
            return true;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const register = async (name, email, password) => {
        setState({ isLoading: true, error: null });
        try {
            await authService.register(name, email, password);
            setState({ isLoading: false });
            return true;
        } catch (error) {
            setState({ isLoading: false, error: error.message });
            throw error;
        }
    };

    const logout = async () => {
        setState({ isLoading: true });
        try {
            await authService.logout();
        } finally {
            setState({
                isAuthenticated: false,
                userEmail: null,
                userName: null,
                userRole: null,
                isLoading: false,
            });
        }
    };

    return {
        getState,
        subscribe,
        login,
        register,
        logout,
    };
}

export const authStore = createAuthStore();