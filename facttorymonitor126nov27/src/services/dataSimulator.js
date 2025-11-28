// Factory Data Simulation Engine
// Generates realistic sensor data streams for multiple machines

const MACHINE_CONFIGS = [
  { id: 'M001', name: 'CNC Mill #1', type: 'milling', baseTemp: 65, baseVib: 0.3, location: 'Bay A-1' },
  { id: 'M002', name: 'CNC Mill #2', type: 'milling', baseTemp: 68, baseVib: 0.35, location: 'Bay A-2' },
  { id: 'M003', name: 'Lathe #1', type: 'turning', baseTemp: 72, baseVib: 0.25, location: 'Bay B-1' },
  { id: 'M004', name: 'Lathe #2', type: 'turning', baseTemp: 70, baseVib: 0.28, location: 'Bay B-2' },
  { id: 'M005', name: 'Press #1', type: 'stamping', baseTemp: 55, baseVib: 0.5, location: 'Bay C-1' },
  { id: 'M006', name: 'Press #2', type: 'stamping', baseTemp: 58, baseVib: 0.48, location: 'Bay C-2' },
  { id: 'M007', name: 'Grinder #1', type: 'grinding', baseTemp: 60, baseVib: 0.4, location: 'Bay D-1' },
  { id: 'M008', name: 'Grinder #2', type: 'grinding', baseTemp: 62, baseVib: 0.42, location: 'Bay D-2' },
  { id: 'M009', name: 'Welder #1', type: 'welding', baseTemp: 85, baseVib: 0.15, location: 'Bay E-1' },
  { id: 'M010', name: 'Welder #2', type: 'welding', baseTemp: 88, baseVib: 0.18, location: 'Bay E-2' },
];

const ERROR_CODES = [
  { code: 'E001', message: 'Temperature threshold exceeded', severity: 'warning' },
  { code: 'E002', message: 'Vibration spike detected', severity: 'warning' },
  { code: 'E003', message: 'Power supply fluctuation', severity: 'error' },
  { code: 'E004', message: 'Tool wear detected', severity: 'warning' },
  { code: 'E005', message: 'Emergency stop triggered', severity: 'critical' },
  { code: 'E006', message: 'Lubrication system low', severity: 'warning' },
  { code: 'E007', message: 'Coolant temperature high', severity: 'error' },
  { code: 'E008', message: 'Motor overload', severity: 'critical' },
  { code: 'E009', message: 'Sensor calibration required', severity: 'info' },
  { code: 'E010', message: 'Maintenance interval reached', severity: 'info' },
];

class DataSimulator {
  constructor() {
    this.machines = this.initializeMachines();
    this.historicalData = new Map();
    this.maintenanceHistory = this.generateMaintenanceHistory();
    this.alarms = [];
    this.isRunning = false;
    this.updateCallbacks = [];
    this.historyRetention = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  initializeMachines() {
    return MACHINE_CONFIGS.map(config => ({
      ...config,
      status: Math.random() > 0.1 ? 'running' : 'idle',
      temperature: config.baseTemp + (Math.random() - 0.5) * 10,
      vibration: config.baseVib + (Math.random() - 0.5) * 0.1,
      voltage: 380 + (Math.random() - 0.5) * 20,
      current: 15 + (Math.random() - 0.5) * 5,
      speed: Math.random() * 100,
      cycleTime: 45 + Math.random() * 30,
      throughput: Math.floor(Math.random() * 50) + 20,
      scrapRate: Math.random() * 5,
      energyUsage: 10 + Math.random() * 15,
      efficiency: 75 + Math.random() * 20,
      uptime: 85 + Math.random() * 10,
      lastMaintenance: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      operatingHours: Math.floor(Math.random() * 10000) + 5000,
      components: this.generateComponentStatus(),
    }));
  }

  generateComponentStatus() {
    const components = [
      'Spindle', 'Motor', 'Bearings', 'Coolant Pump',
      'Hydraulics', 'Electronics', 'Tool Holder', 'Drive Belt'
    ];

    return components.map(name => ({
      name,
      health: 60 + Math.random() * 40,
      status: Math.random() > 0.15 ? 'good' : (Math.random() > 0.5 ? 'warning' : 'critical'),
      lastReplaced: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
      expectedLife: Math.floor(365 + Math.random() * 365),
    }));
  }

  generateMaintenanceHistory() {
    const history = [];
    const types = ['Preventive', 'Corrective', 'Inspection', 'Calibration'];

    MACHINE_CONFIGS.forEach(machine => {
      const count = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < count; i++) {
        history.push({
          machineId: machine.id,
          date: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
          type: types[Math.floor(Math.random() * types.length)],
          description: this.generateMaintenanceDescription(),
          duration: Math.floor(Math.random() * 240) + 30,
          technician: `Tech-${Math.floor(Math.random() * 20) + 1}`,
          cost: Math.floor(Math.random() * 5000) + 500,
        });
      }
    });

    return history.sort((a, b) => b.date - a.date);
  }

  generateMaintenanceDescription() {
    const actions = [
      'Replaced worn bearings',
      'Lubricated drive system',
      'Calibrated sensors',
      'Updated firmware',
      'Cleaned cooling system',
      'Replaced tool holder',
      'Inspected electrical connections',
      'Adjusted belt tension',
      'Replaced hydraulic fluid',
      'Cleaned air filters',
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  updateSensorData() {
    const timestamp = Date.now();

    this.machines = this.machines.map(machine => {
      const updated = { ...machine };

      // Simulate realistic variations
      if (updated.status === 'running') {
        // Temperature with thermal inertia
        const tempTarget = updated.baseTemp + Math.sin(timestamp / 60000) * 5 + (Math.random() - 0.5) * 2;
        updated.temperature += (tempTarget - updated.temperature) * 0.1;

        // Vibration with occasional spikes
        const vibSpike = Math.random() > 0.95 ? Math.random() * 0.3 : 0;
        updated.vibration = updated.baseVib + (Math.random() - 0.5) * 0.05 + vibSpike;

        // Voltage and current with realistic correlation
        updated.voltage = 380 + Math.sin(timestamp / 30000) * 10 + (Math.random() - 0.5) * 5;
        updated.current = 15 + (updated.speed / 100) * 10 + (Math.random() - 0.5) * 2;

        // Speed variations
        updated.speed = Math.max(0, Math.min(100, updated.speed + (Math.random() - 0.5) * 5));

        // Cycle time with some variance
        updated.cycleTime = 45 + Math.random() * 30;

        // Throughput based on cycle time
        updated.throughput += Math.random() > 0.7 ? 1 : 0;

        // Scrap rate with occasional increases
        updated.scrapRate = Math.max(0, updated.scrapRate + (Math.random() - 0.5) * 0.5);

        // Energy usage correlated with speed
        updated.energyUsage = 10 + (updated.speed / 100) * 15 + (Math.random() - 0.5) * 2;

        // Efficiency calculation
        updated.efficiency = Math.min(98, 70 + (updated.speed / 100) * 25 - updated.scrapRate * 2);

        // Operating hours
        updated.operatingHours += 0.0005; // Increment slightly each update
      } else {
        // Idle state - values drift toward baseline
        updated.temperature += (20 - updated.temperature) * 0.05;
        updated.vibration *= 0.9;
        updated.energyUsage = 2 + Math.random();
        updated.speed = 0;
      }

      // Random status changes
      if (Math.random() > 0.99) {
        updated.status = updated.status === 'running' ? 'idle' : 'running';
      }

      // Check for alarm conditions
      this.checkAlarmConditions(updated, timestamp);

      return updated;
    });

    // Store historical data
    this.storeHistoricalData(timestamp);

    // Notify subscribers
    this.notifySubscribers();
  }

  checkAlarmConditions(machine, timestamp) {
    // Temperature alarm
    if (machine.temperature > machine.baseTemp + 15) {
      this.addAlarm(machine.id, 'E001', timestamp, machine.temperature);
    }

    // Vibration alarm
    if (machine.vibration > machine.baseVib + 0.3) {
      this.addAlarm(machine.id, 'E002', timestamp, machine.vibration);
    }

    // Efficiency alarm
    if (machine.efficiency < 60 && machine.status === 'running') {
      this.addAlarm(machine.id, 'E004', timestamp, machine.efficiency);
    }

    // Random maintenance alert
    if (Math.random() > 0.999) {
      const errorCode = ERROR_CODES[Math.floor(Math.random() * ERROR_CODES.length)];
      this.addAlarm(machine.id, errorCode.code, timestamp);
    }
  }

  addAlarm(machineId, errorCode, timestamp, value = null) {
    const errorInfo = ERROR_CODES.find(e => e.code === errorCode);
    const alarm = {
      id: `${machineId}-${errorCode}-${timestamp}`,
      machineId,
      errorCode,
      message: errorInfo?.message || 'Unknown error',
      severity: errorInfo?.severity || 'info',
      timestamp,
      value,
      acknowledged: false,
    };

    // Avoid duplicate recent alarms
    const recentDuplicate = this.alarms.find(
      a => a.machineId === machineId &&
           a.errorCode === errorCode &&
           timestamp - a.timestamp < 60000
    );

    if (!recentDuplicate) {
      this.alarms.unshift(alarm);
      // Keep only last 100 alarms
      if (this.alarms.length > 100) {
        this.alarms = this.alarms.slice(0, 100);
      }
    }
  }

  storeHistoricalData(timestamp) {
    this.machines.forEach(machine => {
      if (!this.historicalData.has(machine.id)) {
        this.historicalData.set(machine.id, []);
      }

      const history = this.historicalData.get(machine.id);
      history.push({
        timestamp,
        temperature: machine.temperature,
        vibration: machine.vibration,
        voltage: machine.voltage,
        current: machine.current,
        speed: machine.speed,
        energyUsage: machine.energyUsage,
        efficiency: machine.efficiency,
        throughput: machine.throughput,
        scrapRate: machine.scrapRate,
      });

      // Remove old data beyond retention period
      const cutoff = timestamp - this.historyRetention;
      const filtered = history.filter(point => point.timestamp > cutoff);
      this.historicalData.set(machine.id, filtered);
    });
  }

  getHistoricalData(machineId, startTime, endTime) {
    const history = this.historicalData.get(machineId) || [];
    return history.filter(point =>
      point.timestamp >= startTime && point.timestamp <= endTime
    );
  }

  getMachineById(id) {
    return this.machines.find(m => m.id === id);
  }

  getMaintenanceHistory(machineId) {
    return this.maintenanceHistory
      .filter(m => m.machineId === machineId)
      .sort((a, b) => b.date - a.date);
  }

  acknowledgeAlarm(alarmId) {
    const alarm = this.alarms.find(a => a.id === alarmId);
    if (alarm) {
      alarm.acknowledged = true;
    }
  }

  subscribe(callback) {
    this.updateCallbacks.push(callback);
    return () => {
      this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    };
  }

  notifySubscribers() {
    this.updateCallbacks.forEach(callback => {
      try {
        callback({
          machines: this.machines,
          alarms: this.alarms,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  start(interval = 2000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.updateSensorData();
    }, interval);

    // Initial update
    this.updateSensorData();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  reset() {
    this.stop();
    this.machines = this.initializeMachines();
    this.historicalData.clear();
    this.alarms = [];
    this.notifySubscribers();
  }
}

export default new DataSimulator();
