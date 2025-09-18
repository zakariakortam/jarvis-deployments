/**
 * AI Anomaly Detection Agent
 * Detects unusual patterns in sensor data using statistical methods and machine learning concepts
 */

class AnomalyDetector {
    constructor() {
        this.historicalData = [];
        this.anomalyThresholds = this.initializeThresholds();
        this.detectionRules = this.initializeDetectionRules();
        this.learningEnabled = true;
        this.confidenceThreshold = 0.7;
        this.adaptationRate = 0.1;
    }

    initializeThresholds() {
        return {
            voltage: {
                min: 360, // -10% of 400V
                max: 440, // +10% of 400V
                stdDevMultiplier: 2.5
            },
            temperature: {
                min: 15,
                max: 50,
                stdDevMultiplier: 2.0
            },
            power: {
                stdDevMultiplier: 2.0,
                suddenChangeThreshold: 0.3 // 30% sudden change
            },
            efficiency: {
                min: 0.6, // 60%
                criticalMin: 0.5, // 50%
                stdDevMultiplier: 1.5
            },
            current: {
                stdDevMultiplier: 2.5
            }
        };
    }

    initializeDetectionRules() {
        return {
            // Pattern-based detection rules
            patterns: [
                {
                    name: 'power_spike',
                    description: 'Sudden increase in power consumption',
                    condition: (current, historical) => {
                        const avgPower = this.calculateMovingAverage(historical, 'power', 10);
                        return current.power > avgPower * 1.5;
                    },
                    severity: 'high'
                },
                {
                    name: 'temperature_drift',
                    description: 'Gradual temperature increase over time',
                    condition: (current, historical) => {
                        const recentTemp = this.calculateMovingAverage(historical.slice(-20), 'temperature', 20);
                        const olderTemp = this.calculateMovingAverage(historical.slice(-60, -40), 'temperature', 20);
                        return recentTemp > olderTemp + 5;
                    },
                    severity: 'medium'
                },
                {
                    name: 'efficiency_degradation',
                    description: 'Declining efficiency over time',
                    condition: (current, historical) => {
                        const trend = this.calculateTrend(historical.slice(-30), 'efficiency');
                        return trend < -0.5; // Decreasing by more than 0.5% per measurement
                    },
                    severity: 'high'
                },
                {
                    name: 'voltage_instability',
                    description: 'High voltage fluctuations',
                    condition: (current, historical) => {
                        const recentVoltages = historical.slice(-10).map(d => d.voltage);
                        const stdDev = this.calculateStandardDeviation(recentVoltages);
                        return stdDev > 15; // More than 15V standard deviation
                    },
                    severity: 'medium'
                },
                {
                    name: 'cascading_failure_risk',
                    description: 'Multiple parameters deteriorating simultaneously',
                    condition: (current, historical) => {
                        let issues = 0;
                        if (current.efficiency < 70) issues++;
                        if (current.temperature > 45) issues++;
                        if (current.power > this.calculateMovingAverage(historical, 'power', 10) * 1.3) issues++;
                        return issues >= 2;
                    },
                    severity: 'critical'
                }
            ],
            
            // Statistical anomaly detection
            statistical: {
                zScoreThreshold: 3.0,
                iqrMultiplier: 1.5,
                windowSize: 50
            }
        };
    }

    processData(sensorData) {
        const results = {
            timestamp: new Date(),
            anomalies: [],
            recommendations: [],
            riskAssessment: this.assessRisk(sensorData),
            confidence: 0
        };

        // Store historical data
        this.updateHistoricalData(sensorData);

        // Detect anomalies for each production line
        sensorData.productionLines.forEach(line => {
            const lineAnomalies = this.detectLineAnomalies(line);
            results.anomalies.push(...lineAnomalies);
        });

        // Detect system-wide anomalies
        const systemAnomalies = this.detectSystemAnomalies(sensorData);
        results.anomalies.push(...systemAnomalies);

        // Generate recommendations based on detected anomalies
        results.recommendations = this.generateRecommendations(results.anomalies, sensorData);

        // Calculate overall confidence
        results.confidence = this.calculateConfidence(results.anomalies, sensorData);

        // Adaptive learning
        if (this.learningEnabled) {
            this.updateLearningModel(sensorData, results);
        }

        return results;
    }

    detectLineAnomalies(lineData) {
        const anomalies = [];
        const lineHistory = this.getLineHistory(lineData.id);

        if (lineHistory.length < 10) {
            return anomalies; // Not enough data for meaningful detection
        }

        // Statistical anomaly detection
        const statisticalAnomalies = this.detectStatisticalAnomalies(lineData, lineHistory);
        anomalies.push(...statisticalAnomalies);

        // Pattern-based anomaly detection
        const patternAnomalies = this.detectPatternAnomalies(lineData, lineHistory);
        anomalies.push(...patternAnomalies);

        // Rule-based anomaly detection
        const ruleAnomalies = this.detectRuleBasedAnomalies(lineData, lineHistory);
        anomalies.push(...ruleAnomalies);

        return anomalies;
    }

    detectStatisticalAnomalies(lineData, history) {
        const anomalies = [];
        const metrics = ['voltage', 'temperature', 'power', 'efficiency', 'current'];

        metrics.forEach(metric => {
            const historicalValues = history.map(d => d[metric]).filter(v => v !== undefined);
            
            if (historicalValues.length < 5) return;

            const mean = this.calculateMean(historicalValues);
            const stdDev = this.calculateStandardDeviation(historicalValues);
            const currentValue = lineData[metric];

            // Z-score anomaly detection
            const zScore = Math.abs((currentValue - mean) / stdDev);
            
            if (zScore > this.detectionRules.statistical.zScoreThreshold) {
                anomalies.push({
                    id: `stat_${lineData.id}_${metric}_${Date.now()}`,
                    type: 'statistical',
                    lineId: lineData.id,
                    lineName: lineData.name,
                    metric: metric,
                    currentValue: currentValue,
                    expectedValue: mean,
                    deviation: zScore,
                    severity: this.classifySeverity(zScore, metric),
                    confidence: Math.min(0.95, zScore / 5),
                    description: `Statistical anomaly detected in ${metric}: current value ${currentValue.toFixed(2)} deviates ${zScore.toFixed(2)} standard deviations from normal`,
                    timestamp: new Date()
                });
            }

            // IQR-based outlier detection
            const q1 = this.calculatePercentile(historicalValues, 25);
            const q3 = this.calculatePercentile(historicalValues, 75);
            const iqr = q3 - q1;
            const lowerBound = q1 - (this.detectionRules.statistical.iqrMultiplier * iqr);
            const upperBound = q3 + (this.detectionRules.statistical.iqrMultiplier * iqr);

            if (currentValue < lowerBound || currentValue > upperBound) {
                anomalies.push({
                    id: `iqr_${lineData.id}_${metric}_${Date.now()}`,
                    type: 'outlier',
                    lineId: lineData.id,
                    lineName: lineData.name,
                    metric: metric,
                    currentValue: currentValue,
                    expectedRange: [lowerBound, upperBound],
                    severity: 'medium',
                    confidence: 0.75,
                    description: `Outlier detected in ${metric}: value ${currentValue.toFixed(2)} is outside expected range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]`,
                    timestamp: new Date()
                });
            }
        });

        return anomalies;
    }

    detectPatternAnomalies(lineData, history) {
        const anomalies = [];

        this.detectionRules.patterns.forEach(pattern => {
            try {
                const isAnomaly = pattern.condition(lineData, history);
                
                if (isAnomaly) {
                    anomalies.push({
                        id: `pattern_${lineData.id}_${pattern.name}_${Date.now()}`,
                        type: 'pattern',
                        pattern: pattern.name,
                        lineId: lineData.id,
                        lineName: lineData.name,
                        severity: pattern.severity,
                        confidence: 0.8,
                        description: pattern.description,
                        timestamp: new Date(),
                        context: this.getPatternContext(lineData, history, pattern)
                    });
                }
            } catch (error) {
                console.warn(`Error detecting pattern ${pattern.name}:`, error);
            }
        });

        return anomalies;
    }

    detectRuleBasedAnomalies(lineData, history) {
        const anomalies = [];

        // Temperature thresholds
        if (lineData.temperature > this.anomalyThresholds.temperature.max) {
            anomalies.push({
                id: `rule_${lineData.id}_temp_high_${Date.now()}`,
                type: 'rule',
                rule: 'temperature_threshold',
                lineId: lineData.id,
                lineName: lineData.name,
                severity: 'high',
                confidence: 0.9,
                description: `Temperature ${lineData.temperature}°C exceeds maximum threshold of ${this.anomalyThresholds.temperature.max}°C`,
                timestamp: new Date()
            });
        }

        // Voltage bounds
        if (lineData.voltage < this.anomalyThresholds.voltage.min || 
            lineData.voltage > this.anomalyThresholds.voltage.max) {
            anomalies.push({
                id: `rule_${lineData.id}_voltage_${Date.now()}`,
                type: 'rule',
                rule: 'voltage_bounds',
                lineId: lineData.id,
                lineName: lineData.name,
                severity: 'medium',
                confidence: 0.85,
                description: `Voltage ${lineData.voltage}V is outside safe operating range [${this.anomalyThresholds.voltage.min}V, ${this.anomalyThresholds.voltage.max}V]`,
                timestamp: new Date()
            });
        }

        // Efficiency thresholds
        if (lineData.efficiency < this.anomalyThresholds.efficiency.criticalMin * 100) {
            anomalies.push({
                id: `rule_${lineData.id}_eff_critical_${Date.now()}`,
                type: 'rule',
                rule: 'efficiency_critical',
                lineId: lineData.id,
                lineName: lineData.name,
                severity: 'critical',
                confidence: 0.95,
                description: `Critical efficiency drop: ${lineData.efficiency}% is below minimum acceptable level`,
                timestamp: new Date()
            });
        }

        return anomalies;
    }

    detectSystemAnomalies(sensorData) {
        const anomalies = [];

        // Total power consumption anomaly
        const totalPower = sensorData.totalMetrics.totalPower;
        const historicalTotalPower = this.getSystemMetricHistory('totalPower');
        
        if (historicalTotalPower.length >= 10) {
            const avgPower = this.calculateMean(historicalTotalPower);
            const powerDeviation = Math.abs(totalPower - avgPower) / avgPower;
            
            if (powerDeviation > 0.4) { // 40% deviation
                anomalies.push({
                    id: `system_power_${Date.now()}`,
                    type: 'system',
                    metric: 'total_power',
                    severity: 'high',
                    confidence: 0.8,
                    description: `System-wide power consumption anomaly: ${totalPower.toFixed(2)}kW deviates ${(powerDeviation * 100).toFixed(1)}% from normal`,
                    currentValue: totalPower,
                    expectedValue: avgPower,
                    timestamp: new Date()
                });
            }
        }

        // Load balancing anomaly
        const powerDistribution = sensorData.productionLines.map(line => line.power);
        const powerImbalance = this.calculateLoadImbalance(powerDistribution);
        
        if (powerImbalance > 0.5) { // 50% imbalance
            anomalies.push({
                id: `system_imbalance_${Date.now()}`,
                type: 'system',
                metric: 'load_balance',
                severity: 'medium',
                confidence: 0.75,
                description: `Load imbalance detected: power distribution variance is ${(powerImbalance * 100).toFixed(1)}%`,
                imbalanceRatio: powerImbalance,
                timestamp: new Date()
            });
        }

        return anomalies;
    }

    generateRecommendations(anomalies, sensorData) {
        const recommendations = [];
        const anomalyGroups = this.groupAnomaliesByType(anomalies);

        // Generate recommendations based on anomaly patterns
        Object.entries(anomalyGroups).forEach(([type, typeAnomalies]) => {
            const typeRecommendations = this.generateTypeSpecificRecommendations(type, typeAnomalies, sensorData);
            recommendations.push(...typeRecommendations);
        });

        // Generate preventive recommendations
        const preventiveRecommendations = this.generatePreventiveRecommendations(sensorData);
        recommendations.push(...preventiveRecommendations);

        return recommendations.slice(0, 10); // Limit to top 10 recommendations
    }

    generateTypeSpecificRecommendations(type, anomalies, sensorData) {
        const recommendations = [];

        switch (type) {
            case 'temperature':
                if (anomalies.length > 0) {
                    recommendations.push({
                        id: `rec_temp_${Date.now()}`,
                        type: 'immediate',
                        priority: 'high',
                        category: 'cooling',
                        title: 'Temperature Management Required',
                        description: 'Multiple temperature anomalies detected. Consider improving cooling systems or reducing load.',
                        actions: [
                            'Check HVAC system operation',
                            'Verify cooling fan functionality',
                            'Consider reducing production speed temporarily',
                            'Schedule maintenance for heat-generating components'
                        ],
                        estimatedSavings: 'Up to 15% energy reduction',
                        implementationTime: '2-4 hours'
                    });
                }
                break;

            case 'power':
                if (anomalies.length > 0) {
                    recommendations.push({
                        id: `rec_power_${Date.now()}`,
                        type: 'optimization',
                        priority: 'high',
                        category: 'energy',
                        title: 'Power Consumption Optimization',
                        description: 'Power usage anomalies suggest potential for energy savings through optimization.',
                        actions: [
                            'Implement variable frequency drives (VFDs)',
                            'Schedule high-power operations during off-peak hours',
                            'Review equipment efficiency ratings',
                            'Consider power factor correction'
                        ],
                        estimatedSavings: 'Up to 25% cost reduction',
                        implementationTime: '1-2 days'
                    });
                }
                break;

            case 'efficiency':
                if (anomalies.length > 0) {
                    recommendations.push({
                        id: `rec_eff_${Date.now()}`,
                        type: 'maintenance',
                        priority: 'medium',
                        category: 'performance',
                        title: 'Efficiency Improvement Required',
                        description: 'Production efficiency below optimal levels. Maintenance or adjustment needed.',
                        actions: [
                            'Schedule preventive maintenance',
                            'Calibrate equipment settings',
                            'Check for worn components',
                            'Optimize production parameters'
                        ],
                        estimatedSavings: 'Up to 20% efficiency gain',
                        implementationTime: '4-8 hours'
                    });
                }
                break;
        }

        return recommendations;
    }

    generatePreventiveRecommendations(sensorData) {
        const recommendations = [];

        // Time-based recommendations
        const hour = new Date().getHours();
        if (hour >= 9 && hour <= 17) { // Peak hours
            recommendations.push({
                id: `rec_peak_${Date.now()}`,
                type: 'scheduling',
                priority: 'medium',
                category: 'cost_optimization',
                title: 'Peak Hour Energy Management',
                description: 'Currently in peak rate period. Consider load shifting for non-critical operations.',
                actions: [
                    'Defer non-essential equipment startup',
                    'Reduce lighting in unused areas',
                    'Optimize air conditioning settings',
                    'Consider energy storage discharge'
                ],
                estimatedSavings: 'Up to 30% on peak rate charges',
                implementationTime: 'Immediate'
            });
        }

        return recommendations;
    }

    assessRisk(sensorData) {
        let riskScore = 0;
        let riskFactors = [];

        sensorData.productionLines.forEach(line => {
            // Temperature risk
            if (line.temperature > 45) {
                riskScore += 0.3;
                riskFactors.push(`High temperature on ${line.name}`);
            }

            // Efficiency risk
            if (line.efficiency < 70) {
                riskScore += 0.2;
                riskFactors.push(`Low efficiency on ${line.name}`);
            }

            // Power risk
            if (line.power > 200) {
                riskScore += 0.15;
                riskFactors.push(`High power consumption on ${line.name}`);
            }
        });

        return {
            score: Math.min(1.0, riskScore),
            level: this.classifyRiskLevel(riskScore),
            factors: riskFactors,
            assessment: this.generateRiskAssessment(riskScore, riskFactors)
        };
    }

    classifyRiskLevel(score) {
        if (score >= 0.7) return 'critical';
        if (score >= 0.4) return 'high';
        if (score >= 0.2) return 'medium';
        return 'low';
    }

    classifySeverity(deviation, metric) {
        if (deviation > 4) return 'critical';
        if (deviation > 3) return 'high';
        if (deviation > 2) return 'medium';
        return 'low';
    }

    // Utility methods
    updateHistoricalData(sensorData) {
        const timestamp = new Date();
        
        // Store line-specific data
        sensorData.productionLines.forEach(line => {
            const lineKey = `line_${line.id}`;
            if (!this.historicalData[lineKey]) {
                this.historicalData[lineKey] = [];
            }
            
            this.historicalData[lineKey].push({
                ...line,
                timestamp
            });
            
            // Keep only last 1000 entries per line
            if (this.historicalData[lineKey].length > 1000) {
                this.historicalData[lineKey] = this.historicalData[lineKey].slice(-1000);
            }
        });

        // Store system-wide metrics
        if (!this.historicalData.system) {
            this.historicalData.system = [];
        }
        
        this.historicalData.system.push({
            ...sensorData.totalMetrics,
            timestamp
        });
        
        if (this.historicalData.system.length > 1000) {
            this.historicalData.system = this.historicalData.system.slice(-1000);
        }
    }

    getLineHistory(lineId) {
        return this.historicalData[`line_${lineId}`] || [];
    }

    getSystemMetricHistory(metric) {
        return (this.historicalData.system || []).map(d => d[metric]).filter(v => v !== undefined);
    }

    calculateMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateStandardDeviation(values) {
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return Math.sqrt(this.calculateMean(squaredDiffs));
    }

    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower === upper) {
            return sorted[lower];
        }
        
        return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
    }

    calculateMovingAverage(data, metric, window) {
        if (data.length < window) return 0;
        
        const recent = data.slice(-window);
        const values = recent.map(d => d[metric]).filter(v => v !== undefined);
        return this.calculateMean(values);
    }

    calculateTrend(data, metric) {
        if (data.length < 2) return 0;
        
        const values = data.map(d => d[metric]).filter(v => v !== undefined);
        if (values.length < 2) return 0;
        
        // Simple linear trend calculation
        const x = Array.from({length: values.length}, (_, i) => i);
        const n = values.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    }

    calculateLoadImbalance(powerValues) {
        if (powerValues.length < 2) return 0;
        
        const mean = this.calculateMean(powerValues);
        const maxDeviation = Math.max(...powerValues.map(p => Math.abs(p - mean)));
        return maxDeviation / mean;
    }

    calculateConfidence(anomalies, sensorData) {
        if (anomalies.length === 0) return 0.9; // High confidence when no anomalies
        
        const avgConfidence = anomalies.reduce((sum, a) => sum + (a.confidence || 0.5), 0) / anomalies.length;
        const dataQuality = this.assessDataQuality(sensorData);
        
        return Math.min(0.95, avgConfidence * dataQuality);
    }

    assessDataQuality(sensorData) {
        let quality = 1.0;
        
        // Check for missing data
        sensorData.productionLines.forEach(line => {
            const requiredFields = ['voltage', 'temperature', 'power', 'efficiency'];
            const missingFields = requiredFields.filter(field => line[field] === undefined || line[field] === null);
            quality -= (missingFields.length / requiredFields.length) * 0.2;
        });
        
        return Math.max(0.3, quality);
    }

    groupAnomaliesByType(anomalies) {
        return anomalies.reduce((groups, anomaly) => {
            const key = anomaly.metric || anomaly.type || 'other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(anomaly);
            return groups;
        }, {});
    }

    getPatternContext(lineData, history, pattern) {
        return {
            patternName: pattern.name,
            currentMetrics: {
                voltage: lineData.voltage,
                temperature: lineData.temperature,
                power: lineData.power,
                efficiency: lineData.efficiency
            },
            historicalTrend: this.getMetricTrends(history),
            timeContext: {
                hour: new Date().getHours(),
                dayOfWeek: new Date().getDay(),
                isWeekend: [0, 6].includes(new Date().getDay())
            }
        };
    }

    getMetricTrends(history) {
        const metrics = ['voltage', 'temperature', 'power', 'efficiency'];
        const trends = {};
        
        metrics.forEach(metric => {
            trends[metric] = this.calculateTrend(history.slice(-20), metric);
        });
        
        return trends;
    }

    generateRiskAssessment(score, factors) {
        let assessment = '';
        
        if (score >= 0.7) {
            assessment = 'Critical risk detected. Immediate intervention recommended to prevent equipment damage or production failure.';
        } else if (score >= 0.4) {
            assessment = 'High risk level. Schedule maintenance and monitoring within next few hours.';
        } else if (score >= 0.2) {
            assessment = 'Medium risk level. Consider preventive maintenance and continued monitoring.';
        } else {
            assessment = 'Low risk level. Normal operation with routine monitoring recommended.';
        }
        
        return assessment;
    }

    updateLearningModel(sensorData, results) {
        // Simple adaptive learning - adjust thresholds based on normal operation
        if (results.anomalies.length === 0) {
            // No anomalies detected, gradually relax thresholds
            this.adaptThresholds(sensorData, 'relax');
        } else if (results.anomalies.length > 10) {
            // Too many anomalies, tighten thresholds
            this.adaptThresholds(sensorData, 'tighten');
        }
    }

    adaptThresholds(sensorData, direction) {
        const factor = direction === 'relax' ? (1 + this.adaptationRate) : (1 - this.adaptationRate);
        
        // Adapt statistical thresholds
        Object.keys(this.anomalyThresholds).forEach(metric => {
            if (this.anomalyThresholds[metric].stdDevMultiplier) {
                this.anomalyThresholds[metric].stdDevMultiplier *= factor;
                // Keep within reasonable bounds
                this.anomalyThresholds[metric].stdDevMultiplier = Math.max(1.5, Math.min(4.0, this.anomalyThresholds[metric].stdDevMultiplier));
            }
        });
    }
}

// Export for use in other modules
window.AnomalyDetector = AnomalyDetector;