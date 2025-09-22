class ChartManager {
    constructor() {
        this.charts = {};
        this.gauges = {};
        this.initializeCharts();
    }

    initializeCharts() {
        this.initializeVitalsChart();
        this.initializeMedicationChart();
        this.initializeCostsChart();
        this.initializeGauges();
        
        this.startChartUpdates();
    }

    initializeVitalsChart() {
        const ctx = document.getElementById('vitalsChart').getContext('2d');
        
        this.charts.vitals = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Heart Rate (BPM)',
                        data: [],
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4
                    },
                    {
                        label: 'Oxygen Level (%)',
                        data: [],
                        borderColor: '#17a2b8',
                        backgroundColor: 'rgba(23, 162, 184, 0.1)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Temperature (°C)',
                        data: [],
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        yAxisID: 'y2'
                    },
                    {
                        label: 'Systolic BP',
                        data: [],
                        borderColor: '#2c5aa0',
                        backgroundColor: 'rgba(44, 90, 160, 0.1)',
                        tension: 0.4,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 4
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
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#dee2e6',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Heart Rate (BPM) / Systolic BP'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: false,
                        position: 'right',
                        min: 80,
                        max: 100,
                        grid: {
                            drawOnChartArea: false,
                        }
                    },
                    y2: {
                        type: 'linear',
                        display: false,
                        position: 'right',
                        min: 35,
                        max: 40,
                        grid: {
                            drawOnChartArea: false,
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    initializeMedicationChart() {
        const ctx = document.getElementById('medicationChart').getContext('2d');
        
        this.charts.medication = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Antibiotics', 'Pain Relief', 'Cardiac', 'Respiratory', 'Supplements', 'Other'],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#dc3545',
                        '#ffc107',
                        '#28a745',
                        '#17a2b8',
                        '#6f42c1',
                        '#fd7e14'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, i) => {
                                        const value = data.datasets[0].data[i];
                                        return {
                                            text: `${label}: ${value}`,
                                            fillStyle: data.datasets[0].backgroundColor[i],
                                            strokeStyle: data.datasets[0].backgroundColor[i],
                                            pointStyle: 'circle',
                                            hidden: false,
                                            index: i
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
    }

    initializeCostsChart() {
        const ctx = document.getElementById('costsChart').getContext('2d');
        
        this.charts.costs = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Daily Cost (¥)',
                    data: [],
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: '#28a745',
                    borderWidth: 1,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        callbacks: {
                            label: function(context) {
                                return `Cost: ¥${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Cost (¥)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '¥' + value.toLocaleString();
                            }
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    initializeGauges() {
        this.initializeGauge('criticalGauge', '#dc3545', 'Critical');
        this.initializeGauge('stableGauge', '#28a745', 'Stable');
        this.initializeGauge('recoveryGauge', '#ffc107', 'Recovery');
    }

    initializeGauge(canvasId, color, label) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        this.gauges[canvasId] = {
            canvas: canvas,
            ctx: ctx,
            color: color,
            label: label,
            value: 0,
            maxValue: 12
        };
    }

    drawGauge(gaugeId, value) {
        const gauge = this.gauges[gaugeId];
        const ctx = gauge.ctx;
        const canvas = gauge.canvas;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 45;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 0.25 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#e9ecef';
        ctx.stroke();
        
        // Value arc
        const angle = 0.75 * Math.PI + (1.5 * Math.PI * (value / gauge.maxValue));
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, angle);
        ctx.lineWidth = 8;
        ctx.strokeStyle = gauge.color;
        ctx.stroke();
        
        // Center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = gauge.color;
        ctx.fill();
        
        // Value text
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(value.toString(), centerX, centerY);
    }

    updateVitalsChart(timeRange = '24h') {
        const history = window.dataGenerator.getVitalHistory(timeRange);
        const sortedEntries = Array.from(history.entries()).sort((a, b) => a[0] - b[0]);
        
        const labels = [];
        const heartRateData = [];
        const oxygenData = [];
        const temperatureData = [];
        const systolicData = [];
        
        sortedEntries.forEach(([timestamp, data]) => {
            const date = new Date(timestamp);
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            heartRateData.push(data.heartRate.toFixed(0));
            oxygenData.push(data.oxygen.toFixed(1));
            temperatureData.push(data.temperature.toFixed(1));
            systolicData.push(data.bloodPressureSystolic.toFixed(0));
        });
        
        // Keep only recent data points to prevent overcrowding
        const maxPoints = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : 144;
        const step = Math.max(1, Math.floor(labels.length / maxPoints));
        
        this.charts.vitals.data.labels = labels.filter((_, i) => i % step === 0);
        this.charts.vitals.data.datasets[0].data = heartRateData.filter((_, i) => i % step === 0);
        this.charts.vitals.data.datasets[1].data = oxygenData.filter((_, i) => i % step === 0);
        this.charts.vitals.data.datasets[2].data = temperatureData.filter((_, i) => i % step === 0);
        this.charts.vitals.data.datasets[3].data = systolicData.filter((_, i) => i % step === 0);
        
        this.charts.vitals.update('none');
    }

    updateMedicationChart() {
        const medicationData = window.dataGenerator.getMedicationData();
        
        this.charts.medication.data.datasets[0].data = [
            medicationData.antibiotics,
            medicationData.painkillers,
            medicationData.cardiacMeds,
            medicationData.respiratoryMeds,
            medicationData.supplements,
            medicationData.other
        ];
        
        this.charts.medication.update('none');
    }

    updateCostsChart() {
        const costData = window.dataGenerator.getCostData();
        
        const labels = costData.map(item => {
            return item.date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });
        
        const data = costData.map(item => item.amount);
        
        this.charts.costs.data.labels = labels;
        this.charts.costs.data.datasets[0].data = data;
        
        this.charts.costs.update('none');
    }

    updateGauges() {
        const statusCounts = window.dataGenerator.getStatusCounts();
        
        this.drawGauge('criticalGauge', statusCounts.critical);
        this.drawGauge('stableGauge', statusCounts.stable);
        this.drawGauge('recoveryGauge', statusCounts.recovery);
        
        // Update labels
        document.getElementById('critical-label').textContent = `Critical (${statusCounts.critical})`;
        document.getElementById('stable-label').textContent = `Stable (${statusCounts.stable})`;
        document.getElementById('recovery-label').textContent = `Recovery (${statusCounts.recovery})`;
    }

    startChartUpdates() {
        // Update all charts every 3 seconds
        setInterval(() => {
            const timeRange = document.getElementById('time-range').value;
            this.updateVitalsChart(timeRange);
            this.updateMedicationChart();
            this.updateCostsChart();
            this.updateGauges();
        }, 3000);

        // Initial update
        setTimeout(() => {
            this.updateVitalsChart();
            this.updateMedicationChart();
            this.updateCostsChart();
            this.updateGauges();
        }, 1000);
    }

    onTimeRangeChange() {
        const timeRange = document.getElementById('time-range').value;
        this.updateVitalsChart(timeRange);
    }
}

// Initialize chart manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.chartManager = new ChartManager();
    
    // Add event listener for time range change
    document.getElementById('time-range').addEventListener('change', function() {
        window.chartManager.onTimeRangeChange();
    });
});