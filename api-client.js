// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Client Service
class ApiClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Add Authorization header if token exists
        const token = localStorage.getItem('access_token');
        const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authHeader,
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    console.warn('Unauthorized request - redirecting to login');
                    // Handle unauthorized access globally
                    if (typeof authClient !== 'undefined' && typeof authClient.logout === 'function') {
                        authClient.logout();
                    }
                }
                const error = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            // Handle empty responses
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

    // GET request
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST request
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT request
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE request
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Create singleton instance
const apiClient = new ApiClient();

// Users API Service
const usersApi = {
    // Get all users
    async getAll() {
        return apiClient.get('/users');
    },

    // Get user by ID
    async getById(id) {
        return apiClient.get(`/users/${id}`);
    },

    // Create new user
    async create(userData) {
        return apiClient.post('/users', userData);
    },

    // Update user
    async update(id, userData) {
        return apiClient.put(`/users/${id}`, userData);
    },

    // Delete user
    async delete(id) {
        return apiClient.delete(`/users/${id}`);
    },
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { apiClient, usersApi };
}
