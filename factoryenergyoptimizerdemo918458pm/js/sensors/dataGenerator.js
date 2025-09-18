/**
 * Mock Sensor Data Generator
 * Generates realistic factory sensor data for testing and demonstration
 */

class SensorDataGenerator {
    constructor() {
        this.isRunning = false;
        this.subscribers = [];
        this.currentData = {};
        this.baselineData = this.initializeBaselines();
        this.anomalyProbability = 0.05; // 5% chance of anomalies
        this.updateInterval = 1000; // 1 second
        this.dataHistory = [];
        this.maxHistorySize = 10000;
    }

    initializeBaselines() {
        return {
            productionLines: [
                {
                    id: 'line1',
                    name: 'Assembly Line 1',
                    baseVoltage: 400, // Volts
                    baseTemperature: 25, // Celsius
                    basePower: 150, // kW
                    baseOutput: 100, // units per hour
                    efficiency: 0.85,
                    status: 'running'
                },
                {
                    id: 'line2',
                    name: 'Assembly Line 2',
                    baseVoltage: 400,
                    baseTemperature: 28,
                    basePower: 180,
                    baseOutput: 120,
                    efficiency: 0.82,
                    status: 'running'
                },
                {
                    id: 'line3',
                    name: 'Packaging Line',
                    baseVoltage: 380,
                    baseTemperature: 22,
                    basePower: 95,
                    baseOutput: 200,
                    efficiency: 0.88,
                    status: 'running'
                }
            ],
            powerCosts: {
                peakRate: 28.5, // yen per kWh during peak hours (9-17)
                offPeakRate: 18.2, // yen per kWh during off-peak hours
                demandCharge: 1520 // yen per kW of peak demand
            }
        };
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.generateInitialData();
        this.scheduleNextUpdate();
        console.log('Sensor data generator started');
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        console.log('Sensor data generator stopped');
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    unsubscribe(callback) {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
            this.subscribers.splice(index, 1);
        }
    }

    generateInitialData() {
        const timestamp = new Date();
        
        this.currentData = {
            timestamp,
            productionLines: this.baselineData.productionLines.map(line => {
                return this.generateLineData(line, timestamp);
            }),
            totalMetrics: this.calculateTotalMetrics(),
            powerCosts: this.baselineData.powerCosts,
            anomalies: [],
            alerts: []
        };

        this.addToHistory(this.currentData);
        this.notifySubscribers(this.currentData);
    }

    generateLineData(baseline, timestamp) {
        const hour = timestamp.getHours();
        const isWeekend = [0, 6].includes(timestamp.getDay());
        const isPeakHour = hour >= 9 && hour <= 17 && !isWeekend;
        
        // Generate realistic variations
        const voltageVariation = this.generateVariation(0.02); // ±2%
        const temperatureVariation = this.generateVariation(0.1, 2); // ±10% + 2°C base
        const powerVariation = this.generateVariation(0.15); // ±15%
        const outputVariation = this.generateVariation(0.1); // ±10%
        
        // Apply time-based modifiers
        const timeModifier = this.getTimeModifier(hour, isWeekend);
        
        // Generate potential anomalies
        const hasAnomaly = Math.random() < this.anomalyProbability;
        const anomalyFactor = hasAnomaly ? this.generateAnomalyFactor() : 1;
        
        const voltage = baseline.baseVoltage * (1 + voltageVariation) * anomalyFactor.voltage;
        const temperature = baseline.baseTemperature + temperatureVariation + (isPeakHour ? 3 : 0);
        const power = baseline.basePower * timeModifier * (1 + powerVariation) * anomalyFactor.power;
        const output = baseline.baseOutput * timeModifier * (1 + outputVariation) * anomalyFactor.output;
        
        // Calculate efficiency
        const efficiency = Math.min(0.95, (output / baseline.baseOutput) / (power / baseline.basePower));
        
        // Determine status
        let status = baseline.status;
        if (hasAnomaly && anomalyFactor.severity > 1.5) {
            status = 'warning';
        } else if (hasAnomaly && anomalyFactor.severity > 2) {
            status = 'error';
        }
        
        return {
            id: baseline.id,
            name: baseline.name,
            timestamp,
            voltage: Math.round(voltage * 10) / 10,
            current: Math.round((power * 1000 / voltage) * 100) / 100, // Amperes
            power: Math.round(power * 100) / 100,
            temperature: Math.round(temperature * 10) / 10,
            output: Math.round(output),
            efficiency: Math.round(efficiency * 1000) / 10, // Percentage
            status,
            anomaly: hasAnomaly ? {
                type: this.getAnomalyType(anomalyFactor),
                severity: anomalyFactor.severity,
                description: this.getAnomalyDescription(anomalyFactor)
            } : null
        };
    }

    generateVariation(range, base = 0) {
        return base + (Math.random() - 0.5) * 2 * range;
    }

    getTimeModifier(hour, isWeekend) {
        if (isWeekend) {
            return 0.3; // Weekend operations at 30%
        }
        
        // Weekday production schedule
        if (hour >= 6 && hour <= 8) return 0.7; // Morning startup
        if (hour >= 9 && hour <= 11) return 1.0; // Peak morning
        if (hour >= 12 && hour <= 13) return 0.8; // Lunch break
        if (hour >= 14 && hour <= 16) return 1.0; // Peak afternoon
        if (hour >= 17 && hour <= 19) return 0.6; // Evening wind-down
        if (hour >= 20 && hour <= 22) return 0.4; // Night shift
        return 0.2; // Late night maintenance
    }

    generateAnomalyFactor() {
        const severity = 1 + Math.random() * 2; // 1-3x normal values
        const type = Math.random();
        
        if (type < 0.3) {
            // Power spike
            return {
                voltage: 1 + Math.random() * 0.1,
                power: severity,
                output: 1 - Math.random() * 0.3,
                temperature: 1 + Math.random() * 0.4,
                severity,
                type: 'power_spike'
            };
        } else if (type < 0.5) {
            // Temperature rise
            return {
                voltage: 1,
                power: 1 + Math.random() * 0.2,
                output: 1 - Math.random() * 0.2,
                temperature: severity,
                severity,
                type: 'temperature_high'
            };
        } else if (type < 0.7) {
            // Voltage fluctuation
            return {
                voltage: severity,
                power: 1 + Math.random() * 0.3,
                output: 1 - Math.random() * 0.1,
                temperature: 1 + Math.random() * 0.2,
                severity,
                type: 'voltage_fluctuation'
            };
        } else {
            // Efficiency drop
            return {
                voltage: 1 - Math.random() * 0.05,
                power: 1 + Math.random() * 0.4,
                output: 1 - Math.random() * 0.5,
                temperature: 1 + Math.random() * 0.3,
                severity,
                type: 'efficiency_drop'
            };
        }
    }

    getAnomalyType(factor) {
        return factor.type || 'unknown';
    }

    getAnomalyDescription(factor) {
        const descriptions = {
            power_spike: 'Unexpected power consumption increase detected',
            temperature_high: 'Equipment temperature above normal range',
            voltage_fluctuation: 'Voltage instability detected in power supply',
            efficiency_drop: 'Production efficiency below acceptable threshold'
        };
        return descriptions[factor.type] || 'Unknown anomaly detected';
    }

    calculateTotalMetrics() {
        if (!this.currentData.productionLines) return {};
        
        const lines = this.currentData.productionLines;
        const totalPower = lines.reduce((sum, line) => sum + line.power, 0);
        const totalOutput = lines.reduce((sum, line) => sum + line.output, 0);
        const avgEfficiency = lines.reduce((sum, line) => sum + line.efficiency, 0) / lines.length;
        const avgTemperature = lines.reduce((sum, line) => sum + line.temperature, 0) / lines.length;
        
        // Calculate costs
        const hour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        const isPeakHour = hour >= 9 && hour <= 17 && !isWeekend;
        
        const rate = isPeakHour ? 
            this.baselineData.powerCosts.peakRate : 
            this.baselineData.powerCosts.offPeakRate;
        
        const energyCost = totalPower * rate / 1000; // Cost per hour
        const dailyEnergyCost = energyCost * 24;
        
        return {
            totalPower: Math.round(totalPower * 100) / 100,
            totalOutput,
            averageEfficiency: Math.round(avgEfficiency * 10) / 10,
            averageTemperature: Math.round(avgTemperature * 10) / 10,
            currentEnergyCost: Math.round(energyCost),
            dailyEnergyCost: Math.round(dailyEnergyCost),
            isPeakHour,
            currentRate: rate
        };
    }

    scheduleNextUpdate() {
        if (!this.isRunning) return;
        
        this.updateTimer = setTimeout(() => {
            this.generateUpdate();
            this.scheduleNextUpdate();
        }, this.updateInterval);
    }

    generateUpdate() {
        const timestamp = new Date();
        
        this.currentData = {
            timestamp,
            productionLines: this.baselineData.productionLines.map(line => {
                return this.generateLineData(line, timestamp);
            }),
            totalMetrics: {},
            powerCosts: this.baselineData.powerCosts,
            anomalies: [],
            alerts: []
        };
        
        this.currentData.totalMetrics = this.calculateTotalMetrics();
        this.detectAnomalies();
        this.generateAlerts();
        
        this.addToHistory(this.currentData);
        this.notifySubscribers(this.currentData);
    }

    detectAnomalies() {
        this.currentData.anomalies = [];
        
        this.currentData.productionLines.forEach(line => {
            if (line.anomaly) {
                this.currentData.anomalies.push({
                    lineId: line.id,
                    lineName: line.name,
                    type: line.anomaly.type,
                    severity: line.anomaly.severity,
                    description: line.anomaly.description,
                    timestamp: line.timestamp,
                    metrics: {
                        voltage: line.voltage,
                        power: line.power,
                        temperature: line.temperature,
                        efficiency: line.efficiency
                    }
                });
            }
        });
    }

    generateAlerts() {
        this.currentData.alerts = [];
        
        // Check for critical conditions
        this.currentData.productionLines.forEach(line => {
            if (line.temperature > 60) {
                this.currentData.alerts.push({
                    id: `temp_${line.id}_${Date.now()}`,
                    type: 'critical',
                    title: `High Temperature Alert - ${line.name}`,
                    message: `Temperature has reached ${line.temperature}°C, exceeding safe operating limits`,
                    lineId: line.id,
                    timestamp: new Date(),
                    acknowledged: false
                });
            }
            
            if (line.efficiency < 60) {
                this.currentData.alerts.push({
                    id: `eff_${line.id}_${Date.now()}`,
                    type: 'warning',
                    title: `Low Efficiency Alert - ${line.name}`,
                    message: `Production efficiency has dropped to ${line.efficiency}%`,
                    lineId: line.id,
                    timestamp: new Date(),
                    acknowledged: false
                });
            }
            
            if (line.power > this.baselineData.productionLines.find(bl => bl.id === line.id).basePower * 1.5) {
                this.currentData.alerts.push({
                    id: `power_${line.id}_${Date.now()}`,
                    type: 'warning',
                    title: `Power Consumption Alert - ${line.name}`,
                    message: `Power consumption is ${Math.round((line.power / this.baselineData.productionLines.find(bl => bl.id === line.id).basePower - 1) * 100)}% above normal`,
                    lineId: line.id,
                    timestamp: new Date(),
                    acknowledged: false
                });
            }
        });
    }

    addToHistory(data) {
        this.dataHistory.push(JSON.parse(JSON.stringify(data)));
        
        // Maintain history size limit
        if (this.dataHistory.length > this.maxHistorySize) {
            this.dataHistory = this.dataHistory.slice(-this.maxHistorySize);
        }
    }

    notifySubscribers(data) {
        this.subscribers.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Error in subscriber callback:', error);
            }
        });
    }

    getCurrentData() {
        return this.currentData;
    }

    getHistoricalData(minutes = 60) {
        const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
        return this.dataHistory.filter(data => new Date(data.timestamp) >= cutoffTime);
    }

    // Utility methods for external consumption
    getProductionLineData(lineId) {
        if (!this.currentData.productionLines) return null;
        return this.currentData.productionLines.find(line => line.id === lineId);
    }

    getTotalPowerConsumption() {
        return this.currentData.totalMetrics?.totalPower || 0;
    }

    getTotalEnergyCost() {
        return this.currentData.totalMetrics?.currentEnergyCost || 0;
    }

    getEfficiencyRating() {
        return this.currentData.totalMetrics?.averageEfficiency || 0;
    }

    getActiveAlerts() {
        return this.currentData.alerts?.filter(alert => !alert.acknowledged) || [];
    }

    getAnomalies() {
        return this.currentData.anomalies || [];
    }
}

// Export for use in other modules
window.SensorDataGenerator = SensorDataGenerator;