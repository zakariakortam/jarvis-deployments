const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const OptimizationService = require('../services/OptimizationService');
const logger = require('../utils/logger');

const router = express.Router();
const optimizationService = new OptimizationService();

// Execute optimization
router.post('/execute',
  [
    body('plant_id').isString().isLength({ min: 2, max: 10 }),
    body('unit_id').isString().isLength({ min: 2, max: 20 }),
    body('optimization_type').isIn(['ACID_SETPOINT', 'TEMPERATURE_OPT', 'FLOW_OPT']),
    body('parameters').isObject(),
    body('execution_mode').optional().isIn(['SYNC', 'ASYNC']).default('ASYNC')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const {
        plant_id,
        unit_id,
        optimization_type,
        parameters,
        execution_mode = 'ASYNC'
      } = req.body;

      logger.info('Optimization request received', {
        plant_id,
        unit_id,
        optimization_type,
        execution_mode,
        user: req.user?.id
      });

      if (execution_mode === 'SYNC') {
        // Synchronous execution
        const result = await optimizationService.executeSynchronous({
          plant_id,
          unit_id,
          optimization_type,
          parameters,
          user_id: req.user?.id
        });

        res.status(200).json(result);
      } else {
        // Asynchronous execution
        const optimizationId = await optimizationService.executeAsynchronous({
          plant_id,
          unit_id,
          optimization_type,
          parameters,
          user_id: req.user?.id
        });

        res.status(202).json({
          optimization_id: optimizationId,
          status: 'QUEUED',
          estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
      }
    } catch (error) {
      logger.error('Optimization execution failed', {
        error: error.message,
        stack: error.stack,
        plant_id: req.body.plant_id,
        unit_id: req.body.unit_id
      });

      res.status(500).json({
        error: 'Optimization Failed',
        message: 'Unable to execute optimization request'
      });
    }
  }
);

// Get optimization status and results
router.get('/:optimization_id',
  [
    param('optimization_id').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const { optimization_id } = req.params;

      const optimization = await optimizationService.getOptimization(optimization_id);

      if (!optimization) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Optimization not found'
        });
      }

      res.status(200).json(optimization);
    } catch (error) {
      logger.error('Failed to retrieve optimization', {
        error: error.message,
        optimization_id: req.params.optimization_id
      });

      res.status(500).json({
        error: 'Server Error',
        message: 'Unable to retrieve optimization'
      });
    }
  }
);

// List optimizations with filtering
router.get('/',
  [
    query('plant_id').optional().isString().isLength({ min: 2, max: 10 }),
    query('unit_id').optional().isString().isLength({ min: 2, max: 20 }),
    query('status').optional().isIn(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED']),
    query('limit').optional().isInt({ min: 1, max: 100 }).default(50),
    query('offset').optional().isInt({ min: 0 }).default(0)
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const filters = {
        plant_id: req.query.plant_id,
        unit_id: req.query.unit_id,
        status: req.query.status,
        user_id: req.user?.id
      };

      const pagination = {
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await optimizationService.listOptimizations(filters, pagination);

      res.status(200).json(result);
    } catch (error) {
      logger.error('Failed to list optimizations', {
        error: error.message,
        user: req.user?.id
      });

      res.status(500).json({
        error: 'Server Error',
        message: 'Unable to retrieve optimizations'
      });
    }
  }
);

// Cancel running optimization
router.delete('/:optimization_id',
  [
    param('optimization_id').isUUID()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation Error',
          details: errors.array()
        });
      }

      const { optimization_id } = req.params;

      const success = await optimizationService.cancelOptimization(optimization_id, req.user?.id);

      if (!success) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Optimization not found or cannot be cancelled'
        });
      }

      res.status(200).json({
        message: 'Optimization cancelled successfully',
        optimization_id
      });
    } catch (error) {
      logger.error('Failed to cancel optimization', {
        error: error.message,
        optimization_id: req.params.optimization_id
      });

      res.status(500).json({
        error: 'Server Error',
        message: 'Unable to cancel optimization'
      });
    }
  }
);

module.exports = router;