// Real-time sensor data generation service

const STATION_LOCATIONS = [
  { id: 'air-01', name: 'Downtown Air Quality', lat: 40.7128, lng: -74.0060, type: 'air' },
  { id: 'air-02', name: 'Industrial Zone Air', lat: 40.7580, lng: -73.9855, type: 'air' },
  { id: 'air-03', name: 'Residential Air Monitor', lat: 40.6782, lng: -73.9442, type: 'air' },
  { id: 'water-01', name: 'River Station North', lat: 40.7489, lng: -73.9680, type: 'water' },
  { id: 'water-02', name: 'Lake Monitor East', lat: 40.7089, lng: -74.0134, type: 'water' },
  { id: 'water-03', name: 'Coastal Water Station', lat: 40.6413, lng: -74.0792, type: 'water' },
  { id: 'weather-01', name: 'Central Weather Station', lat: 40.7306, lng: -73.9352, type: 'weather' },
  { id: 'weather-02', name: 'Airport Weather', lat: 40.6895, lng: -74.1745, type: 'weather' },
  { id: 'weather-03', name: 'Mountain Weather', lat: 40.7829, lng: -73.9654, type: 'weather' },
  { id: 'energy-01', name: 'Grid Station A', lat: 40.7183, lng: -74.0070, type: 'energy' },
];

class SensorDataService {
  constructor() {
    this.listeners = new Set();
    this.isRunning = false;
    this.dataHistory = [];
    this.maxDataPoints = 10000;
    this.updateInterval = 2000; // 2 seconds
    this.intervalId = null;
  }

  // Generate realistic sensor readings
  generateReading(station, timestamp) {
    const baseValues = {
      air: {
        co2: 400 + Math.random() * 600, // 400-1000 ppm
        temperature: 15 + Math.random() * 20, // 15-35°C
        humidity: 30 + Math.random() * 50, // 30-80%
        pm25: Math.random() * 50, // 0-50 µg/m³
        aqi: Math.floor(50 + Math.random() * 100), // 50-150
      },
      water: {
        temperature: 10 + Math.random() * 15, // 10-25°C
        ph: 6.5 + Math.random() * 2, // 6.5-8.5
        turbidity: Math.random() * 10, // 0-10 NTU
        dissolvedOxygen: 7 + Math.random() * 5, // 7-12 mg/L
        conductivity: 200 + Math.random() * 300, // 200-500 µS/cm
      },
      weather: {
        temperature: 10 + Math.random() * 25, // 10-35°C
        humidity: 40 + Math.random() * 50, // 40-90%
        rainfall: Math.random() * 20, // 0-20 mm
        windSpeed: Math.random() * 30, // 0-30 km/h
        pressure: 1000 + Math.random() * 40, // 1000-1040 hPa
      },
      energy: {
        consumption: 1000 + Math.random() * 4000, // 1000-5000 kWh
        solarGeneration: Math.random() * 500, // 0-500 kWh
        windGeneration: Math.random() * 300, // 0-300 kWh
        efficiency: 70 + Math.random() * 25, // 70-95%
        carbonOffset: Math.random() * 200, // 0-200 kg CO2
      },
    };

    const readings = baseValues[station.type];

    return {
      id: `${station.id}-${timestamp}`,
      stationId: station.id,
      stationName: station.name,
      type: station.type,
      lat: station.lat,
      lng: station.lng,
      timestamp,
      readings,
      status: Math.random() > 0.05 ? 'active' : 'warning', // 5% chance of warning
    };
  }

  // Start generating data
  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    // Generate initial batch
    this.generateBatch();

    // Continue generating at intervals
    this.intervalId = setInterval(() => {
      this.generateBatch();
    }, this.updateInterval);
  }

  // Stop generating data
  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Generate a batch of readings for all stations
  generateBatch() {
    const timestamp = Date.now();
    const batch = STATION_LOCATIONS.map(station =>
      this.generateReading(station, timestamp)
    );

    // Add to history
    this.dataHistory.push(...batch);

    // Maintain max data points
    if (this.dataHistory.length > this.maxDataPoints) {
      this.dataHistory = this.dataHistory.slice(-this.maxDataPoints);
    }

    // Notify all listeners
    this.notifyListeners(batch);
  }

  // Subscribe to data updates
  subscribe(callback) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners
  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  // Get historical data
  getHistory(filters = {}) {
    let data = [...this.dataHistory];

    if (filters.stationId) {
      data = data.filter(d => d.stationId === filters.stationId);
    }

    if (filters.type) {
      data = data.filter(d => d.type === filters.type);
    }

    if (filters.startTime) {
      data = data.filter(d => d.timestamp >= filters.startTime);
    }

    if (filters.endTime) {
      data = data.filter(d => d.timestamp <= filters.endTime);
    }

    return data;
  }

  // Get latest readings for each station
  getLatestReadings() {
    const latestMap = new Map();

    this.dataHistory.forEach(reading => {
      const existing = latestMap.get(reading.stationId);
      if (!existing || reading.timestamp > existing.timestamp) {
        latestMap.set(reading.stationId, reading);
      }
    });

    return Array.from(latestMap.values());
  }

  // Get stations list
  getStations() {
    return STATION_LOCATIONS;
  }

  // Clear all data
  clearHistory() {
    this.dataHistory = [];
    this.notifyListeners([]);
  }
}

// Export singleton instance
export const sensorService = new SensorDataService();
