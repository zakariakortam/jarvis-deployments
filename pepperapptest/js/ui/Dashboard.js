/**
 * Dashboard UI Controller
 * Manages all user interface interactions and state
 */

class Dashboard {
    constructor() {
        this.currentTab = 'parameters';
        this.processState = new DataModels.ProcessState();
        this.currentParameters = null;
        this.optimizationResults = null;
        this.safetyValidator = new SafetyValidator();
        this.optimizationEngine = new OptimizationEngine(this.safetyValidator);
        this.monitoringSystem = new MonitoringSystem();
        
        this.isInitialized = false;
        this.emergencyMode = false;
    }

    /**
     * Initialize the dashboard
     */
    async initialize() {
        if (this.isInitialized) return;

        console.log('Initializing Dashboard...');
        
        try {
            // Initialize event listeners
            this.setupEventListeners();
            
            // Initialize monitoring system
            await this.monitoringSystem.initialize();
            
            // Setup safety monitoring
            this.setupSafetyMonitoring();
            
            // Load default parameters
            this.loadDefaultParameters();
            
            // Start monitoring
            this.monitoringSystem.startMonitoring();
            
            // Set initial system status
            this.updateSystemStatus('online');
            
            this.isInitialized = true;
            console.log('Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard: ' + error.message);
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Tab navigation
        this.setupTabNavigation();
        
        // Parameters form
        this.setupParametersForm();
        
        // Optimization controls
        this.setupOptimizationControls();
        
        // Safety controls
        this.setupSafetyControls();
        
        // Report controls
        this.setupReportControls();
        
        // Emergency stop
        this.setupEmergencyStop();
        
        // Window events
        this.setupWindowEvents();
    }

    /**
     * Setup tab navigation
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    /**
     * Switch to a different tab
     */
    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Tab-specific initialization
        this.onTabSwitch(tabName);
    }

    /**
     * Handle tab switch events
     */
    onTabSwitch(tabName) {
        switch (tabName) {
            case 'monitoring':
                // Refresh charts when switching to monitoring
                setTimeout(() => {
                    Object.values(this.monitoringSystem.charts).forEach(chart => {
                        if (chart) chart.resize();
                    });
                }, 100);
                break;
            case 'safety':
                this.updateSafetyDisplay();
                break;
            case 'reports':
                this.loadRecentReports();
                break;
        }
    }

    /**
     * Setup parameters form
     */
    setupParametersForm() {
        const form = document.getElementById('parametersForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleParametersSubmit();
        });

        form.addEventListener('reset', () => {
            this.loadDefaultParameters();
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.validateParameterInput(input);
            });
        });
    }

    /**
     * Handle parameters form submission
     */
    handleParametersSubmit() {
        try {
            const formData = new FormData(document.getElementById('parametersForm'));
            const parameters = new DataModels.PepperProcessParameters({
                pepperType: formData.get('pepperType'),
                initialMoisture: parseFloat(formData.get('moisture')),
                targetMoisture: parseFloat(formData.get('targetMoisture')),
                batchSize: parseFloat(formData.get('batchSize')),
                temperature: parseFloat(formData.get('temperature')),
                currentPH: parseFloat(formData.get('currentPH')),
                targetPH: parseFloat(formData.get('targetPH')),
                acidType: formData.get('acidType')
            });

            // Validate parameters
            const validation = parameters.validate();
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            // Safety validation
            const safetyValidation = this.safetyValidator.validateParameters(parameters);
            if (!safetyValidation.isValid) {
                this.showSafetyWarnings(safetyValidation);
            }

            // Update current parameters
            this.currentParameters = parameters;
            this.updateCurrentSettings(parameters);
            this.updateProcessState('parameters_updated');

            this.showSuccess('Parameters updated successfully');

        } catch (error) {
            console.error('Parameters update failed:', error);
            this.showError('Failed to update parameters: ' + error.message);
        }
    }

    /**
     * Validate individual parameter input
     */
    validateParameterInput(input) {
        const value = parseFloat(input.value);
        const inputName = input.name;
        
        // Remove existing validation classes
        input.classList.remove('valid', 'invalid');
        
        // Basic validation
        if (isNaN(value) || value < 0) {
            input.classList.add('invalid');
            return;
        }
        
        // Specific validations
        switch (inputName) {
            case 'moisture':
            case 'targetMoisture':
                if (value > 100) {
                    input.classList.add('invalid');
                    return;
                }
                break;
            case 'currentPH':
            case 'targetPH':
                if (value > 14) {
                    input.classList.add('invalid');
                    return;
                }
                break;
            case 'temperature':
                if (value > 100 || value < 20) {
                    input.classList.add('invalid');
                    return;
                }
                break;
            case 'batchSize':
                if (value > 10000) {
                    input.classList.add('invalid');
                    return;
                }
                break;
        }
        
        input.classList.add('valid');
    }

    /**
     * Setup optimization controls
     */
    setupOptimizationControls() {
        const runButton = document.getElementById('runOptimization');
        const applyButton = document.getElementById('applyResults');
        const saveButton = document.getElementById('saveResults');

        if (runButton) {
            runButton.addEventListener('click', () => this.runOptimization());
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => this.applyOptimizationResults());
        }

        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveOptimizationResults());
        }
    }

    /**
     * Run optimization
     */
    async runOptimization() {
        if (!this.currentParameters) {
            this.showError('Please set process parameters first');
            return;
        }

        const runButton = document.getElementById('runOptimization');
        const originalText = runButton.textContent;
        
        try {
            // Update UI
            runButton.textContent = 'Optimizing...';
            runButton.disabled = true;

            // Get strategy and constraints
            const strategy = document.getElementById('optimizationStrategy').value;
            const constraints = this.getOptimizationConstraints();

            // Run optimization
            this.optimizationResults = await this.optimizationEngine.optimize(
                this.currentParameters, 
                strategy, 
                constraints
            );

            // Display results
            this.displayOptimizationResults(this.optimizationResults);
            this.updateProcessState('optimization_complete');

            this.showSuccess('Optimization completed successfully');

        } catch (error) {
            console.error('Optimization failed:', error);
            this.showError('Optimization failed: ' + error.message);
        } finally {
            runButton.textContent = originalText;
            runButton.disabled = false;
        }
    }

    /**
     * Get optimization constraints from UI
     */
    getOptimizationConstraints() {
        return {
            safety: document.getElementById('safetyConstraints').checked,
            quality: document.getElementById('qualityConstraints').checked,
            time: document.getElementById('timeConstraints').checked,
            cost: document.getElementById('costConstraints').checked
        };
    }

    /**
     * Display optimization results
     */
    displayOptimizationResults(results) {
        const elements = {
            'optimalConcentration': results.optimalConcentration + '%',
            'optimalFlowRate': results.optimalFlowRate + ' L/min',
            'estimatedTime': results.estimatedTime + ' min',
            'qualityScore': results.qualityScore + '%',
            'efficiency': results.efficiency + '%',
            'safetyMargin': results.safetyMargin + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Show results section
        const resultsSection = document.getElementById('optimizationResults');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
    }

    /**
     * Apply optimization results
     */
    applyOptimizationResults() {
        if (!this.optimizationResults) {
            this.showError('No optimization results to apply');
            return;
        }

        // Update current settings
        this.updateCurrentSettings(this.optimizationResults);
        this.updateProcessState('results_applied');

        // Add alert
        this.processState.addAlert('success', 'Optimization results applied to system');

        this.showSuccess('Optimization results applied successfully');
    }

    /**
     * Save optimization results
     */
    saveOptimizationResults() {
        if (!this.optimizationResults) {
            this.showError('No optimization results to save');
            return;
        }

        try {
            // In a real system, this would save to database
            const data = {
                timestamp: new Date().toISOString(),
                parameters: this.currentParameters.toJSON(),
                results: this.optimizationResults.toJSON()
            };

            localStorage.setItem('pepper_optimization_' + Date.now(), JSON.stringify(data));
            this.showSuccess('Optimization results saved');

        } catch (error) {
            console.error('Save failed:', error);
            this.showError('Failed to save results: ' + error.message);
        }
    }

    /**
     * Setup safety controls
     */
    setupSafetyControls() {
        // Emergency procedures
        const emergencyButtons = document.querySelectorAll('.btn-emergency');
        emergencyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleEmergencyProcedure(e.target.textContent);
            });
        });

        // Safety limit updates
        const safetyInputs = document.querySelectorAll('#safety input[type="number"]');
        safetyInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateSafetyLimits();
            });
        });
    }

    /**
     * Handle emergency procedures
     */
    handleEmergencyProcedure(procedure) {
        console.warn('Emergency procedure activated:', procedure);
        
        switch (procedure) {
            case 'Stop Acid Flow':
                this.stopAcidFlow();
                break;
            case 'Emergency Drain':
                this.emergencyDrain();
                break;
            case 'System Shutdown':
                this.systemShutdown();
                break;
            case 'Alert Supervisor':
                this.alertSupervisor();
                break;
        }

        this.processState.addAlert('warning', `Emergency procedure: ${procedure}`);
        this.updateProcessState('emergency_procedure');
    }

    /**
     * Emergency procedures implementation
     */
    stopAcidFlow() {
        console.log('Stopping acid flow...');
        // Implementation would control actual hardware
    }

    emergencyDrain() {
        console.log('Initiating emergency drain...');
        // Implementation would control actual hardware
    }

    systemShutdown() {
        console.log('Shutting down system...');
        this.monitoringSystem.stopMonitoring();
        this.updateSystemStatus('shutdown');
    }

    alertSupervisor() {
        console.log('Alerting supervisor...');
        // Implementation would send actual alerts
        this.showError('Supervisor has been notified of emergency situation');
    }

    /**
     * Setup report controls
     */
    setupReportControls() {
        // Generate report button
        const generateButton = document.querySelector('#reports .btn-primary');
        if (generateButton) {
            generateButton.addEventListener('click', () => this.generateReport());
        }

        // Download buttons
        const downloadButtons = document.querySelectorAll('.btn-link');
        downloadButtons.forEach(button => {
            if (button.textContent === 'Download') {
                button.addEventListener('click', (e) => {
                    this.downloadReport(e.target.closest('.report-item'));
                });
            }
        });
    }

    /**
     * Generate report
     */
    generateReport() {
        const reportType = document.getElementById('reportType').value;
        const fromDate = document.getElementById('reportFromDate').value;
        const toDate = document.getElementById('reportToDate').value;

        console.log(`Generating ${reportType} report from ${fromDate} to ${toDate}`);
        
        // In a real system, this would generate actual reports
        this.showSuccess('Report generation started. You will be notified when complete.');
    }

    /**
     * Setup emergency stop
     */
    setupEmergencyStop() {
        const emergencyButton = document.querySelector('.emergency-btn');
        if (emergencyButton) {
            emergencyButton.addEventListener('click', () => {
                this.activateEmergencyStop();
            });
        }
    }

    /**
     * Activate emergency stop
     */
    activateEmergencyStop() {
        console.warn('EMERGENCY STOP ACTIVATED');
        
        this.emergencyMode = true;
        this.monitoringSystem.stopMonitoring();
        this.updateSystemStatus('emergency');
        
        // Show emergency modal or overlay
        this.showEmergencyModal();
        
        this.processState.addAlert('error', 'EMERGENCY STOP ACTIVATED - All processes halted');
    }

    /**
     * Setup window events
     */
    setupWindowEvents() {
        window.addEventListener('beforeunload', (e) => {
            if (this.monitoringSystem.isRunning) {
                e.preventDefault();
                e.returnValue = 'Monitoring is active. Are you sure you want to leave?';
            }
        });

        window.addEventListener('resize', () => {
            // Resize charts when window resizes
            setTimeout(() => {
                Object.values(this.monitoringSystem.charts).forEach(chart => {
                    if (chart) chart.resize();
                });
            }, 100);
        });
    }

    /**
     * Setup safety monitoring
     */
    setupSafetyMonitoring() {
        this.safetyValidator.onEmergency((emergencyData) => {
            this.handleSafetyEmergency(emergencyData);
        });

        this.monitoringSystem.onAlert((alert) => {
            this.handleMonitoringAlert(alert);
        });
    }

    /**
     * Handle safety emergencies
     */
    handleSafetyEmergency(emergencyData) {
        console.error('SAFETY EMERGENCY:', emergencyData);
        
        this.emergencyMode = true;
        this.updateSystemStatus('critical');
        this.showCriticalAlert(emergencyData);
        
        // Auto-execute safety procedures
        emergencyData.automaticActions.forEach(action => {
            this.processState.addAlert('error', 'AUTO: ' + action);
        });
    }

    /**
     * Handle monitoring alerts
     */
    handleMonitoringAlert(alert) {
        this.processState.addAlert(alert.type, alert.message);
        
        if (alert.type === 'critical') {
            this.updateSystemStatus('critical');
        }
    }

    /**
     * Update system status
     */
    updateSystemStatus(status) {
        const statusElement = document.getElementById('systemStatus');
        if (statusElement) {
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusElement.className = `status-indicator ${status}`;
        }

        this.processState.status = status;
    }

    /**
     * Update current settings display
     */
    updateCurrentSettings(data) {
        if (data.optimalConcentration !== undefined) {
            const concElement = document.getElementById('currentAcidConc');
            if (concElement) concElement.textContent = data.optimalConcentration + '%';
        }

        if (data.optimalFlowRate !== undefined) {
            const flowElement = document.getElementById('currentFlowRate');
            if (flowElement) flowElement.textContent = data.optimalFlowRate + ' L/min';
        }

        if (data.estimatedTime !== undefined) {
            const timeElement = document.getElementById('processTime');
            if (timeElement) timeElement.textContent = data.estimatedTime + ' min';
        }

        const statusElement = document.getElementById('processStatus');
        if (statusElement) statusElement.textContent = this.processState.status;
    }

    /**
     * Update process state
     */
    updateProcessState(event) {
        console.log('Process state updated:', event);
        
        switch (event) {
            case 'parameters_updated':
                this.processState.currentParameters = this.currentParameters;
                break;
            case 'optimization_complete':
                this.processState.optimizationResults = this.optimizationResults;
                break;
            case 'results_applied':
                this.processState.status = 'running';
                break;
            case 'emergency_procedure':
                this.processState.status = 'emergency';
                break;
        }
    }

    /**
     * Load default parameters
     */
    loadDefaultParameters() {
        const defaults = {
            pepperType: 'cayenne',
            moisture: '85',
            targetMoisture: '10',
            batchSize: '100',
            temperature: '70',
            currentPH: '5.5',
            targetPH: '4.0',
            acidType: 'citric'
        };

        Object.entries(defaults).forEach(([name, value]) => {
            const element = document.querySelector(`[name="${name}"]`);
            if (element) {
                element.value = value;
            }
        });
    }

    /**
     * Update safety display
     */
    updateSafetyDisplay() {
        // Update safety status indicators
        const safetyItems = document.querySelectorAll('.status-item');
        safetyItems.forEach(item => {
            // This would be updated based on real safety status
            item.classList.remove('danger', 'warning');
            item.classList.add('safe');
        });
    }

    /**
     * Load recent reports
     */
    loadRecentReports() {
        // This would load actual reports from storage/database
        console.log('Loading recent reports...');
    }

    /**
     * Show notification messages
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        const errorMessage = 'Validation errors:\n' + errors.join('\n');
        this.showError(errorMessage);
    }

    /**
     * Show safety warnings
     */
    showSafetyWarnings(validation) {
        if (validation.criticalViolations.length > 0) {
            this.showError('Critical safety violations detected!');
        } else if (validation.violations.length > 0) {
            this.showError('Safety violations detected!');
        } else if (validation.warnings.length > 0) {
            this.showWarning('Safety warnings present');
        }
    }

    /**
     * Show emergency modal
     */
    showEmergencyModal() {
        alert('EMERGENCY STOP ACTIVATED\n\nAll processes have been halted for safety.');
    }

    /**
     * Show critical alert
     */
    showCriticalAlert(data) {
        const violations = data.violations.map(v => v.message).join('\n');
        alert('CRITICAL SAFETY ALERT\n\n' + violations + '\n\nAutomatic safety measures activated.');
    }

    /**
     * Get dashboard status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentTab: this.currentTab,
            emergencyMode: this.emergencyMode,
            processState: this.processState.status,
            monitoringActive: this.monitoringSystem.isRunning,
            hasParameters: !!this.currentParameters,
            hasOptimizationResults: !!this.optimizationResults
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
} else {
    window.Dashboard = Dashboard;
}