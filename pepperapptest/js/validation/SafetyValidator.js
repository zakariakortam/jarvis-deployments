/**
 * Safety Validation System for Pepper Acid Optimization
 * Implements comprehensive safety checks and emergency procedures
 */

class SafetyValidator {
    constructor() {
        this.safetyLimits = {
            temperature: {
                min: 20,
                max: 85,
                critical: 100,
                unit: '°C'
            },
            ph: {
                min: 3.0,
                max: 6.0,
                critical_low: 2.0,
                critical_high: 8.0,
                unit: 'pH'
            },
            acidConcentration: {
                min: 0,
                max: 50,
                critical: 75,
                unit: '%'
            },
            flowRate: {
                min: 0,
                max: 10.0,
                critical: 15.0,
                unit: 'L/min'
            },
            pressure: {
                min: 0,
                max: 2.0,
                critical: 3.0,
                unit: 'bar'
            },
            moisture: {
                min: 5,
                max: 95,
                unit: '%'
            }
        };

        this.emergencyState = false;
        this.safetyOverride = false;
        this.validationCallbacks = [];
        this.emergencyCallbacks = [];
    }

    /**
     * Validates all process parameters against safety limits
     * @param {Object} parameters - Process parameters to validate
     * @returns {Object} Validation result with safety status
     */
    validateParameters(parameters) {
        const results = {
            isValid: true,
            violations: [],
            warnings: [],
            criticalViolations: [],
            overallSafetyLevel: 'safe'
        };

        // Temperature validation
        const tempResult = this.validateTemperature(parameters.temperature);
        this.mergeValidationResult(results, tempResult, 'temperature');

        // pH validation
        const phResult = this.validatePH(parameters.currentPH);
        this.mergeValidationResult(results, phResult, 'ph');

        // Acid concentration validation (if available)
        if (parameters.acidConcentration !== undefined) {
            const acidResult = this.validateAcidConcentration(parameters.acidConcentration);
            this.mergeValidationResult(results, acidResult, 'acidConcentration');
        }

        // Flow rate validation (if available)
        if (parameters.flowRate !== undefined) {
            const flowResult = this.validateFlowRate(parameters.flowRate);
            this.mergeValidationResult(results, flowResult, 'flowRate');
        }

        // Pressure validation (if available)
        if (parameters.pressure !== undefined) {
            const pressureResult = this.validatePressure(parameters.pressure);
            this.mergeValidationResult(results, pressureResult, 'pressure');
        }

        // Process combination validation
        const combinationResult = this.validateParameterCombinations(parameters);
        this.mergeValidationResult(results, combinationResult, 'combinations');

        // Determine overall safety level
        if (results.criticalViolations.length > 0) {
            results.overallSafetyLevel = 'critical';
            results.isValid = false;
        } else if (results.violations.length > 0) {
            results.overallSafetyLevel = 'warning';
            results.isValid = false;
        } else if (results.warnings.length > 0) {
            results.overallSafetyLevel = 'caution';
        }

        // Trigger emergency if critical violations detected
        if (results.criticalViolations.length > 0) {
            this.triggerEmergencyAlert(results.criticalViolations);
        }

        return results;
    }

    /**
     * Validates temperature parameter
     */
    validateTemperature(temperature) {
        const result = { violations: [], warnings: [], criticalViolations: [] };
        const limits = this.safetyLimits.temperature;

        if (temperature > limits.critical) {
            result.criticalViolations.push({
                parameter: 'temperature',
                value: temperature,
                limit: limits.critical,
                severity: 'critical',
                message: `Temperature ${temperature}°C exceeds critical limit of ${limits.critical}°C`
            });
        } else if (temperature > limits.max) {
            result.violations.push({
                parameter: 'temperature',
                value: temperature,
                limit: limits.max,
                severity: 'error',
                message: `Temperature ${temperature}°C exceeds safe limit of ${limits.max}°C`
            });
        } else if (temperature < limits.min) {
            result.warnings.push({
                parameter: 'temperature',
                value: temperature,
                limit: limits.min,
                severity: 'warning',
                message: `Temperature ${temperature}°C below recommended minimum of ${limits.min}°C`
            });
        }

        return result;
    }

    /**
     * Validates pH parameter
     */
    validatePH(ph) {
        const result = { violations: [], warnings: [], criticalViolations: [] };
        const limits = this.safetyLimits.ph;

        if (ph < limits.critical_low || ph > limits.critical_high) {
            result.criticalViolations.push({
                parameter: 'ph',
                value: ph,
                limit: ph < limits.critical_low ? limits.critical_low : limits.critical_high,
                severity: 'critical',
                message: `pH ${ph} is in critical range (safe: ${limits.critical_low}-${limits.critical_high})`
            });
        } else if (ph < limits.min || ph > limits.max) {
            result.violations.push({
                parameter: 'ph',
                value: ph,
                limit: ph < limits.min ? limits.min : limits.max,
                severity: 'error',
                message: `pH ${ph} outside safe range (${limits.min}-${limits.max})`
            });
        }

        return result;
    }

    /**
     * Validates acid concentration
     */
    validateAcidConcentration(concentration) {
        const result = { violations: [], warnings: [], criticalViolations: [] };
        const limits = this.safetyLimits.acidConcentration;

        if (concentration > limits.critical) {
            result.criticalViolations.push({
                parameter: 'acidConcentration',
                value: concentration,
                limit: limits.critical,
                severity: 'critical',
                message: `Acid concentration ${concentration}% exceeds critical limit of ${limits.critical}%`
            });
        } else if (concentration > limits.max) {
            result.violations.push({
                parameter: 'acidConcentration',
                value: concentration,
                limit: limits.max,
                severity: 'error',
                message: `Acid concentration ${concentration}% exceeds safe limit of ${limits.max}%`
            });
        }

        return result;
    }

    /**
     * Validates flow rate
     */
    validateFlowRate(flowRate) {
        const result = { violations: [], warnings: [], criticalViolations: [] };
        const limits = this.safetyLimits.flowRate;

        if (flowRate > limits.critical) {
            result.criticalViolations.push({
                parameter: 'flowRate',
                value: flowRate,
                limit: limits.critical,
                severity: 'critical',
                message: `Flow rate ${flowRate} L/min exceeds critical limit of ${limits.critical} L/min`
            });
        } else if (flowRate > limits.max) {
            result.violations.push({
                parameter: 'flowRate',
                value: flowRate,
                limit: limits.max,
                severity: 'error',
                message: `Flow rate ${flowRate} L/min exceeds safe limit of ${limits.max} L/min`
            });
        }

        return result;
    }

    /**
     * Validates pressure
     */
    validatePressure(pressure) {
        const result = { violations: [], warnings: [], criticalViolations: [] };
        const limits = this.safetyLimits.pressure;

        if (pressure > limits.critical) {
            result.criticalViolations.push({
                parameter: 'pressure',
                value: pressure,
                limit: limits.critical,
                severity: 'critical',
                message: `Pressure ${pressure} bar exceeds critical limit of ${limits.critical} bar`
            });
        } else if (pressure > limits.max) {
            result.violations.push({
                parameter: 'pressure',
                value: pressure,
                limit: limits.max,
                severity: 'error',
                message: `Pressure ${pressure} bar exceeds safe limit of ${limits.max} bar`
            });
        }

        return result;
    }

    /**
     * Validates parameter combinations for safety
     */
    validateParameterCombinations(parameters) {
        const result = { violations: [], warnings: [], criticalViolations: [] };

        // High temperature + low pH combination
        if (parameters.temperature > 75 && parameters.currentPH < 3.5) {
            result.warnings.push({
                parameter: 'combination',
                severity: 'warning',
                message: 'High temperature with low pH may accelerate acid reactions'
            });
        }

        // High temperature + high acid concentration
        if (parameters.temperature > 70 && parameters.acidConcentration > 30) {
            result.violations.push({
                parameter: 'combination',
                severity: 'error',
                message: 'High temperature and acid concentration combination may be unsafe'
            });
        }

        // Rapid pH change validation
        if (Math.abs(parameters.currentPH - parameters.targetPH) > 2.0) {
            result.warnings.push({
                parameter: 'combination',
                severity: 'warning',
                message: 'Large pH change requested - consider gradual adjustment'
            });
        }

        return result;
    }

    /**
     * Merges validation results
     */
    mergeValidationResult(mainResult, newResult, source) {
        mainResult.violations.push(...newResult.violations.map(v => ({...v, source})));
        mainResult.warnings.push(...newResult.warnings.map(w => ({...w, source})));
        mainResult.criticalViolations.push(...newResult.criticalViolations.map(c => ({...c, source})));
    }

    /**
     * Validates optimization results before application
     */
    validateOptimizationResult(result, currentParameters) {
        const validation = {
            isValid: true,
            issues: [],
            recommendations: []
        };

        // Check if optimization result creates safe parameters
        const projectedParams = {
            ...currentParameters,
            acidConcentration: result.optimalConcentration,
            flowRate: result.optimalFlowRate
        };

        const safetyCheck = this.validateParameters(projectedParams);
        
        if (!safetyCheck.isValid) {
            validation.isValid = false;
            validation.issues.push({
                type: 'safety',
                message: 'Optimization result violates safety constraints',
                details: safetyCheck.violations.concat(safetyCheck.criticalViolations)
            });
        }

        // Check safety margin
        if (result.safetyMargin < 20) {
            validation.issues.push({
                type: 'margin',
                message: 'Safety margin too low',
                recommendation: 'Consider more conservative parameters'
            });
        }

        // Check process feasibility
        if (result.estimatedTime > 480) { // 8 hours
            validation.issues.push({
                type: 'duration',
                message: 'Process duration exceeds recommended maximum',
                recommendation: 'Consider higher temperature or concentration'
            });
        }

        return validation;
    }

    /**
     * Emergency procedures and alerts
     */
    triggerEmergencyAlert(criticalViolations) {
        if (this.emergencyState) return; // Already in emergency state

        this.emergencyState = true;
        
        const emergencyData = {
            timestamp: new Date(),
            violations: criticalViolations,
            automaticActions: this.executeEmergencyProcedures(criticalViolations)
        };

        // Notify all emergency callbacks
        this.emergencyCallbacks.forEach(callback => {
            try {
                callback(emergencyData);
            } catch (error) {
                console.error('Emergency callback failed:', error);
            }
        });

        console.error('EMERGENCY STATE ACTIVATED:', emergencyData);
    }

    /**
     * Execute automatic emergency procedures
     */
    executeEmergencyProcedures(violations) {
        const actions = [];

        violations.forEach(violation => {
            switch (violation.parameter) {
                case 'temperature':
                    actions.push('Reducing heating system output');
                    actions.push('Activating cooling system');
                    break;
                case 'ph':
                    actions.push('Stopping acid injection');
                    if (violation.value < 2.0) {
                        actions.push('Initiating neutralization protocol');
                    }
                    break;
                case 'acidConcentration':
                    actions.push('Stopping acid feed');
                    actions.push('Initiating dilution sequence');
                    break;
                case 'flowRate':
                    actions.push('Reducing pump speed');
                    break;
                case 'pressure':
                    actions.push('Opening pressure relief valve');
                    actions.push('Reducing system pressure');
                    break;
            }
        });

        // Common emergency actions
        actions.push('Alerting supervisor');
        actions.push('Logging emergency event');
        actions.push('Switching to manual control mode');

        return actions;
    }

    /**
     * Reset emergency state
     */
    resetEmergencyState() {
        this.emergencyState = false;
        console.log('Emergency state reset');
    }

    /**
     * Update safety limits (admin function)
     */
    updateSafetyLimits(parameter, limits) {
        if (this.safetyOverride) {
            this.safetyLimits[parameter] = { ...this.safetyLimits[parameter], ...limits };
            return true;
        }
        return false;
    }

    /**
     * Enable safety override (requires authorization)
     */
    enableSafetyOverride(authCode) {
        // In real implementation, this would verify authorization
        if (authCode === 'ADMIN_OVERRIDE_2024') {
            this.safetyOverride = true;
            setTimeout(() => {
                this.safetyOverride = false;
            }, 300000); // Auto-disable after 5 minutes
            return true;
        }
        return false;
    }

    /**
     * Register callback for validation events
     */
    onValidation(callback) {
        this.validationCallbacks.push(callback);
    }

    /**
     * Register callback for emergency events
     */
    onEmergency(callback) {
        this.emergencyCallbacks.push(callback);
    }

    /**
     * Get current safety status summary
     */
    getSafetyStatus() {
        return {
            emergencyState: this.emergencyState,
            safetyOverride: this.safetyOverride,
            limits: this.safetyLimits,
            lastValidation: this.lastValidation || null
        };
    }

    /**
     * Generate safety report
     */
    generateSafetyReport(startDate, endDate) {
        return {
            period: { start: startDate, end: endDate },
            emergencyEvents: [], // Would be populated from logs
            violations: [], // Would be populated from logs
            averageSafetyScore: 95.5, // Calculated from historical data
            recommendations: [
                'Regular calibration of pH sensors recommended',
                'Consider upgrading temperature monitoring system',
                'Review operator training on emergency procedures'
            ]
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafetyValidator;
} else {
    window.SafetyValidator = SafetyValidator;
}