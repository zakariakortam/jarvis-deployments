// Chart Management for Warehouse Management System

class ChartManager {
    constructor() {
        this.charts = {};
        this.initializeCharts();
        this.startUpdates();
    }

    initializeCharts() {
        // Inventory Levels by Category Chart
        const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
        this.charts.inventory = new Chart(inventoryCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Current Stock',
                    data: [],
                    backgroundColor: 'rgba(66, 153, 225, 0.8)',
                    borderColor: 'rgba(66, 153, 225, 1)',
                    borderWidth: 2
                }, {
                    label: 'Reorder Point',
                    data: [],
                    backgroundColor: 'rgba(237, 137, 54, 0.5)',
                    borderColor: 'rgba(237, 137, 54, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Order Flow Chart
        const orderFlowCtx = document.getElementById('orderFlowChart').getContext('2d');
        this.charts.orderFlow = new Chart(orderFlowCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Received',
                    data: [],
                    borderColor: 'rgba(72, 187, 120, 1)',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Processed',
                    data: [],
                    borderColor: 'rgba(66, 153, 225, 1)',
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Shipped',
                    data: [],
                    borderColor: 'rgba(159, 122, 234, 1)',
                    backgroundColor: 'rgba(159, 122, 234, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Stock Movement Trends Chart
        const stockMovementCtx = document.getElementById('stockMovementChart').getContext('2d');
        this.charts.stockMovement = new Chart(stockMovementCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Inbound',
                    data: [],
                    borderColor: 'rgba(72, 187, 120, 1)',
                    backgroundColor: 'rgba(72, 187, 120, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }, {
                    label: 'Outbound',
                    data: [],
                    borderColor: 'rgba(245, 101, 101, 1)',
                    backgroundColor: 'rgba(245, 101, 101, 0.2)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Supplier Performance Chart
        const supplierCtx = document.getElementById('supplierChart').getContext('2d');
        this.charts.supplier = new Chart(supplierCtx, {
            type: 'radar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Performance Score',
                    data: [],
                    backgroundColor: 'rgba(159, 122, 234, 0.2)',
                    borderColor: 'rgba(159, 122, 234, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(159, 122, 234, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(159, 122, 234, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });

        // Initialize gauge canvases
        this.initializeGauges();
    }

    initializeGauges() {
        // Value Gauge
        const valueGaugeCtx = document.getElementById('valueGauge').getContext('2d');
        this.charts.valueGauge = new Chart(valueGaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['rgba(72, 187, 120, 0.8)', 'rgba(226, 232, 240, 0.3)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        // Fill Rate Gauge
        const fillRateGaugeCtx = document.getElementById('fillRateGauge').getContext('2d');
        this.charts.fillRateGauge = new Chart(fillRateGaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['rgba(66, 153, 225, 0.8)', 'rgba(226, 232, 240, 0.3)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });

        // Fulfillment Gauge
        const fulfillmentGaugeCtx = document.getElementById('fulfillmentGauge').getContext('2d');
        this.charts.fulfillmentGauge = new Chart(fulfillmentGaugeCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['rgba(159, 122, 234, 0.8)', 'rgba(226, 232, 240, 0.3)'],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    }

    updateInventoryChart() {
        const products = simulator.getProducts();
        const categoryData = {};

        // Aggregate by category
        products.forEach(product => {
            if (!categoryData[product.category]) {
                categoryData[product.category] = {
                    totalStock: 0,
                    totalReorderPoint: 0,
                    count: 0
                };
            }
            categoryData[product.category].totalStock += product.stockLevel;
            categoryData[product.category].totalReorderPoint += product.reorderPoint;
            categoryData[product.category].count++;
        });

        const labels = Object.keys(categoryData);
        const stockData = labels.map(cat => categoryData[cat].totalStock);
        const reorderData = labels.map(cat => categoryData[cat].totalReorderPoint * categoryData[cat].count);

        this.charts.inventory.data.labels = labels;
        this.charts.inventory.data.datasets[0].data = stockData;
        this.charts.inventory.data.datasets[1].data = reorderData;
        this.charts.inventory.update('none');
    }

    updateOrderFlowChart() {
        const orderHistory = simulator.getOrderHistory();

        const labels = orderHistory.map((_, i) => `${i}h`);
        const received = orderHistory.map(h => h.received);
        const processed = orderHistory.map(h => h.processed);
        const shipped = orderHistory.map(h => h.shipped);

        this.charts.orderFlow.data.labels = labels;
        this.charts.orderFlow.data.datasets[0].data = received;
        this.charts.orderFlow.data.datasets[1].data = processed;
        this.charts.orderFlow.data.datasets[2].data = shipped;
        this.charts.orderFlow.update('none');
    }

    updateStockMovementChart() {
        const movements = simulator.getStockMovements();

        const labels = movements.map((_, i) => `Day ${i + 1}`);
        const inbound = movements.map(m => m.inbound);
        const outbound = movements.map(m => m.outbound);

        this.charts.stockMovement.data.labels = labels;
        this.charts.stockMovement.data.datasets[0].data = inbound;
        this.charts.stockMovement.data.datasets[1].data = outbound;
        this.charts.stockMovement.update('none');
    }

    updateSupplierChart() {
        const suppliers = simulator.getSuppliers();

        const labels = suppliers.map(s => s.name.split(' ')[0]);
        const performance = suppliers.map(s => s.performance);

        this.charts.supplier.data.labels = labels;
        this.charts.supplier.data.datasets[0].data = performance;
        this.charts.supplier.update('none');
    }

    updateGauges() {
        const kpis = simulator.getKPIs();

        // Update value gauge (normalized to 0-100 scale)
        const maxValue = 5000000; // $5M max
        const valuePercent = Math.min(100, (kpis.totalValue / maxValue) * 100);
        this.charts.valueGauge.data.datasets[0].data = [valuePercent, 100 - valuePercent];
        this.charts.valueGauge.update('none');

        // Update fill rate gauge
        this.charts.fillRateGauge.data.datasets[0].data = [kpis.fillRate, 100 - kpis.fillRate];
        this.charts.fillRateGauge.update('none');

        // Update fulfillment gauge (inverse - lower is better, max 120 hours)
        const fulfillmentPercent = Math.max(0, 100 - (kpis.avgFulfillment / 120 * 100));
        this.charts.fulfillmentGauge.data.datasets[0].data = [fulfillmentPercent, 100 - fulfillmentPercent];
        this.charts.fulfillmentGauge.update('none');
    }

    updateAllCharts() {
        this.updateInventoryChart();
        this.updateOrderFlowChart();
        this.updateStockMovementChart();
        this.updateSupplierChart();
        this.updateGauges();
    }

    startUpdates() {
        // Update all charts every 2 seconds
        setInterval(() => {
            this.updateAllCharts();
        }, 2000);

        // Initial update
        this.updateAllCharts();
    }
}

// Initialize chart manager when DOM is ready
let chartManager;
document.addEventListener('DOMContentLoaded', () => {
    chartManager = new ChartManager();
});
