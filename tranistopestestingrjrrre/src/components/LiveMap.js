/**
 * LiveMap Component - Integrates Leaflet map with Transit Simulator
 */
class LiveMap {
    constructor(containerId, options = {}) {
        this.container = containerId;
        this.options = {
            center: options.center || [40.7128, -74.0060],
            zoom: options.zoom || 11
        };
        this.map = null;
        this.markers = new Map();
        this.markerCluster = null;

        this.initialize();
    }

    initialize() {
        // Initialize Leaflet map
        this.map = L.map(this.container).setView(this.options.center, this.options.zoom);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Initialize marker cluster
        this.markerCluster = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true
        });
        this.map.addLayer(this.markerCluster);

        console.log('LiveMap initialized');
    }

    updateVehicles(vehicles) {
        if (!vehicles || vehicles.length === 0) return;

        // Clear existing markers
        this.markerCluster.clearLayers();
        this.markers.clear();

        // Add new markers
        vehicles.forEach(vehicle => {
            const marker = L.marker([vehicle.lat, vehicle.lon], {
                icon: this.getVehicleIcon(vehicle.type, vehicle.status)
            });

            marker.bindPopup(`
                <strong>${vehicle.type.toUpperCase()} ${vehicle.id}</strong><br>
                Route: ${vehicle.route}<br>
                Speed: ${vehicle.speed} km/h<br>
                Passengers: ${vehicle.passengers}/${vehicle.capacity}
            `);

            this.markers.set(vehicle.id, marker);
            this.markerCluster.addLayer(marker);
        });
    }

    getVehicleIcon(type, status) {
        const colors = {
            bus: '#4299e1',
            train: '#48bb78',
            tram: '#ed8936',
            ferry: '#38b2ac'
        };

        const statusColors = {
            active: '#48bb78',
            delayed: '#ed8936',
            maintenance: '#f56565'
        };

        const color = colors[type] || colors.bus;

        return L.divIcon({
            html: `<div style="background: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
            className: 'vehicle-marker',
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });
    }
}
