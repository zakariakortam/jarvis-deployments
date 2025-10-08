/**
 * Main Dashboard Controller
 * Orchestrates all dashboard components and real-time updates
 */

class IndustrialDashboard {
    constructor() {
        this.sensorEngine = null;
        this.chartEngine = null;
        this.updateInterval = 1000;
        this.charts = {};
        this.gauges = {};
        this.tables = {};
        this.filters = {
            zone: 'all',
            status: 'all',
            equipment: 'all',
            sortBy: 'name',
            sortOrder: 'asc',
            searchTerm: ''
        };
    }

    /**
     * Initialize dashboard
     */
    async initialize() {
        console.log('Initializing Industrial Dashboard...');

        // Initialize engines
        this.sensorEngine = new SensorEngine();
        this.chartEngine = new ChartEngine();

        // Initialize sensor data
        this.sensorEngine.initialize();

        // Setup UI components
        this.setupCharts();
        this.setupGauges();
        this.setupTables();
        this.setupFilters();
        this.setupEventListeners();

        // Start data updates
        this.sensorEngine.onUpdate((data) => this.handleDataUpdate(data));
        this.sensorEngine.start();

        console.log('Dashboard initialized successfully');
    }

    /**
     * Setup real-time charts
     */
    setupCharts() {
        // Temperature trends chart
        this.charts.temperature = this.chartEngine.createLineChart('tempChart', {
            title: 'Temperature Trends (°C)',
            maxPoints: 50,
            yMin: 0,
            yMax: 200,
            unit: '°C',
            labels: ['Line A', 'Line B', 'Welding', 'Paint'],
            colors: ['#00A6FF', '#00D4AA', '#FFB800', '#FF6B6B'],
            data: [[], [], [], []]
        });

        // Vibration monitoring chart
        this.charts.vibration = this.chartEngine.createLineChart('vibChart', {
            title: 'Vibration Levels (mm/s)',
            maxPoints: 50,
            yMin: 0,
            yMax: 30,
            unit: 'mm/s',
            labels: ['Motor 1', 'Motor 2', 'Pump 1'],
            colors: ['#00A6FF', '#00D4AA', '#FFB800'],
            data: [[], [], []]
        });

        // Power consumption chart
        this.charts.power = this.chartEngine.createLineChart('powerChart', {
            title: 'Power Consumption (kW)',
            maxPoints: 50,
            yMin: 0,
            yMax: 600,
            unit: 'kW',
            labels: ['Total Power'],
            colors: ['#FFB800'],
            data: [[]]
        });

        // Voltage monitoring chart
        this.charts.voltage = this.chartEngine.createLineChart('voltageChart', {
            title: 'Voltage Levels (V)',
            maxPoints: 50,
            yMin: 190,
            yMax: 250,
            unit: 'V',
            labels: ['Grid 1', 'Grid 2'],
            colors: ['#00A6FF', '#00D4AA'],
            data: [[], []]
        });
    }

    /**
     * Setup performance gauges
     */
    setupGauges() {
        // Overall equipment efficiency
        this.gauges.oee = this.chartEngine.createGauge('oeeGauge', {
            title: 'Overall Equipment Efficiency',
            min: 0,
            max: 100,
            value: 0,
            unit: '%',
            thresholds: [
                { value: 60, color: '#FF6B6B' },
                { value: 85, color: '#FFB800' },
                { value: 100, color: '#00D4AA' }
            ]
        });

        // System health
        this.gauges.health = this.chartEngine.createGauge('healthGauge', {
            title: 'System Health',
            min: 0,
            max: 100,
            value: 0,
            unit: '%',
            thresholds: [
                { value: 70, color: '#FF6B6B' },
                { value: 90, color: '#FFB800' },
                { value: 100, color: '#00D4AA' }
            ]
        });

        // Average uptime
        this.gauges.uptime = this.chartEngine.createGauge('uptimeGauge', {
            title: 'Average Uptime',
            min: 0,
            max: 100,
            value: 0,
            unit: '%',
            thresholds: [
                { value: 90, color: '#FF6B6B' },
                { value: 95, color: '#FFB800' },
                { value: 100, color: '#00D4AA' }
            ]
        });

        // Production throughput gauge
        this.gauges.throughput = this.chartEngine.createGauge('throughputGauge', {
            title: 'Production Rate',
            min: 0,
            max: 5000,
            value: 0,
            unit: 'units/hr',
            thresholds: [
                { value: 2000, color: '#FF6B6B' },
                { value: 3500, color: '#FFB800' },
                { value: 5000, color: '#00D4AA' }
            ]
        });
    }

    /**
     * Setup data tables
     */
    setupTables() {
        this.tables.equipment = document.getElementById('equipmentTable');
        this.tables.sensors = document.getElementById('sensorTable');
        this.tables.alerts = document.getElementById('alertsTable');
    }

    /**
     * Setup filters and controls
     */
    setupFilters() {
        const zoneFilter = document.getElementById('zoneFilter');
        const statusFilter = document.getElementById('statusFilter');
        const searchInput = document.getElementById('searchInput');

        if (zoneFilter) {
            zoneFilter.addEventListener('change', (e) => {
                this.filters.zone = e.target.value;
                this.updateTables();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.updateTables();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.searchTerm = e.target.value.toLowerCase();
                this.updateTables();
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Sort buttons
        document.querySelectorAll('[data-sort]').forEach(button => {
            button.addEventListener('click', (e) => {
                const sortBy = e.target.dataset.sort;
                if (this.filters.sortBy === sortBy) {
                    this.filters.sortOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    this.filters.sortBy = sortBy;
                    this.filters.sortOrder = 'asc';
                }
                this.updateTables();
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.forceUpdate();
            });
        }
    }

    /**
     * Handle data updates from sensor engine
     */
    handleDataUpdate(data) {
        this.updateCharts(data);
        this.updateGauges(data);
        this.updateTables(data);
        this.updateKPIs(data);
        this.updateAlerts(data);
    }

    /**
     * Update all charts with new data
     */
    updateCharts(data) {
        // Temperature chart - sample from different zones
        const tempSensors = data.sensors.filter(s => s.type === 'temperature').slice(0, 4);
        tempSensors.forEach((sensor, index) => {
            this.chartEngine.addDataPoint('tempChart', index, sensor.currentValue);
        });

        // Vibration chart - sample vibration sensors
        const vibSensors = data.sensors.filter(s => s.type === 'vibration').slice(0, 3);
        vibSensors.forEach((sensor, index) => {
            this.chartEngine.addDataPoint('vibChart', index, sensor.currentValue);
        });

        // Power chart - total power consumption
        const totalPower = data.sensors
            .filter(s => s.type === 'power')
            .reduce((sum, s) => sum + s.currentValue, 0);
        this.chartEngine.addDataPoint('powerChart', 0, totalPower);

        // Voltage chart - sample voltage sensors
        const voltageSensors = data.sensors.filter(s => s.type === 'voltage').slice(0, 2);
        voltageSensors.forEach((sensor, index) => {
            this.chartEngine.addDataPoint('voltageChart', index, sensor.currentValue);
        });
    }

    /**
     * Update performance gauges
     */
    updateGauges(data) {
        const summary = data.summary;

        // Overall equipment efficiency
        this.chartEngine.updateGauge('oeeGauge', parseFloat(summary.avgEfficiency));

        // System health (based on sensor health)
        this.chartEngine.updateGauge('healthGauge', parseFloat(summary.sensorHealth));

        // Average uptime
        this.chartEngine.updateGauge('uptimeGauge', parseFloat(summary.avgUptime));

        // Throughput
        this.chartEngine.updateGauge('throughputGauge', summary.totalThroughput);
    }

    /**
     * Update data tables
     */
    updateTables(data) {
        if (!data) {
            data = this.sensorEngine.getCurrentSnapshot();
        }

        this.updateEquipmentTable(data);
        this.updateSensorTable(data);
    }

    /**
     * Update equipment table
     */
    updateEquipmentTable(data) {
        const tbody = this.tables.equipment?.querySelector('tbody');
        if (!tbody) return;

        let equipment = [...data.equipment];

        // Apply filters
        if (this.filters.zone !== 'all') {
            equipment = equipment.filter(e => e.zone === this.filters.zone);
        }

        if (this.filters.status !== 'all') {
            equipment = equipment.filter(e => e.status === this.filters.status);
        }

        if (this.filters.searchTerm) {
            equipment = equipment.filter(e =>
                e.name.toLowerCase().includes(this.filters.searchTerm) ||
                e.zone.toLowerCase().includes(this.filters.searchTerm)
            );
        }

        // Apply sorting
        equipment.sort((a, b) => {
            let aVal = a[this.filters.sortBy];
            let bVal = b[this.filters.sortBy];

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.filters.sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        // Render rows
        tbody.innerHTML = equipment.map(eq => `
            <tr class="equipment-row status-${eq.status}">
                <td>${eq.name}</td>
                <td>${eq.zone}</td>
                <td><span class="status-badge ${eq.status}">${eq.status}</span></td>
                <td>${eq.efficiency ? eq.efficiency.toFixed(1) : '0.0'}%</td>
                <td>${eq.uptime.toFixed(1)}%</td>
                <td>${eq.throughput || 0} units/hr</td>
                <td>${eq.sensors.length}</td>
                <td>
                    <button class="btn-small" onclick="dashboard.viewEquipmentDetail('${eq.id}')">
                        Details
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Update sensor table (showing critical/warning sensors)
     */
    updateSensorTable(data) {
        const tbody = this.tables.sensors?.querySelector('tbody');
        if (!tbody) return;

        // Show only sensors with issues
        const sensorsToShow = data.sensors
            .filter(s => s.status === 'warning' || s.status === 'critical')
            .slice(0, 20); // Limit to 20 most recent

        tbody.innerHTML = sensorsToShow.map(sensor => `
            <tr class="sensor-row status-${sensor.status}">
                <td>${sensor.id}</td>
                <td>${sensor.equipmentName}</td>
                <td>${sensor.type}</td>
                <td class="value-cell">${sensor.currentValue.toFixed(2)} ${sensor.unit}</td>
                <td><span class="status-badge ${sensor.status}">${sensor.status}</span></td>
                <td>${new Date(sensor.lastUpdate).toLocaleTimeString()}</td>
            </tr>
        `).join('');

        if (sensorsToShow.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="no-data">All sensors operating normally</td></tr>';
        }
    }

    /**
     * Update KPI summary cards
     */
    updateKPIs(data) {
        const summary = data.summary;

        this.updateElement('totalEquipment', summary.totalEquipment);
        this.updateElement('operationalEquipment', summary.operationalEquipment);
        this.updateElement('totalSensors', summary.totalSensors);
        this.updateElement('criticalSensors', summary.criticalSensors);
        this.updateElement('warningSensors', summary.warningSensors);
        this.updateElement('totalPower', summary.totalPowerConsumption + ' kW');
        this.updateElement('avgEfficiency', summary.avgEfficiency + '%');
        this.updateElement('totalThroughput', summary.totalThroughput + ' units/hr');
    }

    /**
     * Update alerts table
     */
    updateAlerts(data) {
        const tbody = this.tables.alerts?.querySelector('tbody');
        if (!tbody) return;

        const alerts = this.sensorEngine.getCriticalAlerts().slice(0, 10);

        tbody.innerHTML = alerts.map(alert => `
            <tr class="alert-row critical">
                <td>${alert.equipment}</td>
                <td>${alert.type}</td>
                <td>${alert.value} ${alert.unit}</td>
                <td>${new Date(alert.timestamp).toLocaleTimeString()}</td>
                <td>
                    <button class="btn-small btn-danger" onclick="dashboard.acknowledgeAlert(${alert.sensorId})">
                        Acknowledge
                    </button>
                </td>
            </tr>
        `).join('');

        if (alerts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-data">No critical alerts</td></tr>';
        }
    }

    /**
     * Update element by ID
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * View equipment detail
     */
    viewEquipmentDetail(equipmentId) {
        const equipment = this.sensorEngine.equipment.find(e => e.id == equipmentId);
        if (!equipment) return;

        alert(`Equipment: ${equipment.name}\nZone: ${equipment.zone}\nStatus: ${equipment.status}\nEfficiency: ${equipment.efficiency?.toFixed(1)}%\nUptime: ${equipment.uptime.toFixed(1)}%\nSensors: ${equipment.sensors.length}`);
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(sensorId) {
        console.log(`Alert acknowledged for sensor ${sensorId}`);
        // In a real system, this would update the backend
    }

    /**
     * Force update all components
     */
    forceUpdate() {
        const data = this.sensorEngine.getCurrentSnapshot();
        this.handleDataUpdate(data);
    }

    /**
     * Stop dashboard
     */
    stop() {
        if (this.sensorEngine) {
            this.sensorEngine.stop();
        }
    }
}

// Global dashboard instance
let dashboard;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    dashboard = new IndustrialDashboard();
    dashboard.initialize();
});
