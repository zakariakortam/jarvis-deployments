const logger = require('../utils/logger');
const DatabaseService = require('./DatabaseService');

class OptimizationEngine {
  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Main optimization function using Differential Evolution algorithm
   */
  async optimize(optimizationRequest) {
    const {
      optimization_id,
      plant_id,
      unit_id,
      optimization_type,
      parameters
    } = optimizationRequest;

    logger.info('Starting optimization algorithm', {
      optimization_id,
      optimization_type,
      plant_id,
      unit_id
    });

    try {
      // Get current process data
      const processData = await this.getCurrentProcessData(plant_id, unit_id);
      
      // Get historical performance data for model parameters
      const historicalData = await this.getHistoricalData(plant_id, unit_id);

      // Initialize optimization parameters based on type
      const config = this.getOptimizationConfig(optimization_type, parameters);

      // Execute Differential Evolution algorithm
      const results = await this.differentialEvolution(
        processData,
        historicalData,
        config
      );

      logger.info('Optimization completed successfully', {
        optimization_id,
        optimal_efficiency: results.optimal_setpoints.efficiency,
        convergence_generations: results.convergence_info.generations
      });

      return results;

    } catch (error) {
      logger.error('Optimization algorithm failed', {
        optimization_id,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Differential Evolution optimization algorithm
   */
  async differentialEvolution(processData, historicalData, config) {
    const {
      populationSize = 60,
      mutationFactor = 0.8,
      crossoverProbability = 0.7,
      maxGenerations = 200,
      tolerance = 1e-6,
      bounds,
      weights
    } = config;

    logger.debug('DE algorithm parameters', {
      populationSize,
      mutationFactor,
      crossoverProbability,
      maxGenerations
    });

    // Initialize population
    let population = this.initializePopulation(populationSize, bounds);
    let fitness = await this.evaluatePopulation(population, processData, historicalData, weights);
    
    let bestIndex = this.findBestIndex(fitness);
    let bestSolution = [...population[bestIndex]];
    let bestFitness = fitness[bestIndex];
    
    let generation = 0;
    let convergenceHistory = [];
    
    while (generation < maxGenerations) {
      const newPopulation = [];
      
      for (let i = 0; i < populationSize; i++) {
        // Mutation: DE/rand/1 strategy
        const mutantVector = this.mutate(population, i, mutationFactor);
        
        // Crossover
        const trialVector = this.crossover(population[i], mutantVector, crossoverProbability);
        
        // Ensure bounds
        this.enforceBounds(trialVector, bounds);
        
        newPopulation.push(trialVector);
      }
      
      // Evaluate new population
      const newFitness = await this.evaluatePopulation(newPopulation, processData, historicalData, weights);
      
      // Selection
      for (let i = 0; i < populationSize; i++) {
        if (newFitness[i] < fitness[i]) { // Minimization
          population[i] = newPopulation[i];
          fitness[i] = newFitness[i];
        }
      }
      
      // Update best solution
      const currentBestIndex = this.findBestIndex(fitness);
      if (fitness[currentBestIndex] < bestFitness) {
        bestFitness = fitness[currentBestIndex];
        bestSolution = [...population[currentBestIndex]];
      }
      
      convergenceHistory.push({
        generation,
        best_fitness: bestFitness,
        average_fitness: fitness.reduce((a, b) => a + b) / fitness.length
      });
      
      generation++;
      
      // Check for convergence
      if (generation > 50) {
        const recentImprovement = convergenceHistory[generation - 50].best_fitness - bestFitness;
        if (Math.abs(recentImprovement) < tolerance) {
          logger.info('Optimization converged', {
            generation,
            improvement: recentImprovement
          });
          break;
        }
      }
    }

    // Convert solution vector to meaningful setpoints
    const optimalSetpoints = this.solutionToSetpoints(bestSolution, bounds);
    
    // Calculate predicted performance
    const predictedOutcome = await this.predictPerformance(
      optimalSetpoints,
      processData,
      historicalData
    );

    return {
      optimal_setpoints: optimalSetpoints,
      predicted_outcome: predictedOutcome,
      confidence: this.calculateConfidence(bestFitness, convergenceHistory),
      convergence_info: {
        generations: generation,
        final_fitness: bestFitness,
        convergence_history: convergenceHistory.slice(-10) // Last 10 generations
      }
    };
  }

  /**
   * Initialize DE population
   */
  initializePopulation(size, bounds) {
    const population = [];
    const dimensions = bounds.length;
    
    for (let i = 0; i < size; i++) {
      const individual = [];
      for (let j = 0; j < dimensions; j++) {
        const [min, max] = bounds[j];
        individual.push(min + Math.random() * (max - min));
      }
      population.push(individual);
    }
    
    return population;
  }

  /**
   * DE mutation operation
   */
  mutate(population, currentIndex, mutationFactor) {
    const size = population.length;
    const dimensions = population[0].length;
    
    // Select three random individuals (different from current)
    const indices = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * size);
      if (randomIndex !== currentIndex && !indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    
    const [r1, r2, r3] = indices;
    const mutant = [];
    
    for (let i = 0; i < dimensions; i++) {
      mutant.push(population[r1][i] + mutationFactor * (population[r2][i] - population[r3][i]));
    }
    
    return mutant;
  }

  /**
   * DE crossover operation
   */
  crossover(target, mutant, crossoverProbability) {
    const dimensions = target.length;
    const trial = [];
    const randomDimension = Math.floor(Math.random() * dimensions);
    
    for (let i = 0; i < dimensions; i++) {
      if (Math.random() < crossoverProbability || i === randomDimension) {
        trial.push(mutant[i]);
      } else {
        trial.push(target[i]);
      }
    }
    
    return trial;
  }

  /**
   * Enforce variable bounds
   */
  enforceBounds(individual, bounds) {
    for (let i = 0; i < individual.length; i++) {
      const [min, max] = bounds[i];
      individual[i] = Math.max(min, Math.min(max, individual[i]));
    }
  }

  /**
   * Evaluate population fitness
   */
  async evaluatePopulation(population, processData, historicalData, weights) {
    const fitness = [];
    
    for (const individual of population) {
      const setpoints = this.solutionToSetpoints(individual, this.getCurrentBounds());
      const cost = await this.objectiveFunction(setpoints, processData, historicalData, weights);
      fitness.push(cost);
    }
    
    return fitness;
  }

  /**
   * Multi-objective function for acid setpoint optimization
   */
  async objectiveFunction(setpoints, processData, historicalData, weights) {
    const {
      acid_flow_rate,
      temperature_setpoint,
      pH_setpoint,
      mixing_power
    } = setpoints;

    // Calculate individual objective components
    
    // 1. Cost objective (acid + energy + quality loss)
    const acidCost = acid_flow_rate * 0.85; // $/L
    const energyCost = (temperature_setpoint - 60) * 0.05 + mixing_power * 0.12 / 1000; // $/hour
    const qualityLoss = this.calculateQualityLoss(setpoints, processData);
    const totalCost = acidCost + energyCost + qualityLoss * 50;

    // 2. Efficiency objective (negative for minimization)
    const efficiency = this.calculateEfficiency(setpoints, processData);
    const efficiencyObjective = -(efficiency - 85.0); // Target 85%+ efficiency

    // 3. Viscosity reduction objective (negative for minimization) 
    const viscosityReduction = this.calculateViscosityReduction(setpoints, processData);
    const viscosityObjective = -(viscosityReduction - 20.0); // Target 20+ reduction

    // 4. pH control objective
    const pHDeviation = Math.abs(pH_setpoint - 6.0); // Target pH 6.0
    
    // Apply constraints penalties
    let penaltyTerm = 0;
    
    // Temperature constraint (≤ 100°C)
    if (temperature_setpoint > 100) {
      penaltyTerm += 1000 * (temperature_setpoint - 100) ** 2;
    }
    
    // pH constraints (5.8-6.2)
    if (pH_setpoint < 5.8 || pH_setpoint > 6.2) {
      const pHViolation = pH_setpoint < 5.8 ? 5.8 - pH_setpoint : pH_setpoint - 6.2;
      penaltyTerm += 1000 * pHViolation ** 2;
    }
    
    // Efficiency constraint (≥ 82%)
    if (efficiency < 82) {
      penaltyTerm += 1000 * (82 - efficiency) ** 2;
    }

    // Viscosity constraint (≥ 15)
    if (viscosityReduction < 15) {
      penaltyTerm += 1000 * (15 - viscosityReduction) ** 2;
    }

    // Weighted multi-objective sum
    const { cost: w1, efficiency: w2, viscosity: w3, pH: w4 } = weights;
    const objectiveValue = w1 * totalCost + w2 * efficiencyObjective + 
                          w3 * viscosityObjective + w4 * pHDeviation + penaltyTerm;

    return objectiveValue;
  }

  /**
   * Calculate conversion efficiency based on setpoints
   */
  calculateEfficiency(setpoints, processData) {
    const { temperature_setpoint, pH_setpoint, mixing_power, acid_flow_rate } = setpoints;
    
    // Efficiency model based on process analysis
    let efficiency = 75.0; // Base efficiency
    
    // Temperature effect (optimal around 90°C)
    efficiency += 0.15 * (temperature_setpoint - 60) - 0.001 * (temperature_setpoint - 90) ** 2;
    
    // pH effect (optimal around 6.0)
    efficiency += 12.0 * Math.exp(-((pH_setpoint - 6.0) / 0.3) ** 2);
    
    // Mixing power effect
    efficiency += 0.08 * Math.sqrt(mixing_power) - 0.0001 * mixing_power;
    
    // Acid flow rate effect (optimal around 2.5 L/min)
    efficiency -= 0.5 * (acid_flow_rate - 2.5) ** 2;
    
    return Math.max(70, Math.min(96, efficiency));
  }

  /**
   * Calculate viscosity reduction factor
   */
  calculateViscosityReduction(setpoints, processData) {
    const { temperature_setpoint, pH_setpoint, mixing_power } = setpoints;
    
    let reduction = 10.0; // Base reduction
    
    // Temperature effect
    reduction += 0.8 * (temperature_setpoint - 60);
    
    // pH effect
    reduction += 5.0 * (6.2 - pH_setpoint);
    
    // Mixing effect
    reduction += 0.1 * mixing_power;
    
    return Math.max(5, Math.min(40, reduction));
  }

  /**
   * Calculate quality loss penalty
   */
  calculateQualityLoss(setpoints, processData) {
    const { temperature_setpoint, pH_setpoint } = setpoints;
    
    let qualityLoss = 0;
    
    // Temperature quality impact
    if (temperature_setpoint > 95) {
      qualityLoss += (temperature_setpoint - 95) * 0.1;
    }
    
    // pH quality impact
    const pHDeviation = Math.abs(pH_setpoint - 6.0);
    if (pHDeviation > 0.2) {
      qualityLoss += (pHDeviation - 0.2) * 2.0;
    }
    
    return qualityLoss;
  }

  /**
   * Convert solution vector to setpoint dictionary
   */
  solutionToSetpoints(solution, bounds) {
    const [acidFlow, temperature, pH, mixingPower] = solution;
    
    return {
      acid_flow_rate: acidFlow,
      temperature_setpoint: temperature,
      pH_setpoint: pH,
      mixing_power: mixingPower,
      efficiency: this.calculateEfficiency({
        acid_flow_rate: acidFlow,
        temperature_setpoint: temperature,
        pH_setpoint: pH,
        mixing_power: mixingPower
      }, {}),
      viscosity_reduction: this.calculateViscosityReduction({
        temperature_setpoint: temperature,
        pH_setpoint: pH,
        mixing_power: mixingPower
      }, {})
    };
  }

  /**
   * Find index of best (minimum) fitness
   */
  findBestIndex(fitness) {
    let bestIndex = 0;
    let bestValue = fitness[0];
    
    for (let i = 1; i < fitness.length; i++) {
      if (fitness[i] < bestValue) {
        bestValue = fitness[i];
        bestIndex = i;
      }
    }
    
    return bestIndex;
  }

  /**
   * Get optimization configuration
   */
  getOptimizationConfig(optimizationType, parameters) {
    const baseConfig = {
      populationSize: 60,
      mutationFactor: 0.8,
      crossoverProbability: 0.7,
      maxGenerations: 200,
      tolerance: 1e-6
    };

    switch (optimizationType) {
      case 'ACID_SETPOINT':
        return {
          ...baseConfig,
          bounds: [
            [0.5, 5.0],   // Acid flow rate (L/min)
            [60, 100],    // Temperature (°C)
            [5.8, 6.2],   // pH
            [10, 100]     // Mixing power (kW)
          ],
          weights: {
            cost: parameters.cost_weight || 0.4,
            efficiency: parameters.efficiency_weight || 0.3,
            viscosity: parameters.viscosity_weight || 0.2,
            pH: parameters.pH_weight || 0.1
          }
        };
      
      default:
        return baseConfig;
    }
  }

  /**
   * Get current bounds for solution conversion
   */
  getCurrentBounds() {
    return [
      [0.5, 5.0],   // Acid flow rate
      [60, 100],    // Temperature  
      [5.8, 6.2],   // pH
      [10, 100]     // Mixing power
    ];
  }

  /**
   * Calculate optimization confidence score
   */
  calculateConfidence(bestFitness, convergenceHistory) {
    if (convergenceHistory.length < 10) return 0.5;
    
    // Check convergence stability
    const recent = convergenceHistory.slice(-10);
    const variance = this.calculateVariance(recent.map(h => h.best_fitness));
    
    // Lower variance = higher confidence
    const stabilityScore = Math.exp(-variance / 100);
    
    // Check constraint satisfaction (penalty terms)
    const constraintScore = bestFitness < 1000 ? 1.0 : 0.1;
    
    return Math.min(0.95, Math.max(0.1, stabilityScore * constraintScore));
  }

  /**
   * Calculate variance of array
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => (value - mean) ** 2);
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  /**
   * Predict performance outcomes
   */
  async predictPerformance(setpoints, processData, historicalData) {
    const efficiency = setpoints.efficiency;
    const currentEfficiency = processData.current_efficiency || 82.0;
    
    const efficiencyImprovement = efficiency - currentEfficiency;
    const costSavingsPerHour = Math.max(0, efficiencyImprovement * 50); // $50 per % improvement
    
    return {
      efficiency_improvement: Math.round(efficiencyImprovement * 10) / 10,
      cost_savings_per_hour: Math.round(costSavingsPerHour * 100) / 100,
      predicted_efficiency: Math.round(efficiency * 10) / 10,
      viscosity_reduction: setpoints.viscosity_reduction,
      energy_savings_percent: Math.max(0, (90 - setpoints.temperature_setpoint) * 0.5)
    };
  }

  /**
   * Get current process data from database
   */
  async getCurrentProcessData(plantId, unitId) {
    try {
      const recentData = await this.db.getRecentProcessData(plantId, unitId, 60); // Last 60 minutes
      
      return {
        current_efficiency: 82.5, // Would be calculated from recent data
        current_temperature: 88.0,
        current_pH: 6.1,
        current_acid_flow: 2.2,
        current_mixing_power: 45.0,
        feed_rate: recentData.feed_rate || 1000,
        starch_concentration: recentData.starch_concentration || 30.0
      };
    } catch (error) {
      logger.warn('Unable to fetch current process data, using defaults', {
        plant_id: plantId,
        unit_id: unitId,
        error: error.message
      });
      
      return {
        current_efficiency: 82.5,
        current_temperature: 88.0,
        current_pH: 6.1,
        current_acid_flow: 2.2,
        current_mixing_power: 45.0,
        feed_rate: 1000,
        starch_concentration: 30.0
      };
    }
  }

  /**
   * Get historical performance data
   */
  async getHistoricalData(plantId, unitId) {
    try {
      const historicalData = await this.db.getHistoricalPerformance(plantId, unitId, 30); // Last 30 days
      return historicalData || {};
    } catch (error) {
      logger.warn('Unable to fetch historical data', {
        plant_id: plantId,
        unit_id: unitId,
        error: error.message
      });
      return {};
    }
  }
}

module.exports = OptimizationEngine;