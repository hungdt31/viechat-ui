import { io, Socket } from 'socket.io-client';
import { APIManager } from './APIManager';

const SOCKET_URL = 'http://localhost:8085';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Record<string, Function[]> = {};

  connect(token: string) {
    if (APIManager.getMockState()) {
      console.log('SocketService: Running in Mock mode (No live WebSocket connection).');
      // Set up a mock listener trigger based on window events
      window.addEventListener('mock_message_received', this.handleMockMessageReceived);
      return;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        timeout: 10000,
      });

      this.socket.on('connect', () => {
        console.log('SocketService: Connected to Live WebSocket server.');
      });

      this.socket.on('disconnect', (reason) => {
        console.warn('SocketService: Disconnected.', reason);
      });

      // Bind all registered listeners to the live socket
      Object.keys(this.listeners).forEach((event) => {
        this.listeners[event].forEach((cb) => {
          this.socket?.on(event, cb as any);
        });
      });
    } catch (err) {
      console.error('SocketService: Failed to connect to live socket.', err);
    }
  }

  disconnect() {
    window.removeEventListener('mock_message_received', this.handleMockMessageReceived);
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Register Event Listeners
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Unregister Event Listeners
  off(event: string, callback?: Function) {
    if (!this.listeners[event]) return;

    if (callback) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    } else {
      delete this.listeners[event];
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  // Emit Events
  emit(event: string, data: any) {
    if (APIManager.getMockState()) {
      // Simulate actions locally if needed
      if (event === 'typing:start') {
        console.log('Mock Socket: User typing...');
      }
      return;
    }

    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Handle Mock Auto-replies in Mock mode
  private handleMockMessageReceived = (e: Event) => {
    const customEvent = e as CustomEvent;
    const message = customEvent.detail;
    
    // Trigger any listener registered for 'message:receive'
    const eventCallbacks = this.listeners['message:receive'];
    if (eventCallbacks) {
      eventCallbacks.forEach((cb) => cb(message));
    }
  };
}

export const socketService = new SocketService();
