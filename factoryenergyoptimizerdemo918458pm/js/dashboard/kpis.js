/**
 * KPI Management for Factory Energy Optimizer Dashboard
 * Handles KPI calculations, updates, and display formatting
 */

class KPIManager {
    constructor() {
        this.kpiElements = {};
        this.historicalData = [];
        this.targets = this.initializeTargets();
        this.formatters = this.initializeFormatters();
        this.animations = {};
        this.updateQueue = [];
        this.isInitialized = false;
    }

    initializeTargets() {
        return {
            powerConsumption: {
                target: 400, // kW
                warning: 450,
                critical: 500
            },
            energyCost: {
                target: 50000, // ¥ per day
                warning: 60000,
                critical: 70000
            },
            efficiency: {
                target: 85, // %
                warning: 75,
                critical: 65
            },
            productionOutput: {
                target: 420, // units per hour (combined)
                warning: 350,
                critical: 300
            },
            temperatureAverage: {
                target: 35, // °C
                warning: 45,
                critical: 55
            }
        };
    }

    initializeFormatters() {
        return {
            power: {
                format: (value) => this.formatNumber(value, 1),
                unit: 'kW',
                color: (value) => this.getThresholdColor('powerConsumption', value)
            },
            cost: {
                format: (value) => this.formatCurrency(value),
                unit: '¥',
                color: (value) => this.getThresholdColor('energyCost', value)
            },
            efficiency: {
                format: (value) => this.formatNumber(value, 1),
                unit: '%',
                color: (value) => this.getEfficiencyColor(value)
            },
            output: {
                format: (value) => this.formatNumber(value, 0),
                unit: 'units',
                color: (value) => this.getThresholdColor('productionOutput', value, true)
            },
            temperature: {
                format: (value) => this.formatNumber(value, 1),
                unit: '°C',
                color: (value) => this.getThresholdColor('temperatureAverage', value)
            },
            percentage: {
                format: (value) => this.formatNumber(value, 1),
                unit: '%',
                color: (value) => this.getPercentageColor(value)
            }
        };
    }

    initialize() {
        if (this.isInitialized) return;

        this.bindKPIElements();
        this.setupUpdateAnimations();
        this.isInitialized = true;

        console.log('KPI Manager initialized');
    }

    bindKPIElements() {
        // Bind main KPI elements
        this.kpiElements = {
            totalPowerConsumption: document.getElementById('totalPowerConsumption'),
            totalEnergyCost: document.getElementById('totalEnergyCost'),
            energyEfficiency: document.getElementById('energyEfficiency'),
            productionOutput: document.getElementById('productionOutput'),
            
            // Change indicators
            powerConsumptionChange: document.getElementById('powerConsumptionChange'),
            energyCostChange: document.getElementById('energyCostChange'),
            efficiencyChange: document.getElementById('efficiencyChange'),
            outputChange: document.getElementById('outputChange')
        };

        // Remove null elements
        Object.keys(this.kpiElements).forEach(key => {
            if (!this.kpiElements[key]) {
                delete this.kpiElements[key];
            }
        });
    }

    updateKPIs(sensorData) {
        if (!sensorData || !sensorData.totalMetrics) {
            console.warn('Invalid sensor data for KPI update');
            return;
        }

        const metrics = sensorData.totalMetrics;
        const timestamp = new Date(sensorData.timestamp);

        // Store historical data
        this.storeHistoricalData(metrics, timestamp);

        // Update primary KPIs
        this.updatePowerConsumption(metrics.totalPower || 0);
        this.updateEnergyCost(metrics.currentEnergyCost || 0);
        this.updateEnergyEfficiency(metrics.averageEfficiency || 0);
        this.updateProductionOutput(metrics.totalOutput || 0);

        // Update change indicators
        this.updateChangeIndicators(metrics);

        // Process update queue
        this.processUpdateQueue();
    }

    updatePowerConsumption(value) {
        this.updateKPIValue('totalPowerConsumption', value, 'power');
        this.updateKPIStatus('powerConsumption', value);
    }

    updateEnergyCost(value) {
        this.updateKPIValue('totalEnergyCost', value, 'cost');
        this.updateKPIStatus('energyCost', value);
    }

    updateEnergyEfficiency(value) {
        this.updateKPIValue('energyEfficiency', value, 'efficiency');
        this.updateKPIStatus('efficiency', value);
    }

    updateProductionOutput(value) {
        this.updateKPIValue('productionOutput', value, 'output');
        this.updateKPIStatus('productionOutput', value, true);
    }

    updateKPIValue(elementId, value, formatterType) {
        const element = this.kpiElements[elementId];
        if (!element) return;

        const formatter = this.formatters[formatterType];
        if (!formatter) return;

        const formattedValue = formatter.format(value);
        const color = formatter.color(value);

        // Animate value change
        this.animateValueChange(element, formattedValue, color);
    }

    updateChangeIndicators(currentMetrics) {
        const previousMetrics = this.getPreviousMetrics();
        if (!previousMetrics) return;

        // Calculate changes
        const changes = {
            power: this.calculateChange(currentMetrics.totalPower, previousMetrics.totalPower),
            cost: this.calculateChange(currentMetrics.currentEnergyCost, previousMetrics.currentEnergyCost),
            efficiency: this.calculateChange(currentMetrics.averageEfficiency, previousMetrics.averageEfficiency),
            output: this.calculateChange(currentMetrics.totalOutput, previousMetrics.totalOutput)
        };

        // Update change indicators
        this.updateChangeIndicator('powerConsumptionChange', changes.power);
        this.updateChangeIndicator('energyCostChange', changes.cost);
        this.updateChangeIndicator('efficiencyChange', changes.efficiency);
        this.updateChangeIndicator('outputChange', changes.output);
    }

    updateChangeIndicator(elementId, change) {
        const element = this.kpiElements[elementId];
        if (!element) return;

        const isPositive = change > 0;
        const isNegative = change < 0;
        const isNeutral = change === 0;

        // Format change value
        const formattedChange = this.formatPercentageChange(change);
        element.textContent = formattedChange;

        // Update classes
        element.className = 'change-indicator';
        if (isPositive) {
            // For cost and power, positive is bad; for efficiency and output, positive is good
            const isBadIncrease = elementId.includes('Cost') || elementId.includes('Power');
            element.classList.add(isBadIncrease ? 'negative' : 'positive');
        } else if (isNegative) {
            const isBadDecrease = elementId.includes('efficiency') || elementId.includes('output');
            element.classList.add(isBadDecrease ? 'negative' : 'positive');
        } else {
            element.classList.add('neutral');
        }
    }

    updateKPIStatus(kpiType, value, isHigherBetter = false) {
        const targets = this.targets[kpiType];
        if (!targets) return;

        let status = 'normal';
        
        if (isHigherBetter) {
            // Higher values are better (like efficiency, production output)
            if (value < targets.critical) status = 'critical';
            else if (value < targets.warning) status = 'warning';
            else if (value >= targets.target) status = 'excellent';
        } else {
            // Lower values are better (like power consumption, cost)
            if (value > targets.critical) status = 'critical';
            else if (value > targets.warning) status = 'warning';
            else if (value <= targets.target) status = 'excellent';
        }

        // Emit status change event
        this.emitKPIStatusChange(kpiType, status, value);
    }

    // Historical data management
    storeHistoricalData(metrics, timestamp) {
        this.historicalData.push({
            timestamp,
            ...metrics
        });

        // Keep only last 1440 entries (24 hours if updated every minute)
        if (this.historicalData.length > 1440) {
            this.historicalData = this.historicalData.slice(-1440);
        }
    }

    getPreviousMetrics(minutesAgo = 1) {
        if (this.historicalData.length < 2) return null;
        
        // Get metrics from specified minutes ago
        const targetIndex = Math.max(0, this.historicalData.length - minutesAgo - 1);
        return this.historicalData[targetIndex];
    }

    getYesterdayMetrics() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(new Date().getHours());
        
        // Find closest match to same time yesterday
        const closestMatch = this.historicalData.find(data => {
            const dataTime = new Date(data.timestamp);
            const timeDiff = Math.abs(dataTime.getTime() - yesterday.getTime());
            return timeDiff < 30 * 60 * 1000; // Within 30 minutes
        });
        
        return closestMatch || null;
    }

    // Calculation utilities
    calculateChange(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    calculateTrend(kpiType, periodMinutes = 60) {
        const recentData = this.historicalData.slice(-periodMinutes);
        if (recentData.length < 2) return 'stable';

        const values = recentData.map(d => this.getKPIValue(d, kpiType));
        const trend = this.calculateLinearTrend(values);

        if (Math.abs(trend) < 0.1) return 'stable';
        return trend > 0 ? 'increasing' : 'decreasing';
    }

    calculateLinearTrend(values) {
        const n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        values.forEach((y, x) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });

        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    getKPIValue(metrics, kpiType) {
        switch (kpiType) {
            case 'powerConsumption': return metrics.totalPower || 0;
            case 'energyCost': return metrics.currentEnergyCost || 0;
            case 'efficiency': return metrics.averageEfficiency || 0;
            case 'productionOutput': return metrics.totalOutput || 0;
            default: return 0;
        }
    }

    // Formatting utilities
    formatNumber(value, decimals = 0) {
        if (typeof value !== 'number' || isNaN(value)) return '--';
        return value.toLocaleString('ja-JP', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    formatCurrency(value) {
        if (typeof value !== 'number' || isNaN(value)) return '--';
        return value.toLocaleString('ja-JP', {
            style: 'currency',
            currency: 'JPY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).replace('￥', '');
    }

    formatPercentageChange(change) {
        if (typeof change !== 'number' || isNaN(change)) return '--';
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    }

    // Color coding utilities
    getThresholdColor(kpiType, value, isHigherBetter = false) {
        const targets = this.targets[kpiType];
        if (!targets) return 'var(--text-primary)';

        if (isHigherBetter) {
            if (value < targets.critical) return 'var(--error-color)';
            if (value < targets.warning) return 'var(--warning-color)';
            if (value >= targets.target) return 'var(--success-color)';
        } else {
            if (value > targets.critical) return 'var(--error-color)';
            if (value > targets.warning) return 'var(--warning-color)';
            if (value <= targets.target) return 'var(--success-color)';
        }

        return 'var(--text-primary)';
    }

    getEfficiencyColor(value) {
        if (value >= 90) return 'var(--success-color)';
        if (value >= 80) return 'var(--info-color)';
        if (value >= 70) return 'var(--warning-color)';
        return 'var(--error-color)';
    }

    getPercentageColor(value) {
        if (value > 0) return 'var(--success-color)';
        if (value < 0) return 'var(--error-color)';
        return 'var(--text-muted)';
    }

    // Animation utilities
    setupUpdateAnimations() {
        this.animations.duration = 800;
        this.animations.easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
    }

    animateValueChange(element, newValue, color) {
        if (!element) return;

        // Add animation class
        element.classList.add('updating');
        
        // Update color
        if (color) {
            element.style.color = color;
        }

        // Animate counter if numeric
        const currentValue = parseFloat(element.textContent.replace(/[^\d.-]/g, '')) || 0;
        const targetValue = parseFloat(newValue.replace(/[^\d.-]/g, '')) || 0;
        
        if (currentValue !== targetValue && !isNaN(targetValue)) {
            this.animateCounter(element, currentValue, targetValue, newValue);
        } else {
            element.textContent = newValue;
        }

        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('updating');
        }, this.animations.duration);
    }

    animateCounter(element, startValue, endValue, formattedEnd) {
        const startTime = performance.now();
        const duration = this.animations.duration;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easedProgress = this.easeInOutCubic(progress);
            
            // Calculate current value
            const currentValue = startValue + (endValue - startValue) * easedProgress;
            
            // Update display
            const formatter = this.getFormatterForElement(element);
            if (formatter) {
                element.textContent = formatter.format(currentValue);
            } else {
                element.textContent = this.formatNumber(currentValue, 1);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = formattedEnd;
            }
        };

        requestAnimationFrame(animate);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    getFormatterForElement(element) {
        const id = element.id;
        if (id.includes('power') || id.includes('Power')) return this.formatters.power;
        if (id.includes('cost') || id.includes('Cost')) return this.formatters.cost;
        if (id.includes('efficiency') || id.includes('Efficiency')) return this.formatters.efficiency;
        if (id.includes('output') || id.includes('Output')) return this.formatters.output;
        return null;
    }

    // Queue management for smooth updates
    processUpdateQueue() {
        if (this.updateQueue.length === 0) return;

        const update = this.updateQueue.shift();
        setTimeout(() => {
            if (update.callback) {
                update.callback();
            }
            this.processUpdateQueue();
        }, update.delay || 100);
    }

    queueUpdate(callback, delay = 100) {
        this.updateQueue.push({ callback, delay });
    }

    // Event emission
    emitKPIStatusChange(kpiType, status, value) {
        window.dispatchEvent(new CustomEvent('kpiStatusChange', {
            detail: {
                kpiType,
                status,
                value,
                timestamp: new Date()
            }
        }));
    }

    // Public API methods
    getKPISummary() {
        const latest = this.historicalData[this.historicalData.length - 1];
        if (!latest) return null;

        return {
            powerConsumption: {
                value: latest.totalPower || 0,
                status: this.getKPIStatus('powerConsumption', latest.totalPower),
                trend: this.calculateTrend('powerConsumption')
            },
            energyCost: {
                value: latest.currentEnergyCost || 0,
                status: this.getKPIStatus('energyCost', latest.currentEnergyCost),
                trend: this.calculateTrend('energyCost')
            },
            efficiency: {
                value: latest.averageEfficiency || 0,
                status: this.getKPIStatus('efficiency', latest.averageEfficiency),
                trend: this.calculateTrend('efficiency')
            },
            productionOutput: {
                value: latest.totalOutput || 0,
                status: this.getKPIStatus('productionOutput', latest.totalOutput),
                trend: this.calculateTrend('productionOutput')
            }
        };
    }

    getKPIStatus(kpiType, value) {
        const targets = this.targets[kpiType];
        if (!targets) return 'unknown';

        const isHigherBetter = kpiType === 'efficiency' || kpiType === 'productionOutput';

        if (isHigherBetter) {
            if (value < targets.critical) return 'critical';
            if (value < targets.warning) return 'warning';
            if (value >= targets.target) return 'excellent';
        } else {
            if (value > targets.critical) return 'critical';
            if (value > targets.warning) return 'warning';
            if (value <= targets.target) return 'excellent';
        }

        return 'normal';
    }

    exportKPIData(format = 'json') {
        const data = {
            metadata: {
                exportTime: new Date().toISOString(),
                dataPoints: this.historicalData.length,
                timeRange: {
                    start: this.historicalData[0]?.timestamp,
                    end: this.historicalData[this.historicalData.length - 1]?.timestamp
                }
            },
            targets: this.targets,
            data: this.historicalData
        };

        if (format === 'csv') {
            return this.convertToCSV(data);
        }

        return JSON.stringify(data, null, 2);
    }

    convertToCSV(data) {
        const headers = ['timestamp', 'totalPower', 'currentEnergyCost', 'averageEfficiency', 'totalOutput'];
        let csv = headers.join(',') + '\n';

        data.data.forEach(row => {
            const values = headers.map(header => row[header] || '');
            csv += values.join(',') + '\n';
        });

        return csv;
    }
}

// Export for use in other modules
window.KPIManager = KPIManager;