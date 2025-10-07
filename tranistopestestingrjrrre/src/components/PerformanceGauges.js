/**
 * PerformanceGauges Component - Display key performance metrics
 */
class PerformanceGauges {
    constructor(options = {}) {
        this.elements = {
            activeVehicles: document.getElementById(options.activeVehiclesId || 'activeVehiclesGauge'),
            avgSpeed: document.getElementById(options.avgSpeedId || 'avgSpeedGauge'),
            totalTrips: document.getElementById(options.totalTripsId || 'totalTripsGauge'),
            onTime: document.getElementById(options.onTimeId || 'onTimeGauge')
        };

        console.log('PerformanceGauges initialized');
    }

    update(metrics) {
        if (!metrics) return;

        if (this.elements.activeVehicles) {
            this.elements.activeVehicles.textContent = metrics.activeVehicles || 0;
        }

        if (this.elements.avgSpeed) {
            this.elements.avgSpeed.textContent = (metrics.averageSpeed || 0).toFixed(1);
        }

        if (this.elements.totalTrips) {
            this.elements.totalTrips.textContent = metrics.totalTrips || 0;
        }

        if (this.elements.onTime) {
            const onTimeRate = metrics.onTimeRate || 0;
            this.elements.onTime.textContent = `${onTimeRate.toFixed(1)}%`;

            // Color coding
            if (onTimeRate >= 90) {
                this.elements.onTime.style.color = '#48bb78';
            } else if (onTimeRate >= 70) {
                this.elements.onTime.style.color = '#ed8936';
            } else {
                this.elements.onTime.style.color = '#f56565';
            }
        }
    }
}
