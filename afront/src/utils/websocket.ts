import { Message } from '../types/message';

// WebSocket事件类型
export type WebSocketEvent =
    | 'message'
    | 'connect'
    | 'disconnect'
    | 'error'
    | 'online_status'
    | 'friend_request';

// WebSocket消息类型
export interface WebSocketMessage {
    type: string;
    data: any;
}

/**
 * WebSocket客户端封装
 */
export class WebSocketClient {
    private socket: WebSocket | null = null;
    private url: string;
    private reconnectInterval: number;
    private reconnectAttempts: number;
    private maxReconnectAttempts: number;
    private eventListeners: Record<WebSocketEvent, Array<(data: any) => void>> = {
        message: [],
        connect: [],
        disconnect: [],
        error: [],
        online_status: [],
        friend_request: [],
    };
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    /**
     * 构造函数
     * @param url - WebSocket服务地址
     * @param options - 配置选项
     */
    constructor(
        url: string,
        options: {
            reconnectInterval?: number;
            maxReconnectAttempts?: number;
        } = {}
    ) {
        this.url = url;
        this.reconnectInterval = options.reconnectInterval || 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.reconnectAttempts = 0;
    }

    /**
     * 连接WebSocket
     * @param token - 认证令牌
     */
    connect(token: string): void {
        // 关闭现有连接
        this.disconnect();

        // 创建新连接
        const connectUrl = `${this.url}?token=${token}`;
        this.socket = new WebSocket(connectUrl);

        // 连接成功
        this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emit('connect');
        };

        // 接收消息
        this.socket.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        // 连接关闭
        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected:', event.code, event.reason);
            this.emit('disconnect', event);

            // 自动重连
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectTimer = setTimeout(() => {
                    this.reconnectAttempts++;
                    console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    this.connect(token);
                }, this.reconnectInterval);
            }
        };

        // 错误处理
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        };
    }

    /**
     * 断开连接
     */
    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    /**
     * 发送消息
     * @param type - 消息类型
     * @param data - 消息数据
     */
    send(type: string, data: any): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket not connected');
            return;
        }

        const message: WebSocketMessage = { type, data };
        this.socket.send(JSON.stringify(message));
    }

    /**
     * 发送聊天消息
     * @param message - 消息对象
     */
    sendChatMessage(message: Partial<Message>): void {
        this.send('chat_message', message);
    }

    /**
     * 更新在线状态
     * @param status - 状态（online/offline/away/busy）
     */
    updateOnlineStatus(status: string): void {
        this.send('online_status', { status });
    }

    /**
     * 添加事件监听
     * @param event - 事件类型
     * @param callback - 回调函数
     */
    on(event: WebSocketEvent, callback: (data: any) => void): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(callback);
    }

    /**
     * 移除事件监听
     * @param event - 事件类型
     * @param callback - 回调函数（可选，不传则移除所有）
     */
    off(event: WebSocketEvent, callback?: (data: any) => void): void {
        if (!this.eventListeners[event]) return;

        if (callback) {
            this.eventListeners[event] = this.eventListeners[event].filter(
                listener => listener !== callback
            );
        } else {
            this.eventListeners[event] = [];
        }
    }

    /**
     * 触发事件
     * @param event - 事件类型
     * @param data - 事件数据
     */
    private emit(event: WebSocketEvent, data?: any): void {
        const listeners = this.eventListeners[event];
        if (listeners) {
            listeners.forEach(listener => listener(data));
        }
    }

    /**
     * 处理WebSocket消息
     * @param message - 消息对象
     */
    private handleMessage(message: WebSocketMessage): void {
        switch (message.type) {
            case 'chat_message':
                this.emit('message', message.data);
                break;

            case 'online_status':
                this.emit('online_status', message.data);
                break;

            case 'friend_request':
                this.emit('friend_request', message.data);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }
}

// 创建WebSocket实例（单例）
export const createWebSocketClient = (
    url = 'ws://localhost:5055/ws',
    options?: { reconnectInterval?: number; maxReconnectAttempts?: number }
) => {
    return new WebSocketClient(url, options);
};