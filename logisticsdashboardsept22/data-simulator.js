class LogisticsDataSimulator {
    constructor() {
        this.fleetData = [];
        this.shipmentData = [];
        this.warehouseData = [];
        this.timeSeriesData = {
            deliveries: [],
            fuel: [],
            costs: []
        };
        this.kpiData = {
            activeTrucks: 127,
            deliveriesToday: 342,
            fuelEfficiency: 7.2,
            costSavings: 2800000
        };
        
        this.isRunning = false;
        this.updateInterval = 2000; // 2 seconds
        this.subscribers = {};
        
        this.initializeData();
    }

    initializeData() {
        this.generateFleetData();
        this.generateShipmentData();
        this.generateWarehouseData();
        this.generateTimeSeriesData();
    }

    generateFleetData() {
        const cities = [
            { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Osaka', lat: 34.6937, lng: 135.5023 },
            { name: 'Yokohama', lat: 35.4437, lng: 139.6380 },
            { name: 'Nagoya', lat: 35.1815, lng: 136.9066 },
            { name: 'Kobe', lat: 34.6901, lng: 135.1956 },
            { name: 'Kyoto', lat: 35.0116, lng: 135.7681 }
        ];
        
        const drivers = [
            'Tanaka Hiroshi', 'Sato Kenji', 'Suzuki Akira', 'Watanabe Yuki',
            'Ito Masaki', 'Yamamoto Taro', 'Nakamura Shin', 'Kobayashi Jun',
            'Kato Ryu', 'Yoshida Hana', 'Yamada Ken', 'Sasaki Yui'
        ];
        
        const truckTypes = ['Standard', 'Refrigerated', 'Heavy Duty', 'Express'];
        const statuses = ['in-transit', 'loading', 'unloading', 'maintenance', 'idle'];
        
        this.fleetData = [];
        for (let i = 0; i < 127; i++) {
            const origin = cities[Math.floor(Math.random() * cities.length)];
            const destination = cities[Math.floor(Math.random() * cities.length)];
            
            // Generate GPS position along route
            const progress = Math.random();
            const lat = origin.lat + (destination.lat - origin.lat) * progress;
            const lng = origin.lng + (destination.lng - origin.lng) * progress;
            
            const truck = {
                id: `TRK${(1000 + i).toString()}`,
                driver: drivers[Math.floor(Math.random() * drivers.length)],
                type: truckTypes[Math.floor(Math.random() * truckTypes.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                position: { lat, lng },
                origin: origin.name,
                destination: destination.name,
                speed: Math.floor(Math.random() * 80 + 40), // 40-120 km/h
                fuelLevel: Math.floor(Math.random() * 100),
                cargo: Math.floor(Math.random() * 15000 + 5000), // 5-20 tons
                eta: new Date(Date.now() + Math.random() * 8 * 3600000), // 0-8 hours
                lastUpdate: new Date()
            };
            
            this.fleetData.push(truck);
        }
    }

    generateShipmentData() {
        const origins = ['Tokyo Central', 'Osaka Hub', 'Yokohama Port', 'Nagoya DC', 'Kobe Terminal'];
        const destinations = ['Tokyo East', 'Osaka South', 'Yokohama Center', 'Nagoya West', 'Kobe North'];
        const statuses = ['in-transit', 'delivered', 'delayed', 'pending'];
        const priorities = ['high', 'medium', 'low'];
        
        this.shipmentData = [];
        for (let i = 0; i < 150; i++) {
            const shipment = {
                id: `SHP${(10000 + i).toString()}`,
                origin: origins[Math.floor(Math.random() * origins.length)],
                destination: destinations[Math.floor(Math.random() * destinations.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                driver: this.fleetData[Math.floor(Math.random() * this.fleetData.length)].driver,
                eta: new Date(Date.now() + Math.random() * 24 * 3600000),
                weight: Math.floor(Math.random() * 10000 + 1000),
                value: Math.floor(Math.random() * 500000 + 50000),
                created: new Date(Date.now() - Math.random() * 7 * 24 * 3600000)
            };
            
            this.shipmentData.push(shipment);
        }
    }

    generateWarehouseData() {
        this.warehouseData = [
            {
                id: 'WH001',
                name: 'Tokyo Central',
                location: { lat: 35.6762, lng: 139.6503 },
                capacity: 20000,
                current: 15240,
                inbound: 23,
                outbound: 67,
                temperature: 22,
                humidity: 45,
                security: 'active'
            },
            {
                id: 'WH002',
                name: 'Osaka Hub',
                location: { lat: 34.6937, lng: 135.5023 },
                capacity: 18000,
                current: 12890,
                inbound: 18,
                outbound: 45,
                temperature: 21,
                humidity: 48,
                security: 'active'
            },
            {
                id: 'WH003',
                name: 'Yokohama Port',
                location: { lat: 35.4437, lng: 139.6380 },
                capacity: 15000,
                current: 8567,
                inbound: 31,
                outbound: 28,
                temperature: 23,
                humidity: 52,
                security: 'active'
            }
        ];
    }

    generateTimeSeriesData() {
        const now = new Date();
        const hours = 24;
        
        // Generate delivery performance data
        for (let i = hours; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 3600000);
            this.timeSeriesData.deliveries.push({
                time: time.toISOString(),
                completed: Math.floor(Math.random() * 30 + 10),
                onTime: Math.floor(Math.random() * 25 + 15),
                delayed: Math.floor(Math.random() * 5 + 1)
            });
        }
        
        // Generate fuel consumption data
        for (let i = hours; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 3600000);
            this.timeSeriesData.fuel.push({
                time: time.toISOString(),
                consumption: Math.random() * 2000 + 3000, // Liters
                efficiency: Math.random() * 2 + 6, // L/100km
                cost: Math.random() * 200000 + 400000 // Yen
            });
        }
        
        // Generate cost analysis data
        for (let i = hours; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 3600000);
            this.timeSeriesData.costs.push({
                time: time.toISOString(),
                fuel: Math.random() * 200000 + 400000,
                maintenance: Math.random() * 100000 + 50000,
                driver: Math.random() * 150000 + 200000,
                insurance: Math.random() * 50000 + 30000
            });
        }
    }

    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    notify(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(callback => callback(data));
        }
    }

    updateFleetPositions() {
        this.fleetData.forEach(truck => {
            if (truck.status === 'in-transit') {
                // Simulate movement along route
                const speedKmh = truck.speed;
                const speedDegreePerSec = (speedKmh / 111320) / 3600; // Rough conversion
                
                // Random movement in route direction
                const bearing = Math.random() * 2 * Math.PI;
                const distance = speedDegreePerSec * 2; // 2 second interval
                
                truck.position.lat += Math.cos(bearing) * distance;
                truck.position.lng += Math.sin(bearing) * distance;
                truck.lastUpdate = new Date();
                
                // Update fuel level
                truck.fuelLevel = Math.max(0, truck.fuelLevel - Math.random() * 0.5);
                
                // Update speed with variation
                truck.speed = Math.max(20, Math.min(120, truck.speed + (Math.random() - 0.5) * 10));
            }
        });
        
        this.notify('fleetUpdate', this.fleetData);
    }

    updateKPIs() {
        // Simulate real-time KPI changes
        this.kpiData.activeTrucks = Math.max(120, Math.min(135, 
            this.kpiData.activeTrucks + Math.floor((Math.random() - 0.5) * 3)));
        
        this.kpiData.deliveriesToday += Math.floor(Math.random() * 3);
        
        this.kpiData.fuelEfficiency = Math.max(6.5, Math.min(8.0, 
            this.kpiData.fuelEfficiency + (Math.random() - 0.5) * 0.1));
        
        this.kpiData.costSavings += Math.floor((Math.random() - 0.3) * 10000);
        
        this.notify('kpiUpdate', this.kpiData);
    }

    updateWarehouseData() {
        this.warehouseData.forEach(warehouse => {
            // Simulate inventory changes
            const inboundChange = Math.floor(Math.random() * 5);
            const outboundChange = Math.floor(Math.random() * 5);
            
            warehouse.inbound = Math.max(0, warehouse.inbound + inboundChange - outboundChange);
            warehouse.outbound = Math.max(0, warehouse.outbound + outboundChange - inboundChange);
            
            warehouse.current = Math.max(0, Math.min(warehouse.capacity, 
                warehouse.current + inboundChange - outboundChange));
            
            // Update environmental conditions
            warehouse.temperature = Math.max(18, Math.min(25, 
                warehouse.temperature + (Math.random() - 0.5) * 0.5));
            warehouse.humidity = Math.max(40, Math.min(60, 
                warehouse.humidity + (Math.random() - 0.5) * 2));
        });
        
        this.notify('warehouseUpdate', this.warehouseData);
    }

    addNewTimeSeriesData() {
        const now = new Date();
        
        // Add new delivery data point
        this.timeSeriesData.deliveries.push({
            time: now.toISOString(),
            completed: Math.floor(Math.random() * 30 + 10),
            onTime: Math.floor(Math.random() * 25 + 15),
            delayed: Math.floor(Math.random() * 5 + 1)
        });
        
        // Add new fuel data point
        this.timeSeriesData.fuel.push({
            time: now.toISOString(),
            consumption: Math.random() * 2000 + 3000,
            efficiency: Math.random() * 2 + 6,
            cost: Math.random() * 200000 + 400000
        });
        
        // Add new cost data point
        this.timeSeriesData.costs.push({
            time: now.toISOString(),
            fuel: Math.random() * 200000 + 400000,
            maintenance: Math.random() * 100000 + 50000,
            driver: Math.random() * 150000 + 200000,
            insurance: Math.random() * 50000 + 30000
        });
        
        // Keep only last 24 hours of data
        const cutoff = new Date(now.getTime() - 24 * 3600000);
        ['deliveries', 'fuel', 'costs'].forEach(type => {
            this.timeSeriesData[type] = this.timeSeriesData[type].filter(
                point => new Date(point.time) > cutoff
            );
        });
        
        this.notify('timeSeriesUpdate', this.timeSeriesData);
    }

    updateShipmentStatuses() {
        // Randomly update shipment statuses
        const numUpdates = Math.floor(Math.random() * 3);
        for (let i = 0; i < numUpdates; i++) {
            const randomIndex = Math.floor(Math.random() * this.shipmentData.length);
            const shipment = this.shipmentData[randomIndex];
            
            if (shipment.status === 'pending') {
                shipment.status = 'in-transit';
            } else if (shipment.status === 'in-transit' && Math.random() > 0.8) {
                shipment.status = Math.random() > 0.1 ? 'delivered' : 'delayed';
            }
        }
        
        this.notify('shipmentUpdate', this.shipmentData);
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.updateFleetPositions();
            this.updateKPIs();
            this.updateWarehouseData();
            this.addNewTimeSeriesData();
            this.updateShipmentStatuses();
        }, this.updateInterval);
        
        console.log('Data simulator started');
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.intervalId);
        console.log('Data simulator stopped');
    }

    getFleetData() {
        return this.fleetData;
    }

    getShipmentData() {
        return this.shipmentData;
    }

    getWarehouseData() {
        return this.warehouseData;
    }

    getTimeSeriesData() {
        return this.timeSeriesData;
    }

    getKPIData() {
        return this.kpiData;
    }
}

// Global instance
window.logisticsSimulator = new LogisticsDataSimulator();