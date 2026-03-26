import { API_BASE_URL } from '../../config.js';

export class AuthService {
    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    /**
     * Get device metadata safely via the preload bridge (contextBridge).
     * Falls back gracefully if electronAPI is unavailable.
     */
    getMachineMetadata() {
        try {
            if (window.electronAPI && typeof window.electronAPI.getMachineMetadata === 'function') {
                return window.electronAPI.getMachineMetadata();
            }
        } catch (e) {
            console.warn('Failed to get machine metadata:', e);
        }
        return { device: 'Desktop', os: 'unknown', arch: 'unknown' };
    }

    async login(email, password) {
        try {
            const machineMetadata = this.getMachineMetadata();
            
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    machineMetadata.publicIp = ipData.ip;
                }
            } catch (e) {
                console.warn('Could not fetch public IP for location:', e);
            }

            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password,
                    metadata: machineMetadata 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.setTokens(data.accessToken, data.refreshToken);
            localStorage.setItem('user_email', email);
            if (data.user) {
                if (data.user.role) localStorage.setItem('user_role', data.user.role);
                if (data.user.name) localStorage.setItem('user_name', data.user.name);
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const token = this.getAccessToken();
            if (token) {
                await fetch(`${this.baseUrl}/auth/logout`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Backend logout failed:', error);
        } finally {
            this.clearTokens();
            // Dispatch event for the app to handle UI transition
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    }

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    clearTokens() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        localStorage.removeItem('lastPage');
    }

    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    getRefreshToken() {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Check if the stored JWT token is expired.
     * Decodes the payload without verification and checks the `exp` claim.
     */
    isTokenExpired() {
        const token = this.getAccessToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    }

    /**
     * Returns true only if a token exists AND is not expired.
     */
    isAuthenticated() {
        const token = this.getAccessToken();
        if (!token) return false;
        return !this.isTokenExpired();
    }

    getUserEmail() {
        return localStorage.getItem('user_email');
    }

    getUserRole() {
        return localStorage.getItem('user_role');
    }

    getUserName() {
        return localStorage.getItem('user_name');
    }
}

export const authService = new AuthService();