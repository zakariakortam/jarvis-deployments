const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { MaintenanceTask, Equipment, User, MaintenanceHistory } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all maintenance tasks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      type, 
      equipmentId, 
      assignedTo, 
      overdue = false,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (equipmentId) where.equipmentId = equipmentId;
    if (assignedTo) where.assignedTo = assignedTo;
    
    // Filter overdue tasks
    if (overdue === 'true') {
      where.scheduledDate = { [Op.lt]: new Date() };
      where.status = { [Op.in]: ['pending', 'in_progress'] };
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: tasks } = await MaintenanceTask.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduledDate', 'ASC']],
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'serialNumber']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'role'],
          required: false
        }
      ]
    });

    res.json({
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Maintenance tasks fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single maintenance task
router.get('/:id', [
  authenticateToken,
  param('id').isUUID()
], async (req, res) => {
  try {
    const task = await MaintenanceTask.findByPk(req.params.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'serialNumber', 'specifications']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'role'],
          required: false
        }
      ]
    });

    if (!task) {
      return res.status(404).json({ error: 'Maintenance task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Maintenance task detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create maintenance task
router.post('/', [
  authenticateToken,
  authorizeRoles(['supervisor', 'technician']),
  body('equipmentId').isUUID().withMessage('Valid equipment ID required'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title required (max 200 chars)'),
  body('type').isIn(['preventive', 'corrective', 'predictive', 'routine']).withMessage('Invalid type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date required'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Duration must be positive integer'),
  body('assignedTo').optional().isUUID().withMessage('Valid user ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      equipmentId,
      title,
      description,
      type,
      priority = 'medium',
      scheduledDate,
      estimatedDuration,
      assignedTo,
      requiredParts,
      instructions,
      frequency,
      isRecurring = false
    } = req.body;

    // Verify equipment exists
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment || !equipment.isActive) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    // Verify assignee exists if provided
    if (assignedTo) {
      const assignee = await User.findOne({
        where: { id: assignedTo, isActive: true, role: { [Op.in]: ['technician', 'supervisor'] } }
      });
      if (!assignee) {
        return res.status(400).json({ error: 'Invalid assignee' });
      }
    }

    const task = await MaintenanceTask.create({
      equipmentId,
      title,
      description,
      type,
      priority,
      scheduledDate,
      estimatedDuration,
      assignedTo,
      requiredParts,
      instructions,
      frequency,
      isRecurring
    });

    const taskWithDetails = await MaintenanceTask.findByPk(task.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.status(201).json(taskWithDetails);
  } catch (error) {
    console.error('Maintenance task creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update maintenance task
router.put('/:id', [
  authenticateToken,
  param('id').isUUID(),
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled', 'overdue']),
  body('scheduledDate').optional().isISO8601(),
  body('assignedTo').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await MaintenanceTask.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Maintenance task not found' });
    }

    // Check permissions
    if (req.user.role === 'operator' && req.body.assignedTo !== req.user.userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If marking as completed, set completion date
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedDate = new Date();
    }

    await task.update(req.body);

    const updatedTask = await MaintenanceTask.findByPk(task.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Maintenance task update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Complete maintenance task with history record
router.post('/:id/complete', [
  authenticateToken,
  param('id').isUUID(),
  body('notes').optional().isLength({ max: 2000 }),
  body('partsUsed').optional().isArray(),
  body('actualDuration').optional().isInt({ min: 1 }),
  body('cost').optional().isDecimal(),
  body('nextMaintenanceDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await MaintenanceTask.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Maintenance task not found' });
    }

    if (task.status === 'completed') {
      return res.status(400).json({ error: 'Task already completed' });
    }

    const {
      notes,
      partsUsed,
      actualDuration,
      cost,
      nextMaintenanceDate,
      photos,
      status = 'completed'
    } = req.body;

    // Create maintenance history record
    const historyRecord = await MaintenanceHistory.create({
      equipmentId: task.equipmentId,
      maintenanceTaskId: task.id,
      performedBy: req.user.userId,
      title: task.title,
      description: task.description,
      type: task.type,
      startTime: new Date(),
      endTime: new Date(),
      duration: actualDuration,
      partsUsed,
      notes,
      cost,
      nextMaintenanceDate,
      photos,
      status
    });

    // Update task status
    await task.update({
      status: 'completed',
      completedDate: new Date()
    });

    // Update equipment's last maintenance date
    await Equipment.update(
      { 
        lastMaintenanceDate: new Date(),
        nextMaintenanceDate: nextMaintenanceDate || null
      },
      { where: { id: task.equipmentId } }
    );

    res.json({
      message: 'Maintenance task completed successfully',
      historyId: historyRecord.id
    });
  } catch (error) {
    console.error('Maintenance completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get maintenance history for equipment
router.get('/equipment/:equipmentId/history', [
  authenticateToken,
  param('equipmentId').isUUID()
], async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: history } = await MaintenanceHistory.findAndCountAll({
      where: { equipmentId: req.params.equipmentId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startTime', 'DESC']],
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Maintenance history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get overdue maintenance tasks
router.get('/overdue', authenticateToken, async (req, res) => {
  try {
    const overdueTasks = await MaintenanceTask.findAll({
      where: {
        scheduledDate: { [Op.lt]: new Date() },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      order: [['scheduledDate', 'ASC']],
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'criticalLevel']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json(overdueTasks);
  } catch (error) {
    console.error('Overdue tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;