/**
 * Chart Management for Factory Energy Optimizer Dashboard
 * Handles all chart creation, updates, and interactions
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = this.initializeChartConfigs();
        this.updateIntervals = {};
        this.isInitialized = false;
    }

    initializeChartConfigs() {
        return {
            powerChart: {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: 'white',
                            bodyColor: 'white',
                            borderColor: '#0066cc',
                            borderWidth: 1
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'minute',
                                displayFormats: {
                                    minute: 'HH:mm',
                                    hour: 'HH:mm'
                                }
                            },
                            title: {
                                display: true,
                                text: 'Time'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Power (kW)'
                            },
                            beginAtZero: true
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            },
            productionChart: {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            titleColor: 'white',
                            bodyColor: 'white'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Production Lines'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Output (units/hour)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            },
            efficiencyChart: {
                type: 'doughnut',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: ${context.parsed}%`;
                                }
                            }
                        }
                    }
                }
            },
            temperatureChart: {
                type: 'line',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'minute',
                                displayFormats: {
                                    minute: 'HH:mm'
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            },
                            min: 15,
                            max: 60
                        }
                    }
                }
            },
            costAnalysisChart: {
                type: 'bar',
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Cost (¥)'
                            }
                        }
                    }
                }
            }
        };
    }

    initialize() {
        if (this.isInitialized) return;

        this.createPowerChart();
        this.createProductionChart();
        this.setupChartEventListeners();
        this.isInitialized = true;

        console.log('Chart Manager initialized');
    }

    createPowerChart() {
        const canvas = document.getElementById('powerChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.powerChart = new Chart(ctx, {
            type: this.chartConfigs.powerChart.type,
            data: {
                datasets: [
                    {
                        label: 'Total Power',
                        data: [],
                        borderColor: '#0066cc',
                        backgroundColor: 'rgba(0,102,204,0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Line 1',
                        data: [],
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76,175,80,0.1)',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Line 2',
                        data: [],
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255,152,0,0.1)',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Line 3',
                        data: [],
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244,67,54,0.1)',
                        borderWidth: 1,
                        fill: false
                    }
                ]
            },
            options: this.chartConfigs.powerChart.options
        });
    }

    createProductionChart() {
        const canvas = document.getElementById('productionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.productionChart = new Chart(ctx, {
            type: this.chartConfigs.productionChart.type,
            data: {
                labels: ['Line 1', 'Line 2', 'Line 3'],
                datasets: [
                    {
                        label: 'Current Output',
                        data: [0, 0, 0],
                        backgroundColor: ['#0066cc', '#4caf50', '#ff9800'],
                        borderColor: ['#004499', '#388e3c', '#f57c00'],
                        borderWidth: 1
                    },
                    {
                        label: 'Target Output',
                        data: [100, 120, 200],
                        backgroundColor: ['rgba(0,102,204,0.3)', 'rgba(76,175,80,0.3)', 'rgba(255,152,0,0.3)'],
                        borderColor: ['#0066cc', '#4caf50', '#ff9800'],
                        borderWidth: 2,
                        type: 'line',
                        fill: false
                    }
                ]
            },
            options: this.chartConfigs.productionChart.options
        });
    }

    createEfficiencyChart(containerId) {
        const canvas = document.getElementById(containerId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.efficiencyChart = new Chart(ctx, {
            type: this.chartConfigs.efficiencyChart.type,
            data: {
                labels: ['Line 1', 'Line 2', 'Line 3'],
                datasets: [{
                    data: [85, 82, 88],
                    backgroundColor: ['#0066cc', '#4caf50', '#ff9800'],
                    borderColor: ['#004499', '#388e3c', '#f57c00'],
                    borderWidth: 2
                }]
            },
            options: this.chartConfigs.efficiencyChart.options
        });
    }

    createTemperatureChart(containerId) {
        const canvas = document.getElementById(containerId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.temperatureChart = new Chart(ctx, {
            type: this.chartConfigs.temperatureChart.type,
            data: {
                datasets: [
                    {
                        label: 'Line 1 Temperature',
                        data: [],
                        borderColor: '#0066cc',
                        backgroundColor: 'rgba(0,102,204,0.1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Line 2 Temperature',
                        data: [],
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76,175,80,0.1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Line 3 Temperature',
                        data: [],
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255,152,0,0.1)',
                        borderWidth: 2
                    }
                ]
            },
            options: this.chartConfigs.temperatureChart.options
        });
    }

    createCostAnalysisChart(containerId) {
        const canvas = document.getElementById(containerId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        this.charts.costAnalysisChart = new Chart(ctx, {
            type: this.chartConfigs.costAnalysisChart.type,
            data: {
                labels: ['Energy Cost', 'Demand Charges', 'Maintenance', 'Total'],
                datasets: [
                    {
                        label: 'Current Month',
                        data: [0, 0, 0, 0],
                        backgroundColor: '#0066cc',
                        borderColor: '#004499',
                        borderWidth: 1
                    },
                    {
                        label: 'Previous Month',
                        data: [0, 0, 0, 0],
                        backgroundColor: '#4caf50',
                        borderColor: '#388e3c',
                        borderWidth: 1
                    }
                ]
            },
            options: this.chartConfigs.costAnalysisChart.options
        });
    }

    updatePowerChart(sensorData) {
        const chart = this.charts.powerChart;
        if (!chart || !sensorData.productionLines) return;

        const timestamp = new Date(sensorData.timestamp);
        const totalPower = sensorData.totalMetrics.totalPower || 0;

        // Update total power dataset
        this.addDataPoint(chart, 0, { x: timestamp, y: totalPower });

        // Update individual line datasets
        sensorData.productionLines.forEach((line, index) => {
            if (index + 1 < chart.data.datasets.length) {
                this.addDataPoint(chart, index + 1, { x: timestamp, y: line.power });
            }
        });

        // Keep only last 50 data points
        chart.data.datasets.forEach(dataset => {
            if (dataset.data.length > 50) {
                dataset.data = dataset.data.slice(-50);
            }
        });

        chart.update('none'); // Update without animation for real-time feel
    }

    updateProductionChart(sensorData) {
        const chart = this.charts.productionChart;
        if (!chart || !sensorData.productionLines) return;

        const currentOutputs = sensorData.productionLines.map(line => line.output);
        chart.data.datasets[0].data = currentOutputs;

        chart.update();
    }

    updateEfficiencyChart(sensorData) {
        const chart = this.charts.efficiencyChart;
        if (!chart || !sensorData.productionLines) return;

        const efficiencies = sensorData.productionLines.map(line => line.efficiency);
        chart.data.datasets[0].data = efficiencies;

        chart.update();
    }

    updateTemperatureChart(sensorData) {
        const chart = this.charts.temperatureChart;
        if (!chart || !sensorData.productionLines) return;

        const timestamp = new Date(sensorData.timestamp);

        sensorData.productionLines.forEach((line, index) => {
            if (index < chart.data.datasets.length) {
                this.addDataPoint(chart, index, { x: timestamp, y: line.temperature });
            }
        });

        // Keep only last 50 data points
        chart.data.datasets.forEach(dataset => {
            if (dataset.data.length > 50) {
                dataset.data = dataset.data.slice(-50);
            }
        });

        chart.update('none');
    }

    updateCostAnalysisChart(costData) {
        const chart = this.charts.costAnalysisChart;
        if (!chart || !costData) return;

        const currentData = [
            costData.current_costs.monthly_energy,
            costData.current_costs.monthly_demand,
            costData.cost_breakdown.maintenance.current,
            costData.current_costs.monthly_total
        ];

        chart.data.datasets[0].data = currentData;
        chart.update();
    }

    addDataPoint(chart, datasetIndex, dataPoint) {
        if (chart.data.datasets[datasetIndex]) {
            chart.data.datasets[datasetIndex].data.push(dataPoint);
        }
    }

    updateTimeRange(chartId, range) {
        const chart = this.charts[chartId];
        if (!chart) return;

        // Update time scale based on range
        let unit = 'minute';
        let stepSize = 10;

        switch (range) {
            case '1h':
                unit = 'minute';
                stepSize = 10;
                break;
            case '4h':
                unit = 'minute';
                stepSize = 30;
                break;
            case '24h':
                unit = 'hour';
                stepSize = 2;
                break;
        }

        if (chart.options.scales.x.time) {
            chart.options.scales.x.time.unit = unit;
            chart.options.scales.x.time.stepSize = stepSize;
            chart.update();
        }
    }

    setupChartEventListeners() {
        // Power chart time range selector
        const powerTimeRange = document.getElementById('powerTimeRange');
        if (powerTimeRange) {
            powerTimeRange.addEventListener('change', (e) => {
                this.updateTimeRange('powerChart', e.target.value);
            });
        }

        // Chart click handlers for drill-down functionality
        Object.keys(this.charts).forEach(chartId => {
            const chart = this.charts[chartId];
            if (chart && chart.canvas) {
                chart.canvas.addEventListener('click', (event) => {
                    this.handleChartClick(chartId, event);
                });
            }
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.resizeCharts();
        });
    }

    handleChartClick(chartId, event) {
        const chart = this.charts[chartId];
        if (!chart) return;

        const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        
        if (points.length > 0) {
            const firstPoint = points[0];
            const datasetLabel = chart.data.datasets[firstPoint.datasetIndex].label;
            const value = chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
            
            console.log(`Clicked on ${datasetLabel}: ${JSON.stringify(value)}`);
            
            // Emit custom event for other components to handle
            window.dispatchEvent(new CustomEvent('chartPointClick', {
                detail: {
                    chartId,
                    datasetLabel,
                    value,
                    datasetIndex: firstPoint.datasetIndex,
                    pointIndex: firstPoint.index
                }
            }));
        }
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }

    exportChart(chartId, filename) {
        const chart = this.charts[chartId];
        if (!chart) return;

        const url = chart.toBase64Image();
        const link = document.createElement('a');
        link.download = filename || `${chartId}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getChartDataAsCSV(chartId) {
        const chart = this.charts[chartId];
        if (!chart) return '';

        let csv = 'Timestamp,';
        csv += chart.data.datasets.map(ds => ds.label).join(',') + '\n';

        // Assuming time series data
        const maxLength = Math.max(...chart.data.datasets.map(ds => ds.data.length));
        
        for (let i = 0; i < maxLength; i++) {
            const row = [];
            
            // Get timestamp from first dataset
            const firstDataPoint = chart.data.datasets[0]?.data[i];
            if (firstDataPoint && firstDataPoint.x) {
                row.push(firstDataPoint.x.toISOString());
            } else {
                row.push(`Point ${i + 1}`);
            }
            
            // Get values from all datasets
            chart.data.datasets.forEach(dataset => {
                const dataPoint = dataset.data[i];
                if (dataPoint) {
                    row.push(typeof dataPoint === 'object' ? dataPoint.y : dataPoint);
                } else {
                    row.push('');
                }
            });
            
            csv += row.join(',') + '\n';
        }

        return csv;
    }

    // Advanced chart features
    addTrendLine(chartId, datasetIndex) {
        const chart = this.charts[chartId];
        if (!chart) return;

        const dataset = chart.data.datasets[datasetIndex];
        if (!dataset) return;

        const data = dataset.data.map(point => typeof point === 'object' ? point.y : point);
        const trendData = this.calculateLinearRegression(data);

        // Add trend line dataset
        chart.data.datasets.push({
            label: `${dataset.label} Trend`,
            data: trendData,
            borderColor: dataset.borderColor,
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0
        });

        chart.update();
    }

    calculateLinearRegression(data) {
        const n = data.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

        data.forEach((y, x) => {
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return data.map((_, x) => ({
            x: x,
            y: slope * x + intercept
        }));
    }

    addAnomalyMarkers(chartId, anomalies) {
        const chart = this.charts[chartId];
        if (!chart || !anomalies.length) return;

        // Add annotation plugin if not already added
        if (!chart.options.plugins.annotation) {
            chart.options.plugins.annotation = { annotations: {} };
        }

        anomalies.forEach((anomaly, index) => {
            if (anomaly.timestamp) {
                chart.options.plugins.annotation.annotations[`anomaly_${index}`] = {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: anomaly.timestamp,
                    borderColor: 'red',
                    borderWidth: 2,
                    borderDash: [3, 3],
                    label: {
                        content: 'Anomaly',
                        enabled: true,
                        position: 'top'
                    }
                };
            }
        });

        chart.update();
    }

    setChartTheme(theme) {
        const isDark = theme === 'dark';
        const textColor = isDark ? '#ffffff' : '#333333';
        const gridColor = isDark ? '#444444' : '#e0e0e0';
        const backgroundColor = isDark ? '#1a1a1a' : '#ffffff';

        Object.values(this.charts).forEach(chart => {
            // Update text colors
            chart.options.plugins.legend.labels.color = textColor;
            chart.options.scales.x.title.color = textColor;
            chart.options.scales.y.title.color = textColor;
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;

            // Update grid colors
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;

            chart.update();
        });
    }

    startRealTimeUpdate(updateFunction, interval = 1000) {
        if (this.updateIntervals.realTime) {
            clearInterval(this.updateIntervals.realTime);
        }

        this.updateIntervals.realTime = setInterval(() => {
            if (typeof updateFunction === 'function') {
                updateFunction();
            }
        }, interval);
    }

    stopRealTimeUpdate() {
        if (this.updateIntervals.realTime) {
            clearInterval(this.updateIntervals.realTime);
            delete this.updateIntervals.realTime;
        }
    }
}

// Export for use in other modules
window.ChartManager = ChartManager;