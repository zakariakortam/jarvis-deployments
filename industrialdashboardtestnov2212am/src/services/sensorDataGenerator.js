// Mock sensor data generator for industrial equipment
// Simulates realistic sensor readings with noise and trends

const EQUIPMENT_TYPES = ['CNC Machine', 'Injection Molder', 'Conveyor Belt', 'Assembly Robot', 'Packaging Unit', 'Quality Scanner'];
const EQUIPMENT_LOCATIONS = ['Line A', 'Line B', 'Line C', 'Warehouse', 'Assembly', 'QC Station'];

class SensorDataGenerator {
  constructor() {
    this.equipment = this.generateEquipment(100); // Generate 100 equipment units
    this.baseTime = Date.now();
    this.alerts = [];
  }

  generateEquipment(count) {
    return Array.from({ length: count }, (_, i) => ({
      id: `EQ-${String(i + 1).padStart(4, '0')}`,
      name: `${EQUIPMENT_TYPES[i % EQUIPMENT_TYPES.length]} ${Math.floor(i / EQUIPMENT_TYPES.length) + 1}`,
      type: EQUIPMENT_TYPES[i % EQUIPMENT_TYPES.length],
      location: EQUIPMENT_LOCATIONS[i % EQUIPMENT_LOCATIONS.length],
      status: Math.random() > 0.1 ? 'operational' : Math.random() > 0.5 ? 'warning' : 'offline',
      baseTemp: 50 + Math.random() * 30,
      baseVoltage: 220 + Math.random() * 10,
      baseVibration: 1 + Math.random() * 2,
      basePower: 10 + Math.random() * 90,
      cycleCount: Math.floor(Math.random() * 10000),
      throughput: Math.floor(Math.random() * 1000),
      efficiency: 75 + Math.random() * 20,
      lastMaintenance: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      nextMaintenance: Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000,
    }));
  }

  addNoise(value, noiseLevel = 0.05) {
    return value * (1 + (Math.random() - 0.5) * noiseLevel);
  }

  generateTemperature(equipment, time) {
    const cyclicVariation = Math.sin(time / 60000) * 5; // 1-minute cycle
    const randomNoise = (Math.random() - 0.5) * 3;
    const statusMultiplier = equipment.status === 'warning' ? 1.2 : equipment.status === 'critical' ? 1.4 : 1;

    return Math.max(20, equipment.baseTemp + cyclicVariation + randomNoise) * statusMultiplier;
  }

  generateVoltage(equipment, time) {
    const cyclicVariation = Math.sin(time / 30000) * 2; // 30-second cycle
    const randomNoise = (Math.random() - 0.5) * 1;

    return equipment.baseVoltage + cyclicVariation + randomNoise;
  }

  generateVibration(equipment, time) {
    const cyclicVariation = Math.sin(time / 10000) * 0.5; // 10-second cycle
    const randomNoise = (Math.random() - 0.5) * 0.3;
    const statusMultiplier = equipment.status === 'warning' ? 1.5 : equipment.status === 'critical' ? 2 : 1;

    return Math.max(0, equipment.baseVibration + cyclicVariation + randomNoise) * statusMultiplier;
  }

  generatePower(equipment, time) {
    const cyclicVariation = Math.sin(time / 45000) * 10; // 45-second cycle
    const randomNoise = (Math.random() - 0.5) * 5;
    const statusMultiplier = equipment.status === 'offline' ? 0.1 : 1;

    return Math.max(0, equipment.basePower + cyclicVariation + randomNoise) * statusMultiplier;
  }

  updateCycleCount(equipment, deltaTime) {
    if (equipment.status === 'operational') {
      equipment.cycleCount += Math.floor(Math.random() * 5 * (deltaTime / 1000));
    }
  }

  updateThroughput(equipment, deltaTime) {
    if (equipment.status === 'operational') {
      const rate = equipment.efficiency / 100;
      equipment.throughput += Math.floor(Math.random() * 10 * rate * (deltaTime / 1000));
    }
  }

  checkThresholds(equipment, readings) {
    const alerts = [];

    if (readings.temperature > 85) {
      alerts.push({
        equipmentId: equipment.id,
        severity: readings.temperature > 95 ? 'critical' : 'warning',
        type: 'temperature',
        message: `High temperature detected: ${readings.temperature.toFixed(1)}°C`,
        timestamp: Date.now()
      });
      equipment.status = readings.temperature > 95 ? 'critical' : 'warning';
    }

    if (readings.vibration > 5.0) {
      alerts.push({
        equipmentId: equipment.id,
        severity: 'warning',
        type: 'vibration',
        message: `High vibration detected: ${readings.vibration.toFixed(2)} mm/s`,
        timestamp: Date.now()
      });
      if (equipment.status === 'operational') {
        equipment.status = 'warning';
      }
    }

    if (readings.voltage < 200 || readings.voltage > 250) {
      alerts.push({
        equipmentId: equipment.id,
        severity: 'warning',
        type: 'voltage',
        message: `Voltage out of range: ${readings.voltage.toFixed(1)}V`,
        timestamp: Date.now()
      });
    }

    return alerts;
  }

  generateSnapshot() {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.baseTime;
    this.baseTime = currentTime;

    const snapshot = this.equipment.map(eq => {
      const readings = {
        equipmentId: eq.id,
        name: eq.name,
        type: eq.type,
        location: eq.location,
        status: eq.status,
        temperature: this.generateTemperature(eq, currentTime),
        voltage: this.generateVoltage(eq, currentTime),
        vibration: this.generateVibration(eq, currentTime),
        power: this.generatePower(eq, currentTime),
        cycleCount: eq.cycleCount,
        throughput: eq.throughput,
        efficiency: eq.efficiency,
        timestamp: currentTime,
        lastMaintenance: eq.lastMaintenance,
        nextMaintenance: eq.nextMaintenance,
      };

      this.updateCycleCount(eq, deltaTime);
      this.updateThroughput(eq, deltaTime);

      const newAlerts = this.checkThresholds(eq, readings);
      this.alerts.push(...newAlerts);

      // Randomly recover from warning states
      if (eq.status === 'warning' && Math.random() > 0.95) {
        eq.status = 'operational';
      }

      // Randomly go offline
      if (eq.status === 'operational' && Math.random() > 0.999) {
        eq.status = 'offline';
      }

      // Randomly come back online
      if (eq.status === 'offline' && Math.random() > 0.9) {
        eq.status = 'operational';
      }

      return readings;
    });

    // Keep only recent alerts (last 100)
    this.alerts = this.alerts.slice(-100);

    return {
      snapshot,
      alerts: this.alerts,
      summary: this.generateSummary(snapshot)
    };
  }

  generateSummary(snapshot) {
    const operational = snapshot.filter(s => s.status === 'operational').length;
    const warning = snapshot.filter(s => s.status === 'warning').length;
    const critical = snapshot.filter(s => s.status === 'critical').length;
    const offline = snapshot.filter(s => s.status === 'offline').length;

    const avgTemp = snapshot.reduce((sum, s) => sum + s.temperature, 0) / snapshot.length;
    const avgPower = snapshot.reduce((sum, s) => sum + s.power, 0) / snapshot.length;
    const totalThroughput = snapshot.reduce((sum, s) => sum + s.throughput, 0);
    const avgEfficiency = snapshot.reduce((sum, s) => sum + s.efficiency, 0) / snapshot.length;

    return {
      total: snapshot.length,
      operational,
      warning,
      critical,
      offline,
      avgTemperature: avgTemp,
      avgPower: avgPower,
      totalThroughput,
      avgEfficiency,
      healthScore: ((operational + warning * 0.5) / snapshot.length) * 100
    };
  }

  getEquipmentById(id) {
    return this.equipment.find(eq => eq.id === id);
  }

  getAllEquipment() {
    return this.equipment;
  }

  getRecentAlerts(limit = 20) {
    return this.alerts.slice(-limit).reverse();
  }
}

export default SensorDataGenerator;
