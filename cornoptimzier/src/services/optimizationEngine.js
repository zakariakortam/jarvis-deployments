/**
 * Optimization Engine for Acid Set Point Control
 * Implements mathematical optimization algorithms for corn dry thinning process
 */

const { create, all } = require('mathjs');
const { Matrix } = require('ml-matrix');
const cron = require('node-cron');
const logger = require('../utils/logger');
const { getPool } = require('../config/database');

const math = create(all);

class OptimizationEngine {
  constructor() {
    this.isRunning = false;
    this.optimizationInterval = process.env.OPTIMIZATION_INTERVAL || 300000; // 5 minutes
    this.safetyBuffer = parseFloat(process.env.SAFETY_BUFFER_PERCENT) || 5;
    this.confidenceThreshold = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.85;
    this.maxPHChangeRate = parseFloat(process.env.MAX_PH_CHANGE_RATE) || 0.2;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Optimization engine is already running');
      return;
    }

    this.isRunning = true;
    
    // Run optimization every 5 minutes
    this.scheduler = cron.schedule('*/5 * * * *', async () => {
      await this.runOptimizationCycle();
    });

    logger.info('🧠 Optimization Engine started');
  }

  stop() {
    if (this.scheduler) {
      this.scheduler.stop();
    }
    this.isRunning = false;
    logger.info(' Optimization Engine stopped');
  }

  async runOptimizationCycle() {
    const pool = getPool();
    
    try {
      logger.info(' Starting optimization cycle');
      
      // Get all active plants
      const plantsResult = await pool.query(
        'SELECT plant_id FROM plants WHERE status = $1',
        ['active']
      );

      for (const plant of plantsResult.rows) {
        await this.optimizePlant(plant.plant_id);
      }

      logger.info(' Optimization cycle completed');
      
    } catch (error) {
      logger.error(' Optimization cycle failed:', error);
    }
  }

  async optimizePlant(plantId) {
    const pool = getPool();
    const optimizationRunId = await this.createOptimizationRun(plantId);
    
    try {
      // Step 1: Collect recent process data
      const processData = await this.collectProcessData(plantId);
      
      if (!processData || processData.length === 0) {
        logger.warn(`No process data available for plant ${plantId}`);
        return;
      }

      // Step 2: Run optimization algorithm
      const optimizationResults = await this.runOptimizationAlgorithm(plantId, processData);
      
      // Step 3: Validate safety constraints
      const safeResults = await this.applySafetyConstraints(plantId, optimizationResults);
      
      // Step 4: Store optimization results
      await this.storeOptimizationResults(plantId, optimizationRunId, safeResults);
      
      // Step 5: Update optimization run status
      await this.updateOptimizationRun(optimizationRunId, 'completed', {
        results_count: safeResults.length,
        avg_confidence: safeResults.reduce((sum, r) => sum + r.confidence, 0) / safeResults.length
      });

      logger.info(` Plant ${plantId} optimization completed with ${safeResults.length} recommendations`);
      
    } catch (error) {
      logger.error(` Plant ${plantId} optimization failed:`, error);
      await this.updateOptimizationRun(optimizationRunId, 'failed', { error: error.message });
    }
  }

  async collectProcessData(plantId) {
    const pool = getPool();
    
    // Collect last 4 hours of data for optimization
    const query = `
      SELECT 
        pm.sensor_id,
        s.sensor_type,
        AVG(pm.value) as avg_value,
        STDDEV(pm.value) as std_value,
        COUNT(*) as data_points,
        MAX(pm.time) as latest_time
      FROM process_measurements pm
      JOIN sensors s ON pm.sensor_id = s.sensor_id
      WHERE pm.plant_id = $1 
        AND pm.time >= NOW() - INTERVAL '4 hours'
        AND pm.quality = 'good'
      GROUP BY pm.sensor_id, s.sensor_type
      HAVING COUNT(*) >= 20
    `;
    
    const result = await pool.query(query, [plantId]);
    return result.rows;
  }

  async runOptimizationAlgorithm(plantId, processData) {
    // Implement multi-objective optimization for acid thinning process
    const results = [];
    
    // Find pH sensors
    const phSensors = processData.filter(data => data.sensor_type === 'ph');
    const tempSensors = processData.filter(data => data.sensor_type === 'temperature');
    const flowSensors = processData.filter(data => data.sensor_type === 'flow_rate');
    
    for (const phSensor of phSensors) {
      const optimization = await this.optimizeAcidSetPoint({
        plantId,
        currentPH: phSensor.avg_value,
        phVariability: phSensor.std_value,
        temperature: tempSensors.length > 0 ? tempSensors[0].avg_value : 50,
        flowRate: flowSensors.length > 0 ? flowSensors[0].avg_value : 100,
        processData
      });

      if (optimization) {
        results.push(optimization);
      }
    }
    
    return results;
  }

  async optimizeAcidSetPoint(params) {
    const { plantId, currentPH, phVariability, temperature, flowRate } = params;
    
    try {
      // Optimization objective function based on corn dry thinning process
      const objectiveFunction = (ph, temp, flow) => {
        // Viscosity reduction efficiency (primary objective)
        const viscosityReduction = this.calculateViscosityReduction(ph, temp, flow);
        
        // Energy efficiency consideration
        const energyEfficiency = this.calculateEnergyEfficiency(ph, temp, flow);
        
        // Yield optimization
        const yieldFactor = this.calculateYieldFactor(ph, temp, flow);
        
        // Safety penalty
        const safetyPenalty = this.calculateSafetyPenalty(ph, temp, flow);
        
        // Combined objective (maximize)
        return (0.4 * viscosityReduction + 0.3 * energyEfficiency + 0.2 * yieldFactor - 0.1 * safetyPenalty);
      };

      // Current performance
      const currentObjective = objectiveFunction(currentPH, temperature, flowRate);
      
      // Optimization using gradient-free method (simplified)
      const optimizationRange = {
        phMin: Math.max(4.0, currentPH - this.maxPHChangeRate),
        phMax: Math.min(8.0, currentPH + this.maxPHChangeRate),
        phStep: 0.05
      };

      let bestPH = currentPH;
      let bestObjective = currentObjective;
      let bestConfidence = 0.5;

      // Grid search optimization (can be replaced with more sophisticated algorithms)
      for (let ph = optimizationRange.phMin; ph <= optimizationRange.phMax; ph += optimizationRange.phStep) {
        const objective = objectiveFunction(ph, temperature, flowRate);
        
        if (objective > bestObjective) {
          bestPH = ph;
          bestObjective = objective;
          
          // Calculate confidence based on improvement and process stability
          const improvement = (bestObjective - currentObjective) / Math.abs(currentObjective);
          const stabilityFactor = 1 - Math.min(phVariability / currentPH, 0.5);
          bestConfidence = Math.min(0.95, 0.5 + improvement * 2 + stabilityFactor * 0.3);
        }
      }

      // Only recommend changes with sufficient confidence and improvement
      const improvementThreshold = 0.02; // 2% minimum improvement
      const improvement = (bestObjective - currentObjective) / Math.abs(currentObjective);
      
      if (improvement > improvementThreshold && bestConfidence > this.confidenceThreshold) {
        return {
          plantId,
          processUnit: 'acid_thinning_reactor',
          parameterName: 'ph_setpoint',
          currentValue: currentPH,
          optimizedValue: bestPH,
          confidence: bestConfidence,
          expectedImprovement: improvement * 100,
          safetyCheckPassed: await this.validateSafetyLimits(plantId, 'ph', bestPH),
          algorithm: 'grid_search_multi_objective_v1.0'
        };
      }

      return null;
      
    } catch (error) {
      logger.error('Optimization algorithm failed:', error);
      return null;
    }
  }

  calculateViscosityReduction(ph, temperature, flowRate) {
    // Model based on acid thinning kinetics
    // Lower pH increases hydrolysis rate, higher temp increases rate
    const acidEffect = Math.max(0, (7.0 - ph) / 3.0); // Higher effect for lower pH
    const tempEffect = Math.min(1.0, temperature / 60.0); // Optimal around 60°C
    const flowEffect = Math.min(1.0, flowRate / 200.0); // Residence time consideration
    
    return acidEffect * tempEffect * flowEffect;
  }

  calculateEnergyEfficiency(ph, temperature, flowRate) {
    // Energy cost increases with temperature and extreme pH
    const tempPenalty = Math.pow(temperature / 50.0, 2); // Quadratic energy cost
    const phPenalty = Math.pow(Math.abs(ph - 6.0), 2); // Neutral pH requires less neutralization
    
    return Math.max(0, 1.0 - 0.3 * tempPenalty - 0.2 * phPenalty);
  }

  calculateYieldFactor(ph, temperature, flowRate) {
    // Starch yield is maximized in specific pH and temperature ranges
    const optimalPH = 5.5;
    const optimalTemp = 55;
    
    const phDistance = Math.abs(ph - optimalPH);
    const tempDistance = Math.abs(temperature - optimalTemp);
    
    const phFactor = Math.max(0, 1.0 - phDistance / 2.0);
    const tempFactor = Math.max(0, 1.0 - tempDistance / 20.0);
    
    return phFactor * tempFactor;
  }

  calculateSafetyPenalty(ph, temperature, flowRate) {
    let penalty = 0;
    
    // pH safety limits
    if (ph < 4.2 || ph > 7.8) penalty += 0.5;
    
    // Temperature safety limits
    if (temperature > 70) penalty += 0.3;
    
    // Flow rate safety limits
    if (flowRate > 800 || flowRate < 50) penalty += 0.2;
    
    return penalty;
  }

  async validateSafetyLimits(plantId, parameterType, value) {
    const pool = getPool();
    
    try {
      const query = `
        SELECT min_value, max_value, alarm_low, alarm_high
        FROM sensors 
        WHERE plant_id = $1 AND sensor_type = $2 
        LIMIT 1
      `;
      
      const result = await pool.query(query, [plantId, parameterType]);
      
      if (result.rows.length === 0) return false;
      
      const limits = result.rows[0];
      
      return value >= limits.min_value && 
             value <= limits.max_value && 
             value >= limits.alarm_low && 
             value <= limits.alarm_high;
             
    } catch (error) {
      logger.error('Safety validation failed:', error);
      return false;
    }
  }

  async applySafetyConstraints(plantId, optimizationResults) {
    const safeResults = [];
    
    for (const result of optimizationResults) {
      // Apply additional safety checks
      const changeRate = Math.abs(result.optimizedValue - result.currentValue) / result.currentValue;
      
      if (changeRate <= this.maxPHChangeRate && result.safetyCheckPassed) {
        safeResults.push(result);
      } else {
        logger.warn(`Safety constraint violation for ${plantId}: ${result.parameterName}`);
      }
    }
    
    return safeResults;
  }

  async createOptimizationRun(plantId) {
    const pool = getPool();
    
    const result = await pool.query(`
      INSERT INTO optimization_runs (plant_id, algorithm_version, start_time, status)
      VALUES ($1, $2, NOW(), $3)
      RETURNING id
    `, [plantId, 'multi_objective_v1.0', 'running']);
    
    return result.rows[0].id;
  }

  async updateOptimizationRun(runId, status, summary) {
    const pool = getPool();
    
    await pool.query(`
      UPDATE optimization_runs 
      SET status = $1, end_time = NOW(), results_summary = $2
      WHERE id = $3
    `, [status, JSON.stringify(summary), runId]);
  }

  async storeOptimizationResults(plantId, runId, results) {
    const pool = getPool();
    
    for (const result of results) {
      await pool.query(`
        INSERT INTO optimization_results (
          plant_id, optimization_run_id, process_unit, parameter_name,
          current_value, optimized_value, confidence_score, safety_check_passed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        plantId, runId, result.processUnit, result.parameterName,
        result.currentValue, result.optimizedValue, result.confidence,
        result.safetyCheckPassed
      ]);
    }
  }
}

module.exports = OptimizationEngine;