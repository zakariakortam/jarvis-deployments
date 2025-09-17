/**
 * Data Models for Pepper Acid Optimization System
 * Defines all data structures and validation rules
 */

class PepperProcessParameters {
    constructor(data = {}) {
        this.pepperType = data.pepperType || '';
        this.initialMoisture = data.initialMoisture || 0;
        this.targetMoisture = data.targetMoisture || 0;
        this.batchSize = data.batchSize || 0;
        this.temperature = data.temperature || 0;
        this.currentPH = data.currentPH || 0;
        this.targetPH = data.targetPH || 0;
        this.acidType = data.acidType || '';
        this.timestamp = data.timestamp || new Date();
        
        // Derived properties
        this.moistureReduction = this.initialMoisture - this.targetMoisture;
        this.phAdjustment = Math.abs(this.currentPH - this.targetPH);
    }

    validate() {
        const errors = [];
        
        if (!this.pepperType) {
            errors.push('Pepper type is required');
        }
        
        if (this.initialMoisture < 0 || this.initialMoisture > 100) {
            errors.push('Initial moisture must be between 0% and 100%');
        }
        
        if (this.targetMoisture < 0 || this.targetMoisture > 100) {
            errors.push('Target moisture must be between 0% and 100%');
        }
        
        if (this.initialMoisture <= this.targetMoisture) {
            errors.push('Initial moisture must be greater than target moisture');
        }
        
        if (this.batchSize <= 0 || this.batchSize > 10000) {
            errors.push('Batch size must be between 1kg and 10,000kg');
        }
        
        if (this.temperature < 20 || this.temperature > 100) {
            errors.push('Temperature must be between 20°C and 100°C');
        }
        
        if (this.currentPH < 0 || this.currentPH > 14) {
            errors.push('Current pH must be between 0 and 14');
        }
        
        if (this.targetPH < 0 || this.targetPH > 14) {
            errors.push('Target pH must be between 0 and 14');
        }
        
        if (!this.acidType) {
            errors.push('Acid type is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    toJSON() {
        return {
            pepperType: this.pepperType,
            initialMoisture: this.initialMoisture,
            targetMoisture: this.targetMoisture,
            batchSize: this.batchSize,
            temperature: this.temperature,
            currentPH: this.currentPH,
            targetPH: this.targetPH,
            acidType: this.acidType,
            timestamp: this.timestamp.toISOString(),
            moistureReduction: this.moistureReduction,
            phAdjustment: this.phAdjustment
        };
    }
}

class AcidProperties {
    constructor(acidType) {
        this.type = acidType;
        this.properties = this.getAcidProperties(acidType);
    }

    getAcidProperties(acidType) {
        const properties = {
            citric: {
                name: 'Citric Acid',
                molarity: 0.1,
                pkaValues: [3.13, 4.76, 6.40],
                maxConcentration: 60,
                safetyFactor: 0.85,
                costPerLiter: 2.5,
                effectivenessRating: 0.9,
                temperatureStability: 0.95,
                foodSafety: true
            },
            acetic: {
                name: 'Acetic Acid',
                molarity: 0.1,
                pkaValues: [4.76],
                maxConcentration: 30,
                safetyFactor: 0.8,
                costPerLiter: 1.8,
                effectivenessRating: 0.85,
                temperatureStability: 0.9,
                foodSafety: true
            },
            lactic: {
                name: 'Lactic Acid',
                molarity: 0.1,
                pkaValues: [3.86],
                maxConcentration: 50,
                safetyFactor: 0.9,
                costPerLiter: 3.2,
                effectivenessRating: 0.88,
                temperatureStability: 0.85,
                foodSafety: true
            },
            phosphoric: {
                name: 'Phosphoric Acid',
                molarity: 0.1,
                pkaValues: [2.15, 7.09, 12.32],
                maxConcentration: 40,
                safetyFactor: 0.7,
                costPerLiter: 2.1,
                effectivenessRating: 0.92,
                temperatureStability: 0.98,
                foodSafety: true
            }
        };
        
        return properties[acidType] || null;
    }

    calculateRequiredConcentration(currentPH, targetPH, volume) {
        if (!this.properties) return 0;
        
        const phDifference = currentPH - targetPH;
        const baseConcentration = Math.abs(phDifference) * 5;
        const adjustedConcentration = baseConcentration * this.properties.effectivenessRating;
        
        return Math.min(adjustedConcentration, this.properties.maxConcentration);
    }

    calculateFlowRate(batchSize, processTime) {
        if (!this.properties) return 0;
        
        const baseFlowRate = batchSize / processTime;
        return baseFlowRate * 0.1; // 10% acid solution flow rate
    }
}

class ProcessState {
    constructor() {
        this.status = 'idle';
        this.currentParameters = null;
        this.optimizationResults = null;
        this.safetyStatus = {
            temperature: { value: 0, status: 'safe', limit: 85 },
            ph: { value: 7, status: 'safe', minLimit: 3.0, maxLimit: 6.0 },
            pressure: { value: 0, status: 'safe', limit: 2.0 },
            flowRate: { value: 0, status: 'safe', limit: 10.0 },
            acidConcentration: { value: 0, status: 'safe', limit: 50 }
        };
        this.processHistory = [];
        this.alerts = [];
        this.performance = {
            efficiency: 0,
            qualityScore: 0,
            batchesProcessed: 0,
            averageProcessTime: 0
        };
    }

    updateSafetyStatus(parameter, value) {
        if (!this.safetyStatus[parameter]) return;
        
        this.safetyStatus[parameter].value = value;
        
        switch (parameter) {
            case 'temperature':
                this.safetyStatus[parameter].status = 
                    value > this.safetyStatus[parameter].limit ? 'danger' : 'safe';
                break;
            case 'ph':
                const phSafe = value >= this.safetyStatus[parameter].minLimit && 
                              value <= this.safetyStatus[parameter].maxLimit;
                this.safetyStatus[parameter].status = phSafe ? 'safe' : 'danger';
                break;
            case 'pressure':
            case 'flowRate':
            case 'acidConcentration':
                this.safetyStatus[parameter].status = 
                    value > this.safetyStatus[parameter].limit ? 'danger' : 'safe';
                break;
        }
        
        if (this.safetyStatus[parameter].status === 'danger') {
            this.addAlert('error', `${parameter} exceeded safe limits: ${value}`);
        }
    }

    addAlert(type, message) {
        const alert = {
            id: Date.now(),
            type: type,
            message: message,
            timestamp: new Date(),
            acknowledged: false
        };
        
        this.alerts.unshift(alert);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }
    }

    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
        }
    }

    getActiveAlerts() {
        return this.alerts.filter(alert => !alert.acknowledged);
    }

    updatePerformance(efficiency, qualityScore, processTime) {
        this.performance.efficiency = efficiency;
        this.performance.qualityScore = qualityScore;
        this.performance.batchesProcessed++;
        
        // Calculate running average of process time
        if (this.performance.averageProcessTime === 0) {
            this.performance.averageProcessTime = processTime;
        } else {
            this.performance.averageProcessTime = 
                (this.performance.averageProcessTime + processTime) / 2;
        }
    }

    addProcessRecord(parameters, results) {
        const record = {
            id: Date.now(),
            timestamp: new Date(),
            parameters: parameters.toJSON(),
            results: results,
            status: this.status
        };
        
        this.processHistory.unshift(record);
        
        // Keep only last 100 records
        if (this.processHistory.length > 100) {
            this.processHistory = this.processHistory.slice(0, 100);
        }
    }
}

class OptimizationResult {
    constructor(data = {}) {
        this.optimalConcentration = data.optimalConcentration || 0;
        this.optimalFlowRate = data.optimalFlowRate || 0;
        this.estimatedTime = data.estimatedTime || 0;
        this.qualityScore = data.qualityScore || 0;
        this.efficiency = data.efficiency || 0;
        this.safetyMargin = data.safetyMargin || 0;
        this.cost = data.cost || 0;
        this.strategy = data.strategy || '';
        this.constraints = data.constraints || [];
        this.timestamp = data.timestamp || new Date();
        this.confidence = data.confidence || 0;
    }

    calculateOverallScore() {
        const weights = {
            quality: 0.3,
            efficiency: 0.25,
            safety: 0.25,
            cost: 0.2
        };
        
        const normalizedCost = Math.max(0, 100 - this.cost);
        
        return (
            this.qualityScore * weights.quality +
            this.efficiency * weights.efficiency +
            this.safetyMargin * weights.safety +
            normalizedCost * weights.cost
        );
    }

    isValid() {
        return (
            this.optimalConcentration > 0 &&
            this.optimalFlowRate > 0 &&
            this.estimatedTime > 0 &&
            this.qualityScore >= 0 &&
            this.efficiency >= 0 &&
            this.safetyMargin >= 0
        );
    }

    toJSON() {
        return {
            optimalConcentration: this.optimalConcentration,
            optimalFlowRate: this.optimalFlowRate,
            estimatedTime: this.estimatedTime,
            qualityScore: this.qualityScore,
            efficiency: this.efficiency,
            safetyMargin: this.safetyMargin,
            cost: this.cost,
            strategy: this.strategy,
            constraints: this.constraints,
            timestamp: this.timestamp.toISOString(),
            confidence: this.confidence,
            overallScore: this.calculateOverallScore()
        };
    }
}

class SensorData {
    constructor() {
        this.temperature = [];
        this.ph = [];
        this.flowRate = [];
        this.moisture = [];
        this.pressure = [];
        this.acidLevel = [];
        this.maxDataPoints = 100;
    }

    addDataPoint(type, value, timestamp = new Date()) {
        if (!this[type]) return;
        
        const dataPoint = {
            value: value,
            timestamp: timestamp
        };
        
        this[type].push(dataPoint);
        
        // Keep only recent data points
        if (this[type].length > this.maxDataPoints) {
            this[type] = this[type].slice(-this.maxDataPoints);
        }
    }

    getLatestValue(type) {
        if (!this[type] || this[type].length === 0) return null;
        return this[type][this[type].length - 1].value;
    }

    getDataSeries(type, minutes = 60) {
        if (!this[type]) return [];
        
        const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
        return this[type].filter(point => point.timestamp >= cutoffTime);
    }

    calculateTrend(type, points = 10) {
        if (!this[type] || this[type].length < 2) return 'stable';
        
        const recentPoints = this[type].slice(-points);
        if (recentPoints.length < 2) return 'stable';
        
        const first = recentPoints[0].value;
        const last = recentPoints[recentPoints.length - 1].value;
        const change = ((last - first) / first) * 100;
        
        if (Math.abs(change) < 2) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }

    getStatistics(type, minutes = 60) {
        const data = this.getDataSeries(type, minutes);
        if (data.length === 0) return null;
        
        const values = data.map(point => point.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        
        return {
            average: avg,
            minimum: min,
            maximum: max,
            standardDeviation: stdDev,
            trend: this.calculateTrend(type),
            dataPoints: data.length
        };
    }
}

// Export classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PepperProcessParameters,
        AcidProperties,
        ProcessState,
        OptimizationResult,
        SensorData
    };
} else {
    // Browser environment
    window.DataModels = {
        PepperProcessParameters,
        AcidProperties,
        ProcessState,
        OptimizationResult,
        SensorData
    };
}