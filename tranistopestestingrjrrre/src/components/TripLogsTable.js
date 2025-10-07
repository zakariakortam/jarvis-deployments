/**
 * TripLogsTable Component - Display recent trip logs
 */
class TripLogsTable {
    constructor(tbodyId, options = {}) {
        this.tbody = document.getElementById(tbodyId);
        this.trips = [];
        this.maxRows = options.maxRows || 10;

        console.log('TripLogsTable initialized');
    }

    addTrip(trip) {
        this.trips.unshift(trip);

        // Limit rows
        if (this.trips.length > this.maxRows) {
            this.trips.pop();
        }

        this.render();
    }

    render() {
        if (!this.tbody) return;

        if (this.trips.length === 0) {
            this.tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #718096;">
                        No trip data available yet.
                    </td>
                </tr>
            `;
            return;
        }

        this.tbody.innerHTML = this.trips.map(trip => `
            <tr>
                <td>${trip.vehicleId || 'N/A'}</td>
                <td>${trip.route || 'N/A'}</td>
                <td>
                    <span class="status-badge ${trip.status || 'active'}">${trip.status || 'Active'}</span>
                </td>
                <td>${(trip.speed || 0).toFixed(1)} km/h</td>
                <td>${trip.passengers || 0}</td>
                <td>${this.formatTime(trip.timestamp)}</td>
            </tr>
        `).join('');
    }

    formatTime(timestamp) {
        const date = new Date(timestamp || Date.now());
        return date.toLocaleTimeString();
    }
}
