// Table Management for Warehouse Management System

class TableManager {
    constructor() {
        this.currentSortColumn = null;
        this.currentSortDirection = 'asc';
        this.productFilters = {
            search: '',
            category: '',
            status: ''
        };
        this.shipmentFilters = {
            search: '',
            status: ''
        };

        this.initializeEventListeners();
        this.startUpdates();
    }

    initializeEventListeners() {
        // Product table sorting
        const productHeaders = document.querySelectorAll('#productsTable th[data-sort]');
        productHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.sortProductTable(header.dataset.sort);
            });
        });

        // Product filters
        document.getElementById('productSearch').addEventListener('input', (e) => {
            this.productFilters.search = e.target.value.toLowerCase();
            this.updateProductTable();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.productFilters.category = e.target.value;
            this.updateProductTable();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.productFilters.status = e.target.value;
            this.updateProductTable();
        });

        // Shipment table sorting
        const shipmentHeaders = document.querySelectorAll('#shipmentsTable th[data-sort]');
        shipmentHeaders.forEach(header => {
            header.addEventListener('click', () => {
                this.sortShipmentTable(header.dataset.sort);
            });
        });

        // Shipment filters
        document.getElementById('shipmentSearch').addEventListener('input', (e) => {
            this.shipmentFilters.search = e.target.value.toLowerCase();
            this.updateShipmentTable();
        });

        document.getElementById('shipmentStatusFilter').addEventListener('change', (e) => {
            this.shipmentFilters.status = e.target.value;
            this.updateShipmentTable();
        });
    }

    sortProductTable(column) {
        if (this.currentSortColumn === column) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortDirection = 'asc';
        }
        this.updateProductTable();
    }

    sortShipmentTable(column) {
        if (this.currentSortColumn === column) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortColumn = column;
            this.currentSortDirection = 'asc';
        }
        this.updateShipmentTable();
    }

    filterProducts(products) {
        return products.filter(product => {
            // Search filter
            if (this.productFilters.search) {
                const searchMatch =
                    product.productId.toLowerCase().includes(this.productFilters.search) ||
                    product.name.toLowerCase().includes(this.productFilters.search) ||
                    product.supplier.toLowerCase().includes(this.productFilters.search);
                if (!searchMatch) return false;
            }

            // Category filter
            if (this.productFilters.category && product.category !== this.productFilters.category) {
                return false;
            }

            // Status filter
            if (this.productFilters.status && product.status !== this.productFilters.status) {
                return false;
            }

            return true;
        });
    }

    filterShipments(shipments) {
        return shipments.filter(shipment => {
            // Search filter
            if (this.shipmentFilters.search) {
                const searchMatch =
                    shipment.orderId.toLowerCase().includes(this.shipmentFilters.search) ||
                    shipment.productId.toLowerCase().includes(this.shipmentFilters.search) ||
                    shipment.supplier.toLowerCase().includes(this.shipmentFilters.search);
                if (!searchMatch) return false;
            }

            // Status filter
            if (this.shipmentFilters.status && shipment.status !== this.shipmentFilters.status) {
                return false;
            }

            return true;
        });
    }

    sortData(data, column, direction) {
        return [...data].sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            // Handle date sorting
            if (column === 'lastUpdated' || column === 'orderDate' || column === 'estimatedDelivery') {
                aVal = new Date(aVal).getTime();
                bVal = new Date(bVal).getTime();
            }

            // Handle numeric sorting
            if (column === 'stockLevel' || column === 'reorderPoint' || column === 'quantity' || column === 'fulfillmentTime') {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    updateProductTable() {
        let products = simulator.getProducts();

        // Apply filters
        products = this.filterProducts(products);

        // Apply sorting
        if (this.currentSortColumn) {
            products = this.sortData(products, this.currentSortColumn, this.currentSortDirection);
        }

        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = products.map(product => {
            const statusClass = product.status.toLowerCase().replace(/\s+/g, '-');
            const isAlert = product.status === 'Low Stock' || product.status === 'Out of Stock';

            return `
                <tr>
                    <td><strong>${product.productId}</strong></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td class="${isAlert ? 'alert-cell' : ''}">${product.stockLevel}</td>
                    <td>${product.reorderPoint}</td>
                    <td><span class="status-badge status-${statusClass}">${product.status}</span></td>
                    <td>${product.supplier}</td>
                    <td>${this.formatDate(product.lastUpdated)}</td>
                </tr>
            `;
        }).join('');
    }

    updateShipmentTable() {
        let shipments = simulator.getShipments();

        // Apply filters
        shipments = this.filterShipments(shipments);

        // Apply sorting
        if (this.currentSortColumn) {
            shipments = this.sortData(shipments, this.currentSortColumn, this.currentSortDirection);
        }

        const tbody = document.getElementById('shipmentsTableBody');
        tbody.innerHTML = shipments.map(shipment => {
            const statusClass = shipment.status.toLowerCase().replace(/\s+/g, '-');

            return `
                <tr>
                    <td><strong>${shipment.orderId}</strong></td>
                    <td>${shipment.productId}</td>
                    <td>${shipment.quantity}</td>
                    <td><span class="status-badge status-${statusClass}">${shipment.status}</span></td>
                    <td>${shipment.supplier}</td>
                    <td>${this.formatDate(shipment.orderDate)}</td>
                    <td>${this.formatDate(shipment.estimatedDelivery)}</td>
                    <td>${shipment.fulfillmentTime}h</td>
                </tr>
            `;
        }).join('');
    }

    formatDate(date) {
        if (!date) return 'N/A';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    startUpdates() {
        // Update tables every 2 seconds
        setInterval(() => {
            this.updateProductTable();
            this.updateShipmentTable();
        }, 2000);

        // Initial update
        setTimeout(() => {
            this.updateProductTable();
            this.updateShipmentTable();
        }, 100);
    }
}

// Initialize table manager when DOM is ready
let tableManager;
document.addEventListener('DOMContentLoaded', () => {
    tableManager = new TableManager();
});
