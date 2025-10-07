/**
 * TimeSeriesCharts Component - Display historical trends
 */
class TimeSeriesCharts {
    constructor(options = {}) {
        this.speedChart = null;
        this.vehicleChart = null;
        this.speedData = [];
        this.vehicleData = [];
        this.timeLabels = [];
        this.maxDataPoints = 20;

        this.initializeCharts(options);
    }

    initializeCharts(options) {
        // Speed Chart
        const speedCtx = document.getElementById(options.speedChartId || 'speedChart');
        if (speedCtx) {
            this.speedChart = new Chart(speedCtx, {
                type: 'line',
                data: {
                    labels: this.timeLabels,
                    datasets: [{
                        label: 'Average Speed (km/h)',
                        data: this.speedData,
                        borderColor: '#4299e1',
                        backgroundColor: 'rgba(66, 153, 225, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Speed (km/h)'
                            }
                        }
                    }
                }
            });
        }

        // Vehicle Count Chart
        const vehicleCtx = document.getElementById(options.vehicleChartId || 'vehicleChart');
        if (vehicleCtx) {
            this.vehicleChart = new Chart(vehicleCtx, {
                type: 'line',
                data: {
                    labels: this.timeLabels,
                    datasets: [{
                        label: 'Active Vehicles',
                        data: this.vehicleData,
                        borderColor: '#48bb78',
                        backgroundColor: 'rgba(72, 187, 120, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Vehicle Count'
                            }
                        }
                    }
                }
            });
        }

        console.log('TimeSeriesCharts initialized');
    }

    update(metrics) {
        if (!metrics) return;

        // Add timestamp
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        this.timeLabels.push(timeLabel);
        this.speedData.push(metrics.averageSpeed || 0);
        this.vehicleData.push(metrics.activeVehicles || 0);

        // Limit data points
        if (this.timeLabels.length > this.maxDataPoints) {
            this.timeLabels.shift();
            this.speedData.shift();
            this.vehicleData.shift();
        }

        // Update charts
        if (this.speedChart) {
            this.speedChart.data.labels = this.timeLabels;
            this.speedChart.data.datasets[0].data = this.speedData;
            this.speedChart.update('none');
        }

        if (this.vehicleChart) {
            this.vehicleChart.data.labels = this.timeLabels;
            this.vehicleChart.data.datasets[0].data = this.vehicleData;
            this.vehicleChart.update('none');
        }
    }
}
