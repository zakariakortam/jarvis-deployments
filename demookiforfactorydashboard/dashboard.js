// Factory Dashboard JavaScript
class FactoryDashboard {
    constructor() {
        this.currentLanguage = 'en';
        this.charts = {};
        this.sensorData = {
            production: [],
            temperature: { furnace1: 0, furnace2: 0 },
            voltage: 0,
            power: 0,
            equipment: []
        };
        this.alerts = [];
        this.updateInterval = null;
        
        this.initializeTranslations();
        this.initializeEventListeners();
        this.initializeMockData();
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.populateEquipmentTable();
        this.generateAlerts();
    }

    initializeTranslations() {
        this.translations = {
            en: {
                'Equipment ID': 'Equipment ID',
                'Name': 'Name', 
                'Status': 'Status',
                'Temperature (°C)': 'Temperature (°C)',
                'Voltage (V)': 'Voltage (V)', 
                'Power (kW)': 'Power (kW)',
                'Last Updated': 'Last Updated',
                'Running': 'Running',
                'Maintenance': 'Maintenance',
                'Error': 'Error',
                'Search equipment...': 'Search equipment...',
                'Critical Temperature Alert': 'Critical Temperature Alert',
                'High Power Consumption': 'High Power Consumption',
                'Maintenance Required': 'Maintenance Required',
                'Performance Optimization': 'Performance Optimization'
            },
            ja: {
                'Equipment ID': '設備ID',
                'Name': '名前',
                'Status': '状況', 
                'Temperature (°C)': '温度 (°C)',
                'Voltage (V)': '電圧 (V)',
                'Power (kW)': '電力 (kW)',
                'Last Updated': '最終更新',
                'Running': '運転中',
                'Maintenance': 'メンテナンス',
                'Error': 'エラー',
                'Search equipment...': '設備を検索...',
                'Critical Temperature Alert': '温度危険警告',
                'High Power Consumption': '高電力消費',
                'Maintenance Required': 'メンテナンス必要',
                'Performance Optimization': 'パフォーマンス最適化'
            }
        };
    }

    initializeEventListeners() {
        // Language selector
        document.getElementById('languageSelector').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.switchTab(e.currentTarget.dataset.tab);
            });
        });

        // Equipment search
        const searchInput = document.getElementById('equipmentSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterEquipmentTable(e.target.value);
            });
        }
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update all elements with language attributes
        document.querySelectorAll('[data-lang-en], [data-lang-ja]').forEach(element => {
            const key = `data-lang-${lang}`;
            if (element.hasAttribute(key)) {
                element.textContent = element.getAttribute(key);
            }
        });

        // Update placeholder texts
        document.querySelectorAll(`[data-lang-${lang}-placeholder]`).forEach(element => {
            element.placeholder = element.getAttribute(`data-lang-${lang}-placeholder`);
        });

        // Update charts
        this.updateChartLabels();
        this.populateEquipmentTable();
        this.generateAlerts();
    }

    switchTab(tabName) {
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Refresh charts when switching to tabs with charts
        setTimeout(() => {
            Object.values(this.charts).forEach(chart => {
                if (chart && chart.resize) {
                    chart.resize();
                }
            });
        }, 100);
    }

    initializeMockData() {
        // Initialize equipment data
        this.sensorData.equipment = [
            { id: 'EQ001', name: 'Production Line A', nameJa: '生産ラインA', status: 'running', temp: 85, voltage: 415, power: 125.5 },
            { id: 'EQ002', name: 'Production Line B', nameJa: '生産ラインB', status: 'running', temp: 78, voltage: 410, power: 118.2 },
            { id: 'EQ003', name: 'Quality Control', nameJa: '品質管理', status: 'running', temp: 23, voltage: 220, power: 45.8 },
            { id: 'EQ004', name: 'Packaging Unit', nameJa: '包装ユニット', status: 'maintenance', temp: 35, voltage: 380, power: 89.3 },
            { id: 'EQ005', name: 'Conveyor System', nameJa: 'コンベアシステム', status: 'running', temp: 28, voltage: 380, power: 67.4 },
            { id: 'EQ006', name: 'Furnace 1', nameJa: '炉1', status: 'running', temp: 856, voltage: 415, power: 245.7 },
            { id: 'EQ007', name: 'Furnace 2', nameJa: '炉2', status: 'running', temp: 834, voltage: 415, power: 238.9 },
            { id: 'EQ008', name: 'Cooling System', nameJa: '冷却システム', status: 'running', temp: 15, voltage: 220, power: 56.2 }
        ];

        // Initialize production data with recent history
        const now = new Date();
        for (let i = 59; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
            this.sensorData.production.push({
                time: time,
                units: Math.floor(Math.random() * 50) + 200,
                efficiency: Math.random() * 15 + 85,
                power: Math.random() * 50 + 150
            });
        }
    }

    initializeCharts() {
        this.createProductionChart();
        this.createHourlyProductionChart();
        this.createCostBreakdownChart();
        this.createPerformanceTrendChart();
        this.createGauges();
    }

    createProductionChart() {
        const ctx = document.getElementById('productionChart').getContext('2d');
        this.charts.production = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.sensorData.production.slice(-20).map(d => 
                    d.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                ),
                datasets: [{
                    label: 'Units/Hour',
                    data: this.sensorData.production.slice(-20).map(d => d.units),
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Efficiency (%)',
                    data: this.sensorData.production.slice(-20).map(d => d.efficiency),
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Units/Hour'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Efficiency (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                animation: {
                    duration: 750
                }
            }
        });
    }

    createHourlyProductionChart() {
        const ctx = document.getElementById('hourlyProductionChart').getContext('2d');
        const hours = [];
        const production = [];
        
        for (let i = 23; i >= 0; i--) {
            const hour = new Date();
            hour.setHours(hour.getHours() - i);
            hours.push(hour.getHours() + ':00');
            production.push(Math.floor(Math.random() * 1000) + 2000);
        }

        this.charts.hourlyProduction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Units Produced',
                    data: production,
                    backgroundColor: 'rgba(33, 150, 243, 0.8)',
                    borderColor: '#2196f3',
                    borderWidth: 1
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
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Units'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Hour'
                        }
                    }
                }
            }
        });
    }

    createCostBreakdownChart() {
        const ctx = document.getElementById('costBreakdownChart').getContext('2d');
        this.charts.costBreakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Energy', 'Materials', 'Labor', 'Maintenance', 'Other'],
                datasets: [{
                    data: [35, 30, 20, 10, 5],
                    backgroundColor: [
                        '#ff6384',
                        '#36a2eb', 
                        '#ffce56',
                        '#4bc0c0',
                        '#9966ff'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
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
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createPerformanceTrendChart() {
        const ctx = document.getElementById('performanceTrendChart').getContext('2d');
        const days = [];
        const performance = [];
        const quality = [];

        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString());
            performance.push(Math.random() * 10 + 85);
            quality.push(Math.random() * 5 + 95);
        }

        this.charts.performanceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'Performance (%)',
                    data: performance,
                    borderColor: '#2196f3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4
                }, {
                    label: 'Quality (%)',
                    data: quality,
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 80,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    }

    createGauges() {
        this.createGauge('tempGauge1', 'Furnace 1', 850, 1000, '°C');
        this.createGauge('tempGauge2', 'Furnace 2', 830, 1000, '°C');
        this.createGauge('voltageGauge', 'Voltage', 415, 500, 'V');
    }

    createGauge(canvasId, label, value, maxValue, unit) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw gauge background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.lineWidth = 20;
        ctx.strokeStyle = '#e0e0e0';
        ctx.stroke();

        // Draw gauge fill
        const fillAngle = Math.PI + (value / maxValue) * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, fillAngle);
        ctx.strokeStyle = value > maxValue * 0.8 ? '#ff6384' : '#4caf50';
        ctx.stroke();

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fillStyle = '#333';
        ctx.fill();

        // Draw value text
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${value}${unit}`, centerX, centerY + 40);
    }

    updateChartLabels() {
        // This function would update chart labels based on current language
        // For brevity, keeping charts in English but this could be extended
    }

    populateEquipmentTable() {
        const tableBody = document.getElementById('equipmentTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        this.sensorData.equipment.forEach(equipment => {
            const row = document.createElement('tr');
            const name = this.currentLanguage === 'ja' ? equipment.nameJa : equipment.name;
            const status = this.translations[this.currentLanguage][equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)] || equipment.status;
            
            row.innerHTML = `
                <td>${equipment.id}</td>
                <td>${name}</td>
                <td><span class="status-badge ${equipment.status}">${status}</span></td>
                <td>${equipment.temp}</td>
                <td>${equipment.voltage}</td>
                <td>${equipment.power}</td>
                <td>${new Date().toLocaleTimeString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    filterEquipmentTable(searchTerm) {
        const tableRows = document.querySelectorAll('#equipmentTableBody tr');
        const term = searchTerm.toLowerCase();

        tableRows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    generateAlerts() {
        const alertsContainer = document.getElementById('alertsContainer');
        if (!alertsContainer) return;

        const alertTypes = ['critical', 'warning', 'info'];
        const alertTitles = [
            this.translations[this.currentLanguage]['Critical Temperature Alert'],
            this.translations[this.currentLanguage]['High Power Consumption'],
            this.translations[this.currentLanguage]['Maintenance Required'],
            this.translations[this.currentLanguage]['Performance Optimization']
        ];

        alertsContainer.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const alert = document.createElement('div');
            alert.className = `alert-item ${alertType}`;
            
            alert.innerHTML = `
                <div class="alert-title">${alertTitles[i]}</div>
                <div class="alert-message">Equipment monitoring system has detected an anomaly that requires attention.</div>
                <div class="alert-time">${new Date().toLocaleTimeString()}</div>
            `;
            alertsContainer.appendChild(alert);
        }
    }

    startRealTimeUpdates() {
        this.updateInterval = setInterval(() => {
            this.updateSensorData();
            this.updateKPIs();
            this.updateCharts();
            this.updateEquipmentStatus();
            this.updateGauges();
        }, 2000); // Update every 2 seconds
    }

    updateSensorData() {
        // Add new production data point
        const now = new Date();
        const newDataPoint = {
            time: now,
            units: Math.floor(Math.random() * 50) + 200 + Math.sin(now.getTime() / 60000) * 20,
            efficiency: Math.random() * 10 + 87 + Math.sin(now.getTime() / 120000) * 5,
            power: Math.random() * 30 + 160 + Math.cos(now.getTime() / 90000) * 15
        };
        
        this.sensorData.production.push(newDataPoint);
        if (this.sensorData.production.length > 100) {
            this.sensorData.production.shift();
        }

        // Update temperature and voltage with realistic fluctuations
        this.sensorData.temperature.furnace1 = 850 + Math.sin(now.getTime() / 30000) * 20 + (Math.random() - 0.5) * 10;
        this.sensorData.temperature.furnace2 = 830 + Math.cos(now.getTime() / 35000) * 15 + (Math.random() - 0.5) * 8;
        this.sensorData.voltage = 415 + (Math.random() - 0.5) * 10;
        this.sensorData.power = newDataPoint.power;

        // Update equipment data
        this.sensorData.equipment.forEach(equipment => {
            equipment.temp += (Math.random() - 0.5) * 2;
            equipment.voltage += (Math.random() - 0.5) * 5;
            equipment.power += (Math.random() - 0.5) * 3;
            
            // Clamp values to reasonable ranges
            equipment.temp = Math.max(0, equipment.temp);
            equipment.voltage = Math.max(200, Math.min(450, equipment.voltage));
            equipment.power = Math.max(10, equipment.power);
        });
    }

    updateKPIs() {
        const latest = this.sensorData.production[this.sensorData.production.length - 1];
        if (!latest) return;

        // Calculate daily totals (mock calculation)
        const totalProduction = this.sensorData.production.reduce((sum, point) => sum + point.units, 0);
        const avgEfficiency = this.sensorData.production.reduce((sum, point) => sum + point.efficiency, 0) / this.sensorData.production.length;
        const totalPower = this.sensorData.production.reduce((sum, point) => sum + point.power, 0) / this.sensorData.production.length;
        const dailyCost = totalPower * 24 * 0.15; // Mock cost calculation

        document.getElementById('totalProduction').textContent = Math.floor(totalProduction / 10).toLocaleString();
        document.getElementById('efficiency').textContent = Math.floor(avgEfficiency) + '%';
        document.getElementById('powerConsumption').textContent = Math.floor(totalPower) + ' kW';
        document.getElementById('dailyCost').textContent = '¥' + Math.floor(dailyCost).toLocaleString();

        // Update equipment speeds
        document.getElementById('line1-speed').textContent = Math.floor(latest.units * 0.4);
        document.getElementById('line2-speed').textContent = Math.floor(latest.units * 0.6);
        document.getElementById('qc-pass-rate').textContent = Math.floor(latest.efficiency);
        document.getElementById('packaging-throughput').textContent = Math.floor(latest.units * 0.3);
    }

    updateCharts() {
        if (this.charts.production) {
            const recentData = this.sensorData.production.slice(-20);
            this.charts.production.data.labels = recentData.map(d => 
                d.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            );
            this.charts.production.data.datasets[0].data = recentData.map(d => d.units);
            this.charts.production.data.datasets[1].data = recentData.map(d => d.efficiency);
            this.charts.production.update('none');
        }
    }

    updateEquipmentStatus() {
        // Update equipment table if visible
        if (document.getElementById('equipment').classList.contains('active')) {
            this.populateEquipmentTable();
        }
    }

    updateGauges() {
        this.createGauge('tempGauge1', 'Furnace 1', Math.floor(this.sensorData.temperature.furnace1), 1000, '°C');
        this.createGauge('tempGauge2', 'Furnace 2', Math.floor(this.sensorData.temperature.furnace2), 1000, '°C');
        this.createGauge('voltageGauge', 'Voltage', Math.floor(this.sensorData.voltage), 500, 'V');
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.factoryDashboard = new FactoryDashboard();
    
    // Handle page unload
    window.addEventListener('beforeunload', function() {
        if (window.factoryDashboard) {
            window.factoryDashboard.destroy();
        }
    });
    
    console.log('Factory Dashboard initialized successfully');
});

// Extension API for adding new dashboards and KPIs
window.FactoryDashboardAPI = {
    addKPI: function(id, label, getValue, formatValue) {
        // API for adding new KPIs dynamically
        console.log('Adding KPI:', id, label);
    },
    
    addChart: function(containerId, chartConfig) {
        // API for adding new charts
        console.log('Adding chart to container:', containerId);
    },
    
    addEquipmentType: function(equipmentConfig) {
        // API for adding new equipment types
        console.log('Adding equipment type:', equipmentConfig);
    },
    
    registerDataSource: function(sourceId, updateFunction) {
        // API for registering external data sources
        console.log('Registering data source:', sourceId);
    }
};