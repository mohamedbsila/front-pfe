import { WS_URL } from '../../config.js';

class WebSocketManager {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.isConnecting = false;
        this.messageQueue = [];
    }

    connect() {
        if (this.socket?.connected || this.isConnecting) return;

        const token = localStorage.getItem('access_token');
        if (!token) {
            console.warn('⚠️ No token, skipping WebSocket connection');
            return;
        }

        this.isConnecting = true;

        try {
            this.socket = io(WS_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: this.reconnectDelay
            });

            this.socket.on('connect', () => {
                console.log('🔌 WebSocket connected');
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.flushMessageQueue();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('🔌 WebSocket disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ WebSocket connection error:', error.message);
                this.isConnecting = false;
            });

            this.setupDefaultListeners();
        } catch (error) {
            console.error('❌ Failed to initialize WebSocket:', error);
            this.isConnecting = false;
        }
    }

    setupDefaultListeners() {
        this.on('user_changed', (data) => {
            console.log('📡 user_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:user_changed', { detail: data }));
        });

        this.on('plant_changed', (data) => {
            console.log('📡 plant_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:plant_changed', { detail: data }));
        });

        this.on('mutuelle_changed', (data) => {
            console.log('📡 mutuelle_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:mutuelle_changed', { detail: data }));
        });

        this.on('employee_changed', (data) => {
            console.log('📡 employee_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:employee_changed', { detail: data }));
        });

        this.on('labor_data_changed', (data) => {
            console.log('📡 labor_data_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:labor_data_changed', { detail: data }));
        });

        this.on('workshop_changed', (data) => {
            console.log('📡 workshop_changed:', data);
            window.dispatchEvent(new CustomEvent('ws:workshop_changed', { detail: data }));
        });

        this.on('refresh_data', (data) => {
            console.log('📡 refresh_data:', data);
            window.dispatchEvent(new CustomEvent('ws:refresh_data', { detail: data }));
        });
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            this.messageQueue.push({ event, data });
        }
    }

    flushMessageQueue() {
        while (this.messageQueue.length > 0) {
            const { event, data } = this.messageQueue.shift();
            this.emit(event, data);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.listeners.clear();
    }

    isConnected() {
        return this.socket?.connected ?? false;
    }

    getSocket() {
        return this.socket;
    }
}

const wsManager = new WebSocketManager();

export default wsManager;
export { WebSocketManager };