/**
 * Optimization Engine for Pepper Acid Processing
 * Advanced algorithms for optimizing acid levels and process parameters
 */

class OptimizationEngine {
    constructor(safetyValidator) {
        this.safetyValidator = safetyValidator;
        this.algorithms = {
            'efficiency': this.optimizeForEfficiency.bind(this),
            'quality': this.optimizeForQuality.bind(this),
            'speed': this.optimizeForSpeed.bind(this),
            'cost': this.optimizeForCost.bind(this)
        };
        this.constraints = {
            safety: true,
            quality: true,
            time: false,
            cost: false
        };
        this.optimizationHistory = [];
    }

    /**
     * Main optimization function
     * @param {PepperProcessParameters} parameters - Input parameters
     * @param {string} strategy - Optimization strategy
     * @param {Object} constraints - Optimization constraints
     * @returns {OptimizationResult} Optimization results
     */
    async optimize(parameters, strategy = 'efficiency', constraints = {}) {
        // Update constraints
        this.constraints = { ...this.constraints, ...constraints };
        
        // Validate input parameters
        const validation = this.safetyValidator.validateParameters(parameters);
        if (!validation.isValid && validation.criticalViolations.length > 0) {
            throw new Error('Cannot optimize with critical safety violations');
        }

        // Select optimization algorithm
        const algorithm = this.algorithms[strategy];
        if (!algorithm) {
            throw new Error(`Unknown optimization strategy: ${strategy}`);
        }

        console.log(`Starting optimization with ${strategy} strategy`);
        
        try {
            // Run optimization algorithm
            const result = await algorithm(parameters);
            
            // Validate optimization result
            const resultValidation = this.safetyValidator.validateOptimizationResult(result, parameters);
            if (!resultValidation.isValid) {
                console.warn('Optimization result has safety concerns:', resultValidation.issues);
                // Apply safety corrections
                this.applySafetyCorrections(result, resultValidation);
            }

            // Store optimization history
            this.addToHistory(parameters, result, strategy, constraints);

            return result;
        } catch (error) {
            console.error('Optimization failed:', error);
            throw error;
        }
    }

    /**
     * Optimize for maximum efficiency
     */
    async optimizeForEfficiency(parameters) {
        const acidProps = new DataModels.AcidProperties(parameters.acidType);
        
        // Calculate optimal acid concentration for pH change
        const phDifference = Math.abs(parameters.currentPH - parameters.targetPH);
        const baseConcentration = this.calculateBaseAcidConcentration(parameters, acidProps);
        
        // Optimize for minimum acid usage while maintaining effectiveness
        const optimalConcentration = this.optimizeConcentration(
            baseConcentration, 
            acidProps, 
            'efficiency'
        );

        // Calculate optimal flow rate for efficient mixing
        const optimalFlowRate = this.calculateOptimalFlowRate(
            parameters, 
            optimalConcentration, 
            'efficiency'
        );

        // Estimate process time
        const estimatedTime = this.calculateProcessTime(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        );

        // Calculate quality score
        const qualityScore = this.calculateQualityScore(
            parameters, 
            optimalConcentration, 
            estimatedTime
        );

        // Calculate efficiency score
        const efficiency = this.calculateEfficiencyScore(
            parameters, 
            optimalConcentration, 
            optimalFlowRate, 
            estimatedTime
        );

        // Calculate safety margin
        const safetyMargin = this.calculateSafetyMargin(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        );

        return new DataModels.OptimizationResult({
            optimalConcentration: this.roundTo2Decimals(optimalConcentration),
            optimalFlowRate: this.roundTo2Decimals(optimalFlowRate),
            estimatedTime: Math.round(estimatedTime),
            qualityScore: this.roundTo1Decimal(qualityScore),
            efficiency: this.roundTo1Decimal(efficiency),
            safetyMargin: this.roundTo1Decimal(safetyMargin),
            cost: this.calculateCost(parameters, optimalConcentration, optimalFlowRate, estimatedTime),
            strategy: 'efficiency',
            constraints: Object.keys(this.constraints).filter(k => this.constraints[k]),
            confidence: this.calculateConfidence(parameters, 'efficiency')
        });
    }

    /**
     * Optimize for maximum quality
     */
    async optimizeForQuality(parameters) {
        const acidProps = new DataModels.AcidProperties(parameters.acidType);
        
        // For quality optimization, use slightly higher concentrations and longer process times
        const baseConcentration = this.calculateBaseAcidConcentration(parameters, acidProps);
        const optimalConcentration = this.optimizeConcentration(
            baseConcentration * 1.15, 
            acidProps, 
            'quality'
        );

        // Lower flow rate for better mixing and uniform treatment
        const optimalFlowRate = this.calculateOptimalFlowRate(
            parameters, 
            optimalConcentration, 
            'quality'
        ) * 0.85;

        // Allow longer process time for better quality
        const estimatedTime = this.calculateProcessTime(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        ) * 1.2;

        // Quality score should be higher with this approach
        const qualityScore = this.calculateQualityScore(
            parameters, 
            optimalConcentration, 
            estimatedTime
        ) * 1.1;

        const efficiency = this.calculateEfficiencyScore(
            parameters, 
            optimalConcentration, 
            optimalFlowRate, 
            estimatedTime
        ) * 0.9; // Slightly lower efficiency for higher quality

        const safetyMargin = this.calculateSafetyMargin(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        );

        return new DataModels.OptimizationResult({
            optimalConcentration: this.roundTo2Decimals(optimalConcentration),
            optimalFlowRate: this.roundTo2Decimals(optimalFlowRate),
            estimatedTime: Math.round(estimatedTime),
            qualityScore: this.roundTo1Decimal(Math.min(100, qualityScore)),
            efficiency: this.roundTo1Decimal(efficiency),
            safetyMargin: this.roundTo1Decimal(safetyMargin),
            cost: this.calculateCost(parameters, optimalConcentration, optimalFlowRate, estimatedTime),
            strategy: 'quality',
            constraints: Object.keys(this.constraints).filter(k => this.constraints[k]),
            confidence: this.calculateConfidence(parameters, 'quality')
        });
    }

    /**
     * Optimize for minimum time (speed)
     */
    async optimizeForSpeed(parameters) {
        const acidProps = new DataModels.AcidProperties(parameters.acidType);
        
        // Use higher concentrations and flow rates for faster processing
        const baseConcentration = this.calculateBaseAcidConcentration(parameters, acidProps);
        const optimalConcentration = this.optimizeConcentration(
            baseConcentration * 1.3, 
            acidProps, 
            'speed'
        );

        // Higher flow rate for faster processing
        const optimalFlowRate = this.calculateOptimalFlowRate(
            parameters, 
            optimalConcentration, 
            'speed'
        ) * 1.25;

        // Reduced process time
        const estimatedTime = this.calculateProcessTime(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        ) * 0.75;

        const qualityScore = this.calculateQualityScore(
            parameters, 
            optimalConcentration, 
            estimatedTime
        ) * 0.95; // Slightly reduced quality for speed

        const efficiency = this.calculateEfficiencyScore(
            parameters, 
            optimalConcentration, 
            optimalFlowRate, 
            estimatedTime
        ) * 1.1; // Higher efficiency due to time savings

        const safetyMargin = this.calculateSafetyMargin(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        ) * 0.9; // Reduced safety margin due to aggressive parameters

        return new DataModels.OptimizationResult({
            optimalConcentration: this.roundTo2Decimals(optimalConcentration),
            optimalFlowRate: this.roundTo2Decimals(optimalFlowRate),
            estimatedTime: Math.round(estimatedTime),
            qualityScore: this.roundTo1Decimal(qualityScore),
            efficiency: this.roundTo1Decimal(efficiency),
            safetyMargin: this.roundTo1Decimal(Math.max(10, safetyMargin)),
            cost: this.calculateCost(parameters, optimalConcentration, optimalFlowRate, estimatedTime),
            strategy: 'speed',
            constraints: Object.keys(this.constraints).filter(k => this.constraints[k]),
            confidence: this.calculateConfidence(parameters, 'speed')
        });
    }

    /**
     * Optimize for minimum cost
     */
    async optimizeForCost(parameters) {
        const acidProps = new DataModels.AcidProperties(parameters.acidType);
        
        // Use minimum effective concentrations
        const baseConcentration = this.calculateBaseAcidConcentration(parameters, acidProps);
        const optimalConcentration = this.optimizeConcentration(
            baseConcentration * 0.9, 
            acidProps, 
            'cost'
        );

        // Optimize flow rate for minimum waste
        const optimalFlowRate = this.calculateOptimalFlowRate(
            parameters, 
            optimalConcentration, 
            'cost'
        ) * 0.9;

        // Allow longer process time to reduce chemical usage
        const estimatedTime = this.calculateProcessTime(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        ) * 1.15;

        const qualityScore = this.calculateQualityScore(
            parameters, 
            optimalConcentration, 
            estimatedTime
        ) * 0.92; // Slightly reduced quality for cost savings

        const efficiency = this.calculateEfficiencyScore(
            parameters, 
            optimalConcentration, 
            optimalFlowRate, 
            estimatedTime
        ) * 0.88; // Lower efficiency due to longer time

        const safetyMargin = this.calculateSafetyMargin(
            parameters, 
            optimalConcentration, 
            optimalFlowRate
        );

        return new DataModels.OptimizationResult({
            optimalConcentration: this.roundTo2Decimals(optimalConcentration),
            optimalFlowRate: this.roundTo2Decimals(optimalFlowRate),
            estimatedTime: Math.round(estimatedTime),
            qualityScore: this.roundTo1Decimal(qualityScore),
            efficiency: this.roundTo1Decimal(efficiency),
            safetyMargin: this.roundTo1Decimal(safetyMargin),
            cost: this.calculateCost(parameters, optimalConcentration, optimalFlowRate, estimatedTime),
            strategy: 'cost',
            constraints: Object.keys(this.constraints).filter(k => this.constraints[k]),
            confidence: this.calculateConfidence(parameters, 'cost')
        });
    }

    /**
     * Calculate base acid concentration required
     */
    calculateBaseAcidConcentration(parameters, acidProps) {
        const phDifference = Math.abs(parameters.currentPH - parameters.targetPH);
        const batchVolume = parameters.batchSize / 1000; // Assume 1kg = 1L density
        
        // Base calculation using Henderson-Hasselbalch equation approximation
        let concentration = phDifference * 8; // Base factor
        
        // Adjust for acid type effectiveness
        if (acidProps.properties) {
            concentration *= (1 / acidProps.properties.effectivenessRating);
        }
        
        // Adjust for temperature (higher temp = more effective)
        const tempFactor = 1 - ((parameters.temperature - 60) * 0.005);
        concentration *= tempFactor;
        
        // Adjust for batch size (larger batches need proportionally less concentration)
        const sizeFactor = Math.pow(parameters.batchSize / 1000, -0.1);
        concentration *= sizeFactor;
        
        return Math.max(5, Math.min(50, concentration));
    }

    /**
     * Optimize concentration based on strategy
     */
    optimizeConcentration(baseConcentration, acidProps, strategy) {
        let optimized = baseConcentration;
        
        // Apply safety constraints
        if (this.constraints.safety && acidProps.properties) {
            optimized = Math.min(optimized, acidProps.properties.maxConcentration * acidProps.properties.safetyFactor);
        }
        
        // Apply strategy-specific adjustments
        switch (strategy) {
            case 'efficiency':
                // Find sweet spot between effectiveness and usage
                optimized *= 1.05;
                break;
            case 'quality':
                // Higher concentration for better results
                optimized *= 1.15;
                break;
            case 'speed':
                // High concentration for fast reaction
                optimized *= 1.3;
                break;
            case 'cost':
                // Minimum effective concentration
                optimized *= 0.9;
                break;
        }
        
        return Math.max(1, Math.min(50, optimized));
    }

    /**
     * Calculate optimal flow rate
     */
    calculateOptimalFlowRate(parameters, concentration, strategy) {
        const batchVolume = parameters.batchSize / 1000;
        let baseFlowRate = batchVolume * 0.05; // Base 5% of batch volume per time unit
        
        // Adjust for concentration (higher concentration = lower flow rate needed)
        baseFlowRate *= (25 / concentration);
        
        // Strategy adjustments
        switch (strategy) {
            case 'efficiency':
                baseFlowRate *= 1.1;
                break;
            case 'quality':
                baseFlowRate *= 0.85; // Slower for better mixing
                break;
            case 'speed':
                baseFlowRate *= 1.25; // Faster flow for speed
                break;
            case 'cost':
                baseFlowRate *= 0.9; // Conservative flow rate
                break;
        }
        
        return Math.max(0.5, Math.min(10, baseFlowRate));
    }

    /**
     * Calculate estimated process time
     */
    calculateProcessTime(parameters, concentration, flowRate) {
        const moistureReduction = parameters.initialMoisture - parameters.targetMoisture;
        const batchVolume = parameters.batchSize / 1000;
        
        // Base time calculation (minutes)
        let processTime = (moistureReduction * 2) + (batchVolume * 5);
        
        // Adjust for pH change required
        const phChange = Math.abs(parameters.currentPH - parameters.targetPH);
        processTime += phChange * 15;
        
        // Adjust for temperature (higher temp = faster)
        const tempFactor = Math.max(0.5, 1 - ((parameters.temperature - 60) * 0.01));
        processTime *= tempFactor;
        
        // Adjust for concentration (higher concentration = faster)
        const concFactor = Math.max(0.7, 1 - ((concentration - 20) * 0.01));
        processTime *= concFactor;
        
        // Adjust for flow rate (higher flow rate = potentially faster)
        const flowFactor = Math.max(0.8, 1 - ((flowRate - 2) * 0.05));
        processTime *= flowFactor;
        
        return Math.max(30, Math.min(480, processTime));
    }

    /**
     * Calculate quality score
     */
    calculateQualityScore(parameters, concentration, processTime) {
        let score = 80; // Base score
        
        // Better score for optimal concentration range
        if (concentration >= 15 && concentration <= 35) {
            score += 10;
        } else {
            score -= Math.abs(25 - concentration) * 0.5;
        }
        
        // Better score for adequate process time
        if (processTime >= 60 && processTime <= 240) {
            score += 8;
        } else if (processTime < 60) {
            score -= (60 - processTime) * 0.2;
        }
        
        // Pepper type quality factors
        const pepperQualityFactors = {
            'cayenne': 1.0,
            'habanero': 1.1,
            'jalapeño': 0.95,
            'ghost': 1.2,
            'bell': 0.85
        };
        
        score *= (pepperQualityFactors[parameters.pepperType] || 1.0);
        
        return Math.max(60, Math.min(100, score));
    }

    /**
     * Calculate efficiency score
     */
    calculateEfficiencyScore(parameters, concentration, flowRate, processTime) {
        let score = 75; // Base score
        
        // Efficiency based on time (shorter = more efficient)
        const timeScore = Math.max(0, 100 - (processTime - 60) * 0.5);
        score = (score + timeScore) / 2;
        
        // Efficiency based on acid usage
        const optimalConcentration = 20;
        const concScore = 100 - Math.abs(concentration - optimalConcentration) * 2;
        score = (score + Math.max(50, concScore)) / 2;
        
        // Flow rate efficiency
        const optimalFlowRate = 3;
        const flowScore = 100 - Math.abs(flowRate - optimalFlowRate) * 5;
        score = (score + Math.max(60, flowScore)) / 2;
        
        return Math.max(60, Math.min(100, score));
    }

    /**
     * Calculate safety margin
     */
    calculateSafetyMargin(parameters, concentration, flowRate) {
        const safetyLimits = this.safetyValidator.safetyLimits;
        let margin = 100;
        
        // Temperature safety margin
        const tempMargin = ((safetyLimits.temperature.max - parameters.temperature) / safetyLimits.temperature.max) * 100;
        margin = Math.min(margin, Math.max(0, tempMargin));
        
        // pH safety margin
        const phMargin = Math.min(
            ((parameters.currentPH - safetyLimits.ph.min) / (safetyLimits.ph.max - safetyLimits.ph.min)) * 100,
            ((safetyLimits.ph.max - parameters.currentPH) / (safetyLimits.ph.max - safetyLimits.ph.min)) * 100
        );
        margin = Math.min(margin, Math.max(0, phMargin));
        
        // Concentration safety margin
        const concMargin = ((safetyLimits.acidConcentration.max - concentration) / safetyLimits.acidConcentration.max) * 100;
        margin = Math.min(margin, Math.max(0, concMargin));
        
        // Flow rate safety margin
        const flowMargin = ((safetyLimits.flowRate.max - flowRate) / safetyLimits.flowRate.max) * 100;
        margin = Math.min(margin, Math.max(0, flowMargin));
        
        return margin;
    }

    /**
     * Calculate cost
     */
    calculateCost(parameters, concentration, flowRate, processTime) {
        const acidProps = new DataModels.AcidProperties(parameters.acidType);
        const volumeUsed = flowRate * (processTime / 60); // Liters
        const acidCost = volumeUsed * (concentration / 100) * (acidProps.properties?.costPerLiter || 2.0);
        
        // Energy cost (heating/cooling)
        const energyCost = (processTime / 60) * 0.5; // Simplified energy cost
        
        // Labor cost
        const laborCost = (processTime / 60) * 25; // Simplified labor cost per hour
        
        return Math.round((acidCost + energyCost + laborCost) * 100) / 100;
    }

    /**
     * Calculate confidence level
     */
    calculateConfidence(parameters, strategy) {
        let confidence = 85; // Base confidence
        
        // Higher confidence for well-known pepper types
        const knownPeppers = ['cayenne', 'habanero', 'jalapeño'];
        if (knownPeppers.includes(parameters.pepperType)) {
            confidence += 5;
        }
        
        // Higher confidence for moderate parameter values
        if (parameters.temperature >= 60 && parameters.temperature <= 80) {
            confidence += 3;
        }
        
        if (parameters.currentPH >= 4 && parameters.currentPH <= 6) {
            confidence += 3;
        }
        
        // Strategy-specific confidence adjustments
        switch (strategy) {
            case 'efficiency':
                confidence += 2; // Well-tested strategy
                break;
            case 'quality':
                confidence += 1;
                break;
            case 'speed':
                confidence -= 5; // More aggressive, less predictable
                break;
            case 'cost':
                confidence -= 2; // Conservative estimates
                break;
        }
        
        return Math.max(60, Math.min(95, confidence));
    }

    /**
     * Apply safety corrections to optimization result
     */
    applySafetyCorrections(result, validation) {
        validation.issues.forEach(issue => {
            switch (issue.type) {
                case 'safety':
                    // Reduce concentration if unsafe
                    if (result.optimalConcentration > 40) {
                        result.optimalConcentration *= 0.8;
                    }
                    // Reduce flow rate if unsafe
                    if (result.optimalFlowRate > 8) {
                        result.optimalFlowRate *= 0.8;
                    }
                    break;
                case 'margin':
                    // Increase safety margin by reducing aggressive parameters
                    result.optimalConcentration *= 0.9;
                    result.optimalFlowRate *= 0.95;
                    break;
            }
        });
        
        // Recalculate dependent values
        result.safetyMargin = Math.max(result.safetyMargin, 15);
        result.confidence = Math.max(result.confidence - 10, 50);
    }

    /**
     * Add optimization to history
     */
    addToHistory(parameters, result, strategy, constraints) {
        const record = {
            timestamp: new Date(),
            parameters: parameters.toJSON(),
            result: result.toJSON(),
            strategy: strategy,
            constraints: constraints
        };
        
        this.optimizationHistory.unshift(record);
        
        // Keep only last 50 optimizations
        if (this.optimizationHistory.length > 50) {
            this.optimizationHistory = this.optimizationHistory.slice(0, 50);
        }
    }

    /**
     * Utility functions
     */
    roundTo1Decimal(value) {
        return Math.round(value * 10) / 10;
    }

    roundTo2Decimals(value) {
        return Math.round(value * 100) / 100;
    }

    /**
     * Get optimization history
     */
    getOptimizationHistory(limit = 10) {
        return this.optimizationHistory.slice(0, limit);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizationEngine;
} else {
    window.OptimizationEngine = OptimizationEngine;
}