class LogisticsDashboard {
    constructor() {
        this.isInitialized = false;
        this.updateInterval = 2000;
        this.performanceMetrics = {
            startTime: performance.now(),
            updateCount: 0,
            averageUpdateTime: 0
        };
        
        this.kpiAnimations = new Map();
        this.notificationQueue = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Logistics Dashboard...');
            
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core systems
            await this.initializeSystems();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            // Setup global event handlers
            this.setupGlobalEventHandlers();
            
            // Initialize performance monitoring
            this.initializePerformanceMonitoring();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ Logistics Dashboard initialized successfully');
            this.showSystemNotification('Dashboard Online', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error);
            this.showSystemNotification('Initialization Failed', 'error');
        }
    }

    async initializeSystems() {
        const systems = [
            { name: 'Data Simulator', init: () => this.initializeDataSimulator() },
            { name: 'Language Controller', init: () => this.initializeLanguageController() },
            { name: 'Map Controller', init: () => this.initializeMapController() },
            { name: 'Chart Controller', init: () => this.initializeChartController() },
            { name: 'Table Controller', init: () => this.initializeTableController() },
            { name: 'KPI Controller', init: () => this.initializeKPIController() },
            { name: 'Warehouse Monitor', init: () => this.initializeWarehouseMonitor() }
        ];

        for (const system of systems) {
            try {
                console.log(`🔧 Initializing ${system.name}...`);
                await system.init();
                console.log(`✅ ${system.name} ready`);
            } catch (error) {
                console.warn(`⚠️ ${system.name} initialization warning:`, error);
            }
        }
    }

    initializeDataSimulator() {
        if (!window.logisticsSimulator) {
            throw new Error('Data simulator not available');
        }
        
        // Subscribe to all data events
        window.logisticsSimulator.subscribe('kpiUpdate', (data) => {
            this.handleKPIUpdate(data);
        });
        
        window.logisticsSimulator.subscribe('fleetUpdate', (data) => {
            this.handleFleetUpdate(data);
        });
        
        window.logisticsSimulator.subscribe('warehouseUpdate', (data) => {
            this.handleWarehouseUpdate(data);
        });
        
        // Start the simulator
        window.logisticsSimulator.start();
    }

    initializeLanguageController() {
        if (!window.languageController) {
            console.warn('Language controller not available, creating minimal fallback');
            window.languageController = {
                currentLanguage: 'en',
                subscribe: () => {},
                switchLanguage: () => {}
            };
        }
    }

    initializeMapController() {
        if (!window.mapController) {
            console.warn('Map controller not available');
        }
    }

    initializeChartController() {
        if (!window.chartController) {
            console.warn('Chart controller not available');
        }
    }

    initializeTableController() {
        if (!window.tableController) {
            console.warn('Table controller not available');
        }
    }

    initializeKPIController() {
        // Initialize KPI update animations and formatting
        this.kpiElements = {
            activeTrucks: document.getElementById('active-trucks'),
            deliveriesToday: document.getElementById('deliveries-today'),
            fuelEfficiency: document.getElementById('fuel-efficiency'),
            costSavings: document.getElementById('cost-savings')
        };
        
        // Initialize with current data
        this.handleKPIUpdate(window.logisticsSimulator.getKPIData());
    }

    initializeWarehouseMonitor() {
        // Set up warehouse capacity monitoring and alerts
        this.warehouseThresholds = {
            high: 85,    // High capacity warning
            critical: 95 // Critical capacity alert
        };
        
        this.monitorWarehouseCapacity();
    }

    startRealTimeUpdates() {
        console.log('🔄 Starting real-time updates...');
        
        // Main update loop
        this.updateLoop = setInterval(() => {
            this.performUpdate();
        }, this.updateInterval);
        
        // Secondary slower updates for less critical data
        this.slowUpdateLoop = setInterval(() => {
            this.performSlowUpdate();
        }, this.updateInterval * 5); // 10 seconds
        
        // Time display updates
        this.timeUpdateLoop = setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }

    performUpdate() {
        const updateStart = performance.now();
        
        try {
            // Update counters
            this.performanceMetrics.updateCount++;
            
            // Trigger any pending animations
            this.processAnimationQueue();
            
            // Update status indicators
            this.updateSystemStatus();
            
        } catch (error) {
            console.error('Update error:', error);
        } finally {
            // Record performance
            const updateTime = performance.now() - updateStart;
            this.updatePerformanceMetrics(updateTime);
        }
    }

    performSlowUpdate() {
        try {
            // Update warehouse capacity indicators with smooth transitions
            this.updateWarehouseCapacityBars();
            
            // Check for system alerts
            this.checkSystemAlerts();
            
            // Clean up old notifications
            this.cleanupNotifications();
            
        } catch (error) {
            console.error('Slow update error:', error);
        }
    }

    updateTimeDisplay() {
        const timeElement = document.getElementById('current-time');
        if (timeElement && window.languageController) {
            const now = new Date();
            const locale = window.languageController.currentLanguage === 'jp' ? 'ja-JP' : 'en-US';
            const timeString = now.toLocaleTimeString(locale, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timeElement.textContent = timeString;
        }
    }

    handleKPIUpdate(kpiData) {
        Object.keys(kpiData).forEach(key => {
            const element = this.kpiElements[key];
            if (element && element.textContent !== this.formatKPIValue(key, kpiData[key])) {
                this.animateKPIUpdate(element, this.formatKPIValue(key, kpiData[key]));
            }
        });
    }

    formatKPIValue(key, value) {
        switch (key) {
            case 'activeTrucks':
            case 'deliveriesToday':
                return value.toLocaleString();
            case 'fuelEfficiency':
                return value.toFixed(1) + 'L';
            case 'costSavings':
                return '¥' + (value / 1000000).toFixed(1) + 'M';
            default:
                return value.toString();
        }
    }

    animateKPIUpdate(element, newValue) {
        if (!element) return;
        
        // Cancel any existing animation
        if (this.kpiAnimations.has(element)) {
            clearTimeout(this.kpiAnimations.get(element));
        }
        
        // Add animation class
        element.classList.add('kpi-updating');
        
        // Update value with delay
        const timeout = setTimeout(() => {
            element.textContent = newValue;
            element.classList.remove('kpi-updating');
            element.classList.add('kpi-updated');
            
            // Remove updated class after animation
            setTimeout(() => {
                element.classList.remove('kpi-updated');
            }, 500);
            
            this.kpiAnimations.delete(element);
        }, 200);
        
        this.kpiAnimations.set(element, timeout);
    }

    handleFleetUpdate(fleetData) {
        // Update fleet statistics
        const activeCount = fleetData.filter(truck => truck.status === 'in-transit').length;
        const maintenanceCount = fleetData.filter(truck => truck.status === 'maintenance').length;
        
        // Check for alerts
        if (maintenanceCount > 5) {
            this.queueNotification(
                `High maintenance queue: ${maintenanceCount} trucks`,
                'warning'
            );
        }
        
        // Update low fuel alerts
        const lowFuelTrucks = fleetData.filter(truck => truck.fuelLevel < 15);
        if (lowFuelTrucks.length > 0) {
            lowFuelTrucks.forEach(truck => {
                this.queueNotification(
                    `Low fuel alert: ${truck.id} (${truck.fuelLevel}%)`,
                    'warning'
                );
            });
        }
    }

    handleWarehouseUpdate(warehouseData) {
        warehouseData.forEach(warehouse => {
            const utilization = (warehouse.current / warehouse.capacity) * 100;
            
            if (utilization >= this.warehouseThresholds.critical) {
                this.queueNotification(
                    `Critical: ${warehouse.name} at ${utilization.toFixed(1)}% capacity`,
                    'error'
                );
            } else if (utilization >= this.warehouseThresholds.high) {
                this.queueNotification(
                    `Warning: ${warehouse.name} at ${utilization.toFixed(1)}% capacity`,
                    'warning'
                );
            }
        });
    }

    updateWarehouseCapacityBars() {
        const warehouseData = window.logisticsSimulator.getWarehouseData();
        
        warehouseData.forEach(warehouse => {
            const utilization = (warehouse.current / warehouse.capacity) * 100;
            const capacityFill = document.querySelector(
                `[data-warehouse="${warehouse.id}"] .capacity-fill`
            );
            
            if (capacityFill) {
                // Smooth transition to new width
                capacityFill.style.transition = 'width 1s ease';
                capacityFill.style.width = `${utilization}%`;
                
                // Update color based on utilization
                let color = '#27ae60'; // Green
                if (utilization >= this.warehouseThresholds.critical) {
                    color = '#e74c3c'; // Red
                } else if (utilization >= this.warehouseThresholds.high) {
                    color = '#f39c12'; // Orange
                }
                capacityFill.style.background = `linear-gradient(90deg, ${color}, ${color}CC)`;
            }
        });
    }

    monitorWarehouseCapacity() {
        // Set up continuous monitoring
        setInterval(() => {
            const warehouseData = window.logisticsSimulator.getWarehouseData();
            this.checkWarehouseAlerts(warehouseData);
        }, 30000); // Check every 30 seconds
    }

    checkWarehouseAlerts(warehouseData) {
        warehouseData.forEach(warehouse => {
            const utilization = (warehouse.current / warehouse.capacity) * 100;
            const alertKey = `warehouse-${warehouse.id}-capacity`;
            
            if (utilization >= this.warehouseThresholds.critical) {
                if (!this.hasRecentAlert(alertKey, 300000)) { // 5 minutes
                    this.showSystemAlert({
                        type: 'critical',
                        title: 'Critical Capacity',
                        message: `${warehouse.name} is at ${utilization.toFixed(1)}% capacity`,
                        actions: ['Redistribute Inventory', 'Schedule Pickup']
                    });
                    this.recordAlert(alertKey);
                }
            }
        });
    }

    processAnimationQueue() {
        // Process any queued animations or visual updates
        if (this.animationQueue && this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            if (animation && typeof animation === 'function') {
                try {
                    animation();
                } catch (error) {
                    console.warn('Animation error:', error);
                }
            }
        }
    }

    updateSystemStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            // Update based on system health
            const isHealthy = this.checkSystemHealth();
            statusIndicator.classList.toggle('live', isHealthy);
            statusIndicator.classList.toggle('warning', !isHealthy);
        }
    }

    checkSystemHealth() {
        // Simple health check based on update performance
        const avgUpdateTime = this.performanceMetrics.averageUpdateTime;
        return avgUpdateTime < 100; // Less than 100ms average
    }

    checkSystemAlerts() {
        // Check for various system conditions
        const now = Date.now();
        
        // Check update performance
        if (this.performanceMetrics.averageUpdateTime > 200) {
            this.queueNotification('System performance degraded', 'warning');
        }
        
        // Check data freshness
        if (window.logisticsSimulator && !window.logisticsSimulator.isRunning) {
            this.queueNotification('Data feed interrupted', 'error');
        }
    }

    queueNotification(message, type = 'info') {
        this.notificationQueue.push({
            message,
            type,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        
        // Process queue
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        // Limit simultaneous notifications
        const maxNotifications = 3;
        const currentNotifications = document.querySelectorAll('.system-notification').length;
        
        if (currentNotifications >= maxNotifications || this.notificationQueue.length === 0) {
            return;
        }
        
        const notification = this.notificationQueue.shift();
        this.showNotification(notification);
    }

    showNotification(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `system-notification notification-${notification.type}`;
        notificationEl.dataset.notificationId = notification.id;
        
        notificationEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${new Date(notification.timestamp).toLocaleTimeString()}</div>
            </div>
            <button class="notification-close">×</button>
        `;
        
        // Position and style
        notificationEl.style.cssText = `
            position: fixed;
            top: ${80 + document.querySelectorAll('.system-notification').length * 70}px;
            right: 20px;
            background: var(--card-background);
            border-left: 4px solid var(--${this.getNotificationColor(notification.type)});
            border-radius: 8px;
            padding: 1rem;
            min-width: 300px;
            max-width: 400px;
            box-shadow: var(--shadow-dark);
            backdrop-filter: blur(10px);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notificationEl);
        
        // Animate in
        setTimeout(() => {
            notificationEl.style.transform = 'translateX(0)';
        }, 10);
        
        // Close button
        notificationEl.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notificationEl);
        });
        
        // Auto close
        setTimeout(() => {
            if (notificationEl.parentNode) {
                this.closeNotification(notificationEl);
            }
        }, notification.type === 'error' ? 10000 : 5000);
    }

    getNotificationColor(type) {
        const colors = {
            success: 'success-color',
            warning: 'warning-color',
            error: 'danger-color',
            info: 'accent-color'
        };
        return colors[type] || 'accent-color';
    }

    closeNotification(notificationEl) {
        notificationEl.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.parentNode.removeChild(notificationEl);
            }
            // Reposition remaining notifications
            this.repositionNotifications();
            // Process queue
            setTimeout(() => this.processNotificationQueue(), 100);
        }, 300);
    }

    repositionNotifications() {
        const notifications = document.querySelectorAll('.system-notification');
        notifications.forEach((notification, index) => {
            notification.style.top = `${80 + index * 70}px`;
        });
    }

    cleanupNotifications() {
        // Remove old notifications
        const notifications = document.querySelectorAll('.system-notification');
        const maxAge = 30000; // 30 seconds
        const now = Date.now();
        
        notifications.forEach(notification => {
            const timestamp = parseInt(notification.dataset.timestamp || '0');
            if (now - timestamp > maxAge) {
                this.closeNotification(notification);
            }
        });
    }

    showSystemNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        this.queueNotification(message, type);
    }

    updatePerformanceMetrics(updateTime) {
        this.performanceMetrics.averageUpdateTime = 
            (this.performanceMetrics.averageUpdateTime + updateTime) / 2;
    }

    initializePerformanceMonitoring() {
        // Monitor and log performance metrics
        setInterval(() => {
            const metrics = {
                updateCount: this.performanceMetrics.updateCount,
                averageUpdateTime: this.performanceMetrics.averageUpdateTime.toFixed(2),
                uptime: ((performance.now() - this.performanceMetrics.startTime) / 1000 / 60).toFixed(1)
            };
            
            console.log('📊 Performance:', metrics);
        }, 60000); // Every minute
    }

    setupGlobalEventHandlers() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + L: Switch language
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                const currentLang = window.languageController.currentLanguage;
                const newLang = currentLang === 'en' ? 'jp' : 'en';
                window.languageController.switchLanguage(newLang);
            }
            
            // Ctrl/Cmd + R: Refresh data
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                this.refreshAllData();
            }
            
            // Escape: Close modals/notifications
            if (e.key === 'Escape') {
                this.closeAllNotifications();
            }
        });
        
        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseUpdates();
            } else {
                this.resumeUpdates();
            }
        });
        
        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showSystemNotification('System error occurred', 'error');
        });
    }

    refreshAllData() {
        this.showSystemNotification('Refreshing data...', 'info');
        
        // Regenerate all data
        if (window.logisticsSimulator) {
            window.logisticsSimulator.stop();
            window.logisticsSimulator.initializeData();
            window.logisticsSimulator.start();
        }
        
        // Refresh all controllers
        if (window.mapController) {
            window.mapController.updateFleetMarkers(window.logisticsSimulator.getFleetData());
        }
        
        if (window.chartController) {
            window.chartController.updateCharts(window.logisticsSimulator.getTimeSeriesData());
        }
        
        if (window.tableController) {
            window.tableController.updateTableData(window.logisticsSimulator.getShipmentData());
        }
    }

    pauseUpdates() {
        console.log('⏸️ Pausing updates (tab hidden)');
        if (this.updateLoop) clearInterval(this.updateLoop);
        if (this.slowUpdateLoop) clearInterval(this.slowUpdateLoop);
    }

    resumeUpdates() {
        console.log('▶️ Resuming updates (tab visible)');
        this.startRealTimeUpdates();
    }

    handleResize() {
        // Notify chart controller of resize
        if (window.chartController && window.chartController.currentChart) {
            window.chartController.currentChart.resize();
        }
        
        // Reposition notifications
        this.repositionNotifications();
    }

    closeAllNotifications() {
        document.querySelectorAll('.system-notification').forEach(notification => {
            this.closeNotification(notification);
        });
    }

    // Utility methods
    hasRecentAlert(alertKey, timeWindow) {
        const lastAlert = localStorage.getItem(`alert-${alertKey}`);
        if (!lastAlert) return false;
        
        const lastTime = parseInt(lastAlert);
        return (Date.now() - lastTime) < timeWindow;
    }

    recordAlert(alertKey) {
        localStorage.setItem(`alert-${alertKey}`, Date.now().toString());
    }

    // Public API methods
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            performance: this.performanceMetrics,
            activeNotifications: document.querySelectorAll('.system-notification').length,
            dataSimulatorRunning: window.logisticsSimulator?.isRunning || false
        };
    }

    exportSystemLogs() {
        // Export system logs and performance data
        const logs = {
            systemStatus: this.getSystemStatus(),
            timestamp: new Date().toISOString(),
            performance: this.performanceMetrics
        };
        
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-logs-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.logisticsDashboard = new LogisticsDashboard();
});

// Add CSS for animations and notifications
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
    .kpi-updating {
        opacity: 0.6;
        transform: scale(0.95);
        transition: all 0.2s ease;
    }
    
    .kpi-updated {
        animation: kpiPulse 0.5s ease;
    }
    
    @keyframes kpiPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .system-notification {
        font-size: 0.875rem;
        animation: slideInRight 0.3s ease;
    }
    
    .notification-content {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .notification-message {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .notification-time {
        color: var(--text-secondary);
        font-size: 0.75rem;
    }
    
    .notification-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: var(--text-primary);
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(dashboardStyles);