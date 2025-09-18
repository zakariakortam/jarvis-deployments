/**
 * Main Application Controller
 * Orchestrates all components and manages the application lifecycle
 */

class FactoryEnergyOptimizer {
    constructor() {
        this.components = {};
        this.isInitialized = false;
        this.updateInterval = null;
        this.config = {
            updateFrequency: 1000, // 1 second
            historyRetention: 1440, // 24 hours in minutes
            autoSave: true,
            theme: 'light'
        };
        
        // Bind methods to maintain context
        this.handleSensorUpdate = this.handleSensorUpdate.bind(this);
        this.handleAnomalyDetection = this.handleAnomalyDetection.bind(this);
        this.handleOptimizationUpdate = this.handleOptimizationUpdate.bind(this);
    }

    async initialize() {
        if (this.isInitialized) return;

        console.log('Initializing Factory Energy Optimizer...');
        
        try {
            // Initialize core components
            await this.initializeComponents();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load configuration
            this.loadConfiguration();
            
            // Start data flow
            this.startDataFlow();
            
            // Setup auto-save
            if (this.config.autoSave) {
                this.setupAutoSave();
            }
            
            this.isInitialized = true;
            console.log('Factory Energy Optimizer initialized successfully');
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            // Show welcome message if first time
            this.showWelcomeIfFirstTime();
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeComponents() {
        // Initialize I18n first
        if (window.i18n && !window.i18n.isInitialized) {
            window.i18n.initialize();
            this.components.i18n = window.i18n;
        }

        // Initialize sensor data generator
        this.components.sensorGenerator = new SensorDataGenerator();
        
        // Initialize AI components
        this.components.anomalyDetector = new AnomalyDetector();
        this.components.optimizationAgent = new OptimizationAgent();
        
        // Initialize dashboard components
        this.components.chartManager = new ChartManager();
        this.components.kpiManager = new KPIManager();
        
        // Initialize UI components
        this.initializeNavigation();
        this.initializeAlertSystem();
        this.initializeInsightsPanel();
        this.initializeRecommendationsPanel();
        this.initializeSettingsPanel();
        
        // Initialize all components
        await Promise.all([
            this.components.chartManager.initialize(),
            this.components.kpiManager.initialize()
        ]);
    }

    initializeNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    initializeAlertSystem() {
        const alertBadge = document.getElementById('alertBadge');
        const alertsPanel = document.getElementById('alertsPanel');
        const closeAlerts = document.getElementById('closeAlerts');
        
        if (alertBadge) {
            alertBadge.addEventListener('click', () => {
                if (alertsPanel) {
                    alertsPanel.classList.toggle('open');
                }
            });
        }
        
        if (closeAlerts) {
            closeAlerts.addEventListener('click', () => {
                if (alertsPanel) {
                    alertsPanel.classList.remove('open');
                }
            });
        }
    }

    initializeInsightsPanel() {
        const refreshButton = document.getElementById('refreshInsights');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.refreshInsights();
            });
        }
    }

    initializeRecommendationsPanel() {
        // Recommendations will be dynamically generated
        this.components.recommendations = {
            container: document.querySelector('#recommendations-tab .recommendations-content'),
            data: []
        };
    }

    initializeSettingsPanel() {
        // Settings panel initialization
        this.components.settings = {
            container: document.querySelector('#settings-tab .settings-content'),
            data: { ...this.config }
        };
        
        this.renderSettingsPanel();
    }

    setupEventListeners() {
        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveConfiguration();
            this.cleanup();
        });
        
        window.addEventListener('resize', () => {
            if (this.components.chartManager) {
                this.components.chartManager.resizeCharts();
            }
        });
        
        // Custom events
        window.addEventListener('kpiStatusChange', (event) => {
            this.handleKPIStatusChange(event.detail);
        });
        
        window.addEventListener('chartPointClick', (event) => {
            this.handleChartPointClick(event.detail);
        });
        
        window.addEventListener('languageChange', (event) => {
            this.handleLanguageChange(event.detail);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    startDataFlow() {
        // Start sensor data generation
        this.components.sensorGenerator.subscribe(this.handleSensorUpdate);
        this.components.sensorGenerator.start();
        
        // Set up regular updates
        this.updateInterval = setInterval(() => {
            this.performRegularUpdate();
        }, this.config.updateFrequency);
        
        console.log('Data flow started');
    }

    handleSensorUpdate(sensorData) {
        try {
            // Update last update time
            this.updateLastUpdateTime(sensorData.timestamp);
            
            // Update KPIs
            if (this.components.kpiManager) {
                this.components.kpiManager.updateKPIs(sensorData);
            }
            
            // Update charts
            if (this.components.chartManager) {
                this.components.chartManager.updatePowerChart(sensorData);
                this.components.chartManager.updateProductionChart(sensorData);
            }
            
            // Process anomaly detection
            if (this.components.anomalyDetector) {
                const anomalyResults = this.components.anomalyDetector.processData(sensorData);
                this.handleAnomalyDetection(anomalyResults);
            }
            
            // Update alerts
            this.updateAlerts(sensorData.alerts || []);
            
        } catch (error) {
            console.error('Error handling sensor update:', error);
        }
    }

    handleAnomalyDetection(anomalyResults) {
        if (!anomalyResults || !anomalyResults.anomalies) return;
        
        // Update insights panel
        this.updateInsightsPanel(anomalyResults);
        
        // Generate optimization recommendations
        if (this.components.optimizationAgent) {
            const optimizationResults = this.components.optimizationAgent.analyze(
                this.components.sensorGenerator.getCurrentData(),
                anomalyResults.anomalies
            );
            this.handleOptimizationUpdate(optimizationResults);
        }
    }

    handleOptimizationUpdate(optimizationResults) {
        if (!optimizationResults) return;
        
        // Update recommendations panel
        this.updateRecommendationsPanel(optimizationResults.recommendations);
        
        // Update cost analysis
        if (this.components.chartManager && optimizationResults.cost_analysis) {
            this.components.chartManager.updateCostAnalysisChart(optimizationResults.cost_analysis);
        }
    }

    performRegularUpdate() {
        // This runs every update interval for maintenance tasks
        try {
            // Clean up old data
            this.cleanupOldData();
            
            // Save configuration if auto-save is enabled
            if (this.config.autoSave && Date.now() % 60000 < this.config.updateFrequency) {
                this.saveConfiguration();
            }
            
        } catch (error) {
            console.error('Error in regular update:', error);
        }
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
            this.onTabActivated(tabName);
        }
    }

    onTabActivated(tabName) {
        switch (tabName) {
            case 'production':
                this.renderProductionTab();
                break;
            case 'energy':
                this.renderEnergyTab();
                break;
            case 'ai-insights':
                this.renderAIInsightsTab();
                break;
            case 'recommendations':
                this.renderRecommendationsTab();
                break;
            case 'settings':
                this.renderSettingsTab();
                break;
        }
    }

    renderProductionTab() {
        const container = document.querySelector('#production-tab .production-grid');
        if (!container || !this.components.sensorGenerator) return;
        
        const sensorData = this.components.sensorGenerator.getCurrentData();
        if (!sensorData || !sensorData.productionLines) return;
        
        container.innerHTML = '';
        
        sensorData.productionLines.forEach(line => {
            const lineCard = this.createProductionLineCard(line);
            container.appendChild(lineCard);
        });
    }

    createProductionLineCard(line) {
        const card = document.createElement('div');
        card.className = 'production-line-card';
        
        card.innerHTML = `
            <div class="production-line-header">
                <h3 class="production-line-title">${line.name}</h3>
                <span class="production-status ${line.status}">${this.translateStatus(line.status)}</span>
            </div>
            <div class="production-metrics">
                <div class="production-metric">
                    <span class="production-metric-value">${line.power.toFixed(1)}</span>
                    <span class="production-metric-label">${this.components.i18n?.translate('units.kw') || 'kW'}</span>
                </div>
                <div class="production-metric">
                    <span class="production-metric-value">${line.temperature.toFixed(1)}</span>
                    <span class="production-metric-label">${this.components.i18n?.translate('units.celsius') || '°C'}</span>
                </div>
                <div class="production-metric">
                    <span class="production-metric-value">${line.efficiency.toFixed(1)}</span>
                    <span class="production-metric-label">${this.components.i18n?.translate('units.percent') || '%'}</span>
                </div>
                <div class="production-metric">
                    <span class="production-metric-value">${line.output}</span>
                    <span class="production-metric-label">${this.components.i18n?.translate('production.metrics.output') || 'units'}</span>
                </div>
            </div>
        `;
        
        return card;
    }

    renderEnergyTab() {
        const container = document.querySelector('#energy-tab .energy-charts');
        if (!container) return;
        
        // Create energy analysis charts
        container.innerHTML = `
            <div class="chart-container">
                <div class="chart-header">
                    <h3>${this.components.i18n?.translate('charts.temperatureTrend') || 'Temperature Trend'}</h3>
                </div>
                <canvas id="temperatureChart"></canvas>
            </div>
            <div class="chart-container">
                <div class="chart-header">
                    <h3>${this.components.i18n?.translate('charts.costBreakdown') || 'Cost Breakdown'}</h3>
                </div>
                <canvas id="costAnalysisChart"></canvas>
            </div>
        `;
        
        // Initialize new charts
        if (this.components.chartManager) {
            this.components.chartManager.createTemperatureChart('temperatureChart');
            this.components.chartManager.createCostAnalysisChart('costAnalysisChart');
        }
    }

    renderAIInsightsTab() {
        const container = document.querySelector('#ai-insights-tab .ai-panels');
        if (!container) return;
        
        container.innerHTML = `
            <div class="ai-panel">
                <h3>${this.components.i18n?.translate('ai.anomalyDetection') || 'Anomaly Detection'}</h3>
                <div id="anomalyDetectionPanel" class="ai-panel-content"></div>
            </div>
            <div class="ai-panel">
                <h3>${this.components.i18n?.translate('ai.optimization') || 'Optimization Suggestions'}</h3>
                <div id="optimizationPanel" class="ai-panel-content"></div>
            </div>
        `;
    }

    renderRecommendationsTab() {
        if (!this.components.recommendations.container) return;
        
        const recommendations = this.components.recommendations.data;
        if (!recommendations || recommendations.length === 0) {
            this.components.recommendations.container.innerHTML = `
                <div class="no-recommendations">
                    <p>${this.components.i18n?.translate('recommendations.noRecommendations') || 'No recommendations available at this time.'}</p>
                </div>
            `;
            return;
        }
        
        this.components.recommendations.container.innerHTML = '';
        
        recommendations.forEach(rec => {
            const recCard = this.createRecommendationCard(rec);
            this.components.recommendations.container.appendChild(recCard);
        });
    }

    createRecommendationCard(recommendation) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const priorityText = this.components.i18n?.translate(`recommendations.priority.${recommendation.priority}`) || recommendation.priority;
        const categoryText = this.components.i18n?.translate(`recommendations.category.${recommendation.category}`) || recommendation.category;
        
        card.innerHTML = `
            <div class="recommendation-header">
                <h3 class="recommendation-title">${recommendation.title}</h3>
                <span class="recommendation-priority ${recommendation.priority}">${priorityText}</span>
            </div>
            <p class="recommendation-description">${recommendation.description}</p>
            <div class="recommendation-impact">
                <div class="impact-metric">
                    <span class="impact-value">${this.formatCurrency(recommendation.estimated_savings?.annual || 0)}</span>
                    <span class="impact-label">${this.components.i18n?.translate('recommendations.estimatedSavings') || 'Annual Savings'}</span>
                </div>
                <div class="impact-metric">
                    <span class="impact-value">${recommendation.implementation?.time_required || 'N/A'}</span>
                    <span class="impact-label">${this.components.i18n?.translate('recommendations.implementationTime') || 'Implementation Time'}</span>
                </div>
                <div class="impact-metric">
                    <span class="impact-value">${recommendation.roi?.toFixed(1) || 'N/A'}%</span>
                    <span class="impact-label">${this.components.i18n?.translate('recommendations.roi') || 'ROI'}</span>
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="btn-primary" onclick="app.implementRecommendation('${recommendation.id}')">
                    ${this.components.i18n?.translate('actions.apply') || 'Apply'}
                </button>
                <button class="btn-secondary" onclick="app.dismissRecommendation('${recommendation.id}')">
                    ${this.components.i18n?.translate('alerts.dismiss') || 'Dismiss'}
                </button>
            </div>
        `;
        
        return card;
    }

    renderSettingsTab() {
        if (!this.components.settings.container) return;
        
        this.components.settings.container.innerHTML = `
            <div class="settings-section">
                <h3>${this.components.i18n?.translate('settings.general') || 'General Settings'}</h3>
                <div class="settings-group">
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">${this.components.i18n?.translate('settings.language') || 'Language'}</div>
                            <div class="setting-description">Select interface language</div>
                        </div>
                        <div class="setting-control">
                            <select id="settingsLanguage">
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>
                    </div>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">${this.components.i18n?.translate('settings.theme') || 'Theme'}</div>
                            <div class="setting-description">Choose interface theme</div>
                        </div>
                        <div class="setting-control">
                            <select id="settingsTheme">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="auto">Auto</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div class="settings-section">
                <h3>${this.components.i18n?.translate('settings.thresholds') || 'Alert Thresholds'}</h3>
                <div class="settings-group">
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Temperature Warning (°C)</div>
                            <div class="setting-description">Temperature threshold for warnings</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" id="tempWarning" min="30" max="70" value="45">
                        </div>
                    </div>
                    <div class="setting-item">
                        <div>
                            <div class="setting-label">Power Limit (kW)</div>
                            <div class="setting-description">Maximum power consumption threshold</div>
                        </div>
                        <div class="setting-control">
                            <input type="number" id="powerLimit" min="100" max="1000" value="500">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.bindSettingsEvents();
    }

    bindSettingsEvents() {
        const settingsLanguage = document.getElementById('settingsLanguage');
        const settingsTheme = document.getElementById('settingsTheme');
        
        if (settingsLanguage) {
            settingsLanguage.value = this.components.i18n?.getCurrentLanguage() || 'en';
            settingsLanguage.addEventListener('change', (e) => {
                if (this.components.i18n) {
                    this.components.i18n.setLanguage(e.target.value);
                }
            });
        }
        
        if (settingsTheme) {
            settingsTheme.value = this.config.theme;
            settingsTheme.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
    }

    updateInsightsPanel(anomalyResults) {
        const container = document.getElementById('insightsContent');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (anomalyResults.anomalies && anomalyResults.anomalies.length > 0) {
            anomalyResults.anomalies.slice(0, 5).forEach(anomaly => {
                const insightCard = this.createInsightCard(anomaly);
                container.appendChild(insightCard);
            });
        } else {
            container.innerHTML = `
                <div class="insight-card success">
                    <div class="insight-title">${this.components.i18n?.translate('ai.noAnomalies') || 'No Anomalies Detected'}</div>
                    <div class="insight-description">All systems are operating within normal parameters.</div>
                </div>
            `;
        }
    }

    createInsightCard(anomaly) {
        const card = document.createElement('div');
        card.className = `insight-card ${anomaly.severity || 'info'}`;
        
        card.innerHTML = `
            <div class="insight-title">${anomaly.description}</div>
            <div class="insight-description">
                Line: ${anomaly.lineName}<br>
                Confidence: ${Math.round((anomaly.confidence || 0) * 100)}%<br>
                Time: ${new Date(anomaly.timestamp).toLocaleTimeString()}
            </div>
        `;
        
        return card;
    }

    updateRecommendationsPanel(recommendations) {
        if (!this.components.recommendations) return;
        
        this.components.recommendations.data = recommendations || [];
        
        // Re-render if currently viewing recommendations tab
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'recommendations-tab') {
            this.renderRecommendationsTab();
        }
    }

    updateAlerts(alerts) {
        const alertsContent = document.getElementById('alertsContent');
        const alertBadge = document.getElementById('alertBadge');
        const alertCount = alertBadge?.querySelector('.alert-count');
        
        if (alertCount) {
            alertCount.textContent = alerts.length;
        }
        
        if (alertsContent) {
            alertsContent.innerHTML = '';
            
            if (alerts.length === 0) {
                alertsContent.innerHTML = `
                    <div class="no-alerts">
                        <p>${this.components.i18n?.translate('alerts.noAlerts') || 'No active alerts'}</p>
                    </div>
                `;
            } else {
                alerts.forEach(alert => {
                    const alertElement = this.createAlertElement(alert);
                    alertsContent.appendChild(alertElement);
                });
            }
        }
    }

    createAlertElement(alert) {
        const element = document.createElement('div');
        element.className = `alert-item ${alert.type}`;
        
        element.innerHTML = `
            <div class="alert-header">
                <span class="alert-type">${alert.type.toUpperCase()}</span>
                <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="alert-title">${alert.title}</div>
            <div class="alert-message">${alert.message}</div>
            <div class="alert-actions">
                <button class="btn-secondary" onclick="app.acknowledgeAlert('${alert.id}')">
                    ${this.components.i18n?.translate('alerts.acknowledge') || 'Acknowledge'}
                </button>
            </div>
        `;
        
        return element;
    }

    updateLastUpdateTime(timestamp) {
        const element = document.getElementById('lastUpdateTime');
        if (element) {
            element.textContent = new Date(timestamp).toLocaleTimeString();
        }
    }

    // Event handlers
    handleKPIStatusChange(detail) {
        console.log('KPI status changed:', detail);
        
        // Could trigger additional actions based on status changes
        if (detail.status === 'critical') {
            this.showNotification(`Critical ${detail.kpiType} level detected!`, 'error');
        }
    }

    handleChartPointClick(detail) {
        console.log('Chart point clicked:', detail);
        // Implement drill-down functionality
    }

    handleLanguageChange(detail) {
        console.log('Language changed to:', detail.newLanguage);
        
        // Re-render current tab content
        const activeTab = document.querySelector('.nav-tab.active')?.dataset.tab;
        if (activeTab) {
            this.onTabActivated(activeTab);
        }
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 's':
                    event.preventDefault();
                    this.saveConfiguration();
                    this.showNotification('Configuration saved', 'success');
                    break;
                case 'r':
                    event.preventDefault();
                    this.refreshInsights();
                    break;
            }
        }
    }

    // Utility methods
    translateStatus(status) {
        return this.components.i18n?.translate(`production.status.${status}`) || status;
    }

    formatCurrency(value) {
        return this.components.i18n?.formatCurrency(value) || `¥${value.toLocaleString()}`;
    }

    showNotification(message, type = 'info') {
        // Simple notification implementation
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    showWelcomeIfFirstTime() {
        const isFirstTime = !localStorage.getItem('hasVisited');
        if (isFirstTime) {
            localStorage.setItem('hasVisited', 'true');
            this.showNotification('Welcome to Factory Energy Optimizer!', 'info');
        }
    }

    refreshInsights() {
        if (!this.components.anomalyDetector || !this.components.sensorGenerator) return;
        
        const sensorData = this.components.sensorGenerator.getCurrentData();
        const anomalyResults = this.components.anomalyDetector.processData(sensorData);
        this.handleAnomalyDetection(anomalyResults);
        
        this.showNotification('Insights refreshed', 'success');
    }

    // Configuration management
    loadConfiguration() {
        try {
            const saved = localStorage.getItem('factoryOptimizerConfig');
            if (saved) {
                const config = JSON.parse(saved);
                this.config = { ...this.config, ...config };
            }
        } catch (error) {
            console.warn('Failed to load configuration:', error);
        }
    }

    saveConfiguration() {
        try {
            localStorage.setItem('factoryOptimizerConfig', JSON.stringify(this.config));
        } catch (error) {
            console.error('Failed to save configuration:', error);
        }
    }

    setTheme(theme) {
        this.config.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        if (this.components.chartManager) {
            this.components.chartManager.setChartTheme(theme);
        }
    }

    // Action handlers
    implementRecommendation(recommendationId) {
        console.log('Implementing recommendation:', recommendationId);
        this.showNotification('Recommendation implementation started', 'info');
        // Implement actual recommendation logic here
    }

    dismissRecommendation(recommendationId) {
        this.components.recommendations.data = this.components.recommendations.data.filter(
            rec => rec.id !== recommendationId
        );
        this.renderRecommendationsTab();
        this.showNotification('Recommendation dismissed', 'info');
    }

    acknowledgeAlert(alertId) {
        console.log('Acknowledging alert:', alertId);
        this.showNotification('Alert acknowledged', 'success');
        // Update alert status in the system
    }

    // Cleanup
    cleanupOldData() {
        // This would clean up old historical data based on retention policy
        if (this.components.kpiManager && this.components.kpiManager.historicalData) {
            const maxEntries = this.config.historyRetention;
            if (this.components.kpiManager.historicalData.length > maxEntries) {
                this.components.kpiManager.historicalData = 
                    this.components.kpiManager.historicalData.slice(-maxEntries);
            }
        }
    }

    setupAutoSave() {
        setInterval(() => {
            this.saveConfiguration();
        }, 60000); // Save every minute
    }

    cleanup() {
        // Stop data generation
        if (this.components.sensorGenerator) {
            this.components.sensorGenerator.stop();
        }
        
        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Destroy charts
        if (this.components.chartManager) {
            this.components.chartManager.destroyAllCharts();
        }
        
        console.log('Application cleaned up');
    }

    handleInitializationError(error) {
        const errorMessage = `
            <div class="error-message">
                <h3>Initialization Error</h3>
                <p>Failed to initialize the application. Please refresh the page and try again.</p>
                <p><strong>Error:</strong> ${error.message}</p>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }
}

// Create global application instance
const app = new FactoryEnergyOptimizer();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.initialize();
    });
} else {
    app.initialize();
}

// Export for debugging and external access
window.app = app;