/**
 * AI Optimization Agent
 * Provides intelligent recommendations for energy optimization and cost reduction
 */

class OptimizationAgent {
    constructor() {
        this.optimizationStrategies = this.initializeStrategies();
        this.costModel = this.initializeCostModel();
        this.efficiencyTargets = this.initializeEfficiencyTargets();
        this.schedulingRules = this.initializeSchedulingRules();
        this.historicalOptimizations = [];
        this.learningRate = 0.1;
    }

    initializeStrategies() {
        return {
            energyReduction: [
                {
                    id: 'load_shifting',
                    name: 'Load Shifting',
                    description: 'Shift energy-intensive operations to off-peak hours',
                    category: 'scheduling',
                    potential_savings: 0.25, // 25% cost reduction
                    implementation_difficulty: 'medium',
                    requirements: ['programmable_controllers', 'flexible_scheduling']
                },
                {
                    id: 'vfd_implementation',
                    name: 'Variable Frequency Drives',
                    description: 'Install VFDs on motors to optimize speed and power consumption',
                    category: 'equipment',
                    potential_savings: 0.30, // 30% energy reduction
                    implementation_difficulty: 'high',
                    requirements: ['vfd_compatible_motors', 'electrical_upgrades']
                },
                {
                    id: 'power_factor_correction',
                    name: 'Power Factor Correction',
                    description: 'Improve power factor to reduce reactive power charges',
                    category: 'electrical',
                    potential_savings: 0.15, // 15% reduction in demand charges
                    implementation_difficulty: 'medium',
                    requirements: ['capacitor_banks', 'power_monitoring']
                },
                {
                    id: 'predictive_maintenance',
                    name: 'Predictive Maintenance',
                    description: 'Use sensor data to predict and prevent equipment failures',
                    category: 'maintenance',
                    potential_savings: 0.20, // 20% reduction in downtime costs
                    implementation_difficulty: 'medium',
                    requirements: ['sensor_network', 'analytics_platform']
                },
                {
                    id: 'thermal_optimization',
                    name: 'Thermal Management',
                    description: 'Optimize cooling and heating systems for energy efficiency',
                    category: 'hvac',
                    potential_savings: 0.18, // 18% HVAC energy reduction
                    implementation_difficulty: 'low',
                    requirements: ['temperature_sensors', 'smart_controls']
                }
            ],
            
            productionOptimization: [
                {
                    id: 'process_optimization',
                    name: 'Process Parameter Optimization',
                    description: 'Optimize production parameters for maximum efficiency',
                    category: 'process',
                    potential_savings: 0.12, // 12% efficiency improvement
                    implementation_difficulty: 'low',
                    requirements: ['process_monitoring', 'parameter_control']
                },
                {
                    id: 'equipment_scheduling',
                    name: 'Smart Equipment Scheduling',
                    description: 'Optimize equipment utilization and scheduling',
                    category: 'scheduling',
                    potential_savings: 0.15, // 15% utilization improvement
                    implementation_difficulty: 'medium',
                    requirements: ['production_planning_system', 'real_time_monitoring']
                },
                {
                    id: 'quality_optimization',
                    name: 'Quality-Energy Balance',
                    description: 'Optimize quality parameters while minimizing energy consumption',
                    category: 'quality',
                    potential_savings: 0.10, // 10% waste reduction
                    implementation_difficulty: 'high',
                    requirements: ['quality_sensors', 'advanced_analytics']
                }
            ]
        };
    }

    initializeCostModel() {
        return {
            electricity: {
                peakRate: 28.5, // ¥/kWh
                offPeakRate: 18.2, // ¥/kWh
                demandCharge: 1520, // ¥/kW
                peakHours: { start: 9, end: 17 },
                weekdayMultiplier: 1.0,
                weekendMultiplier: 0.7
            },
            maintenance: {
                preventiveCostMultiplier: 0.3, // 30% of reactive maintenance cost
                downTimeCostPerHour: 50000, // ¥ per hour of downtime
                equipmentReplacementThreshold: 0.6 // Replace when efficiency drops below 60%
            },
            production: {
                qualityCostPerDefect: 1500, // ¥ per defective unit
                wasteDisposalCostPerKg: 120, // ¥ per kg of waste
                laborCostPerHour: 3500 // ¥ per hour of labor
            }
        };
    }

    initializeEfficiencyTargets() {
        return {
            overall_equipment_effectiveness: 0.85, // 85% OEE target
            energy_efficiency: 0.75, // 75% energy efficiency target
            power_factor: 0.95, // 95% power factor target
            temperature_efficiency: { max: 45, optimal: 35 }, // °C
            production_efficiency: 0.90 // 90% production efficiency target
        };
    }

    initializeSchedulingRules() {
        return {
            peak_avoidance: {
                high_power_threshold: 100, // kW
                defer_non_critical: true,
                max_delay_hours: 8
            },
            load_balancing: {
                max_line_imbalance: 0.3, // 30% maximum imbalance
                rebalance_threshold: 0.2 // Trigger rebalancing at 20% imbalance
            },
            maintenance_windows: {
                preferred_hours: [22, 23, 0, 1, 2, 3, 4, 5], // 10 PM to 5 AM
                minimum_duration: 2, // hours
                advance_notice: 24 // hours
            }
        };
    }

    analyze(sensorData, anomalies = []) {
        const analysis = {
            timestamp: new Date(),
            current_performance: this.assessCurrentPerformance(sensorData),
            optimization_opportunities: this.identifyOptimizationOpportunities(sensorData, anomalies),
            cost_analysis: this.performCostAnalysis(sensorData),
            recommendations: [],
            priority_matrix: {},
            implementation_roadmap: {},
            expected_roi: {}
        };

        // Generate specific recommendations
        analysis.recommendations = this.generateRecommendations(analysis);
        
        // Create priority matrix
        analysis.priority_matrix = this.createPriorityMatrix(analysis.recommendations);
        
        // Build implementation roadmap
        analysis.implementation_roadmap = this.buildImplementationRoadmap(analysis.recommendations);
        
        // Calculate expected ROI
        analysis.expected_roi = this.calculateExpectedROI(analysis.recommendations, sensorData);

        return analysis;
    }

    assessCurrentPerformance(sensorData) {
        const performance = {
            energy_efficiency: 0,
            cost_efficiency: 0,
            production_efficiency: 0,
            overall_score: 0,
            metrics: {}
        };

        // Calculate energy efficiency
        const totalPower = sensorData.totalMetrics.totalPower || 0;
        const totalOutput = sensorData.totalMetrics.totalOutput || 0;
        const energyPerUnit = totalOutput > 0 ? totalPower / totalOutput : 0;
        
        // Benchmark against industry standards
        const industryBenchmark = 2.5; // kW per unit (hypothetical)
        performance.energy_efficiency = Math.max(0, Math.min(1, (industryBenchmark - energyPerUnit) / industryBenchmark));

        // Calculate cost efficiency
        const currentCost = sensorData.totalMetrics.currentEnergyCost || 0;
        const targetCost = totalPower * this.costModel.electricity.offPeakRate;
        performance.cost_efficiency = targetCost > 0 ? Math.min(1, targetCost / currentCost) : 0;

        // Calculate production efficiency
        const avgEfficiency = sensorData.totalMetrics.averageEfficiency || 0;
        performance.production_efficiency = avgEfficiency / 100;

        // Overall performance score
        performance.overall_score = (
            performance.energy_efficiency * 0.4 +
            performance.cost_efficiency * 0.4 +
            performance.production_efficiency * 0.2
        );

        // Detailed metrics
        performance.metrics = {
            power_consumption: totalPower,
            energy_cost: currentCost,
            production_output: totalOutput,
            average_efficiency: avgEfficiency,
            energy_per_unit: energyPerUnit,
            cost_per_unit: totalOutput > 0 ? currentCost / totalOutput : 0
        };

        return performance;
    }

    identifyOptimizationOpportunities(sensorData, anomalies) {
        const opportunities = [];
        const currentHour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        const isPeakHour = currentHour >= 9 && currentHour <= 17 && !isWeekend;

        // Peak hour optimization
        if (isPeakHour && sensorData.totalMetrics.totalPower > 300) {
            opportunities.push({
                type: 'immediate',
                category: 'cost_reduction',
                opportunity: 'peak_hour_load_reduction',
                description: 'High power consumption during peak rate hours',
                potential_savings: sensorData.totalMetrics.totalPower * 
                    (this.costModel.electricity.peakRate - this.costModel.electricity.offPeakRate) / 1000,
                confidence: 0.9,
                timeline: 'immediate',
                actions: [
                    'Reduce non-essential equipment operation',
                    'Defer maintenance activities to off-peak hours',
                    'Optimize production scheduling'
                ]
            });
        }

        // Temperature optimization
        const highTempLines = sensorData.productionLines.filter(line => 
            line.temperature > this.efficiencyTargets.temperature_efficiency.optimal
        );
        
        if (highTempLines.length > 0) {
            const coolingPotential = highTempLines.reduce((sum, line) => {
                const tempExcess = line.temperature - this.efficiencyTargets.temperature_efficiency.optimal;
                return sum + (tempExcess * line.power * 0.02); // 2% power reduction per °C
            }, 0);

            opportunities.push({
                type: 'operational',
                category: 'efficiency_improvement',
                opportunity: 'thermal_optimization',
                description: 'Equipment operating above optimal temperature',
                affected_lines: highTempLines.map(l => l.id),
                potential_savings: coolingPotential * this.costModel.electricity.peakRate / 1000,
                confidence: 0.75,
                timeline: 'short_term',
                actions: [
                    'Improve ventilation systems',
                    'Schedule cooling maintenance',
                    'Optimize equipment placement for heat dissipation'
                ]
            });
        }

        // Efficiency optimization
        const lowEfficiencyLines = sensorData.productionLines.filter(line => 
            line.efficiency < this.efficiencyTargets.production_efficiency * 100
        );
        
        if (lowEfficiencyLines.length > 0) {
            const efficiencyPotential = lowEfficiencyLines.reduce((sum, line) => {
                const efficiencyGap = (this.efficiencyTargets.production_efficiency * 100) - line.efficiency;
                return sum + (efficiencyGap / 100 * line.power);
            }, 0);

            opportunities.push({
                type: 'maintenance',
                category: 'efficiency_improvement',
                opportunity: 'production_efficiency_optimization',
                description: 'Production lines operating below target efficiency',
                affected_lines: lowEfficiencyLines.map(l => l.id),
                potential_savings: efficiencyPotential * this.costModel.electricity.peakRate / 1000,
                confidence: 0.8,
                timeline: 'medium_term',
                actions: [
                    'Schedule preventive maintenance',
                    'Calibrate equipment parameters',
                    'Replace worn components',
                    'Optimize production processes'
                ]
            });
        }

        // Load balancing optimization
        const powerValues = sensorData.productionLines.map(line => line.power);
        const loadImbalance = this.calculateLoadImbalance(powerValues);
        
        if (loadImbalance > this.schedulingRules.load_balancing.rebalance_threshold) {
            opportunities.push({
                type: 'scheduling',
                category: 'cost_reduction',
                opportunity: 'load_balancing_optimization',
                description: 'Uneven power distribution across production lines',
                imbalance_ratio: loadImbalance,
                potential_savings: sensorData.totalMetrics.totalPower * 0.05 * this.costModel.electricity.peakRate / 1000, // 5% potential savings
                confidence: 0.7,
                timeline: 'immediate',
                actions: [
                    'Redistribute production loads',
                    'Adjust equipment scheduling',
                    'Implement dynamic load balancing'
                ]
            });
        }

        // Anomaly-based opportunities
        anomalies.forEach(anomaly => {
            if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
                opportunities.push({
                    type: 'corrective',
                    category: 'risk_mitigation',
                    opportunity: `anomaly_resolution_${anomaly.id}`,
                    description: `Address anomaly: ${anomaly.description}`,
                    anomaly_id: anomaly.id,
                    line_id: anomaly.lineId,
                    potential_savings: this.estimateAnomalySavings(anomaly, sensorData),
                    confidence: anomaly.confidence || 0.6,
                    timeline: 'immediate',
                    actions: this.generateAnomalyActions(anomaly)
                });
            }
        });

        return opportunities.sort((a, b) => b.potential_savings - a.potential_savings);
    }

    performCostAnalysis(sensorData) {
        const analysis = {
            current_costs: {},
            projected_costs: {},
            savings_opportunities: {},
            cost_breakdown: {}
        };

        const totalPower = sensorData.totalMetrics.totalPower || 0;
        const totalOutput = sensorData.totalMetrics.totalOutput || 0;
        const currentHour = new Date().getHours();
        const isWeekend = [0, 6].includes(new Date().getDay());
        const isPeakHour = currentHour >= 9 && currentHour <= 17 && !isWeekend;

        // Current energy costs
        const currentRate = isPeakHour ? 
            this.costModel.electricity.peakRate : 
            this.costModel.electricity.offPeakRate;
        
        analysis.current_costs.energy_per_hour = totalPower * currentRate / 1000;
        analysis.current_costs.daily_energy = analysis.current_costs.energy_per_hour * 24;
        analysis.current_costs.monthly_energy = analysis.current_costs.daily_energy * 30;
        analysis.current_costs.annual_energy = analysis.current_costs.daily_energy * 365;

        // Demand charges
        analysis.current_costs.monthly_demand = totalPower * this.costModel.electricity.demandCharge / 1000;
        analysis.current_costs.annual_demand = analysis.current_costs.monthly_demand * 12;

        // Total costs
        analysis.current_costs.monthly_total = analysis.current_costs.monthly_energy + analysis.current_costs.monthly_demand;
        analysis.current_costs.annual_total = analysis.current_costs.annual_energy + analysis.current_costs.annual_demand;

        // Projected costs with optimizations
        const optimizationFactor = 0.8; // Assume 20% reduction potential
        analysis.projected_costs.monthly_total = analysis.current_costs.monthly_total * optimizationFactor;
        analysis.projected_costs.annual_total = analysis.current_costs.annual_total * optimizationFactor;

        // Savings opportunities
        analysis.savings_opportunities.monthly = analysis.current_costs.monthly_total - analysis.projected_costs.monthly_total;
        analysis.savings_opportunities.annual = analysis.current_costs.annual_total - analysis.projected_costs.annual_total;
        analysis.savings_opportunities.percentage = (1 - optimizationFactor) * 100;

        // Cost breakdown by category
        analysis.cost_breakdown = {
            energy: {
                current: analysis.current_costs.monthly_energy,
                potential: analysis.current_costs.monthly_energy * 0.75, // 25% energy reduction
                savings: analysis.current_costs.monthly_energy * 0.25
            },
            demand: {
                current: analysis.current_costs.monthly_demand,
                potential: analysis.current_costs.monthly_demand * 0.85, // 15% demand reduction
                savings: analysis.current_costs.monthly_demand * 0.15
            },
            maintenance: {
                current: totalPower * 50, // Estimated maintenance costs
                potential: totalPower * 35, // 30% reduction through predictive maintenance
                savings: totalPower * 15
            }
        };

        return analysis;
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        // High-impact immediate recommendations
        analysis.optimization_opportunities
            .filter(opp => opp.timeline === 'immediate' && opp.potential_savings > 5000)
            .forEach(opportunity => {
                recommendations.push({
                    id: `rec_${opportunity.opportunity}_${Date.now()}`,
                    type: 'immediate',
                    priority: 'high',
                    title: this.formatOpportunityTitle(opportunity),
                    description: opportunity.description,
                    category: opportunity.category,
                    estimated_savings: {
                        monthly: opportunity.potential_savings * 24 * 30,
                        annual: opportunity.potential_savings * 24 * 365
                    },
                    implementation: {
                        difficulty: 'low',
                        time_required: '1-2 hours',
                        resources_needed: ['operator_time'],
                        cost: 0
                    },
                    actions: opportunity.actions,
                    confidence: opportunity.confidence,
                    roi: this.calculateROI(opportunity.potential_savings * 24 * 365, 0, 1)
                });
            });

        // Strategic long-term recommendations
        const strategicOpportunities = this.identifyStrategicOpportunities(analysis);
        strategicOpportunities.forEach(opportunity => {
            recommendations.push(opportunity);
        });

        // Maintenance-based recommendations
        const maintenanceRecs = this.generateMaintenanceRecommendations(analysis);
        recommendations.push(...maintenanceRecs);

        // Scheduling optimization recommendations
        const schedulingRecs = this.generateSchedulingRecommendations(analysis);
        recommendations.push(...schedulingRecs);

        return recommendations.sort((a, b) => {
            // Sort by priority (high > medium > low) then by ROI
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
            if (priorityDiff !== 0) return priorityDiff;
            return b.roi - a.roi;
        }).slice(0, 15); // Limit to top 15 recommendations
    }

    identifyStrategicOpportunities(analysis) {
        const opportunities = [];

        // VFD implementation for high-power equipment
        if (analysis.current_performance.metrics.power_consumption > 200) {
            const vfdStrategy = this.optimizationStrategies.energyReduction
                .find(s => s.id === 'vfd_implementation');
            
            opportunities.push({
                id: `rec_vfd_${Date.now()}`,
                type: 'strategic',
                priority: 'medium',
                title: 'Variable Frequency Drive Implementation',
                description: vfdStrategy.description,
                category: 'equipment_upgrade',
                estimated_savings: {
                    monthly: analysis.current_performance.metrics.power_consumption * 
                        vfdStrategy.potential_savings * 
                        this.costModel.electricity.peakRate * 24 * 30 / 1000,
                    annual: analysis.current_performance.metrics.power_consumption * 
                        vfdStrategy.potential_savings * 
                        this.costModel.electricity.peakRate * 24 * 365 / 1000
                },
                implementation: {
                    difficulty: 'high',
                    time_required: '2-4 weeks',
                    resources_needed: ['electrical_contractor', 'equipment_procurement', 'downtime_scheduling'],
                    cost: analysis.current_performance.metrics.power_consumption * 800 // Estimated cost per kW
                },
                actions: [
                    'Conduct VFD compatibility assessment',
                    'Obtain quotes from qualified contractors',
                    'Schedule installation during maintenance window',
                    'Train operators on new equipment'
                ],
                confidence: 0.8,
                roi: this.calculateROI(
                    analysis.current_performance.metrics.power_consumption * 
                    vfdStrategy.potential_savings * 
                    this.costModel.electricity.peakRate * 24 * 365 / 1000,
                    analysis.current_performance.metrics.power_consumption * 800,
                    3 // 3 year payback period
                )
            });
        }

        // Power factor correction
        opportunities.push({
            id: `rec_pfc_${Date.now()}`,
            type: 'strategic',
            priority: 'medium',
            title: 'Power Factor Correction System',
            description: 'Install capacitor banks to improve power factor and reduce demand charges',
            category: 'electrical_efficiency',
            estimated_savings: {
                monthly: analysis.current_costs.monthly_demand * 0.15, // 15% demand charge reduction
                annual: analysis.current_costs.annual_demand * 0.15
            },
            implementation: {
                difficulty: 'medium',
                time_required: '1-2 weeks',
                resources_needed: ['electrical_contractor', 'capacitor_banks', 'power_monitoring_equipment'],
                cost: 150000 // Estimated cost in yen
            },
            actions: [
                'Conduct power quality assessment',
                'Calculate required capacitive reactive power',
                'Install automatic power factor correction system',
                'Monitor and adjust for optimal power factor'
            ],
            confidence: 0.85,
            roi: this.calculateROI(analysis.current_costs.annual_demand * 0.15, 150000, 2)
        });

        return opportunities;
    }

    generateMaintenanceRecommendations(analysis) {
        const recommendations = [];

        // Predictive maintenance recommendation
        recommendations.push({
            id: `rec_predictive_maint_${Date.now()}`,
            type: 'operational',
            priority: 'high',
            title: 'Implement Predictive Maintenance Program',
            description: 'Use sensor data analytics to predict equipment failures and optimize maintenance schedules',
            category: 'maintenance_optimization',
            estimated_savings: {
                monthly: analysis.cost_breakdown.maintenance.savings * 0.7, // 70% of maintenance savings from predictive approach
                annual: analysis.cost_breakdown.maintenance.savings * 0.7 * 12
            },
            implementation: {
                difficulty: 'medium',
                time_required: '1-3 months',
                resources_needed: ['maintenance_team_training', 'analytics_software', 'sensor_calibration'],
                cost: 200000 // Software and training costs
            },
            actions: [
                'Establish baseline equipment conditions',
                'Set up automated monitoring and alerts',
                'Train maintenance team on predictive techniques',
                'Develop maintenance optimization algorithms'
            ],
            confidence: 0.75,
            roi: this.calculateROI(analysis.cost_breakdown.maintenance.savings * 0.7 * 12, 200000, 2)
        });

        return recommendations;
    }

    generateSchedulingRecommendations(analysis) {
        const recommendations = [];
        
        // Load shifting recommendation
        recommendations.push({
            id: `rec_load_shift_${Date.now()}`,
            type: 'operational',
            priority: 'high',
            title: 'Implement Smart Load Shifting',
            description: 'Automatically shift non-critical operations to off-peak hours to reduce energy costs',
            category: 'scheduling_optimization',
            estimated_savings: {
                monthly: analysis.current_costs.monthly_energy * 0.2, // 20% savings from rate arbitrage
                annual: analysis.current_costs.annual_energy * 0.2
            },
            implementation: {
                difficulty: 'low',
                time_required: '2-4 weeks',
                resources_needed: ['programmable_controllers', 'scheduling_software', 'operator_training'],
                cost: 80000
            },
            actions: [
                'Identify non-critical operations suitable for shifting',
                'Program automatic scheduling based on rate schedules',
                'Set up override controls for urgent production needs',
                'Monitor and optimize scheduling algorithms'
            ],
            confidence: 0.9,
            roi: this.calculateROI(analysis.current_costs.annual_energy * 0.2, 80000, 1)
        });

        return recommendations;
    }

    createPriorityMatrix(recommendations) {
        const matrix = {
            immediate_high: [],
            immediate_medium: [],
            immediate_low: [],
            short_term_high: [],
            short_term_medium: [],
            short_term_low: [],
            long_term_high: [],
            long_term_medium: [],
            long_term_low: []
        };

        recommendations.forEach(rec => {
            const timeframe = this.categorizeTimeframe(rec.type);
            const key = `${timeframe}_${rec.priority}`;
            
            if (matrix[key]) {
                matrix[key].push({
                    id: rec.id,
                    title: rec.title,
                    savings: rec.estimated_savings.annual,
                    cost: rec.implementation.cost,
                    roi: rec.roi,
                    confidence: rec.confidence
                });
            }
        });

        return matrix;
    }

    buildImplementationRoadmap(recommendations) {
        const roadmap = {
            phase1_immediate: [], // 0-1 months
            phase2_short_term: [], // 1-6 months
            phase3_long_term: [], // 6+ months
            timeline: {},
            dependencies: {},
            resource_allocation: {}
        };

        recommendations.forEach(rec => {
            const phase = this.determineImplementationPhase(rec);
            roadmap[phase].push({
                id: rec.id,
                title: rec.title,
                duration: rec.implementation.time_required,
                resources: rec.implementation.resources_needed,
                dependencies: this.identifyDependencies(rec, recommendations),
                milestones: this.defineMilestones(rec)
            });
        });

        // Sort each phase by priority and dependencies
        Object.keys(roadmap).filter(key => key.startsWith('phase')).forEach(phase => {
            roadmap[phase].sort((a, b) => {
                // Items with no dependencies come first
                const aDeps = a.dependencies.length;
                const bDeps = b.dependencies.length;
                return aDeps - bDeps;
            });
        });

        return roadmap;
    }

    calculateExpectedROI(recommendations, sensorData) {
        const roi = {
            total_investment: 0,
            total_annual_savings: 0,
            payback_period: 0,
            net_present_value: 0,
            internal_rate_of_return: 0,
            by_category: {}
        };

        recommendations.forEach(rec => {
            roi.total_investment += rec.implementation.cost || 0;
            roi.total_annual_savings += rec.estimated_savings.annual || 0;
            
            // Group by category
            if (!roi.by_category[rec.category]) {
                roi.by_category[rec.category] = {
                    investment: 0,
                    savings: 0,
                    roi: 0
                };
            }
            
            roi.by_category[rec.category].investment += rec.implementation.cost || 0;
            roi.by_category[rec.category].savings += rec.estimated_savings.annual || 0;
        });

        // Calculate overall metrics
        roi.payback_period = roi.total_annual_savings > 0 ? 
            roi.total_investment / roi.total_annual_savings : Infinity;
        
        roi.net_present_value = this.calculateNPV(roi.total_annual_savings, roi.total_investment, 0.08, 10);
        roi.internal_rate_of_return = this.calculateIRR(roi.total_investment, roi.total_annual_savings, 10);

        // Calculate category ROIs
        Object.keys(roi.by_category).forEach(category => {
            const cat = roi.by_category[category];
            cat.roi = cat.investment > 0 ? (cat.savings - cat.investment) / cat.investment : 0;
        });

        return roi;
    }

    // Utility methods
    calculateLoadImbalance(powerValues) {
        if (powerValues.length < 2) return 0;
        
        const mean = powerValues.reduce((sum, val) => sum + val, 0) / powerValues.length;
        const maxDeviation = Math.max(...powerValues.map(p => Math.abs(p - mean)));
        return maxDeviation / mean;
    }

    estimateAnomalySavings(anomaly, sensorData) {
        // Estimate potential savings from resolving the anomaly
        const baselinePower = 100; // kW baseline assumption
        let powerReduction = 0;

        switch (anomaly.type) {
            case 'temperature':
                powerReduction = baselinePower * 0.05; // 5% power reduction
                break;
            case 'efficiency':
                powerReduction = baselinePower * 0.1; // 10% power reduction
                break;
            case 'power':
                powerReduction = baselinePower * 0.15; // 15% power reduction
                break;
            default:
                powerReduction = baselinePower * 0.03; // 3% default
        }

        return powerReduction * this.costModel.electricity.peakRate / 1000;
    }

    generateAnomalyActions(anomaly) {
        const actionMap = {
            temperature: [
                'Check cooling system operation',
                'Clean air filters and ventilation',
                'Verify thermal sensors calibration',
                'Consider equipment load reduction'
            ],
            efficiency: [
                'Schedule equipment maintenance',
                'Calibrate production parameters',
                'Check for worn components',
                'Optimize operating conditions'
            ],
            power: [
                'Investigate power quality issues',
                'Check for equipment malfunctions',
                'Verify load connections',
                'Consider power factor correction'
            ]
        };

        return actionMap[anomaly.type] || [
            'Investigate anomaly cause',
            'Monitor equipment closely',
            'Consider maintenance schedule',
            'Document findings for future reference'
        ];
    }

    formatOpportunityTitle(opportunity) {
        const titleMap = {
            peak_hour_load_reduction: 'Reduce Peak Hour Power Consumption',
            thermal_optimization: 'Optimize Equipment Thermal Management',
            production_efficiency_optimization: 'Improve Production Line Efficiency',
            load_balancing_optimization: 'Balance Power Distribution',
            anomaly_resolution: 'Resolve Equipment Anomaly'
        };

        return titleMap[opportunity.opportunity] || 'Optimization Opportunity';
    }

    calculateROI(annualSavings, initialCost, years) {
        if (initialCost === 0) return Infinity;
        const totalSavings = annualSavings * years;
        return ((totalSavings - initialCost) / initialCost) * 100;
    }

    calculateNPV(annualCashFlow, initialInvestment, discountRate, years) {
        let npv = -initialInvestment;
        
        for (let year = 1; year <= years; year++) {
            npv += annualCashFlow / Math.pow(1 + discountRate, year);
        }
        
        return npv;
    }

    calculateIRR(initialInvestment, annualCashFlow, years) {
        // Simplified IRR calculation using approximation
        if (initialInvestment === 0) return Infinity;
        
        const averageReturn = annualCashFlow / initialInvestment;
        return (averageReturn - 1) * 100;
    }

    categorizeTimeframe(type) {
        const typeMap = {
            immediate: 'immediate',
            operational: 'short_term',
            strategic: 'long_term',
            maintenance: 'short_term',
            corrective: 'immediate'
        };
        
        return typeMap[type] || 'short_term';
    }

    determineImplementationPhase(recommendation) {
        const difficulty = recommendation.implementation.difficulty;
        const cost = recommendation.implementation.cost || 0;
        
        if (recommendation.type === 'immediate' || (difficulty === 'low' && cost < 50000)) {
            return 'phase1_immediate';
        } else if (difficulty === 'medium' || (difficulty === 'high' && cost < 200000)) {
            return 'phase2_short_term';
        } else {
            return 'phase3_long_term';
        }
    }

    identifyDependencies(recommendation, allRecommendations) {
        const dependencies = [];
        
        // Simple dependency logic - infrastructure recommendations depend on assessments
        if (recommendation.category === 'equipment_upgrade') {
            const assessmentRec = allRecommendations.find(r => 
                r.category === 'assessment' || r.title.includes('assessment')
            );
            if (assessmentRec) {
                dependencies.push(assessmentRec.id);
            }
        }
        
        return dependencies;
    }

    defineMilestones(recommendation) {
        const defaultMilestones = [
            { name: 'Planning Complete', percentage: 25 },
            { name: 'Implementation Started', percentage: 50 },
            { name: 'Testing Complete', percentage: 75 },
            { name: 'Full Deployment', percentage: 100 }
        ];
        
        return defaultMilestones;
    }
}

// Export for use in other modules
window.OptimizationAgent = OptimizationAgent;