/**
 * Main Application Controller
 * Entry point and application lifecycle management
 */

class PepperAcidOptimizerApp {
    constructor() {
        this.dashboard = null;
        this.initialized = false;
        this.version = '1.0.0';
        this.buildDate = '2024-01-15';
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log(`Pepper Acid Optimizer v${this.version} - Starting...`);
        
        try {
            // Wait for DOM to be ready
            await this.waitForDOM();
            
            // Initialize dashboard
            this.dashboard = new Dashboard();
            await this.dashboard.initialize();
            
            // Setup global error handling
            this.setupErrorHandling();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Show startup success
            this.showStartupMessage();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.showFatalError(error);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleError(new Error('Unhandled promise rejection: ' + event.reason));
        });
    }

    /**
     * Handle application errors
     */
    handleError(error) {
        if (this.dashboard) {
            this.dashboard.showError('System error: ' + error.message);
        } else {
            alert('System error: ' + error.message);
        }

        // Log error for debugging
        console.error('Application error:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor performance metrics
        if (window.performance && window.performance.mark) {
            window.performance.mark('app-initialized');
            
            // Log performance metrics periodically
            setInterval(() => {
                this.logPerformanceMetrics();
            }, 60000); // Every minute
        }
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const metrics = {
            memory: this.getMemoryUsage(),
            timing: this.getTimingMetrics(),
            chartCount: this.getActiveChartCount(),
            timestamp: new Date().toISOString()
        };

        console.log('Performance metrics:', metrics);
    }

    /**
     * Get memory usage (if available)
     */
    getMemoryUsage() {
        if (window.performance && window.performance.memory) {
            return {
                used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    /**
     * Get timing metrics
     */
    getTimingMetrics() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            return {
                loadTime: timing.loadEventEnd - timing.navigationStart,
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                renderTime: timing.loadEventEnd - timing.domLoading
            };
        }
        return null;
    }

    /**
     * Get active chart count
     */
    getActiveChartCount() {
        if (this.dashboard && this.dashboard.monitoringSystem) {
            return Object.keys(this.dashboard.monitoringSystem.charts).length;
        }
        return 0;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + key combinations
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        this.dashboard.switchTab('parameters');
                        break;
                    case '2':
                        event.preventDefault();
                        this.dashboard.switchTab('optimization');
                        break;
                    case '3':
                        event.preventDefault();
                        this.dashboard.switchTab('monitoring');
                        break;
                    case '4':
                        event.preventDefault();
                        this.dashboard.switchTab('safety');
                        break;
                    case '5':
                        event.preventDefault();
                        this.dashboard.switchTab('reports');
                        break;
                }
            }

            // Emergency stop shortcut (Ctrl+Shift+E)
            if (event.ctrlKey && event.shiftKey && event.key === 'E') {
                event.preventDefault();
                this.dashboard.activateEmergencyStop();
            }

            // Help shortcut (F1)
            if (event.key === 'F1') {
                event.preventDefault();
                this.showHelp();
            }
        });
    }

    /**
     * Show startup message
     */
    showStartupMessage() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                PEPPER ACID OPTIMIZATION SYSTEM              ║
║                        Version ${this.version}                        ║
║                                                              ║
║  🌶️  Advanced pepper processing optimization                ║
║  ⚗️  Real-time acid level monitoring                        ║
║  🛡️  Comprehensive safety systems                           ║
║  📊  Performance analytics & reporting                      ║
║                                                              ║
║  Status: ONLINE                                              ║
║  Build Date: ${this.buildDate}                                ║
╚══════════════════════════════════════════════════════════════╝
        `);

        if (this.dashboard) {
            this.dashboard.showSuccess('System initialized and ready for operation');
        }
    }

    /**
     * Show help information
     */
    showHelp() {
        const helpText = `
PEPPER ACID OPTIMIZATION SYSTEM - HELP

KEYBOARD SHORTCUTS:
• Ctrl+1-5: Switch between tabs
• Ctrl+Shift+E: Emergency stop
• F1: Show this help

TABS:
• Parameters: Set process parameters
• Optimization: Run optimization algorithms
• Monitoring: View real-time data
• Safety: Monitor safety systems
• Reports: Generate and view reports

SAFETY FEATURES:
• Real-time monitoring of pH, temperature, flow rate
• Automatic safety limits enforcement
• Emergency stop procedures
• Alert and notification system

For technical support, contact your system administrator.
        `;

        alert(helpText);
    }

    /**
     * Show fatal error
     */
    showFatalError(error) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(220, 38, 38, 0.95);
                color: white;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            ">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">⚠️ SYSTEM ERROR</h1>
                <p style="font-size: 1.5rem; margin-bottom: 2rem; text-align: center;">
                    The Pepper Acid Optimization System failed to initialize
                </p>
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 600px;
                    text-align: center;
                ">
                    <h2>Error Details:</h2>
                    <pre style="
                        background: rgba(0,0,0,0.5);
                        padding: 1rem;
                        border-radius: 4px;
                        margin: 1rem 0;
                        text-align: left;
                        overflow: auto;
                    ">${error.message}</pre>
                    <p>Please check the browser console for more details and contact technical support.</p>
                </div>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #dc2626;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-top: 2rem;
                ">
                    RELOAD SYSTEM
                </button>
            </div>
        `;

        document.body.innerHTML = errorHTML;
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            version: this.version,
            buildDate: this.buildDate,
            initialized: this.initialized,
            uptime: this.getUptime(),
            dashboard: this.dashboard ? this.dashboard.getStatus() : null,
            performance: {
                memory: this.getMemoryUsage(),
                timing: this.getTimingMetrics(),
                charts: this.getActiveChartCount()
            }
        };
    }

    /**
     * Get application uptime
     */
    getUptime() {
        if (window.performance && window.performance.timing) {
            return Date.now() - window.performance.timing.navigationStart;
        }
        return null;
    }

    /**
     * Shutdown application gracefully
     */
    shutdown() {
        console.log('Shutting down application...');
        
        if (this.dashboard) {
            this.dashboard.monitoringSystem.stopMonitoring();
            this.dashboard.updateSystemStatus('shutdown');
        }
        
        console.log('Application shutdown complete');
    }

    /**
     * Restart application
     */
    restart() {
        console.log('Restarting application...');
        this.shutdown();
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
}

// Global application instance
let app = null;

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        app = new PepperAcidOptimizerApp();
        await app.init();
        
        // Make app globally accessible for debugging
        window.pepperApp = app;
        
    } catch (error) {
        console.error('Failed to start application:', error);
        
        // Show basic error message if app failed to initialize
        document.body.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                background: #dc2626; 
                color: white; 
                font-family: Arial, sans-serif;
                text-align: center;
            ">
                <div>
                    <h1>System Initialization Failed</h1>
                    <p>Please check the console for error details and reload the page.</p>
                    <button onclick="location.reload()" style="
                        background: white; 
                        color: #dc2626; 
                        border: none; 
                        padding: 10px 20px; 
                        border-radius: 5px; 
                        cursor: pointer; 
                        font-weight: bold;
                    ">
                        RELOAD
                    </button>
                </div>
            </div>
        `;
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.shutdown();
    }
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (app && app.dashboard) {
        if (document.hidden) {
            // Reduce update frequency when tab is not visible
            app.dashboard.monitoringSystem.setUpdateInterval(10000); // 10 seconds
        } else {
            // Restore normal update frequency
            app.dashboard.monitoringSystem.setUpdateInterval(2000); // 2 seconds
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PepperAcidOptimizerApp;
}