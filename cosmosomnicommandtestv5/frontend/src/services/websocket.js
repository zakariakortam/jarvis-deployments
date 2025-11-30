class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000;
    this.listeners = new Map();
    this.messageQueue = [];
    this.isConnecting = false;
  }

  connect(store) {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.store = store;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = import.meta.env.VITE_WS_URL ||
      (import.meta.env.VITE_API_URL ?
        `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws` :
        `${protocol}//${window.location.host}/ws`);

    console.log('Connecting to WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        store.setConnected(true);

        // Send any queued messages
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          this.send(message);
        }

        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        store.setConnected(false);
        this.emit('disconnected');

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);
          setTimeout(() => this.connect(store), this.reconnectDelay);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'init':
        this.store.initializeData(data.data);
        this.emit('init', data.data);
        break;

      case 'update':
        this.store.updateData(data.data);
        this.emit('update', data.data);
        break;

      case 'newAlert':
        data.data.alerts?.forEach(alert => {
          this.store.addNotification({
            type: 'alert',
            severity: alert.severity,
            title: alert.title,
            message: alert.description
          });
        });
        this.emit('newAlert', data.data);
        break;

      case 'newEvent':
        data.data.events?.forEach(event => {
          this.store.addNotification({
            type: 'event',
            severity: event.priority === 'critical' ? 'alert' : 'info',
            title: event.title,
            message: event.description
          });
        });
        this.emit('newEvent', data.data);
        break;

      case 'commandResult':
        this.store.addCommandResult(data.data);
        this.emit('commandResult', data.data);
        break;

      default:
        this.emit(data.type, data.data);
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue the message for when connection is established
      this.messageQueue.push(data);
    }
  }

  sendCommand(command) {
    this.send({ type: 'command', command });
  }

  subscribe(streams) {
    this.send({ type: 'subscribe', streams });
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in listener for ${event}:`, error);
      }
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
