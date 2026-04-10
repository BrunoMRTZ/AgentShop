// websocket.service.ts

interface RealtimeMessage {
    event: string;
    data: any;
}

interface WebSocketConfig {
    url: string;
    protocols?: string | string[];
}

class WebSocketService {
    private socket: WebSocket | null = null;
    private heartbeatInterval: number = 30000; // 30 seconds
    private reconnectInterval: number = 5000; // 5 seconds
    private isConnected: boolean = false;
    private config: WebSocketConfig;

    constructor(config: WebSocketConfig) {
        this.config = config;
        this.connect();
    }

    private connect() {
        this.socket = new WebSocket(this.config.url, this.config.protocols);

        this.socket.onopen = () => {
            this.isConnected = true;
            console.log('WebSocket connected');
            this.startHeartbeat();
        };

        this.socket.onmessage = (event) => {
            const message: RealtimeMessage = JSON.parse(event.data);
            this.handleMessage(message);
        };

        this.socket.onclose = () => {
            this.isConnected = false;
            console.log('WebSocket disconnected, attempting to reconnect...');
            this.reconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    private handleMessage(message: RealtimeMessage) {
        // Handle incoming message based on the event type
        console.log('Received message:', message);
    }

    private startHeartbeat() {
        setInterval(() => {
            if (this.socket && this.isConnected) {
                this.socket.send(JSON.stringify({ event: 'heartbeat' }));
            }
        }, this.heartbeatInterval);
    }

    private reconnect() {
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }
}