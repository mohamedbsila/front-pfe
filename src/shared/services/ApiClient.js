import { API_BASE_URL } from '../../config.js';

class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    getToken() {
        return localStorage.getItem('access_token');
    }

    /**
     * Check if the stored JWT token is expired.
     * Decodes the payload (no verification) and checks the `exp` claim.
     */
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // exp is in seconds, Date.now() is in milliseconds
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            // If token can't be decoded, treat as expired
            return true;
        }
    }

    buildHeaders(additionalHeaders = {}) {
        const token = this.getToken();
        const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        return {
            'Content-Type': 'application/json',
            ...authHeader,
            ...additionalHeaders,
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: this.buildHeaders(options.headers),
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized request — clearing session');
                    this.handleUnauthorized();
                }
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Handle 401 Unauthorized responses.
     * Clears all stored tokens and dispatches a custom event
     * so the App class can redirect to login.
     */
    handleUnauthorized() {
        // Clear all auth data from localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');

        // Dispatch a custom event so main.js can handle the redirect
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    async postFormData(endpoint, formData) {
        const token = this.getToken();
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: formData,
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                this.handleUnauthorized();
            }
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                errorMessage = response.statusText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        return await response.json();
    }
}

const apiClient = new ApiClient();

export { ApiClient, apiClient };