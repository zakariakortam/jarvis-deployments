// Main Application Controller for Warehouse Management System

class WarehouseApp {
    constructor() {
        this.updateCounter = 0;
        this.initializeApp();
    }

    initializeApp() {
        this.updateSystemTime();
        this.updateKPIs();
        this.startUpdateCycle();
    }

    updateSystemTime() {
        const timeElement = document.getElementById('systemTime');
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateKPIs() {
        const kpis = simulator.getKPIs();

        // Total Inventory Value
        const totalValueElement = document.getElementById('totalValue');
        totalValueElement.textContent = this.formatCurrency(kpis.totalValue);

        // Fill Rate
        const fillRateElement = document.getElementById('fillRate');
        fillRateElement.textContent = `${kpis.fillRate.toFixed(1)}%`;

        // Average Fulfillment Time
        const avgFulfillmentElement = document.getElementById('avgFulfillment');
        avgFulfillmentElement.textContent = `${kpis.avgFulfillment.toFixed(1)}h`;

        // Reorder Alerts
        const reorderAlertsElement = document.getElementById('reorderAlerts');
        reorderAlertsElement.textContent = kpis.reorderAlerts;

        // Update alert indicator
        const alertIndicator = document.getElementById('alertIndicator');
        if (kpis.reorderAlerts > 0) {
            alertIndicator.style.display = 'block';
        } else {
            alertIndicator.style.display = 'none';
        }

        // Color coding for KPIs
        if (kpis.fillRate < 70) {
            fillRateElement.style.color = '#e53e3e';
        } else if (kpis.fillRate < 85) {
            fillRateElement.style.color = '#dd6b20';
        } else {
            fillRateElement.style.color = '#38a169';
        }

        if (kpis.avgFulfillment > 96) {
            avgFulfillmentElement.style.color = '#e53e3e';
        } else if (kpis.avgFulfillment > 72) {
            avgFulfillmentElement.style.color = '#dd6b20';
        } else {
            avgFulfillmentElement.style.color = '#38a169';
        }

        if (kpis.reorderAlerts > 50) {
            reorderAlertsElement.style.color = '#e53e3e';
        } else if (kpis.reorderAlerts > 20) {
            reorderAlertsElement.style.color = '#dd6b20';
        } else {
            reorderAlertsElement.style.color = '#38a169';
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    incrementUpdateCounter() {
        this.updateCounter++;
        document.getElementById('updateCounter').textContent = this.updateCounter;
    }

    startUpdateCycle() {
        // Update system time every second
        setInterval(() => {
            this.updateSystemTime();
        }, 1000);

        // Update KPIs every 2 seconds
        setInterval(() => {
            this.updateKPIs();
            this.incrementUpdateCounter();
        }, 2000);

        // Generate real-time notifications for critical events
        setInterval(() => {
            this.checkForAlerts();
        }, 5000);
    }

    checkForAlerts() {
        const products = simulator.getProducts();
        const criticalProducts = products.filter(p => p.status === 'Out of Stock');

        if (criticalProducts.length > 0 && Math.random() > 0.7) {
            // In a real system, this would trigger notifications
            console.log(`Alert: ${criticalProducts.length} products are out of stock`);
        }

        const lowStockProducts = products.filter(p => p.status === 'Low Stock');
        if (lowStockProducts.length > 30 && Math.random() > 0.8) {
            console.log(`Warning: ${lowStockProducts.length} products are below reorder point`);
        }
    }

    // Export functionality
    exportProductData() {
        const products = simulator.getProducts();
        const csv = this.convertToCSV(products);
        this.downloadCSV(csv, 'warehouse-products.csv');
    }

    exportShipmentData() {
        const shipments = simulator.getShipments();
        const csv = this.convertToCSV(shipments);
        this.downloadCSV(csv, 'warehouse-shipments.csv');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => {
            return Object.values(item).map(val => {
                if (val instanceof Date) {
                    return val.toISOString();
                }
                return typeof val === 'string' ? `"${val}"` : val;
            }).join(',');
        });

        return [headers, ...rows].join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize the application when DOM is ready
let warehouseApp;
document.addEventListener('DOMContentLoaded', () => {
    warehouseApp = new WarehouseApp();
    console.log('Warehouse Management System initialized');
    console.log('System is running with live data simulation');
    console.log('Updates every 2 seconds with continuous data flow');
});

// Make export functions available globally
window.exportProductData = () => warehouseApp.exportProductData();
window.exportShipmentData = () => warehouseApp.exportShipmentData();
