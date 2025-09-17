/**
 * Real-time Monitoring System for Pepper Acid Processing
 * Handles data collection, visualization, and alerting
 */

class MonitoringSystem {
    constructor() {
        this.sensorData = new DataModels.SensorData();
        this.charts = {};
        this.isRunning = false;
        this.updateInterval = 2000; // 2 seconds
        this.monitoringInterval = null;
        this.alertThresholds = {
            temperature: { min: 20, max: 85, critical: 100 },
            ph: { min: 3.0, max: 6.0, critical_low: 2.0, critical_high: 8.0 },
            flowRate: { min: 0, max: 10, critical: 15 },
            moisture: { min: 5, max: 95 }
        };
        this.subscribers = [];
        this.alertCallbacks = [];
    }

    /**
     * Initialize monitoring system
     */
    async initialize() {
        console.log('Initializing monitoring system...');
        
        // Initialize charts
        this.initializeCharts();
        
        // Set up real-time data simulation
        this.setupDataSimulation();
        
        // Set up alert monitoring
        this.setupAlertMonitoring();
        
        console.log('Monitoring system initialized');
    }

    /**
     * Initialize all charts
     */
    initializeCharts() {
        // pH trend chart
        this.initializeTrendChart('phChart', 'pH Level', '#3b82f6');
        
        // Temperature trend chart
        this.initializeTrendChart('tempChart', 'Temperature (°C)', '#ef4444');
        
        // Flow rate trend chart
        this.initializeTrendChart('flowChart', 'Flow Rate (L/min)', '#10b981');
        
        // Moisture trend chart
        this.initializeTrendChart('moistureChart', 'Moisture (%)', '#f59e0b');
        
        // Main process overview chart
        this.initializeMainChart();
    }

    /**
     * Initialize a trend chart
     */
    initializeTrendChart(canvasId, label, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        display: false,
                        beginAtZero: false
                    }
                },
                elements: {
                    line: {
                        borderWidth: 2
                    }
                },
                animation: {
                    duration: 500
                }
            }
        });
    }

    /**
     * Initialize main process chart
     */
    initializeMainChart() {
        const canvas = document.getElementById('mainChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts['mainChart'] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'pH Level',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: '#3b82f620',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: '#ef444420',
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Flow Rate (L/min)',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: '#10b98120',
                        yAxisID: 'y2'
                    },
                    {
                        label: 'Moisture (%)',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: '#f59e0b20',
                        yAxisID: 'y3'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'pH Level'
                        },
                        min: 0,
                        max: 14
                    },
                    y1: {
                        type: 'linear',
                        display: false,
                        position: 'right',
                        min: 0,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        position: 'right',
                        min: 0,
                        max: 15,
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    y3: {
                        type: 'linear',
                        display: false,
                        position: 'right',
                        min: 0,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                animation: {
                    duration: 750
                }
            }
        });
    }

    /**
     * Start monitoring
     */
    startMonitoring() {
        if (this.isRunning) return;

        console.log('Starting real-time monitoring...');
        this.isRunning = true;

        this.monitoringInterval = setInterval(() => {
            this.updateSensorReadings();
            this.updateCharts();
            this.checkAlerts();
            this.notifySubscribers();
        }, this.updateInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isRunning) return;

        console.log('Stopping monitoring...');
        this.isRunning = false;

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    /**
     * Update sensor readings (simulation)
     */
    updateSensorReadings() {
        const now = new Date();
        
        // Simulate sensor readings with realistic values and variations
        const baseValues = this.getBaseValues();
        
        // Add some random variation to simulate real sensor data
        const ph = this.addVariation(baseValues.ph, 0.1);
        const temperature = this.addVariation(baseValues.temperature, 2);
        const flowRate = this.addVariation(baseValues.flowRate, 0.2);
        const moisture = this.addVariation(baseValues.moisture, 1);
        
        // Add data points to sensor data
        this.sensorData.addDataPoint('ph', ph, now);
        this.sensorData.addDataPoint('temperature', temperature, now);
        this.sensorData.addDataPoint('flowRate', flowRate, now);
        this.sensorData.addDataPoint('moisture', moisture, now);

        // Update live display values
        this.updateLiveValues(ph, temperature, flowRate, moisture);
    }

    /**
     * Get base values for simulation
     */
    getBaseValues() {
        // These would come from actual sensors in a real system
        return {
            ph: 4.2 + Math.sin(Date.now() / 10000) * 0.3,
            temperature: 72 + Math.sin(Date.now() / 15000) * 5,
            flowRate: 2.5 + Math.sin(Date.now() / 8000) * 0.5,
            moisture: 45 + Math.sin(Date.now() / 20000) * 10
        };
    }

    /**
     * Add random variation to simulate sensor noise
     */
    addVariation(value, range) {
        const variation = (Math.random() - 0.5) * 2 * range;
        return Math.max(0, value + variation);
    }

    /**
     * Update live display values
     */
    updateLiveValues(ph, temperature, flowRate, moisture) {
        const elements = {
            'livePH': ph.toFixed(1),
            'liveTemp': temperature.toFixed(1) + '°C',
            'liveFlow': flowRate.toFixed(1) + ' L/min',
            'liveMoisture': moisture.toFixed(0) + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                element.parentElement.classList.add('updating');
                setTimeout(() => {
                    element.parentElement.classList.remove('updating');
                }, 500);
            }
        });
    }

    /**
     * Update all charts with new data
     */
    updateCharts() {
        this.updateTrendChart('phChart', 'ph');
        this.updateTrendChart('tempChart', 'temperature');
        this.updateTrendChart('flowChart', 'flowRate');
        this.updateTrendChart('moistureChart', 'moisture');
        this.updateMainChart();
    }

    /**
     * Update a trend chart
     */
    updateTrendChart(chartId, dataType) {
        const chart = this.charts[chartId];
        if (!chart) return;

        const data = this.sensorData.getDataSeries(dataType, 30); // Last 30 minutes
        const labels = data.map(point => point.timestamp.toLocaleTimeString());
        const values = data.map(point => point.value);

        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update('none');
    }

    /**
     * Update main process chart
     */
    updateMainChart() {
        const chart = this.charts['mainChart'];
        if (!chart) return;

        const phData = this.sensorData.getDataSeries('ph', 60);
        const tempData = this.sensorData.getDataSeries('temperature', 60);
        const flowData = this.sensorData.getDataSeries('flowRate', 60);
        const moistureData = this.sensorData.getDataSeries('moisture', 60);

        if (phData.length === 0) return;

        const labels = phData.map(point => point.timestamp.toLocaleTimeString());

        chart.data.labels = labels;
        chart.data.datasets[0].data = phData.map(point => point.value);
        chart.data.datasets[1].data = tempData.map(point => point.value);
        chart.data.datasets[2].data = flowData.map(point => point.value);
        chart.data.datasets[3].data = moistureData.map(point => point.value);
        
        chart.update('none');
    }

    /**
     * Check for alerts
     */
    checkAlerts() {
        const currentValues = {
            temperature: this.sensorData.getLatestValue('temperature'),
            ph: this.sensorData.getLatestValue('ph'),
            flowRate: this.sensorData.getLatestValue('flowRate'),
            moisture: this.sensorData.getLatestValue('moisture')
        };

        Object.entries(currentValues).forEach(([parameter, value]) => {
            if (value === null) return;

            const threshold = this.alertThresholds[parameter];
            if (!threshold) return;

            const alerts = this.evaluateThreshold(parameter, value, threshold);
            alerts.forEach(alert => this.triggerAlert(alert));
        });
    }

    /**
     * Evaluate threshold violations
     */
    evaluateThreshold(parameter, value, threshold) {
        const alerts = [];
        const now = new Date();

        if (parameter === 'ph') {
            if (value < threshold.critical_low || value > threshold.critical_high) {
                alerts.push({
                    type: 'critical',
                    parameter: parameter,
                    value: value,
                    message: `Critical pH level: ${value.toFixed(2)}`,
                    timestamp: now
                });
            } else if (value < threshold.min || value > threshold.max) {
                alerts.push({
                    type: 'warning',
                    parameter: parameter,
                    value: value,
                    message: `pH level outside safe range: ${value.toFixed(2)}`,
                    timestamp: now
                });
            }
        } else {
            if (threshold.critical && value > threshold.critical) {
                alerts.push({
                    type: 'critical',
                    parameter: parameter,
                    value: value,
                    message: `Critical ${parameter} level: ${value.toFixed(1)}`,
                    timestamp: now
                });
            } else if (value > threshold.max) {
                alerts.push({
                    type: 'warning',
                    parameter: parameter,
                    value: value,
                    message: `${parameter} above safe limit: ${value.toFixed(1)}`,
                    timestamp: now
                });
            } else if (value < threshold.min) {
                alerts.push({
                    type: 'info',
                    parameter: parameter,
                    value: value,
                    message: `${parameter} below minimum: ${value.toFixed(1)}`,
                    timestamp: now
                });
            }
        }

        return alerts;
    }

    /**
     * Trigger alert
     */
    triggerAlert(alert) {
        // Add to alerts list in UI
        this.addAlertToUI(alert);

        // Notify alert callbacks
        this.alertCallbacks.forEach(callback => {
            try {
                callback(alert);
            } catch (error) {
                console.error('Alert callback failed:', error);
            }
        });

        // Log alert
        console.warn('ALERT:', alert);
    }

    /**
     * Add alert to UI
     */
    addAlertToUI(alert) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;

        const alertElement = document.createElement('div');
        alertElement.className = `alert ${alert.type}`;
        alertElement.innerHTML = `
            <span class="alert-time">${alert.timestamp.toLocaleTimeString()}</span>
            <span class="alert-message">${alert.message}</span>
        `;

        // Add to top of list
        alertsList.insertBefore(alertElement, alertsList.firstChild);

        // Remove old alerts (keep only 10)
        while (alertsList.children.length > 10) {
            alertsList.removeChild(alertsList.lastChild);
        }

        // Auto-remove info alerts after 10 seconds
        if (alert.type === 'info') {
            setTimeout(() => {
                if (alertElement.parentNode) {
                    alertElement.parentNode.removeChild(alertElement);
                }
            }, 10000);
        }
    }

    /**
     * Setup data simulation for realistic values
     */
    setupDataSimulation() {
        // Initialize with some historical data
        const now = new Date();
        for (let i = 100; i >= 0; i--) {
            const timestamp = new Date(now.getTime() - i * 30000); // 30 seconds intervals
            const baseValues = this.getBaseValues();
            
            this.sensorData.addDataPoint('ph', this.addVariation(baseValues.ph, 0.1), timestamp);
            this.sensorData.addDataPoint('temperature', this.addVariation(baseValues.temperature, 2), timestamp);
            this.sensorData.addDataPoint('flowRate', this.addVariation(baseValues.flowRate, 0.2), timestamp);
            this.sensorData.addDataPoint('moisture', this.addVariation(baseValues.moisture, 1), timestamp);
        }
    }

    /**
     * Setup alert monitoring
     */
    setupAlertMonitoring() {
        this.onAlert((alert) => {
            // Update safety status indicators
            this.updateSafetyStatus(alert.parameter, alert.type);
        });
    }

    /**
     * Update safety status indicators
     */
    updateSafetyStatus(parameter, alertType) {
        // This would update the safety status display in the UI
        console.log(`Safety status update: ${parameter} - ${alertType}`);
    }

    /**
     * Get current sensor statistics
     */
    getSensorStatistics(parameter, minutes = 60) {
        return this.sensorData.getStatistics(parameter, minutes);
    }

    /**
     * Get trend information
     */
    getTrend(parameter, points = 10) {
        return this.sensorData.calculateTrend(parameter, points);
    }

    /**
     * Export data for reporting
     */
    exportData(parameters, startTime, endTime) {
        const data = {};
        
        parameters.forEach(param => {
            const series = this.sensorData.getDataSeries(param);
            data[param] = series.filter(point => 
                point.timestamp >= startTime && point.timestamp <= endTime
            );
        });

        return data;
    }

    /**
     * Subscribe to monitoring updates
     */
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            const index = this.subscribers.indexOf(callback);
            if (index > -1) {
                this.subscribers.splice(index, 1);
            }
        };
    }

    /**
     * Subscribe to alerts
     */
    onAlert(callback) {
        this.alertCallbacks.push(callback);
        return () => {
            const index = this.alertCallbacks.indexOf(callback);
            if (index > -1) {
                this.alertCallbacks.splice(index, 1);
            }
        };
    }

    /**
     * Notify subscribers of updates
     */
    notifySubscribers() {
        const data = {
            timestamp: new Date(),
            values: {
                ph: this.sensorData.getLatestValue('ph'),
                temperature: this.sensorData.getLatestValue('temperature'),
                flowRate: this.sensorData.getLatestValue('flowRate'),
                moisture: this.sensorData.getLatestValue('moisture')
            },
            trends: {
                ph: this.getTrend('ph'),
                temperature: this.getTrend('temperature'),
                flowRate: this.getTrend('flowRate'),
                moisture: this.getTrend('moisture')
            }
        };

        this.subscribers.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('Subscriber callback failed:', error);
            }
        });
    }

    /**
     * Update monitoring interval
     */
    setUpdateInterval(milliseconds) {
        this.updateInterval = milliseconds;
        
        if (this.isRunning) {
            this.stopMonitoring();
            this.startMonitoring();
        }
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            isRunning: this.isRunning,
            updateInterval: this.updateInterval,
            dataPoints: {
                ph: this.sensorData.ph.length,
                temperature: this.sensorData.temperature.length,
                flowRate: this.sensorData.flowRate.length,
                moisture: this.sensorData.moisture.length
            },
            subscribers: this.subscribers.length,
            alertCallbacks: this.alertCallbacks.length
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonitoringSystem;
} else {
    window.MonitoringSystem = MonitoringSystem;
}