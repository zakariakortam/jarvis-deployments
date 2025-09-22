class TableController {
    constructor() {
        this.shipmentData = [];
        this.filteredData = [];
        this.sortColumn = 'id';
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.statusFilter = 'all';
        
        this.currentLanguage = 'en';
        
        this.statusLabels = {
            'in-transit': { en: 'In Transit', jp: '輸送中' },
            'delivered': { en: 'Delivered', jp: '配送完了' },
            'delayed': { en: 'Delayed', jp: '遅延' },
            'pending': { en: 'Pending', jp: '保留中' }
        };
        
        this.priorityLabels = {
            'high': { en: 'High', jp: '高' },
            'medium': { en: 'Medium', jp: '中' },
            'low': { en: 'Low', jp: '低' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialData();
        
        // Subscribe to data updates
        window.logisticsSimulator.subscribe('shipmentUpdate', (data) => {
            this.updateTableData(data);
        });
        
        // Subscribe to language changes
        if (window.languageController) {
            window.languageController.subscribe('languageChanged', (lang) => {
                this.currentLanguage = lang;
                this.renderTable();
            });
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndSort();
            });
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.statusFilter = e.target.value;
                this.filterAndSort();
            });
        }

        // Table header sorting
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable')) {
                const column = e.target.dataset.sort;
                this.sortTable(column);
            }
        });

        // Row click for details
        document.addEventListener('click', (e) => {
            if (e.target.closest('.shipment-row')) {
                const row = e.target.closest('.shipment-row');
                const shipmentId = row.dataset.shipmentId;
                this.showShipmentDetails(shipmentId);
            }
        });
    }

    loadInitialData() {
        this.shipmentData = window.logisticsSimulator.getShipmentData();
        this.filterAndSort();
    }

    updateTableData(newData) {
        this.shipmentData = newData;
        this.filterAndSort();
    }

    filterAndSort() {
        // Filter data
        this.filteredData = this.shipmentData.filter(shipment => {
            // Search filter
            const searchMatch = this.searchTerm === '' || 
                shipment.id.toLowerCase().includes(this.searchTerm) ||
                shipment.origin.toLowerCase().includes(this.searchTerm) ||
                shipment.destination.toLowerCase().includes(this.searchTerm) ||
                shipment.driver.toLowerCase().includes(this.searchTerm);

            // Status filter
            const statusMatch = this.statusFilter === 'all' || 
                shipment.status === this.statusFilter;

            return searchMatch && statusMatch;
        });

        // Sort data
        this.filteredData.sort((a, b) => {
            let aVal = a[this.sortColumn];
            let bVal = b[this.sortColumn];

            // Handle special cases
            if (this.sortColumn === 'eta' || this.sortColumn === 'created') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            let comparison = 0;
            if (aVal > bVal) comparison = 1;
            if (aVal < bVal) comparison = -1;

            return this.sortDirection === 'desc' ? -comparison : comparison;
        });

        this.renderTable();
        this.updateTableStats();
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        // Update sort indicators
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === column) {
                th.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        this.filterAndSort();
    }

    renderTable() {
        const tbody = document.getElementById('shipments-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.filteredData.forEach((shipment, index) => {
            const row = document.createElement('tr');
            row.className = 'shipment-row';
            row.dataset.shipmentId = shipment.id;
            
            // Add animation delay for smooth loading
            row.style.animationDelay = `${index * 50}ms`;
            row.classList.add('table-row-fade-in');

            const statusClass = `status-${shipment.status.replace('-', '')}`;
            const priorityClass = `priority-${shipment.priority}`;
            
            const eta = new Date(shipment.eta);
            const isOverdue = eta < new Date() && shipment.status !== 'delivered';
            
            row.innerHTML = `
                <td class="shipment-id">${shipment.id}</td>
                <td class="origin">${shipment.origin}</td>
                <td class="destination">${shipment.destination}</td>
                <td class="status">
                    <span class="status-badge ${statusClass}">
                        ${this.getLocalizedStatus(shipment.status)}
                    </span>
                    ${isOverdue ? '<span class="overdue-indicator">⚠️</span>' : ''}
                </td>
                <td class="eta ${isOverdue ? 'overdue' : ''}">
                    ${this.formatDateTime(eta)}
                </td>
                <td class="driver">${shipment.driver}</td>
                <td class="priority">
                    <span class="${priorityClass}">
                        ${this.getLocalizedPriority(shipment.priority)}
                    </span>
                </td>
            `;

            // Add click handler for row expansion
            row.addEventListener('click', () => {
                this.toggleRowDetails(row, shipment);
            });

            tbody.appendChild(row);
        });

        // Add table animation styles
        this.addTableAnimationStyles();
    }

    addTableAnimationStyles() {
        if (document.getElementById('table-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'table-animations';
        style.textContent = `
            .table-row-fade-in {
                opacity: 0;
                transform: translateY(10px);
                animation: fadeInUp 0.5s ease forwards;
            }
            
            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .shipment-row {
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .shipment-row:hover {
                background-color: rgba(52, 152, 219, 0.1);
                transform: scale(1.01);
            }
            
            .shipment-row.expanded {
                background-color: rgba(52, 152, 219, 0.05);
            }
            
            .row-details {
                background-color: rgba(30, 40, 56, 0.8);
                padding: 1rem;
                border-left: 4px solid var(--accent-color);
            }
            
            .details-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
            }
            
            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }
            
            .detail-label {
                font-size: 0.75rem;
                color: var(--text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .detail-value {
                font-size: 0.875rem;
                color: var(--text-primary);
                font-weight: 500;
            }
            
            .overdue {
                color: var(--danger-color);
                font-weight: bold;
            }
            
            .overdue-indicator {
                margin-left: 0.5rem;
                animation: blink 1s infinite;
            }
            
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }
            
            .sortable {
                position: relative;
                user-select: none;
                cursor: pointer;
            }
            
            .sortable:hover {
                background-color: rgba(52, 152, 219, 0.1);
            }
            
            .sortable::after {
                content: '↕';
                position: absolute;
                right: 8px;
                opacity: 0.5;
                font-size: 0.8rem;
            }
            
            .sortable.sort-asc::after {
                content: '↑';
                opacity: 1;
                color: var(--accent-color);
            }
            
            .sortable.sort-desc::after {
                content: '↓';
                opacity: 1;
                color: var(--accent-color);
            }
        `;
        document.head.appendChild(style);
    }

    toggleRowDetails(row, shipment) {
        const existingDetails = row.nextElementSibling;
        
        if (existingDetails && existingDetails.classList.contains('row-details')) {
            // Remove existing details
            existingDetails.remove();
            row.classList.remove('expanded');
        } else {
            // Add details row
            const detailsRow = document.createElement('tr');
            detailsRow.className = 'row-details';
            
            const detailsCell = document.createElement('td');
            detailsCell.colSpan = 7;
            
            const progress = this.calculateProgress(shipment);
            const estimatedCost = this.calculateEstimatedCost(shipment);
            
            detailsCell.innerHTML = `
                <div class="details-content">
                    <div class="details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Shipment Weight</span>
                            <span class="detail-value">${shipment.weight.toLocaleString()} kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Cargo Value</span>
                            <span class="detail-value">¥${shipment.value.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created Date</span>
                            <span class="detail-value">${this.formatDateTime(shipment.created)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Progress</span>
                            <span class="detail-value">${progress}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Estimated Cost</span>
                            <span class="detail-value">¥${estimatedCost.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Tracking URL</span>
                            <span class="detail-value">
                                <a href="#" onclick="navigator.clipboard.writeText('https://track.logistics.com/${shipment.id}')">
                                    Copy Link
                                </a>
                            </span>
                        </div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="action-buttons">
                        <button onclick="window.mapController.focusOnTruck('${shipment.id}')" class="btn-sm btn-primary">
                            View on Map
                        </button>
                        <button onclick="window.tableController.exportShipment('${shipment.id}')" class="btn-sm btn-secondary">
                            Export Details
                        </button>
                        <button onclick="window.tableController.notifyCustomer('${shipment.id}')" class="btn-sm btn-success">
                            Notify Customer
                        </button>
                    </div>
                </div>
            `;
            
            detailsRow.appendChild(detailsCell);
            row.parentNode.insertBefore(detailsRow, row.nextSibling);
            row.classList.add('expanded');
            
            // Add progress bar and action button styles
            this.addDetailStyles();
        }
    }

    addDetailStyles() {
        if (document.getElementById('detail-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'detail-styles';
        style.textContent = `
            .progress-bar {
                width: 100%;
                height: 8px;
                background-color: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                margin: 1rem 0;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--accent-color), var(--success-color));
                border-radius: 4px;
                transition: width 0.3s ease;
            }
            
            .action-buttons {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
            }
            
            .btn-sm {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .btn-primary {
                background: var(--accent-color);
                color: white;
            }
            
            .btn-primary:hover {
                background: #2980b9;
                transform: translateY(-1px);
            }
            
            .btn-secondary {
                background: var(--secondary-color);
                color: white;
            }
            
            .btn-secondary:hover {
                background: #7f8c8d;
                transform: translateY(-1px);
            }
            
            .btn-success {
                background: var(--success-color);
                color: white;
            }
            
            .btn-success:hover {
                background: #229954;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    calculateProgress(shipment) {
        const now = new Date();
        const created = new Date(shipment.created);
        const eta = new Date(shipment.eta);
        
        if (shipment.status === 'delivered') return 100;
        if (shipment.status === 'pending') return 0;
        
        const totalTime = eta.getTime() - created.getTime();
        const elapsed = now.getTime() - created.getTime();
        
        return Math.min(Math.max(Math.round((elapsed / totalTime) * 100), 0), 95);
    }

    calculateEstimatedCost(shipment) {
        // Simple cost estimation based on weight and distance
        const baseCost = 5000; // Base delivery cost
        const weightCost = shipment.weight * 2; // Per kg
        const valueCost = shipment.value * 0.001; // Insurance cost
        const priorityMultiplier = shipment.priority === 'high' ? 1.5 : shipment.priority === 'medium' ? 1.2 : 1.0;
        
        return Math.round((baseCost + weightCost + valueCost) * priorityMultiplier);
    }

    updateTableStats() {
        // Update filter counts and statistics
        const totalShipments = this.shipmentData.length;
        const filteredCount = this.filteredData.length;
        
        const stats = {
            total: totalShipments,
            filtered: filteredCount,
            inTransit: this.filteredData.filter(s => s.status === 'in-transit').length,
            delivered: this.filteredData.filter(s => s.status === 'delivered').length,
            delayed: this.filteredData.filter(s => s.status === 'delayed').length,
            overdue: this.filteredData.filter(s => new Date(s.eta) < new Date() && s.status !== 'delivered').length
        };
        
        // Update table header with stats if needed
        this.displayTableStats(stats);
    }

    displayTableStats(stats) {
        const tableHeader = document.querySelector('.table-header h2');
        if (tableHeader) {
            const statsText = this.currentLanguage === 'jp' 
                ? `アクティブな出荷 (${stats.filtered}/${stats.total})`
                : `Active Shipments (${stats.filtered}/${stats.total})`;
            tableHeader.textContent = statsText;
        }
    }

    formatDateTime(date) {
        const d = new Date(date);
        const options = { 
            month: 'short', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit' 
        };
        return d.toLocaleDateString('en-US', options);
    }

    getLocalizedStatus(status) {
        return this.statusLabels[status] ? this.statusLabels[status][this.currentLanguage] : status;
    }

    getLocalizedPriority(priority) {
        return this.priorityLabels[priority] ? this.priorityLabels[priority][this.currentLanguage] : priority;
    }

    exportShipment(shipmentId) {
        const shipment = this.shipmentData.find(s => s.id === shipmentId);
        if (!shipment) return;
        
        const exportData = {
            ...shipment,
            progress: this.calculateProgress(shipment),
            estimatedCost: this.calculateEstimatedCost(shipment),
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `shipment-${shipmentId}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    notifyCustomer(shipmentId) {
        // Simulate customer notification
        const shipment = this.shipmentData.find(s => s.id === shipmentId);
        if (shipment) {
            const message = `Customer notification sent for shipment ${shipmentId}`;
            this.showToast(message, 'success');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--accent-color);
            color: white;
            border-radius: 8px;
            box-shadow: var(--shadow-dark);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;
        
        toast.style.cssText = style;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    exportTableData() {
        const data = this.filteredData.map(shipment => ({
            ...shipment,
            progress: this.calculateProgress(shipment),
            estimatedCost: this.calculateEstimatedCost(shipment)
        }));
        
        const csv = this.convertToCSV(data);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',') 
                        ? `"${value}"` 
                        : value;
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }
}

// Initialize table controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tableController = new TableController();
});