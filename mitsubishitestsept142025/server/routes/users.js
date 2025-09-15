const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (supervisor only)
router.get('/', [
  authenticateToken,
  authorizeRoles(['supervisor'])
], async (req, res) => {
  try {
    const { role, department, page = 1, limit = 50 } = req.query;
    
    const where = { isActive: true };
    if (role) where.role = role;
    if (department) where.department = department;

    const offset = (page - 1) * limit;
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      attributes: { exclude: ['password'] }
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get technicians for assignment
router.get('/technicians', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    
    const where = {
      isActive: true,
      role: { [Op.in]: ['technician', 'supervisor'] }
    };
    if (department) where.department = department;

    const technicians = await User.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'role', 'department'],
      order: [['firstName', 'ASC']]
    });

    res.json(technicians);
  } catch (error) {
    console.error('Technicians fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (supervisor only)
router.put('/:id', [
  authenticateToken,
  authorizeRoles(['supervisor']),
  param('id').isUUID(),
  body('role').optional().isIn(['operator', 'technician', 'supervisor']),
  body('department').optional().isLength({ min: 1 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow modifying your own account
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot modify your own account' });
    }

    await user.update(req.body);
    res.json(user);
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deactivate user (supervisor only)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles(['supervisor']),
  param('id').isUUID()
], async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deactivating your own account
    if (user.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    await user.update({ isActive: false });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('User deactivation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;