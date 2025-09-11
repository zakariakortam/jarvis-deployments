const express = require('express');
const router = express.Router();

// This would be imported from the service in production
const CornOptimizer = require('./CornOptimizer');
const optimizer = new CornOptimizer();

// Mock historical data store
let historicalData = [];

/**
 * POST /api/corn/optimize
 * Calculate optimal acid set point
 */
router.post('/optimize', (req, res) => {
  try {
    const processData = {
      ...req.body,
      historicalData: historicalData.slice(-20) // Use last 20 records
    };
    
    const result = optimizer.calculateOptimalSetPoint(processData);
    
    // Store this optimization for historical tracking
    historicalData.push({
      timestamp: new Date(),
      input: req.body,
      output: result,
      actualYield: null, // Would be updated later with actual results
      targetYield: 0.88
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Optimization calculation failed'
    });
  }
});

/**
 * POST /api/corn/simulate
 * Simulate performance with given parameters
 */
router.post('/simulate', (req, res) => {
  try {
    const simulation = optimizer.simulatePerformance(req.body);
    
    res.json({
      success: true,
      data: simulation
    });
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      error: 'Simulation calculation failed'
    });
  }
});

/**
 * GET /api/corn/monitoring
 * Get real-time monitoring data
 */
router.get('/monitoring', (req, res) => {
  try {
    const data = optimizer.getMonitoringData();
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve monitoring data'
    });
  }
});

/**
 * GET /api/corn/constraints
 * Get process constraints and targets
 */
router.get('/constraints', (req, res) => {
  res.json({
    success: true,
    data: {
      constraints: optimizer.constraints,
      qualityTargets: optimizer.qualityTargets
    }
  });
});

/**
 * GET /api/corn/history
 * Get historical optimization data
 */
router.get('/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  
  res.json({
    success: true,
    data: historicalData.slice(-limit),
    total: historicalData.length
  });
});

/**
 * POST /api/corn/history/update
 * Update historical record with actual results
 */
router.post('/history/update/:id', (req, res) => {
  const { id } = req.params;
  const { actualYield, actualProteinRecovery, actualStarchPurity } = req.body;
  
  const record = historicalData.find(r => r.timestamp.toISOString() === id);
  
  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Historical record not found'
    });
  }
  
  record.actualYield = actualYield;
  record.actualProteinRecovery = actualProteinRecovery;
  record.actualStarchPurity = actualStarchPurity;
  
  res.json({
    success: true,
    message: 'Historical record updated'
  });
});

/**
 * POST /api/corn/alert
 * Create alert for process deviation
 */
router.post('/alert', (req, res) => {
  const { parameter, value, threshold, severity } = req.body;
  
  // In production, this would trigger notifications
  console.log('Process Alert:', {
    parameter,
    value,
    threshold,
    severity,
    timestamp: new Date()
  });
  
  res.json({
    success: true,
    message: 'Alert created successfully'
  });
});

module.exports = router;