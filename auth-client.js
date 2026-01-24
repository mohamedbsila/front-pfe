/**
 * AuthClient - Handles authentication operations for the Electron app
 */
class AuthClient {
    constructor(baseUrl = 'http://localhost:3000/api') {
        this.baseUrl = baseUrl;
    }

    async login(email, password) {
        try {
            // Get detailed machine metadata
            const machineMetadata = this.getMachineMetadata();
            
            // Try to get public IP for better location detection if running locally
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

            // Store tokens
            console.log('Login Response Data:', data); // DEBUG
            this.setTokens(data.accessToken, data.refreshToken);
            
            // Store user info if available (we might need a profile call or just decode JWY)
            localStorage.setItem('user_email', email);
            if (data.user && data.user.role) {
                console.log('Setting user_role to:', data.user.role); // DEBUG
                localStorage.setItem('user_role', data.user.role);
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
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_email');
            localStorage.removeItem('user_role');
            localStorage.removeItem('lastPage');
            
            // Close WebSockets if they are running
            if (typeof closeWebSockets === 'function') {
                closeWebSockets();
            }
            
            window.location.reload(); // Refresh to clear states
        }
    }

    getMachineMetadata() {
        try {
            // Check if we are in Electron and have access to Node.js 'os' module
            if (typeof require !== 'undefined') {
                const os = require('os');
                return {
                    device: os.hostname() || 'Desktop',
                    os: `${os.platform()} ${os.release()}`,
                    arch: os.arch()
                };
            }
        } catch (e) {
            console.warn('Failed to get machine metadata:', e);
        }
        return null;
    }

    setTokens(accessToken, refreshToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
    }

    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }
}

// Global instance
const authClient = new AuthClient();
