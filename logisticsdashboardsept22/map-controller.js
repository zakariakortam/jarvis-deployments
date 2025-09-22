class MapController {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.warehouseMarkers = new Map();
        this.routePolylines = new Map();
        this.markerCluster = null;
        
        this.truckIcon = null;
        this.warehouseIcon = null;
        
        this.init();
    }

    init() {
        this.createCustomIcons();
        this.initializeMap();
        this.setupEventListeners();
        this.addWarehouseMarkers();
        
        // Subscribe to data updates
        window.logisticsSimulator.subscribe('fleetUpdate', (fleetData) => {
            this.updateFleetMarkers(fleetData);
        });
        
        window.logisticsSimulator.subscribe('warehouseUpdate', (warehouseData) => {
            this.updateWarehouseMarkers(warehouseData);
        });
    }

    createCustomIcons() {
        // Truck icons for different statuses
        this.truckIcons = {
            'in-transit': L.divIcon({
                html: '<div class="truck-marker in-transit"><i class="🚛"></i></div>',
                className: 'custom-truck-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }),
            'loading': L.divIcon({
                html: '<div class="truck-marker loading"><i class="📦"></i></div>',
                className: 'custom-truck-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }),
            'unloading': L.divIcon({
                html: '<div class="truck-marker unloading"><i class="📤</i></div>',
                className: 'custom-truck-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }),
            'maintenance': L.divIcon({
                html: '<div class="truck-marker maintenance"><i class="🔧</i></div>',
                className: 'custom-truck-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            }),
            'idle': L.divIcon({
                html: '<div class="truck-marker idle"><i class="⏸️</i></div>',
                className: 'custom-truck-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                popupAnchor: [0, -15]
            })
        };

        this.warehouseIcon = L.divIcon({
            html: '<div class="warehouse-marker"><i class="🏢</i></div>',
            className: 'custom-warehouse-marker',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });
        
        // Add CSS for custom markers
        this.addMarkerStyles();
    }

    addMarkerStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .truck-marker {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                border: 2px solid #fff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .truck-marker:hover {
                transform: scale(1.1);
            }
            .truck-marker.in-transit { background: #3498db; }
            .truck-marker.loading { background: #f39c12; }
            .truck-marker.unloading { background: #e67e22; }
            .truck-marker.maintenance { background: #e74c3c; }
            .truck-marker.idle { background: #95a5a6; }
            
            .warehouse-marker {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                background: #2c3e50;
                border: 3px solid #3498db;
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            }
            
            .route-line {
                stroke: #3498db;
                stroke-width: 3;
                stroke-dasharray: 10,5;
                animation: dash 20s linear infinite;
            }
            
            @keyframes dash {
                to {
                    stroke-dashoffset: -35;
                }
            }
        `;
        document.head.appendChild(style);
    }

    initializeMap() {
        // Initialize map centered on Japan
        this.map = L.map('fleet-map').setView([36.2048, 138.2529], 6);

        // Add tile layer with dark theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(this.map);

        // Add map controls
        this.addMapControls();
        
        // Initialize with fleet data
        this.updateFleetMarkers(window.logisticsSimulator.getFleetData());
    }

    addMapControls() {
        // Custom control for map options
        const mapControl = L.control({ position: 'topright' });
        mapControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-controls');
            div.innerHTML = `
                <div class="control-panel">
                    <label><input type="checkbox" id="show-routes" checked> Show Routes</label>
                    <label><input type="checkbox" id="show-warehouses" checked> Warehouses</label>
                    <label><input type="checkbox" id="cluster-trucks" checked> Cluster Trucks</label>
                    <select id="truck-filter">
                        <option value="all">All Trucks</option>
                        <option value="in-transit">In Transit</option>
                        <option value="loading">Loading</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
            `;
            
            // Prevent map interaction when using controls
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);
            
            return div;
        };
        mapControl.addTo(this.map);
        
        // Add control styles
        const controlStyle = document.createElement('style');
        controlStyle.textContent = `
            .map-controls {
                background: rgba(30, 40, 56, 0.95);
                padding: 10px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
            }
            .control-panel {
                display: flex;
                flex-direction: column;
                gap: 8px;
                min-width: 150px;
            }
            .control-panel label {
                color: #ecf0f1;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .control-panel select {
                background: #1e2838;
                color: #ecf0f1;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
            }
        `;
        document.head.appendChild(controlStyle);
    }

    setupEventListeners() {
        // Map control event listeners
        document.addEventListener('change', (e) => {
            if (e.target.id === 'show-routes') {
                this.toggleRoutes(e.target.checked);
            } else if (e.target.id === 'show-warehouses') {
                this.toggleWarehouses(e.target.checked);
            } else if (e.target.id === 'cluster-trucks') {
                this.toggleClustering(e.target.checked);
            } else if (e.target.id === 'truck-filter') {
                this.filterTrucks(e.target.value);
            }
        });
    }

    addWarehouseMarkers() {
        const warehouseData = window.logisticsSimulator.getWarehouseData();
        
        warehouseData.forEach(warehouse => {
            const marker = L.marker(
                [warehouse.location.lat, warehouse.location.lng],
                { icon: this.warehouseIcon }
            ).addTo(this.map);
            
            const popupContent = `
                <div class="warehouse-popup">
                    <h3>${warehouse.name}</h3>
                    <div class="warehouse-stats">
                        <div class="stat-row">
                            <span>Capacity:</span>
                            <span>${warehouse.current.toLocaleString()}/${warehouse.capacity.toLocaleString()}</span>
                        </div>
                        <div class="stat-row">
                            <span>Utilization:</span>
                            <span>${Math.round(warehouse.current / warehouse.capacity * 100)}%</span>
                        </div>
                        <div class="stat-row">
                            <span>Inbound:</span>
                            <span class="highlight-blue">${warehouse.inbound}</span>
                        </div>
                        <div class="stat-row">
                            <span>Outbound:</span>
                            <span class="highlight-orange">${warehouse.outbound}</span>
                        </div>
                        <div class="stat-row">
                            <span>Temperature:</span>
                            <span>${warehouse.temperature}°C</span>
                        </div>
                        <div class="stat-row">
                            <span>Humidity:</span>
                            <span>${warehouse.humidity}%</span>
                        </div>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            this.warehouseMarkers.set(warehouse.id, marker);
        });
        
        // Add popup styles
        const popupStyle = document.createElement('style');
        popupStyle.textContent = `
            .warehouse-popup h3 {
                margin: 0 0 10px 0;
                color: #3498db;
                font-size: 16px;
            }
            .warehouse-stats {
                font-size: 12px;
            }
            .stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                padding: 2px 0;
            }
            .highlight-blue { color: #3498db; font-weight: bold; }
            .highlight-orange { color: #f39c12; font-weight: bold; }
        `;
        document.head.appendChild(popupStyle);
    }

    updateFleetMarkers(fleetData) {
        // Clear existing markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers.clear();
        
        // Add updated markers
        fleetData.forEach(truck => {
            const icon = this.truckIcons[truck.status] || this.truckIcons['idle'];
            const marker = L.marker([truck.position.lat, truck.position.lng], { icon });
            
            const popupContent = `
                <div class="truck-popup">
                    <h3>${truck.id}</h3>
                    <div class="truck-info">
                        <div class="info-row">
                            <span>Driver:</span>
                            <span>${truck.driver}</span>
                        </div>
                        <div class="info-row">
                            <span>Status:</span>
                            <span class="status-${truck.status}">${truck.status.replace('-', ' ').toUpperCase()}</span>
                        </div>
                        <div class="info-row">
                            <span>Route:</span>
                            <span>${truck.origin} → ${truck.destination}</span>
                        </div>
                        <div class="info-row">
                            <span>Speed:</span>
                            <span>${truck.speed} km/h</span>
                        </div>
                        <div class="info-row">
                            <span>Fuel:</span>
                            <span class="fuel-level-${truck.fuelLevel > 30 ? 'good' : truck.fuelLevel > 15 ? 'warning' : 'critical'}">${truck.fuelLevel}%</span>
                        </div>
                        <div class="info-row">
                            <span>Cargo:</span>
                            <span>${truck.cargo.toLocaleString()} kg</span>
                        </div>
                        <div class="info-row">
                            <span>ETA:</span>
                            <span>${new Date(truck.eta).toLocaleTimeString()}</span>
                        </div>
                        <div class="info-row">
                            <span>Last Update:</span>
                            <span>${truck.lastUpdate.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.addTo(this.map);
            this.markers.set(truck.id, marker);
            
            // Add route line if in transit
            if (truck.status === 'in-transit') {
                this.addRouteForTruck(truck);
            }
        });
        
        // Add truck popup styles
        this.addTruckPopupStyles();
    }

    addTruckPopupStyles() {
        if (document.getElementById('truck-popup-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'truck-popup-styles';
        style.textContent = `
            .truck-popup h3 {
                margin: 0 0 10px 0;
                color: #3498db;
                font-size: 16px;
                font-weight: bold;
            }
            .truck-info {
                font-size: 12px;
                min-width: 200px;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                padding: 2px 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .info-row:last-child {
                border-bottom: none;
            }
            .status-in-transit { color: #3498db; font-weight: bold; }
            .status-loading { color: #f39c12; font-weight: bold; }
            .status-unloading { color: #e67e22; font-weight: bold; }
            .status-maintenance { color: #e74c3c; font-weight: bold; }
            .status-idle { color: #95a5a6; font-weight: bold; }
            .fuel-level-good { color: #27ae60; font-weight: bold; }
            .fuel-level-warning { color: #f39c12; font-weight: bold; }
            .fuel-level-critical { color: #e74c3c; font-weight: bold; }
        `;
        document.head.appendChild(style);
    }

    addRouteForTruck(truck) {
        // Simple route simulation (in real app, would use routing service)
        const routeCoords = [
            [truck.position.lat, truck.position.lng],
            [truck.position.lat + (Math.random() - 0.5) * 0.1, truck.position.lng + (Math.random() - 0.5) * 0.1]
        ];
        
        const routeLine = L.polyline(routeCoords, {
            color: '#3498db',
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
        });
        
        routeLine.addTo(this.map);
        this.routePolylines.set(truck.id, routeLine);
    }

    updateWarehouseMarkers(warehouseData) {
        warehouseData.forEach(warehouse => {
            const marker = this.warehouseMarkers.get(warehouse.id);
            if (marker) {
                const popupContent = `
                    <div class="warehouse-popup">
                        <h3>${warehouse.name}</h3>
                        <div class="warehouse-stats">
                            <div class="stat-row">
                                <span>Capacity:</span>
                                <span>${warehouse.current.toLocaleString()}/${warehouse.capacity.toLocaleString()}</span>
                            </div>
                            <div class="stat-row">
                                <span>Utilization:</span>
                                <span>${Math.round(warehouse.current / warehouse.capacity * 100)}%</span>
                            </div>
                            <div class="stat-row">
                                <span>Inbound:</span>
                                <span class="highlight-blue">${warehouse.inbound}</span>
                            </div>
                            <div class="stat-row">
                                <span>Outbound:</span>
                                <span class="highlight-orange">${warehouse.outbound}</span>
                            </div>
                            <div class="stat-row">
                                <span>Temperature:</span>
                                <span>${warehouse.temperature.toFixed(1)}°C</span>
                            </div>
                            <div class="stat-row">
                                <span>Humidity:</span>
                                <span>${warehouse.humidity.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `;
                marker.setPopupContent(popupContent);
            }
        });
    }

    toggleRoutes(show) {
        this.routePolylines.forEach(polyline => {
            if (show) {
                polyline.addTo(this.map);
            } else {
                this.map.removeLayer(polyline);
            }
        });
    }

    toggleWarehouses(show) {
        this.warehouseMarkers.forEach(marker => {
            if (show) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    toggleClustering(enable) {
        // Simple clustering simulation
        if (enable && !this.markerCluster) {
            // Would use a clustering library in production
            console.log('Clustering enabled');
        } else if (!enable && this.markerCluster) {
            console.log('Clustering disabled');
        }
    }

    filterTrucks(status) {
        this.markers.forEach((marker, truckId) => {
            const fleetData = window.logisticsSimulator.getFleetData();
            const truck = fleetData.find(t => t.id === truckId);
            
            if (status === 'all' || truck.status === status) {
                marker.addTo(this.map);
            } else {
                this.map.removeLayer(marker);
            }
        });
    }

    focusOnTruck(truckId) {
        const marker = this.markers.get(truckId);
        if (marker) {
            this.map.setView(marker.getLatLng(), 12);
            marker.openPopup();
        }
    }

    fitBounds() {
        if (this.markers.size > 0) {
            const group = new L.featureGroup(Array.from(this.markers.values()));
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mapController = new MapController();
});