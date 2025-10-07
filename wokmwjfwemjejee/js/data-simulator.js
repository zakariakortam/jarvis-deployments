// Heavy IoT Data Simulator for Building Management System
class IoTDataSimulator {
    constructor() {
        this.buildings = [];
        this.devices = [];
        this.maintenanceLogs = [];
        this.alerts = [];
        this.energyHistory = [];
        this.dataPointsPerSecond = 0;
        this.startTime = Date.now();

        this.deviceTypes = ['HVAC', 'Lighting', 'Elevator', 'Security', 'Fire Safety', 'Water System', 'Power Distribution', 'BMS Controller'];
        this.systemTypes = ['hvac', 'lighting', 'energy', 'occupancy', 'equipment'];
        this.statusTypes = ['operational', 'warning', 'critical', 'maintenance'];

        this.initializeBuildings(2500); // 2500 buildings
        this.initializeDevices();
        this.generateHistoricalData();
        this.startContinuousSimulation();
    }

    initializeBuildings(count) {
        const buildingTypes = ['Office Tower', 'Residential Complex', 'Shopping Mall', 'Hospital', 'University Campus', 'Hotel', 'Data Center', 'Industrial Facility'];
        const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];

        for (let i = 0; i < count; i++) {
            const floors = Math.floor(Math.random() * 40) + 5;
            const building = {
                id: `BLD-${String(i + 1).padStart(6, '0')}`,
                name: `${buildingTypes[Math.floor(Math.random() * buildingTypes.length)]} ${i + 1}`,
                type: buildingTypes[Math.floor(Math.random() * buildingTypes.length)],
                location: `${cities[Math.floor(Math.random() * cities.length)]}, USA`,
                floors: floors,
                totalArea: Math.floor(Math.random() * 200000) + 50000, // sq ft
                capacity: Math.floor(Math.random() * 2000) + 200,
                currentOccupancy: 0,
                energyConsumption: 0,
                hvacLoad: 0,
                lightingLoad: 0,
                equipmentLoad: 0,
                status: 'operational'
            };
            this.buildings.push(building);
        }
    }

    initializeDevices() {
        this.buildings.forEach(building => {
            const devicesPerFloor = Math.floor(Math.random() * 20) + 15;
            const totalDevices = building.floors * devicesPerFloor;

            for (let i = 0; i < totalDevices; i++) {
                const deviceType = this.deviceTypes[Math.floor(Math.random() * this.deviceTypes.length)];
                const floor = Math.floor(i / devicesPerFloor) + 1;

                const device = {
                    id: `${building.id}-DEV-${String(i + 1).padStart(4, '0')}`,
                    buildingId: building.id,
                    buildingName: building.name,
                    type: deviceType,
                    floor: floor,
                    zone: String.fromCharCode(65 + Math.floor(Math.random() * 6)), // A-F
                    status: this.statusTypes[Math.floor(Math.random() * 100) > 85 ? Math.floor(Math.random() * 4) : 0],
                    powerDraw: Math.random() * 10 + 0.5, // kW
                    efficiency: Math.random() * 0.3 + 0.7, // 70-100%
                    temperature: deviceType === 'HVAC' ? Math.random() * 5 + 20 : null,
                    humidity: deviceType === 'HVAC' ? Math.random() * 20 + 40 : null,
                    airflow: deviceType === 'HVAC' ? Math.floor(Math.random() * 2000) + 500 : null,
                    lastMaintenance: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                    nextMaintenance: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
                    runtime: Math.floor(Math.random() * 50000), // hours
                    faultCount: Math.floor(Math.random() * 5)
                };

                this.devices.push(device);
            }
        });
    }

    generateHistoricalData() {
        // Generate 15 minutes of historical energy data
        const now = Date.now();
        for (let i = 900; i >= 0; i--) {
            const timestamp = now - (i * 1000);
            const baseLoad = 15000 + Math.sin(i / 100) * 5000;
            const noise = (Math.random() - 0.5) * 2000;

            this.energyHistory.push({
                timestamp: timestamp,
                total: baseLoad + noise,
                hvac: (baseLoad + noise) * 0.45,
                lighting: (baseLoad + noise) * 0.25,
                equipment: (baseLoad + noise) * 0.20,
                other: (baseLoad + noise) * 0.10
            });
        }

        // Keep only last 15 minutes
        if (this.energyHistory.length > 900) {
            this.energyHistory = this.energyHistory.slice(-900);
        }
    }

    generateMaintenanceLogs(count = 5000) {
        const descriptions = [
            'Routine maintenance completed',
            'Filter replacement required',
            'Sensor calibration performed',
            'Emergency repair - System failure',
            'Scheduled inspection completed',
            'Performance optimization required',
            'Component replacement needed',
            'Software update applied',
            'Abnormal vibration detected',
            'Temperature threshold exceeded',
            'Pressure anomaly detected',
            'Communication error resolved',
            'Power surge detected',
            'Backup system activated',
            'Energy efficiency audit completed',
            'Preventive maintenance scheduled',
            'Critical fault resolved',
            'Warning threshold exceeded',
            'System reset performed',
            'Configuration updated'
        ];

        this.maintenanceLogs = [];

        for (let i = 0; i < count; i++) {
            const device = this.devices[Math.floor(Math.random() * this.devices.length)];
            const status = this.statusTypes[Math.floor(Math.random() * this.statusTypes.length)];
            const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

            let cost = 0;
            switch(status) {
                case 'critical':
                    cost = Math.floor(Math.random() * 10000) + 5000;
                    break;
                case 'warning':
                    cost = Math.floor(Math.random() * 5000) + 1000;
                    break;
                case 'maintenance':
                    cost = Math.floor(Math.random() * 3000) + 500;
                    break;
                default:
                    cost = Math.floor(Math.random() * 1000) + 100;
            }

            this.maintenanceLogs.push({
                id: `LOG-${String(i + 1).padStart(6, '0')}`,
                timestamp: timestamp,
                building: device.buildingName,
                buildingId: device.buildingId,
                system: device.type,
                deviceId: device.id,
                floor: device.floor,
                zone: device.zone,
                status: status,
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                cost: cost,
                technician: `Tech-${Math.floor(Math.random() * 50) + 1}`,
                duration: Math.floor(Math.random() * 240) + 15 // minutes
            });
        }

        // Sort by timestamp descending
        this.maintenanceLogs.sort((a, b) => b.timestamp - a.timestamp);
    }

    startContinuousSimulation() {
        // Update every 100ms for smooth real-time updates
        setInterval(() => {
            this.updateDevices();
            this.updateBuildings();
            this.updateEnergyHistory();
            this.checkForAlerts();
            this.dataPointsPerSecond = this.devices.length * 10; // Each device sends ~10 data points/sec
        }, 100);

        // Generate new maintenance logs periodically
        setInterval(() => {
            this.generateNewMaintenanceLog();
        }, 5000);

        // Generate maintenance logs initially
        this.generateMaintenanceLogs();
    }

    updateDevices() {
        this.devices.forEach(device => {
            // Update power draw with realistic fluctuations
            const basePower = device.powerDraw;
            device.powerDraw = basePower + (Math.random() - 0.5) * basePower * 0.1;

            // Update temperature and humidity for HVAC
            if (device.type === 'HVAC') {
                device.temperature += (Math.random() - 0.5) * 0.2;
                device.temperature = Math.max(18, Math.min(26, device.temperature));

                device.humidity += (Math.random() - 0.5) * 2;
                device.humidity = Math.max(30, Math.min(70, device.humidity));

                device.airflow += (Math.random() - 0.5) * 50;
                device.airflow = Math.max(300, Math.min(3000, device.airflow));
            }

            // Randomly change status (very rarely)
            if (Math.random() > 0.9999) {
                const oldStatus = device.status;
                device.status = this.statusTypes[Math.floor(Math.random() * 4)];

                if (oldStatus !== device.status && device.status !== 'operational') {
                    this.createAlert(device);
                }
            }

            // Update runtime
            device.runtime += 0.0000278; // hours per 100ms
        });
    }

    updateBuildings() {
        this.buildings.forEach(building => {
            // Calculate building metrics from devices
            const buildingDevices = this.devices.filter(d => d.buildingId === building.id);

            building.energyConsumption = buildingDevices.reduce((sum, d) => sum + d.powerDraw, 0);
            building.hvacLoad = buildingDevices.filter(d => d.type === 'HVAC').reduce((sum, d) => sum + d.powerDraw, 0);
            building.lightingLoad = buildingDevices.filter(d => d.type === 'Lighting').reduce((sum, d) => sum + d.powerDraw, 0);
            building.equipmentLoad = building.energyConsumption - building.hvacLoad - building.lightingLoad;

            // Simulate occupancy (varies by time of day)
            const hour = new Date().getHours();
            let occupancyFactor = 0.3;
            if (hour >= 8 && hour <= 18) {
                occupancyFactor = 0.6 + Math.random() * 0.3;
            } else if (hour >= 19 && hour <= 22) {
                occupancyFactor = 0.3 + Math.random() * 0.2;
            }
            building.currentOccupancy = Math.floor(building.capacity * occupancyFactor);
        });
    }

    updateEnergyHistory() {
        const totalEnergy = this.buildings.reduce((sum, b) => sum + b.energyConsumption, 0);
        const hvacEnergy = this.buildings.reduce((sum, b) => sum + b.hvacLoad, 0);
        const lightingEnergy = this.buildings.reduce((sum, b) => sum + b.lightingLoad, 0);
        const equipmentEnergy = this.buildings.reduce((sum, b) => sum + b.equipmentLoad, 0);

        this.energyHistory.push({
            timestamp: Date.now(),
            total: totalEnergy,
            hvac: hvacEnergy,
            lighting: lightingEnergy,
            equipment: equipmentEnergy,
            other: totalEnergy - hvacEnergy - lightingEnergy - equipmentEnergy
        });

        // Keep only last 15 minutes (900 data points at 1 per second)
        if (this.energyHistory.length > 900) {
            this.energyHistory.shift();
        }
    }

    checkForAlerts() {
        // Check for devices with critical or warning status
        this.devices.forEach(device => {
            if ((device.status === 'critical' || device.status === 'warning') && Math.random() > 0.99) {
                this.createAlert(device);
            }
        });

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
    }

    createAlert(device) {
        const alertMessages = {
            critical: [
                'System failure detected - immediate attention required',
                'Critical temperature threshold exceeded',
                'Device unresponsive - connection lost',
                'Safety system triggered',
                'Power failure detected'
            ],
            warning: [
                'Performance degradation detected',
                'Maintenance window approaching',
                'Unusual power consumption pattern',
                'Sensor reading out of normal range',
                'Communication latency increased'
            ]
        };

        if (device.status === 'critical' || device.status === 'warning') {
            const messages = alertMessages[device.status];
            this.alerts.push({
                id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                severity: device.status,
                building: device.buildingName,
                device: device.id,
                type: device.type,
                message: messages[Math.floor(Math.random() * messages.length)],
                acknowledged: false
            });
        }
    }

    generateNewMaintenanceLog() {
        const device = this.devices[Math.floor(Math.random() * this.devices.length)];
        const descriptions = [
            'Scheduled maintenance in progress',
            'Real-time diagnostics completed',
            'Performance metrics updated',
            'System health check performed',
            'Automatic optimization applied'
        ];

        const log = {
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            building: device.buildingName,
            buildingId: device.buildingId,
            system: device.type,
            deviceId: device.id,
            floor: device.floor,
            zone: device.zone,
            status: device.status,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            cost: Math.floor(Math.random() * 500) + 50,
            technician: `Tech-${Math.floor(Math.random() * 50) + 1}`,
            duration: Math.floor(Math.random() * 60) + 10
        };

        this.maintenanceLogs.unshift(log);

        // Keep only last 10000 logs
        if (this.maintenanceLogs.length > 10000) {
            this.maintenanceLogs.pop();
        }
    }

    getBuildings() {
        return this.buildings;
    }

    getDevices() {
        return this.devices;
    }

    getDevicesByBuilding(buildingId) {
        return this.devices.filter(d => d.buildingId === buildingId);
    }

    getEnergyHistory(minutes = 15) {
        const dataPoints = minutes * 60 * 10; // 10 data points per second
        return this.energyHistory.slice(-dataPoints);
    }

    getMaintenanceLogs() {
        return this.maintenanceLogs;
    }

    getAlerts() {
        return this.alerts;
    }

    getSystemStats() {
        const totalDevices = this.devices.length;
        const operationalDevices = this.devices.filter(d => d.status === 'operational').length;
        const warningDevices = this.devices.filter(d => d.status === 'warning').length;
        const criticalDevices = this.devices.filter(d => d.status === 'critical').length;
        const maintenanceDevices = this.devices.filter(d => d.status === 'maintenance').length;

        const totalEnergy = this.buildings.reduce((sum, b) => sum + b.energyConsumption, 0);
        const totalOccupants = this.buildings.reduce((sum, b) => sum + b.currentOccupancy, 0);
        const totalCapacity = this.buildings.reduce((sum, b) => sum + b.capacity, 0);

        return {
            buildingCount: this.buildings.length,
            deviceCount: totalDevices,
            dataRate: this.dataPointsPerSecond,
            operational: operationalDevices,
            warning: warningDevices,
            critical: criticalDevices,
            maintenance: maintenanceDevices,
            totalEnergy: totalEnergy,
            totalOccupants: totalOccupants,
            totalCapacity: totalCapacity,
            utilizationRate: (totalOccupants / totalCapacity * 100).toFixed(1),
            alertCount: this.alerts.filter(a => !a.acknowledged).length
        };
    }

    getBuildingStats(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building) return null;

        const devices = this.getDevicesByBuilding(buildingId);
        const hvacDevices = devices.filter(d => d.type === 'HVAC');

        const avgTemp = hvacDevices.reduce((sum, d) => sum + (d.temperature || 0), 0) / hvacDevices.length;
        const avgHumidity = hvacDevices.reduce((sum, d) => sum + (d.humidity || 0), 0) / hvacDevices.length;
        const avgAirflow = hvacDevices.reduce((sum, d) => sum + (d.airflow || 0), 0) / hvacDevices.length;

        return {
            building: building,
            devices: devices,
            hvacStats: {
                temperature: avgTemp.toFixed(1),
                humidity: avgHumidity.toFixed(1),
                airflow: Math.floor(avgAirflow),
                power: building.hvacLoad.toFixed(2),
                units: hvacDevices.length,
                activeUnits: hvacDevices.filter(d => d.status === 'operational').length,
                efficiency: (hvacDevices.reduce((sum, d) => sum + d.efficiency, 0) / hvacDevices.length * 100).toFixed(1)
            }
        };
    }

    getOccupancyMap(buildingId) {
        const building = this.buildings.find(b => b.id === buildingId);
        if (!building) return [];

        const zones = 10; // 10x10 grid
        const map = [];

        for (let i = 0; i < zones * zones; i++) {
            const occupancy = Math.random();
            let level = 'low';
            if (occupancy > 0.7) level = 'high';
            else if (occupancy > 0.4) level = 'medium';

            map.push({
                id: i,
                occupancy: occupancy,
                level: level,
                count: Math.floor(occupancy * 50)
            });
        }

        return map;
    }
}

// Initialize the simulator
const simulator = new IoTDataSimulator();