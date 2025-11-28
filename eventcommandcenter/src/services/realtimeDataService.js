// Real-time data service with WebSocket simulation
import MockDataGenerator from './mockDataGenerator';

class RealtimeDataService {
  constructor() {
    this.mockGenerator = new MockDataGenerator();
    this.subscribers = new Map();
    this.updateInterval = null;
    this.isRunning = false;
    this.updateFrequency = 2000; // 2 seconds
  }

  // Start real-time updates
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.broadcastUpdates();
    }, this.updateFrequency);

    // Initial data broadcast
    this.broadcastUpdates();
  }

  // Stop real-time updates
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRunning = false;
  }

  // Subscribe to specific data streams
  subscribe(channel, callback) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    this.subscribers.get(channel).add(callback);

    // Return unsubscribe function
    return () => {
      const channelSubscribers = this.subscribers.get(channel);
      if (channelSubscribers) {
        channelSubscribers.delete(callback);
      }
    };
  }

  // Broadcast updates to all subscribers
  broadcastUpdates() {
    const snapshot = this.mockGenerator.generateDashboardSnapshot();

    // Broadcast to specific channels
    this.notify('attendeeFlow', snapshot.attendeeFlow);
    this.notify('ticketScans', snapshot.ticketScans);
    this.notify('vendorSales', snapshot.vendorSales);
    this.notify('security', snapshot.security);
    this.notify('staffAllocation', snapshot.staffAllocation);
    this.notify('crowdDensity', snapshot.crowdDensity);
    this.notify('stats', snapshot.stats);

    // Handle alerts separately (only new alerts)
    if (snapshot.alerts) {
      this.notify('alerts', snapshot.alerts);
    }

    // Broadcast complete snapshot
    this.notify('dashboard', snapshot);

    // Simulate check-in progression
    if (Math.random() > 0.5) {
      this.mockGenerator.incrementCheckins(Math.floor(Math.random() * 5) + 1);
    }
  }

  // Notify subscribers of a specific channel
  notify(channel, data) {
    const channelSubscribers = this.subscribers.get(channel);
    if (channelSubscribers) {
      channelSubscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for channel ${channel}:`, error);
        }
      });
    }
  }

  // Get initial data for a specific channel
  getInitialData(channel) {
    const snapshot = this.mockGenerator.generateDashboardSnapshot();
    return snapshot[channel] || null;
  }

  // Update frequency control
  setUpdateFrequency(milliseconds) {
    this.updateFrequency = milliseconds;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  // Manual trigger for specific data updates
  triggerUpdate(channel) {
    let data;
    switch (channel) {
      case 'attendeeFlow':
        data = this.mockGenerator.generateAttendeeFlow();
        break;
      case 'ticketScans':
        data = this.mockGenerator.generateTicketScans();
        break;
      case 'vendorSales':
        data = this.mockGenerator.generateVendorSales();
        break;
      case 'security':
        data = this.mockGenerator.generateSecurityMonitoring();
        break;
      case 'staffAllocation':
        data = this.mockGenerator.generateStaffAllocation();
        break;
      case 'crowdDensity':
        data = this.mockGenerator.generateCrowdDensity();
        break;
      case 'stats':
        data = this.mockGenerator.generateEventStats();
        break;
      default:
        data = this.mockGenerator.generateDashboardSnapshot();
    }
    this.notify(channel, data);
    return data;
  }

  // Get current status
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateFrequency: this.updateFrequency,
      subscriberCount: Array.from(this.subscribers.values()).reduce(
        (sum, set) => sum + set.size,
        0
      ),
      channels: Array.from(this.subscribers.keys())
    };
  }

  // Clear all subscribers
  clearSubscribers() {
    this.subscribers.clear();
  }

  // Simulate WebSocket connection status
  getConnectionStatus() {
    return {
      connected: this.isRunning,
      latency: Math.floor(Math.random() * 50) + 10,
      lastUpdate: new Date(),
      protocol: 'mock-websocket',
      endpoint: 'ws://localhost:5000/realtime'
    };
  }
}

// Singleton instance
const realtimeService = new RealtimeDataService();

export default realtimeService;
