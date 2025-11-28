const regions = ['North America', 'Europe', 'Asia Pacific', 'South America'];
const plantTypes = ['Assembly', 'Fabrication', 'Processing', 'Packaging'];
const machineCategories = ['CNC', 'Injection Molding', 'Assembly Robot', 'Conveyor', 'Press', 'Laser Cutter', 'Welding Station', 'Quality Scanner'];

export const plants = [
  { id: 'NA-01', name: 'Detroit Assembly Plant', region: 'North America', lat: 42.3314, lng: -83.0458, type: 'Assembly' },
  { id: 'NA-02', name: 'Chicago Fabrication', region: 'North America', lat: 41.8781, lng: -87.6298, type: 'Fabrication' },
  { id: 'NA-03', name: 'Houston Processing', region: 'North America', lat: 29.7604, lng: -95.3698, type: 'Processing' },
  { id: 'EU-01', name: 'Berlin Manufacturing', region: 'Europe', lat: 52.5200, lng: 13.4050, type: 'Assembly' },
  { id: 'EU-02', name: 'Paris Production', region: 'Europe', lat: 48.8566, lng: 2.3522, type: 'Fabrication' },
  { id: 'EU-03', name: 'Madrid Operations', region: 'Europe', lat: 40.4168, lng: -3.7038, type: 'Packaging' },
  { id: 'AP-01', name: 'Tokyo Advanced Facility', region: 'Asia Pacific', lat: 35.6762, lng: 139.6503, type: 'Assembly' },
  { id: 'AP-02', name: 'Shanghai Mega Factory', region: 'Asia Pacific', lat: 31.2304, lng: 121.4737, type: 'Fabrication' },
  { id: 'AP-03', name: 'Singapore Tech Center', region: 'Asia Pacific', lat: 1.3521, lng: 103.8198, type: 'Processing' },
  { id: 'SA-01', name: 'Sao Paulo Production', region: 'South America', lat: -23.5505, lng: -46.6333, type: 'Assembly' },
  { id: 'SA-02', name: 'Buenos Aires Plant', region: 'South America', lat: -34.6037, lng: -58.3816, type: 'Packaging' }
];

export const generateMachines = (plantId) => {
  const machines = [];
  const machineCount = 15 + Math.floor(Math.random() * 10);

  for (let i = 0; i < machineCount; i++) {
    const category = machineCategories[Math.floor(Math.random() * machineCategories.length)];
    machines.push({
      id: `${plantId}-M${String(i + 1).padStart(3, '0')}`,
      name: `${category} ${i + 1}`,
      category,
      plantId,
      status: Math.random() > 0.15 ? 'operational' : Math.random() > 0.5 ? 'warning' : 'critical',
      efficiency: 65 + Math.random() * 30,
      temperature: 45 + Math.random() * 40,
      vibration: Math.random() * 10,
      rpm: 1000 + Math.random() * 2000,
      power: 50 + Math.random() * 200,
      cycleTime: 30 + Math.random() * 120,
      x: Math.random() * 800,
      y: Math.random() * 600
    });
  }

  return machines;
};

export const generateProcessLines = (plantId) => {
  const lines = [];
  const lineCount = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < lineCount; i++) {
    lines.push({
      id: `${plantId}-L${i + 1}`,
      name: `Production Line ${i + 1}`,
      plantId,
      status: Math.random() > 0.2 ? 'running' : 'stopped',
      throughput: 50 + Math.random() * 100,
      targetThroughput: 120,
      efficiency: 70 + Math.random() * 25,
      cycleTime: 45 + Math.random() * 60,
      downtime: Math.random() * 120,
      temperature: 60 + Math.random() * 30,
      stages: [
        { name: 'Material Loading', duration: 5 + Math.random() * 10, status: 'active' },
        { name: 'Processing', duration: 20 + Math.random() * 30, status: 'active' },
        { name: 'Quality Check', duration: 3 + Math.random() * 7, status: 'active' },
        { name: 'Assembly', duration: 15 + Math.random() * 25, status: 'active' },
        { name: 'Packaging', duration: 8 + Math.random() * 12, status: 'active' }
      ]
    });
  }

  return lines;
};

export const generateEnergyData = (plantId, hours = 24) => {
  const data = [];
  const baseLoad = 500 + Math.random() * 500;

  for (let i = 0; i < hours; i++) {
    const hourOfDay = (new Date().getHours() + i) % 24;
    const peakFactor = hourOfDay >= 8 && hourOfDay <= 18 ? 1.5 : 0.7;
    const randomVariation = 0.8 + Math.random() * 0.4;

    data.push({
      timestamp: new Date(Date.now() + i * 3600000).toISOString(),
      consumption: baseLoad * peakFactor * randomVariation,
      demand: baseLoad * peakFactor * 1.1,
      cost: (baseLoad * peakFactor * randomVariation * 0.12),
      renewable: Math.random() * 30
    });
  }

  return data;
};

export const generateQualityData = (plantId, samples = 1000) => {
  const data = [];
  const mean = 100;
  const stdDev = 2;

  for (let i = 0; i < samples; i++) {
    const value = mean + (Math.random() - 0.5) * 2 * stdDev * 3;
    const defectType = Math.random() < 0.95 ? null :
      ['Dimension', 'Surface', 'Assembly', 'Material'][Math.floor(Math.random() * 4)];

    data.push({
      id: `${plantId}-Q${String(i + 1).padStart(5, '0')}`,
      timestamp: new Date(Date.now() - (samples - i) * 300000).toISOString(),
      value,
      isDefect: defectType !== null,
      defectType,
      batchId: `B${Math.floor(i / 50)}`,
      lineId: `${plantId}-L${Math.floor(Math.random() * 3) + 1}`
    });
  }

  return data;
};

export const generateMaintenanceData = (machines) => {
  return machines.map(machine => {
    const mtbf = 200 + Math.random() * 300;
    const hoursSinceLastMaintenance = Math.random() * mtbf;
    const failureProbability = Math.min(95, (hoursSinceLastMaintenance / mtbf) * 100);

    return {
      machineId: machine.id,
      machineName: machine.name,
      lastMaintenance: new Date(Date.now() - hoursSinceLastMaintenance * 3600000).toISOString(),
      nextScheduled: new Date(Date.now() + (mtbf - hoursSinceLastMaintenance) * 3600000).toISOString(),
      failureProbability,
      criticalParts: [
        { name: 'Bearing Assembly', condition: 100 - failureProbability, inStock: Math.random() > 0.3 },
        { name: 'Motor Belt', condition: 100 - failureProbability * 0.8, inStock: Math.random() > 0.2 },
        { name: 'Hydraulic Pump', condition: 100 - failureProbability * 0.6, inStock: Math.random() > 0.4 },
        { name: 'Control Board', condition: 100 - failureProbability * 0.4, inStock: Math.random() > 0.5 }
      ],
      estimatedDowntime: 2 + Math.random() * 8,
      priority: failureProbability > 70 ? 'high' : failureProbability > 40 ? 'medium' : 'low'
    };
  });
};

export const generateKPIData = () => {
  return {
    overall: {
      oee: 72 + Math.random() * 15,
      availability: 85 + Math.random() * 10,
      performance: 80 + Math.random() * 15,
      quality: 95 + Math.random() * 4,
      mtbf: 250 + Math.random() * 100,
      mttr: 2 + Math.random() * 3,
      scrapRate: 2 + Math.random() * 3,
      energyEfficiency: 75 + Math.random() * 15,
      laborProductivity: 85 + Math.random() * 12,
      costPerUnit: 45 + Math.random() * 15
    },
    byRegion: regions.map(region => ({
      region,
      oee: 70 + Math.random() * 20,
      throughput: 5000 + Math.random() * 3000,
      defectRate: 1 + Math.random() * 3,
      energyCost: 50000 + Math.random() * 30000
    })),
    trends: {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
        oee: 70 + Math.random() * 15,
        throughput: 4000 + Math.random() * 2000,
        quality: 94 + Math.random() * 4
      }))
    }
  };
};

export const generateAlerts = (plants, machines) => {
  const alerts = [];
  const alertTypes = [
    { type: 'critical', message: 'Machine failure detected', probability: 0.05 },
    { type: 'warning', message: 'Temperature threshold exceeded', probability: 0.15 },
    { type: 'warning', message: 'Efficiency below target', probability: 0.20 },
    { type: 'info', message: 'Scheduled maintenance due', probability: 0.10 },
    { type: 'critical', message: 'Quality threshold breach', probability: 0.08 }
  ];

  machines.forEach(machine => {
    alertTypes.forEach(alert => {
      if (Math.random() < alert.probability) {
        alerts.push({
          id: `A${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: alert.type,
          message: `${machine.name}: ${alert.message}`,
          machineId: machine.id,
          plantId: machine.plantId,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          acknowledged: Math.random() > 0.6
        });
      }
    });
  });

  return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export class DataStreamSimulator {
  constructor() {
    this.listeners = new Map();
    this.intervals = new Map();
  }

  subscribe(streamId, callback, interval = 1000) {
    if (!this.listeners.has(streamId)) {
      this.listeners.set(streamId, new Set());
    }
    this.listeners.get(streamId).add(callback);

    if (!this.intervals.has(streamId)) {
      const intervalId = setInterval(() => {
        this.emit(streamId);
      }, interval);
      this.intervals.set(streamId, intervalId);
    }

    return () => {
      const listeners = this.listeners.get(streamId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          clearInterval(this.intervals.get(streamId));
          this.intervals.delete(streamId);
          this.listeners.delete(streamId);
        }
      }
    };
  }

  emit(streamId) {
    const listeners = this.listeners.get(streamId);
    if (listeners) {
      const data = this.generateStreamData(streamId);
      listeners.forEach(callback => callback(data));
    }
  }

  generateStreamData(streamId) {
    if (streamId.includes('machine-')) {
      return {
        temperature: 45 + Math.random() * 40,
        vibration: Math.random() * 10,
        rpm: 1000 + Math.random() * 2000,
        power: 50 + Math.random() * 200,
        efficiency: 65 + Math.random() * 30,
        status: Math.random() > 0.95 ? 'warning' : 'operational'
      };
    } else if (streamId.includes('line-')) {
      return {
        throughput: 50 + Math.random() * 100,
        cycleTime: 45 + Math.random() * 60,
        efficiency: 70 + Math.random() * 25,
        temperature: 60 + Math.random() * 30
      };
    } else if (streamId.includes('energy-')) {
      return {
        consumption: 500 + Math.random() * 500,
        cost: (500 + Math.random() * 500) * 0.12,
        renewable: Math.random() * 30
      };
    }
    return {};
  }
}

export const dataSimulator = new DataStreamSimulator();
