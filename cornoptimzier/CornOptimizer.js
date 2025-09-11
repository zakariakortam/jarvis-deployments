/**
 * CornOptimizer Service
 * Optimizes acid set point for corn dry thinning process
 */
class CornOptimizer {
  constructor() {
    // Process parameters and constraints
    this.constraints = {
      acidSetPoint: { min: 3.5, max: 4.5, optimal: 4.0 },
      temperature: { min: 45, max: 55, optimal: 50 }, // °C
      flowRate: { min: 100, max: 300, optimal: 200 }, // L/min
      steepTime: { min: 36, max: 52, optimal: 44 }, // hours
      sulfurDioxide: { min: 0.1, max: 0.2, optimal: 0.15 }, // %
      moistureContent: { min: 45, max: 50, optimal: 48 } // %
    };
    
    // Quality targets
    this.qualityTargets = {
      proteinRecovery: 0.92, // 92% minimum
      starchPurity: 0.995, // 99.5% minimum
      fiberRemoval: 0.85, // 85% minimum
      yieldEfficiency: 0.88 // 88% minimum
    };
  }

  /**
   * Calculate optimal acid set point based on process parameters
   */
  calculateOptimalSetPoint(processData) {
    const {
      currentTemp,
      currentFlow,
      cornMoisture,
      targetProteinRecovery,
      targetStarchPurity,
      historicalData = []
    } = processData;

    // Base calculation using empirical formula
    let baseSetPoint = this.constraints.acidSetPoint.optimal;
    
    // Temperature adjustment factor
    const tempFactor = this.calculateTempAdjustment(currentTemp);
    
    // Flow rate adjustment factor
    const flowFactor = this.calculateFlowAdjustment(currentFlow);
    
    // Moisture content adjustment
    const moistureFactor = this.calculateMoistureAdjustment(cornMoisture);
    
    // Quality target adjustments
    const qualityFactor = this.calculateQualityAdjustment(
      targetProteinRecovery,
      targetStarchPurity
    );
    
    // Historical performance adjustment
    const historicalFactor = this.calculateHistoricalAdjustment(historicalData);
    
    // Calculate final set point
    let optimalSetPoint = baseSetPoint * 
      (1 + tempFactor + flowFactor + moistureFactor + qualityFactor + historicalFactor);
    
    // Apply constraints
    optimalSetPoint = Math.max(
      this.constraints.acidSetPoint.min,
      Math.min(this.constraints.acidSetPoint.max, optimalSetPoint)
    );
    
    // Calculate confidence and recommendations
    const confidence = this.calculateConfidence(processData, historicalData);
    const recommendations = this.generateRecommendations(processData, optimalSetPoint);
    
    return {
      optimalSetPoint: Number(optimalSetPoint.toFixed(3)),
      confidence,
      recommendations,
      adjustmentFactors: {
        temperature: tempFactor,
        flowRate: flowFactor,
        moisture: moistureFactor,
        quality: qualityFactor,
        historical: historicalFactor
      }
    };
  }

  calculateTempAdjustment(currentTemp) {
    const optimal = this.constraints.temperature.optimal;
    const deviation = Math.abs(currentTemp - optimal);
    
    if (deviation <= 2) return 0;
    
    const adjustment = deviation * 0.02;
    return currentTemp < optimal ? adjustment : -adjustment;
  }

  calculateFlowAdjustment(currentFlow) {
    const optimal = this.constraints.flowRate.optimal;
    const deviation = Math.abs(currentFlow - optimal);
    
    if (deviation <= 20) return 0;
    
    const adjustment = (deviation / 10) * 0.01;
    return currentFlow > optimal ? adjustment : -adjustment;
  }

  calculateMoistureAdjustment(cornMoisture) {
    const optimal = this.constraints.moistureContent.optimal;
    const deviation = Math.abs(cornMoisture - optimal);
    
    if (deviation <= 1) return 0;
    
    const adjustment = deviation * 0.03;
    return cornMoisture > optimal ? adjustment : -adjustment;
  }

  calculateQualityAdjustment(targetProtein, targetStarch) {
    let adjustment = 0;
    
    if (targetProtein > this.qualityTargets.proteinRecovery) {
      adjustment += (targetProtein - this.qualityTargets.proteinRecovery) * 0.5;
    }
    
    if (targetStarch > this.qualityTargets.starchPurity) {
      adjustment += (targetStarch - this.qualityTargets.starchPurity) * 0.3;
    }
    
    return adjustment;
  }

  calculateHistoricalAdjustment(historicalData) {
    if (!historicalData || historicalData.length < 5) return 0;
    
    const recentData = historicalData.slice(-10);
    let totalDeviation = 0;
    
    recentData.forEach(record => {
      if (record.actualYield && record.targetYield) {
        const yieldRatio = record.actualYield / record.targetYield;
        totalDeviation += (1 - yieldRatio);
      }
    });
    
    return totalDeviation / recentData.length * 0.1;
  }

  calculateConfidence(processData, historicalData) {
    let confidence = 0.5;
    
    if (processData.currentTemp) confidence += 0.1;
    if (processData.currentFlow) confidence += 0.1;
    if (processData.cornMoisture) confidence += 0.1;
    
    if (historicalData && historicalData.length > 0) {
      confidence += Math.min(0.2, historicalData.length * 0.02);
    }
    
    return Math.min(0.95, confidence);
  }

  generateRecommendations(processData, optimalSetPoint) {
    const recommendations = [];
    
    if (processData.currentTemp < this.constraints.temperature.min) {
      recommendations.push({
        type: 'warning',
        parameter: 'temperature',
        message: `Temperature (${processData.currentTemp}°C) is below minimum. Increase to at least ${this.constraints.temperature.min}°C for optimal results.`
      });
    }
    
    if (Math.abs(processData.currentFlow - this.constraints.flowRate.optimal) > 50) {
      recommendations.push({
        type: 'suggestion',
        parameter: 'flowRate',
        message: `Consider adjusting flow rate closer to ${this.constraints.flowRate.optimal} L/min for better efficiency.`
      });
    }
    
    if (optimalSetPoint === this.constraints.acidSetPoint.min || 
        optimalSetPoint === this.constraints.acidSetPoint.max) {
      recommendations.push({
        type: 'alert',
        parameter: 'acidSetPoint',
        message: 'Calculated set point is at constraint boundary. Review process parameters.'
      });
    }
    
    return recommendations;
  }

  simulatePerformance(parameters) {
    const {
      acidSetPoint,
      temperature,
      flowRate,
      steepTime,
      cornMoisture
    } = parameters;
    
    const baseYield = 0.85;
    
    const acidFactor = 1 - Math.abs(acidSetPoint - this.constraints.acidSetPoint.optimal) * 0.1;
    const tempFactor = 1 - Math.abs(temperature - this.constraints.temperature.optimal) * 0.02;
    const flowFactor = 1 - Math.abs(flowRate - this.constraints.flowRate.optimal) * 0.001;
    
    const predictedYield = baseYield * acidFactor * tempFactor * flowFactor;
    const proteinRecovery = 0.92 * acidFactor * 0.95;
    const starchPurity = 0.995 * (1 - Math.abs(acidSetPoint - 4.0) * 0.01);
    
    return {
      predictedYield: Number(predictedYield.toFixed(3)),
      proteinRecovery: Number(proteinRecovery.toFixed(3)),
      starchPurity: Number(starchPurity.toFixed(4)),
      estimatedProcessTime: steepTime,
      economicImpact: this.calculateEconomicImpact(predictedYield, parameters)
    };
  }

  calculateEconomicImpact(yield, parameters) {
    const cornPricePerTon = 250;
    const acidCostPerUnit = 50;
    const energyCostPerHour = 100;
    
    const throughputTonsPerDay = 100;
    const revenuePerTon = 400;
    
    const additionalYield = (yield - 0.85) * throughputTonsPerDay;
    const additionalRevenue = additionalYield * revenuePerTon;
    const additionalAcidCost = Math.abs(parameters.acidSetPoint - 4.0) * acidCostPerUnit;
    
    const netBenefit = additionalRevenue - additionalAcidCost;
    
    return {
      dailyBenefit: Number(netBenefit.toFixed(2)),
      annualBenefit: Number((netBenefit * 350).toFixed(2)),
      yieldImprovement: Number(((yield - 0.85) * 100).toFixed(2))
    };
  }

  getMonitoringData() {
    return {
      timestamp: new Date(),
      currentSetPoint: 4.05,
      actualPH: 4.03,
      temperature: 49.8,
      flowRate: 195,
      steamPressure: 2.1,
      agitatorSpeed: 45,
      tankLevel: 78
    };
  }
}

// Export for use in backend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CornOptimizer;
}