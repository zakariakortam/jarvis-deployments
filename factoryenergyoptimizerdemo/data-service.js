/**
 * OPC UA Data Service for Factory Energy Optimization System
 * Handles real-time sensor data ingestion and processing
 */

class OPCUADataService {
    constructor() {
        this.isConnected = false;
        this.sensorData = new Map();
        this.subscribers = new Map();
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        
        // Simulate OPC UA endpoints
        this.endpoints = [
            { id: 'plc1', url: 'opc.tcp://192.168.1.100:4840', name: 'Production Line 1' },
            { id: 'plc2', url: 'opc.tcp://192.168.1.101:4840', name: 'Production Line 2' },
            { id: 'plc3', url: 'opc.tcp://192.168.1.102:4840', name: 'Utility Systems' }
        ];

        // Sensor node mappings
        this.sensorNodes = {
            power: {
                voltage_l1: 'ns=2;s=PowerMeter.Voltage.L1',
                voltage_l2: 'ns=2;s=PowerMeter.Voltage.L2',
                voltage_l3: 'ns=2;s=PowerMeter.Voltage.L3',
                current_l1: 'ns=2;s=PowerMeter.Current.L1',
                current_l2: 'ns=2;s=PowerMeter.Current.L2',
                current_l3: 'ns=2;s=PowerMeter.Current.L3',
                active_power: 'ns=2;s=PowerMeter.ActivePower',
                reactive_power: 'ns=2;s=PowerMeter.ReactivePower',
                power_factor: 'ns=2;s=PowerMeter.PowerFactor'
            },
            production: {
                line_speed: 'ns=2;s=Production.LineSpeed',
                units_per_hour: 'ns=2;s=Production.UnitsPerHour',
                cycle_time: 'ns=2;s=Production.CycleTime',
                downtime: 'ns=2;s=Production.Downtime',
                quality_rate: 'ns=2;s=Production.QualityRate'
            },
            environment: {
                temperature: 'ns=2;s=Environment.Temperature',
                humidity: 'ns=2;s=Environment.Humidity',
                vibration: 'ns=2;s=Environment.Vibration',
                noise_level: 'ns=2;s=Environment.NoiseLevel'
            }
        };

        this.init();
    }

    async init() {
        await this.simulateConnection();
        this.startDataSimulation();
        this.updateConnectionStatus();
    }

    async simulateConnection() {
        console.log('🔌 Attempting OPC UA connection...');
        
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful connection (90% success rate)
        const success = Math.random() > 0.1;
        
        if (success) {
            this.isConnected = true;
            this.connectionAttempts = 0;
            console.log('✅ OPC UA connection established');
            this.notifySubscribers('connection', { status: 'connected' });
        } else {
            this.isConnected = false;
            this.connectionAttempts++;
            console.log(`❌ OPC UA connection failed (attempt ${this.connectionAttempts})`);
            
            if (this.connectionAttempts < this.maxReconnectAttempts) {
                setTimeout(() => this.simulateConnection(), this.reconnectInterval);
            }
        }
    }

    startDataSimulation() {
        // Simulate real-time sensor data updates
        setInterval(() => {
            if (this.isConnected) {
                this.generateSensorData();
            }
        }, 1000);

        // Simulate periodic connection issues
        setInterval(() => {
            if (Math.random() < 0.05) { // 5% chance of disconnection
                this.simulateDisconnection();
            }
        }, 30000);
    }

    generateSensorData() {
        const timestamp = new Date().toISOString();
        
        // Power data simulation
        const basePower = 200 + Math.sin(Date.now() / 60000) * 50; // Daily cycle
        const powerNoise = (Math.random() - 0.5) * 20;
        const actualPower = Math.max(0, basePower + powerNoise);

        const powerData = {
            timestamp,
            voltage: {
                l1: 220 + (Math.random() - 0.5) * 10,
                l2: 219 + (Math.random() - 0.5) * 10,
                l3: 221 + (Math.random() - 0.5) * 10
            },
            current: {
                l1: actualPower / 220 * 0.33,
                l2: actualPower / 220 * 0.33,
                l3: actualPower / 220 * 0.34
            },
            active_power: actualPower,
            reactive_power: actualPower * 0.1,
            power_factor: 0.85 + Math.random() * 0.1
        };

        // Production data simulation
        const baseProduction = 1200 + Math.sin(Date.now() / 120000) * 200; // Production cycle
        const productionNoise = (Math.random() - 0.5) * 100;
        const actualProduction = Math.max(0, baseProduction + productionNoise);

        const productionData = {
            timestamp,
            line_speed: 85 + (Math.random() - 0.5) * 10,
            units_per_hour: actualProduction,
            cycle_time: 3600 / actualProduction,
            downtime: Math.random() * 5, // minutes
            quality_rate: 0.94 + Math.random() * 0.05,
            oee: this.calculateOEE(actualProduction, 1400, 0.94 + Math.random() * 0.05)
        };

        // Environment data simulation
        const environmentData = {
            timestamp,
            temperature: 22 + Math.sin(Date.now() / 180000) * 5 + (Math.random() - 0.5) * 2,
            humidity: 45 + Math.sin(Date.now() / 240000) * 10 + (Math.random() - 0.5) * 5,
            vibration: 0.1 + Math.random() * 0.3,
            noise_level: 70 + (Math.random() - 0.5) * 10
        };

        // Store data
        this.sensorData.set('power', powerData);
        this.sensorData.set('production', productionData);
        this.sensorData.set('environment', environmentData);

        // Calculate derived metrics
        const efficiency = this.calculateEfficiency(powerData.active_power, productionData.units_per_hour);
        const costPerHour = this.calculateCost(powerData.active_power);
        const powerPerUnit = productionData.units_per_hour > 0 ? powerData.active_power / productionData.units_per_hour : 0;

        const derivedData = {
            timestamp,
            efficiency,
            cost_per_hour: costPerHour,
            power_per_unit: powerPerUnit,
            daily_cost: costPerHour * 24, // Rough estimate
            energy_intensity: powerData.active_power / (productionData.units_per_hour || 1)
        };

        this.sensorData.set('derived', derivedData);

        // Notify subscribers
        this.notifySubscribers('data_update', {
            power: powerData,
            production: productionData,
            environment: environmentData,
            derived: derivedData
        });

        // Check for anomalies
        this.checkForAnomalies();
    }

    calculateOEE(actualProduction, plannedProduction, qualityRate) {
        const availability = 0.95; // Assume 95% availability
        const performance = actualProduction / plannedProduction;
        return Math.min(1.0, availability * performance * qualityRate);
    }

    calculateEfficiency(power, production) {
        if (production === 0) return 0;
        // Efficiency based on optimal power-to-production ratio
        const optimalRatio = 0.15; // kW per unit
        const actualRatio = power / production;
        return Math.max(0, Math.min(100, (optimalRatio / actualRatio) * 100));
    }

    calculateCost(powerKW) {
        const costPerKWh = 25; // ¥25 per kWh
        return (powerKW * costPerKWh) / 60; // Cost per minute
    }

    checkForAnomalies() {
        const powerData = this.sensorData.get('power');
        const productionData = this.sensorData.get('production');
        const derivedData = this.sensorData.get('derived');

        const anomalies = [];

        // Power anomalies
        if (powerData.active_power > 300) {
            anomalies.push({
                type: 'power_spike',
                severity: 'warning',
                message: 'Power consumption exceeds normal range',
                value: powerData.active_power,
                threshold: 300
            });
        }

        if (powerData.power_factor < 0.8) {
            anomalies.push({
                type: 'poor_power_factor',
                severity: 'warning',
                message: 'Poor power factor detected',
                value: powerData.power_factor,
                threshold: 0.8
            });
        }

        // Production anomalies
        if (productionData.units_per_hour < 1000) {
            anomalies.push({
                type: 'low_production',
                severity: 'critical',
                message: 'Production rate below minimum threshold',
                value: productionData.units_per_hour,
                threshold: 1000
            });
        }

        // Efficiency anomalies
        if (derivedData.efficiency < 70) {
            anomalies.push({
                type: 'low_efficiency',
                severity: 'warning',
                message: 'Energy efficiency below target',
                value: derivedData.efficiency,
                threshold: 70
            });
        }

        if (anomalies.length > 0) {
            this.notifySubscribers('anomaly_detected', { anomalies });
        }
    }

    simulateDisconnection() {
        this.isConnected = false;
        console.log('⚠️ OPC UA connection lost');
        this.notifySubscribers('connection', { status: 'disconnected' });
        
        // Attempt reconnection
        setTimeout(() => this.simulateConnection(), 3000);
    }

    subscribe(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    unsubscribe(event, callback) {
        if (this.subscribers.has(event)) {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    notifySubscribers(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in subscriber callback for ${event}:`, error);
                }
            });
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.className = `connection-status ${this.isConnected ? '' : 'disconnected'}`;
            const statusText = statusElement.querySelector('span');
            if (statusText) {
                statusText.textContent = this.isConnected ? 
                    (getCurrentLanguage() === 'ja' ? 'OPC UA 接続済み' : 'OPC UA Connected') :
                    (getCurrentLanguage() === 'ja' ? 'OPC UA 切断' : 'OPC UA Disconnected');
            }
        }
    }

    getCurrentData(category) {
        return this.sensorData.get(category) || {};
    }

    getAllData() {
        const result = {};
        for (const [key, value] of this.sensorData) {
            result[key] = value;
        }
        return result;
    }

    getHistoricalData(category, timeRange = '1h') {
        // In a real implementation, this would query historical data from a database
        // For now, we'll simulate historical data
        const points = 60; // 60 data points
        const interval = this.getIntervalMs(timeRange) / points;
        const data = [];
        
        const currentTime = Date.now();
        const currentData = this.getCurrentData(category);
        
        for (let i = points - 1; i >= 0; i--) {
            const timestamp = new Date(currentTime - (i * interval));
            const simulatedData = this.simulateHistoricalPoint(category, currentData, i, points);
            data.push({
                timestamp: timestamp.toISOString(),
                ...simulatedData
            });
        }
        
        return data;
    }

    getIntervalMs(timeRange) {
        const intervals = {
            '1h': 60 * 60 * 1000,
            '8h': 8 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000
        };
        return intervals[timeRange] || intervals['1h'];
    }

    simulateHistoricalPoint(category, currentData, index, total) {
        // Create realistic historical data variations
        const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
        
        if (category === 'power') {
            return {
                active_power: Math.max(0, currentData.active_power * (1 + variation)),
                power_factor: Math.max(0.7, Math.min(1.0, currentData.power_factor * (1 + variation * 0.1)))
            };
        } else if (category === 'production') {
            return {
                units_per_hour: Math.max(0, currentData.units_per_hour * (1 + variation)),
                oee: Math.max(0.5, Math.min(1.0, currentData.oee * (1 + variation * 0.1)))
            };
        } else if (category === 'derived') {
            return {
                efficiency: Math.max(0, Math.min(100, currentData.efficiency * (1 + variation * 0.1))),
                cost_per_hour: currentData.cost_per_hour * (1 + variation)
            };
        }
        
        return currentData;
    }
}

// Initialize the data service
const dataService = new OPCUADataService();

// Export for use in other modules
window.dataService = dataService;