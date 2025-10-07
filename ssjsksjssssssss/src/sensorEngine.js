/**
 * Industrial Sensor Data Simulation Engine
 * Generates realistic sensor data for factory equipment monitoring
 */

class SensorEngine {
    constructor() {
        this.sensors = [];
        this.equipment = [];
        this.dataStreams = new Map();
        this.updateInterval = 1000; // 1 second updates
        this.isRunning = false;
        this.listeners = new Map();
        this.historicalData = new Map();
        this.maxHistoryPoints = 100;
    }

    /**
     * Initialize sensor network with factory equipment
     */
    initialize() {
        // Define equipment zones
        const zones = ['Assembly Line A', 'Assembly Line B', 'Welding Station', 'Paint Booth',
                      'Quality Control', 'Packaging', 'Material Handler', 'Press Shop'];

        const equipmentTypes = ['Motor', 'Pump', 'Conveyor', 'Robot Arm', 'Press', 'Furnace', 'Compressor', 'Hydraulic Unit'];

        let sensorId = 1;
        let equipmentId = 1;

        // Generate 50 pieces of equipment with multiple sensors each
        for (let i = 0; i < 50; i++) {
            const zone = zones[i % zones.length];
            const type = equipmentTypes[i % equipmentTypes.length];
            const equipmentName = `${type}-${String(equipmentId).padStart(3, '0')}`;

            const equipment = {
                id: equipmentId,
                name: equipmentName,
                zone: zone,
                type: type,
                status: 'operational',
                uptime: 95 + Math.random() * 5,
                sensors: []
            };

            // Each equipment has 4-6 sensors
            const sensorCount = 4 + Math.floor(Math.random() * 3);

            for (let j = 0; j < sensorCount; j++) {
                const sensor = this.createSensor(sensorId++, equipmentName, j);
                equipment.sensors.push(sensor);
                this.sensors.push(sensor);
            }

            this.equipment.push(equipment);
            equipmentId++;
        }

        console.log(`Initialized ${this.equipment.length} equipment units with ${this.sensors.length} sensors`);
    }

    /**
     * Create individual sensor with realistic parameters
     */
    createSensor(id, equipmentName, index) {
        const sensorTypes = [
            { type: 'temperature', unit: '°C', min: 20, max: 150, nominal: 75, variance: 15 },
            { type: 'voltage', unit: 'V', min: 200, max: 250, nominal: 220, variance: 10 },
            { type: 'vibration', unit: 'mm/s', min: 0, max: 25, nominal: 5, variance: 8 },
            { type: 'power', unit: 'kW', min: 10, max: 500, nominal: 150, variance: 100 },
            { type: 'pressure', unit: 'bar', min: 0, max: 10, nominal: 5, variance: 3 },
            { type: 'speed', unit: 'RPM', min: 0, max: 3000, nominal: 1500, variance: 500 }
        ];

        const sensorSpec = sensorTypes[index % sensorTypes.length];

        return {
            id: id,
            equipmentName: equipmentName,
            type: sensorSpec.type,
            unit: sensorSpec.unit,
            currentValue: sensorSpec.nominal,
            min: sensorSpec.min,
            max: sensorSpec.max,
            nominal: sensorSpec.nominal,
            variance: sensorSpec.variance,
            status: 'normal',
            lastUpdate: Date.now(),
            cycleCount: Math.floor(Math.random() * 100000),
            totalRuntime: Math.floor(Math.random() * 10000)
        };
    }

    /**
     * Start real-time data generation
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateLoop();
        console.log('Sensor engine started');
    }

    /**
     * Stop data generation
     */
    stop() {
        this.isRunning = false;
        console.log('Sensor engine stopped');
    }

    /**
     * Main update loop
     */
    updateLoop() {
        if (!this.isRunning) return;

        // Update all sensors
        this.sensors.forEach(sensor => {
            this.updateSensorValue(sensor);
        });

        // Update equipment metrics
        this.equipment.forEach(eq => {
            this.updateEquipmentMetrics(eq);
        });

        // Notify listeners
        this.notifyListeners();

        // Schedule next update
        setTimeout(() => this.updateLoop(), this.updateInterval);
    }

    /**
     * Update individual sensor with realistic variation
     */
    updateSensorValue(sensor) {
        const now = Date.now();
        const timeDelta = (now - sensor.lastUpdate) / 1000;

        // Generate realistic value with drift and noise
        let delta = (Math.random() - 0.5) * sensor.variance * 0.3;

        // Add occasional spikes (5% chance)
        if (Math.random() < 0.05) {
            delta *= 3;
        }

        // Apply cyclic patterns based on sensor type
        const cycle = (now / 10000) % (2 * Math.PI);
        if (sensor.type === 'temperature') {
            delta += Math.sin(cycle) * sensor.variance * 0.2;
        } else if (sensor.type === 'vibration') {
            delta += Math.cos(cycle * 2) * sensor.variance * 0.15;
        }

        let newValue = sensor.currentValue + delta;

        // Keep within bounds
        newValue = Math.max(sensor.min, Math.min(sensor.max, newValue));

        // Determine status based on deviation from nominal
        const deviation = Math.abs(newValue - sensor.nominal) / sensor.variance;
        if (deviation > 2.5) {
            sensor.status = 'critical';
        } else if (deviation > 1.5) {
            sensor.status = 'warning';
        } else {
            sensor.status = 'normal';
        }

        sensor.currentValue = newValue;
        sensor.lastUpdate = now;

        // Update cycle count for certain sensor types
        if (['speed', 'power'].includes(sensor.type)) {
            sensor.cycleCount += Math.floor(Math.random() * 10);
            sensor.totalRuntime += timeDelta;
        }

        // Store historical data
        this.storeHistoricalData(sensor);
    }

    /**
     * Store historical data points for charting
     */
    storeHistoricalData(sensor) {
        const key = `sensor_${sensor.id}`;

        if (!this.historicalData.has(key)) {
            this.historicalData.set(key, []);
        }

        const history = this.historicalData.get(key);
        history.push({
            timestamp: sensor.lastUpdate,
            value: sensor.currentValue,
            status: sensor.status
        });

        // Keep only recent history
        if (history.length > this.maxHistoryPoints) {
            history.shift();
        }
    }

    /**
     * Update equipment-level metrics
     */
    updateEquipmentMetrics(equipment) {
        // Calculate throughput based on sensor activity
        const activeSensors = equipment.sensors.filter(s => s.status !== 'critical').length;
        const efficiency = (activeSensors / equipment.sensors.length) * 100;

        equipment.efficiency = efficiency;
        equipment.throughput = Math.floor(efficiency * (50 + Math.random() * 50));

        // Update status based on sensor health
        const criticalCount = equipment.sensors.filter(s => s.status === 'critical').length;
        const warningCount = equipment.sensors.filter(s => s.status === 'warning').length;

        if (criticalCount > 0) {
            equipment.status = 'critical';
        } else if (warningCount > equipment.sensors.length / 2) {
            equipment.status = 'warning';
        } else {
            equipment.status = 'operational';
        }

        // Adjust uptime
        if (equipment.status === 'operational') {
            equipment.uptime = Math.min(100, equipment.uptime + 0.01);
        } else {
            equipment.uptime = Math.max(0, equipment.uptime - 0.1);
        }
    }

    /**
     * Register listener for data updates
     */
    onUpdate(callback) {
        const id = Date.now() + Math.random();
        this.listeners.set(id, callback);
        return id;
    }

    /**
     * Remove listener
     */
    offUpdate(id) {
        this.listeners.delete(id);
    }

    /**
     * Notify all registered listeners
     */
    notifyListeners() {
        const data = this.getCurrentSnapshot();
        this.listeners.forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }

    /**
     * Get current snapshot of all data
     */
    getCurrentSnapshot() {
        return {
            timestamp: Date.now(),
            sensors: this.sensors.map(s => ({...s})),
            equipment: this.equipment.map(e => ({...e})),
            summary: this.calculateSummary()
        };
    }

    /**
     * Calculate summary statistics
     */
    calculateSummary() {
        const totalSensors = this.sensors.length;
        const normalSensors = this.sensors.filter(s => s.status === 'normal').length;
        const warningSensors = this.sensors.filter(s => s.status === 'warning').length;
        const criticalSensors = this.sensors.filter(s => s.status === 'critical').length;

        const operationalEquipment = this.equipment.filter(e => e.status === 'operational').length;
        const totalThroughput = this.equipment.reduce((sum, e) => sum + (e.throughput || 0), 0);
        const avgEfficiency = this.equipment.reduce((sum, e) => sum + (e.efficiency || 0), 0) / this.equipment.length;
        const avgUptime = this.equipment.reduce((sum, e) => sum + e.uptime, 0) / this.equipment.length;

        const totalPower = this.sensors
            .filter(s => s.type === 'power')
            .reduce((sum, s) => sum + s.currentValue, 0);

        return {
            totalSensors,
            normalSensors,
            warningSensors,
            criticalSensors,
            sensorHealth: (normalSensors / totalSensors * 100).toFixed(1),
            totalEquipment: this.equipment.length,
            operationalEquipment,
            equipmentHealth: (operationalEquipment / this.equipment.length * 100).toFixed(1),
            totalThroughput,
            avgEfficiency: avgEfficiency.toFixed(1),
            avgUptime: avgUptime.toFixed(1),
            totalPowerConsumption: totalPower.toFixed(1)
        };
    }

    /**
     * Get historical data for a specific sensor
     */
    getHistory(sensorId) {
        const key = `sensor_${sensorId}`;
        return this.historicalData.get(key) || [];
    }

    /**
     * Get sensors by type
     */
    getSensorsByType(type) {
        return this.sensors.filter(s => s.type === type);
    }

    /**
     * Get equipment by zone
     */
    getEquipmentByZone(zone) {
        return this.equipment.filter(e => e.zone === zone);
    }

    /**
     * Get critical alerts
     */
    getCriticalAlerts() {
        return this.sensors
            .filter(s => s.status === 'critical')
            .map(s => ({
                sensorId: s.id,
                equipment: s.equipmentName,
                type: s.type,
                value: s.currentValue.toFixed(2),
                unit: s.unit,
                timestamp: s.lastUpdate
            }));
    }
}

// Export for use in main application
window.SensorEngine = SensorEngine;
