const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { Issue, Equipment, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get all issues
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      severity, 
      type,
      equipmentId, 
      reportedBy,
      assignedTo,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (type) where.type = type;
    if (equipmentId) where.equipmentId = equipmentId;
    if (reportedBy) where.reportedBy = reportedBy;
    if (assignedTo) where.assignedTo = assignedTo;

    const offset = (page - 1) * limit;
    
    const { count, rows: issues } = await Issue.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'serialNumber']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'role']
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
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Issues fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single issue
router.get('/:id', [
  authenticateToken,
  param('id').isUUID()
], async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'serialNumber', 'specifications']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'role']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName', 'role'],
          required: false
        }
      ]
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Issue detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Report new issue
router.post('/', [
  authenticateToken,
  body('equipmentId').isUUID().withMessage('Valid equipment ID required'),
  body('title').isLength({ min: 1, max: 200 }).withMessage('Title required (max 200 chars)'),
  body('description').isLength({ min: 10 }).withMessage('Description required (min 10 chars)'),
  body('type').isIn(['mechanical', 'electrical', 'software', 'safety', 'other']).withMessage('Invalid type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('downtimeStart').optional().isISO8601().withMessage('Valid downtime start required')
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
      severity,
      downtimeStart,
      photos,
      estimatedRepairTime
    } = req.body;

    // Verify equipment exists
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment || !equipment.isActive) {
      return res.status(400).json({ error: 'Equipment not found' });
    }

    const issue = await Issue.create({
      equipmentId,
      reportedBy: req.user.userId,
      title,
      description,
      type,
      severity,
      downtimeStart: downtimeStart || null,
      photos,
      estimatedRepairTime
    });

    // If critical or high severity, update equipment status
    if (['critical', 'high'].includes(severity)) {
      await equipment.update({ status: 'down' });
    }

    const issueWithDetails = await Issue.findByPk(issue.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json(issueWithDetails);
  } catch (error) {
    console.error('Issue creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update issue
router.put('/:id', [
  authenticateToken,
  param('id').isUUID(),
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  body('assignedTo').optional().isUUID(),
  body('resolution').optional().isLength({ max: 2000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check permissions
    const canEdit = req.user.role === 'supervisor' || 
                   req.user.role === 'technician' ||
                   issue.reportedBy === req.user.userId;
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // If resolving issue, set resolution timestamp
    if (req.body.status === 'resolved' && issue.status !== 'resolved') {
      req.body.resolvedAt = new Date();
      req.body.downtimeEnd = new Date();
    }

    await issue.update(req.body);

    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Issue update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign issue to technician
router.put('/:id/assign', [
  authenticateToken,
  authorizeRoles(['supervisor', 'technician']),
  param('id').isUUID(),
  body('assignedTo').isUUID().withMessage('Valid user ID required')
], async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const assignee = await User.findOne({
      where: { 
        id: req.body.assignedTo, 
        isActive: true, 
        role: { [Op.in]: ['technician', 'supervisor'] }
      }
    });

    if (!assignee) {
      return res.status(400).json({ error: 'Invalid assignee' });
    }

    await issue.update({
      assignedTo: req.body.assignedTo,
      status: 'in_progress'
    });

    const updatedIssue = await Issue.findByPk(issue.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json(updatedIssue);
  } catch (error) {
    console.error('Issue assignment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Close issue with resolution
router.put('/:id/close', [
  authenticateToken,
  param('id').isUUID(),
  body('resolution').isLength({ min: 10, max: 2000 }).withMessage('Resolution required (10-2000 chars)'),
  body('partsUsed').optional().isArray(),
  body('actualRepairTime').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const issue = await Issue.findByPk(req.params.id, {
      include: [{ model: Equipment }]
    });

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Check permissions
    const canClose = req.user.role === 'supervisor' ||
                    req.user.role === 'technician' ||
                    issue.assignedTo === req.user.userId;

    if (!canClose) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { resolution, partsUsed, actualRepairTime } = req.body;

    await issue.update({
      status: 'resolved',
      resolution,
      partsUsed,
      actualRepairTime,
      resolvedAt: new Date(),
      downtimeEnd: new Date()
    });

    // Update equipment status back to operational if it was down
    if (issue.Equipment && issue.Equipment.status === 'down') {
      await issue.Equipment.update({ status: 'operational' });
    }

    res.json({ message: 'Issue closed successfully' });
  } catch (error) {
    console.error('Issue closure error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get critical/open issues
router.get('/critical/open', authenticateToken, async (req, res) => {
  try {
    const criticalIssues = await Issue.findAll({
      where: {
        severity: { [Op.in]: ['critical', 'high'] },
        status: { [Op.in]: ['open', 'in_progress'] }
      },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: Equipment,
          attributes: ['id', 'name', 'model', 'location', 'criticalLevel']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ]
    });

    res.json(criticalIssues);
  } catch (error) {
    console.error('Critical issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;