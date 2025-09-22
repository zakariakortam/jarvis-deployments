class ChartController {
    constructor() {
        this.currentChart = null;
        this.currentChartType = 'deliveries';
        this.chartConfig = {
            deliveries: {
                type: 'line',
                data: { datasets: [] },
                options: {}
            },
            fuel: {
                type: 'bar',
                data: { datasets: [] },
                options: {}
            },
            costs: {
                type: 'doughnut',
                data: { datasets: [] },
                options: {}
            }
        };
        
        this.colors = {
            primary: '#3498db',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c',
            secondary: '#95a5a6',
            dark: '#2c3e50'
        };
        
        this.init();
    }

    init() {
        this.setupChartDefaults();
        this.setupEventListeners();
        this.createDeliveryChart();
        
        // Subscribe to data updates
        window.logisticsSimulator.subscribe('timeSeriesUpdate', (data) => {
            this.updateCharts(data);
        });
        
        // Initial data load
        this.updateCharts(window.logisticsSimulator.getTimeSeriesData());
    }

    setupChartDefaults() {
        Chart.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#bdc3c7';
        Chart.defaults.backgroundColor = 'rgba(52, 152, 219, 0.8)';
        Chart.defaults.borderColor = 'rgba(52, 152, 219, 1)';
        Chart.defaults.elements.point.borderWidth = 2;
        Chart.defaults.elements.point.radius = 4;
        Chart.defaults.elements.point.hoverRadius = 6;
        Chart.defaults.elements.line.borderWidth = 3;
        Chart.defaults.elements.line.tension = 0.4;
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        Chart.defaults.plugins.legend.labels.padding = 20;
        Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.scale.ticks.color = '#bdc3c7';
    }

    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chart;
                this.switchChart(chartType);
            });
        });
    }

    switchChart(chartType) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');
        
        // Switch chart
        this.currentChartType = chartType;
        
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        switch (chartType) {
            case 'deliveries':
                this.createDeliveryChart();
                break;
            case 'fuel':
                this.createFuelChart();
                break;
            case 'costs':
                this.createCostChart();
                break;
        }
    }

    createDeliveryChart() {
        const ctx = document.getElementById('main-chart').getContext('2d');
        const data = window.logisticsSimulator.getTimeSeriesData().deliveries;
        
        this.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => new Date(d.time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })),
                datasets: [
                    {
                        label: 'Completed Deliveries',
                        data: data.map(d => d.completed),
                        borderColor: this.colors.success,
                        backgroundColor: this.colors.success + '20',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'On-Time Deliveries',
                        data: data.map(d => d.onTime),
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '20',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Delayed Deliveries',
                        data: data.map(d => d.delayed),
                        borderColor: this.colors.danger,
                        backgroundColor: this.colors.danger + '20',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Delivery Performance - Last 24 Hours',
                        color: '#ecf0f1',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#bdc3c7' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 40, 56, 0.95)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#bdc3c7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            afterLabel: (context) => {
                                const total = context.dataset.data[context.dataIndex];
                                const percentage = ((total / 50) * 100).toFixed(1);
                                return `Performance: ${percentage}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#bdc3c7'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Deliveries',
                            color: '#bdc3c7'
                        },
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    createFuelChart() {
        const ctx = document.getElementById('main-chart').getContext('2d');
        const data = window.logisticsSimulator.getTimeSeriesData().fuel;
        
        this.currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => new Date(d.time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })),
                datasets: [
                    {
                        label: 'Fuel Consumption (L)',
                        data: data.map(d => d.consumption),
                        backgroundColor: this.colors.warning + '80',
                        borderColor: this.colors.warning,
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Fuel Efficiency (L/100km)',
                        data: data.map(d => d.efficiency),
                        type: 'line',
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '20',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Fuel Consumption & Efficiency - Last 24 Hours',
                        color: '#ecf0f1',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { color: '#bdc3c7' }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 40, 56, 0.95)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#bdc3c7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            afterLabel: (context) => {
                                if (context.datasetIndex === 0) {
                                    const cost = data[context.dataIndex].cost;
                                    return `Cost: ¥${cost.toLocaleString()}`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Time',
                            color: '#bdc3c7'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Consumption (Liters)',
                            color: '#bdc3c7'
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Efficiency (L/100km)',
                            color: '#bdc3c7'
                        },
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    createCostChart() {
        const ctx = document.getElementById('main-chart').getContext('2d');
        const data = window.logisticsSimulator.getTimeSeriesData().costs;
        
        // Calculate averages for the pie chart
        const avgCosts = {
            fuel: data.reduce((sum, d) => sum + d.fuel, 0) / data.length,
            maintenance: data.reduce((sum, d) => sum + d.maintenance, 0) / data.length,
            driver: data.reduce((sum, d) => sum + d.driver, 0) / data.length,
            insurance: data.reduce((sum, d) => sum + d.insurance, 0) / data.length
        };
        
        this.currentChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Fuel Costs', 'Maintenance', 'Driver Wages', 'Insurance'],
                datasets: [{
                    data: [avgCosts.fuel, avgCosts.maintenance, avgCosts.driver, avgCosts.insurance],
                    backgroundColor: [
                        this.colors.warning + '80',
                        this.colors.danger + '80',
                        this.colors.primary + '80',
                        this.colors.secondary + '80'
                    ],
                    borderColor: [
                        this.colors.warning,
                        this.colors.danger,
                        this.colors.primary,
                        this.colors.secondary
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Average Cost Breakdown - Last 24 Hours',
                        color: '#ecf0f1',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'right',
                        labels: { 
                            color: '#bdc3c7',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(30, 40, 56, 0.95)',
                        titleColor: '#ecf0f1',
                        bodyColor: '#bdc3c7',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                const value = context.parsed.toLocaleString();
                                return `${context.label}: ¥${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderWidth: 2
                    }
                }
            }
        });
        
        // Add center text for total cost
        const total = Object.values(avgCosts).reduce((sum, val) => sum + val, 0);
        this.addCenterText(`¥${total.toLocaleString()}`, 'Total Avg Cost');
    }

    addCenterText(mainText, subText) {
        const centerText = {
            id: 'centerText',
            beforeDatasetsDraw: (chart) => {
                const { ctx, chartArea: { top, width, height } } = chart;
                ctx.save();
                
                // Main text
                ctx.font = 'bold 24px Inter';
                ctx.fillStyle = '#3498db';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                const centerX = width / 2;
                const centerY = top + height / 2 - 10;
                ctx.fillText(mainText, centerX, centerY);
                
                // Sub text
                ctx.font = '14px Inter';
                ctx.fillStyle = '#bdc3c7';
                ctx.fillText(subText, centerX, centerY + 25);
                
                ctx.restore();
            }
        };
        
        Chart.register(centerText);
    }

    updateCharts(timeSeriesData) {
        if (!this.currentChart) return;
        
        switch (this.currentChartType) {
            case 'deliveries':
                this.updateDeliveryChart(timeSeriesData.deliveries);
                break;
            case 'fuel':
                this.updateFuelChart(timeSeriesData.fuel);
                break;
            case 'costs':
                this.updateCostChart(timeSeriesData.costs);
                break;
        }
    }

    updateDeliveryChart(data) {
        if (this.currentChartType !== 'deliveries' || !this.currentChart) return;
        
        this.currentChart.data.labels = data.map(d => new Date(d.time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        
        this.currentChart.data.datasets[0].data = data.map(d => d.completed);
        this.currentChart.data.datasets[1].data = data.map(d => d.onTime);
        this.currentChart.data.datasets[2].data = data.map(d => d.delayed);
        
        this.currentChart.update('none');
    }

    updateFuelChart(data) {
        if (this.currentChartType !== 'fuel' || !this.currentChart) return;
        
        this.currentChart.data.labels = data.map(d => new Date(d.time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }));
        
        this.currentChart.data.datasets[0].data = data.map(d => d.consumption);
        this.currentChart.data.datasets[1].data = data.map(d => d.efficiency);
        
        this.currentChart.update('none');
    }

    updateCostChart(data) {
        if (this.currentChartType !== 'costs' || !this.currentChart) return;
        
        const avgCosts = {
            fuel: data.reduce((sum, d) => sum + d.fuel, 0) / data.length,
            maintenance: data.reduce((sum, d) => sum + d.maintenance, 0) / data.length,
            driver: data.reduce((sum, d) => sum + d.driver, 0) / data.length,
            insurance: data.reduce((sum, d) => sum + d.insurance, 0) / data.length
        };
        
        this.currentChart.data.datasets[0].data = [
            avgCosts.fuel, 
            avgCosts.maintenance, 
            avgCosts.driver, 
            avgCosts.insurance
        ];
        
        this.currentChart.update('none');
    }

    exportChart() {
        if (this.currentChart) {
            const url = this.currentChart.toBase64Image();
            const a = document.createElement('a');
            a.href = url;
            a.download = `logistics-${this.currentChartType}-chart.png`;
            a.click();
        }
    }

    printChart() {
        if (this.currentChart) {
            const canvas = this.currentChart.canvas;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head><title>Logistics Chart - ${this.currentChartType}</title></head>
                    <body><img src="${canvas.toDataURL()}" style="width: 100%;"></body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }
}

// Initialize chart controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chartController = new ChartController();
});