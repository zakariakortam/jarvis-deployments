/**
 * Advanced Sensor Simulation Engine
 * Generates realistic data for 10,000+ city sensors across multiple systems
 */

export class SensorSimulator {
  constructor() {
    this.sensors = new Map();
    this.historicalData = new Map();
    this.maxHistoryPoints = 100;
    this.anomalyProbability = 0.02;
  }

  /**
   * Initialize all city sensors
   */
  initializeSensors() {
    this.initializeTransportationSensors();
    this.initializePowerSensors();
    this.initializeWasteSensors();
    this.initializeWaterSensors();
  }

  initializeTransportationSensors() {
    const types = ['traffic_light', 'speed_camera', 'parking_sensor', 'bus_tracker', 'bike_station'];

    for (let i = 0; i < 3000; i++) {
      const id = `TRANS-${String(i).padStart(5, '0')}`;
      this.sensors.set(id, {
        id,
        type: types[Math.floor(Math.random() * types.length)],
        system: 'transportation',
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          zone: `Zone-${Math.floor(Math.random() * 10) + 1}`
        },
        status: 'operational',
        baseValue: Math.random() * 100,
        variance: 10 + Math.random() * 20
      });
    }
  }

  initializePowerSensors() {
    const types = ['grid_meter', 'substation', 'solar_panel', 'wind_turbine', 'battery_storage'];

    for (let i = 0; i < 2500; i++) {
      const id = `POWER-${String(i).padStart(5, '0')}`;
      this.sensors.set(id, {
        id,
        type: types[Math.floor(Math.random() * types.length)],
        system: 'power',
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          district: `District-${Math.floor(Math.random() * 8) + 1}`
        },
        status: 'operational',
        baseValue: 50 + Math.random() * 50,
        variance: 5 + Math.random() * 15
      });
    }
  }

  initializeWasteSensors() {
    const types = ['bin_level', 'truck_gps', 'compactor', 'recycling_station', 'collection_point'];

    for (let i = 0; i < 2000; i++) {
      const id = `WASTE-${String(i).padStart(5, '0')}`;
      this.sensors.set(id, {
        id,
        type: types[Math.floor(Math.random() * types.length)],
        system: 'waste',
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          route: `Route-${Math.floor(Math.random() * 15) + 1}`
        },
        status: 'operational',
        baseValue: Math.random() * 100,
        variance: 8 + Math.random() * 12
      });
    }
  }

  initializeWaterSensors() {
    const types = ['flow_meter', 'pressure_sensor', 'quality_monitor', 'leak_detector', 'valve_controller'];

    for (let i = 0; i < 2500; i++) {
      const id = `WATER-${String(i).padStart(5, '0')}`;
      this.sensors.set(id, {
        id,
        type: types[Math.floor(Math.random() * types.length)],
        system: 'water',
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          pipeline: `Pipeline-${Math.floor(Math.random() * 12) + 1}`
        },
        status: 'operational',
        baseValue: 30 + Math.random() * 70,
        variance: 5 + Math.random() * 10
      });
    }
  }

  /**
   * Generate real-time reading for a sensor
   */
  generateReading(sensor) {
    const timestamp = Date.now();
    const trend = Math.sin(timestamp / 10000) * sensor.variance;
    const noise = (Math.random() - 0.5) * sensor.variance * 0.5;

    // Introduce occasional anomalies
    const isAnomaly = Math.random() < this.anomalyProbability;
    const anomalyFactor = isAnomaly ? (Math.random() * 2 + 1) : 1;

    const value = Math.max(0, Math.min(100,
      sensor.baseValue + trend + noise * anomalyFactor
    ));

    const reading = {
      sensorId: sensor.id,
      value: parseFloat(value.toFixed(2)),
      timestamp,
      status: sensor.status,
      alert: isAnomaly || value > 90 || value < 10,
      alertLevel: isAnomaly ? 'critical' : value > 90 ? 'warning' : value < 10 ? 'info' : null
    };

    // Store in historical data
    if (!this.historicalData.has(sensor.id)) {
      this.historicalData.set(sensor.id, []);
    }

    const history = this.historicalData.get(sensor.id);
    history.push(reading);

    if (history.length > this.maxHistoryPoints) {
      history.shift();
    }

    return reading;
  }

  /**
   * Get all sensors for a system
   */
  getSensorsBySystem(system) {
    return Array.from(this.sensors.values()).filter(s => s.system === system);
  }

  /**
   * Get real-time readings for all sensors in a system
   */
  getSystemReadings(system) {
    const sensors = this.getSensorsBySystem(system);
    return sensors.map(sensor => this.generateReading(sensor));
  }

  /**
   * Get aggregated metrics for a system
   */
  getSystemMetrics(system) {
    const readings = this.getSystemReadings(system);
    const values = readings.map(r => r.value);

    return {
      system,
      totalSensors: readings.length,
      operational: readings.filter(r => r.status === 'operational').length,
      alerts: readings.filter(r => r.alert).length,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      timestamp: Date.now()
    };
  }

  /**
   * Get heatmap data for mapping
   */
  getHeatmapData(system, metric = 'value') {
    const readings = this.getSystemReadings(system);
    return readings.map(reading => {
      const sensor = this.sensors.get(reading.sensorId);
      return {
        lat: sensor.location.lat,
        lng: sensor.location.lng,
        intensity: reading[metric] || reading.value,
        alert: reading.alert,
        sensorId: sensor.id,
        type: sensor.type
      };
    });
  }

  /**
   * Get time series data for trending
   */
  getTimeSeriesData(sensorId) {
    return this.historicalData.get(sensorId) || [];
  }

  /**
   * Get system-wide time series
   */
  getSystemTimeSeries(system, aggregation = 'average') {
    const sensors = this.getSensorsBySystem(system);
    const timestamps = new Set();

    sensors.forEach(sensor => {
      const history = this.historicalData.get(sensor.id) || [];
      history.forEach(reading => timestamps.add(reading.timestamp));
    });

    return Array.from(timestamps).sort().map(timestamp => {
      const readings = sensors
        .map(sensor => {
          const history = this.historicalData.get(sensor.id) || [];
          return history.find(r => r.timestamp === timestamp);
        })
        .filter(Boolean);

      const values = readings.map(r => r.value);
      let aggregatedValue;

      switch (aggregation) {
        case 'average':
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'max':
          aggregatedValue = Math.max(...values);
          break;
        case 'min':
          aggregatedValue = Math.min(...values);
          break;
        default:
          aggregatedValue = values.reduce((a, b) => a + b, 0) / values.length;
      }

      return {
        timestamp,
        value: parseFloat(aggregatedValue.toFixed(2)),
        sampleSize: readings.length
      };
    });
  }

  /**
   * Get all system KPIs
   */
  getAllSystemKPIs() {
    return ['transportation', 'power', 'waste', 'water'].map(system =>
      this.getSystemMetrics(system)
    );
  }

  /**
   * Get detailed sensor information
   */
  getSensorDetails(sensorId) {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return null;

    return {
      ...sensor,
      currentReading: this.generateReading(sensor),
      history: this.getTimeSeriesData(sensorId)
    };
  }

  /**
   * Get alerts across all systems
   */
  getAllAlerts() {
    const alerts = [];

    this.sensors.forEach(sensor => {
      const reading = this.generateReading(sensor);
      if (reading.alert) {
        alerts.push({
          sensorId: sensor.id,
          system: sensor.system,
          type: sensor.type,
          location: sensor.location,
          value: reading.value,
          alertLevel: reading.alertLevel,
          timestamp: reading.timestamp
        });
      }
    });

    return alerts.sort((a, b) => {
      const priority = { critical: 3, warning: 2, info: 1 };
      return priority[b.alertLevel] - priority[a.alertLevel];
    });
  }
}

// Singleton instance
export const sensorSimulator = new SensorSimulator();
sensorSimulator.initializeSensors();
