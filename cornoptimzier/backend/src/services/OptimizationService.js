const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const DatabaseService = require('./DatabaseService');
const OptimizationEngine = require('./OptimizationEngine');
const QueueService = require('./QueueService');

class OptimizationService {
  constructor() {
    this.db = new DatabaseService();
    this.engine = new OptimizationEngine();
    this.queue = new QueueService();
  }

  /**
   * Execute optimization synchronously
   */
  async executeSynchronous(optimizationRequest) {
    const optimizationId = uuidv4();
    const startTime = Date.now();

    try {
      // Create optimization record
      await this.db.createOptimization({
        optimization_id: optimizationId,
        ...optimizationRequest,
        status: 'RUNNING',
        started_at: new Date()
      });

      logger.info('Starting synchronous optimization', {
        optimization_id: optimizationId,
        plant_id: optimizationRequest.plant_id,
        unit_id: optimizationRequest.unit_id
      });

      // Execute optimization algorithm
      const results = await this.engine.optimize({
        optimization_id: optimizationId,
        ...optimizationRequest
      });

      const executionTime = Date.now() - startTime;

      // Update optimization record with results
      await this.db.updateOptimization(optimizationId, {
        status: 'COMPLETED',
        completed_at: new Date(),
        results: results,
        execution_time_ms: executionTime
      });

      logger.info('Synchronous optimization completed', {
        optimization_id: optimizationId,
        execution_time_ms: executionTime,
        optimal_efficiency: results.optimal_setpoints?.efficiency
      });

      return {
        optimization_id: optimizationId,
        status: 'COMPLETED',
        results: results,
        execution_time_ms: executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      await this.db.updateOptimization(optimizationId, {
        status: 'FAILED',
        completed_at: new Date(),
        error_message: error.message,
        execution_time_ms: executionTime
      });

      logger.error('Synchronous optimization failed', {
        optimization_id: optimizationId,
        error: error.message,
        execution_time_ms: executionTime
      });

      throw error;
    }
  }

  /**
   * Execute optimization asynchronously
   */
  async executeAsynchronous(optimizationRequest) {
    const optimizationId = uuidv4();

    try {
      // Create optimization record
      await this.db.createOptimization({
        optimization_id: optimizationId,
        ...optimizationRequest,
        status: 'QUEUED',
        created_at: new Date()
      });

      // Add to optimization queue
      await this.queue.addOptimizationJob({
        optimization_id: optimizationId,
        ...optimizationRequest
      });

      logger.info('Asynchronous optimization queued', {
        optimization_id: optimizationId,
        plant_id: optimizationRequest.plant_id,
        unit_id: optimizationRequest.unit_id
      });

      return optimizationId;

    } catch (error) {
      logger.error('Failed to queue asynchronous optimization', {
        error: error.message,
        plant_id: optimizationRequest.plant_id,
        unit_id: optimizationRequest.unit_id
      });

      throw error;
    }
  }

  /**
   * Get optimization by ID
   */
  async getOptimization(optimizationId) {
    try {
      const optimization = await this.db.getOptimizationById(optimizationId);
      return optimization;
    } catch (error) {
      logger.error('Failed to retrieve optimization', {
        error: error.message,
        optimization_id: optimizationId
      });
      throw error;
    }
  }

  /**
   * List optimizations with filtering and pagination
   */
  async listOptimizations(filters, pagination) {
    try {
      const result = await this.db.getOptimizations(filters, pagination);
      return result;
    } catch (error) {
      logger.error('Failed to list optimizations', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  /**
   * Cancel running optimization
   */
  async cancelOptimization(optimizationId, userId) {
    try {
      const optimization = await this.db.getOptimizationById(optimizationId);

      if (!optimization) {
        return false;
      }

      if (!['QUEUED', 'RUNNING'].includes(optimization.status)) {
        return false;
      }

      // Cancel job in queue if queued
      if (optimization.status === 'QUEUED') {
        await this.queue.cancelOptimizationJob(optimizationId);
      }

      // Update status to cancelled
      await this.db.updateOptimization(optimizationId, {
        status: 'CANCELLED',
        completed_at: new Date(),
        error_message: `Cancelled by user ${userId}`
      });

      logger.info('Optimization cancelled', {
        optimization_id: optimizationId,
        cancelled_by: userId
      });

      return true;

    } catch (error) {
      logger.error('Failed to cancel optimization', {
        error: error.message,
        optimization_id: optimizationId
      });
      throw error;
    }
  }

  /**
   * Process optimization job from queue
   */
  async processOptimizationJob(jobData) {
    const { optimization_id } = jobData;
    const startTime = Date.now();

    try {
      // Update status to running
      await this.db.updateOptimization(optimization_id, {
        status: 'RUNNING',
        started_at: new Date()
      });

      logger.info('Processing optimization job', {
        optimization_id,
        plant_id: jobData.plant_id,
        unit_id: jobData.unit_id
      });

      // Execute optimization algorithm
      const results = await this.engine.optimize(jobData);

      const executionTime = Date.now() - startTime;

      // Update with results
      await this.db.updateOptimization(optimization_id, {
        status: 'COMPLETED',
        completed_at: new Date(),
        results: results,
        execution_time_ms: executionTime
      });

      // Create setpoint recommendations
      if (results.optimal_setpoints) {
        await this.createSetpointRecommendations(optimization_id, results);
      }

      logger.info('Optimization job completed', {
        optimization_id,
        execution_time_ms: executionTime,
        optimal_efficiency: results.optimal_setpoints?.efficiency
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;

      await this.db.updateOptimization(optimization_id, {
        status: 'FAILED',
        completed_at: new Date(),
        error_message: error.message,
        execution_time_ms: executionTime
      });

      logger.error('Optimization job failed', {
        optimization_id,
        error: error.message,
        execution_time_ms: executionTime
      });

      throw error;
    }
  }

  /**
   * Create setpoint recommendations from optimization results
   */
  async createSetpointRecommendations(optimizationId, results) {
    try {
      const optimization = await this.db.getOptimizationById(optimizationId);

      const recommendation = {
        optimization_id: optimizationId,
        plant_id: optimization.plant_id,
        unit_id: optimization.unit_id,
        setpoints: results.optimal_setpoints,
        predicted_outcome: results.predicted_outcome,
        confidence_score: results.confidence || 0.8,
        valid_until: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours validity
        status: 'PENDING'
      };

      const recommendationId = await this.db.createSetpointRecommendation(recommendation);

      logger.info('Setpoint recommendation created', {
        recommendation_id: recommendationId,
        optimization_id,
        plant_id: optimization.plant_id
      });

      return recommendationId;

    } catch (error) {
      logger.error('Failed to create setpoint recommendation', {
        error: error.message,
        optimization_id
      });
      throw error;
    }
  }
}

module.exports = OptimizationService;