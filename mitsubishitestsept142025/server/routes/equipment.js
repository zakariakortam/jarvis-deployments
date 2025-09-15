const express = require('express');
const QRCode = require('qrcode');
const { body, validationResult, param } = require('express-validator');
const { Equipment, MaintenanceTask, Issue } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all equipment
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { department, status, page = 1, limit = 50 } = req.query;
    
    const where = { isActive: true };
    if (department) where.department = department;
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    
    const { count, rows: equipment } = await Equipment.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      include: [
        {
          model: MaintenanceTask,
          where: { status: ['pending', 'in_progress'] },
          required: false
        },
        {
          model: Issue,
          where: { status: ['open', 'in_progress'] },
          required: false
        }
      ]
    });

    res.json({
      equipment,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Equipment fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single equipment by ID
router.get('/:id', [
  authenticateToken,
  param('id').isUUID().withMessage('Invalid equipment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const equipment = await Equipment.findOne({
      where: { id: req.params.id, isActive: true },
      include: [
        {
          model: MaintenanceTask,
          order: [['scheduledDate', 'ASC']]
        },
        {
          model: Issue,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json(equipment);
  } catch (error) {
    console.error('Equipment detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new equipment (supervisors and technicians only)
router.post('/', [
  authenticateToken,
  authorizeRoles(['supervisor', 'technician']),
  body('name').isLength({ min: 1, max: 100 }).withMessage('Name is required (max 100 chars)'),
  body('model').isLength({ min: 1 }).withMessage('Model is required'),
  body('serialNumber').isLength({ min: 1 }).withMessage('Serial number is required'),
  body('location').isLength({ min: 1 }).withMessage('Location is required'),
  body('department').isLength({ min: 1 }).withMessage('Department is required'),
  body('installationDate').isISO8601().withMessage('Valid installation date required'),
  body('criticalLevel').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      model,
      serialNumber,
      location,
      department,
      installationDate,
      specifications,
      manualUrl,
      criticalLevel
    } = req.body;

    // Check if serial number already exists
    const existingEquipment = await Equipment.findOne({ where: { serialNumber } });
    if (existingEquipment) {
      return res.status(400).json({ error: 'Serial number already exists' });
    }

    const equipment = await Equipment.create({
      name,
      model,
      serialNumber,
      location,
      department,
      installationDate,
      specifications,
      manualUrl,
      criticalLevel
    });

    // Generate QR code containing equipment details
    const qrData = {
      id: equipment.id,
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/equipment/${equipment.id}`
    };

    try {
      const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
      equipment.qrCode = qrCodeDataURL;
      await equipment.save();
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      // Continue without QR code if generation fails
    }

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Equipment creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update equipment
router.put('/:id', [
  authenticateToken,
  authorizeRoles(['supervisor', 'technician']),
  param('id').isUUID(),
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('model').optional().isLength({ min: 1 }),
  body('location').optional().isLength({ min: 1 }),
  body('department').optional().isLength({ min: 1 }),
  body('status').optional().isIn(['operational', 'maintenance', 'down', 'retired']),
  body('criticalLevel').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const equipment = await Equipment.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.update(req.body);
    res.json(equipment);
  } catch (error) {
    console.error('Equipment update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete equipment (soft delete)
router.delete('/:id', [
  authenticateToken,
  authorizeRoles(['supervisor']),
  param('id').isUUID()
], async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await equipment.update({ isActive: false });
    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Equipment deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new QR code for equipment
router.post('/:id/qr-code', [
  authenticateToken,
  authorizeRoles(['supervisor', 'technician']),
  param('id').isUUID()
], async (req, res) => {
  try {
    const equipment = await Equipment.findOne({
      where: { id: req.params.id, isActive: true }
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const qrData = {
      id: equipment.id,
      name: equipment.name,
      serialNumber: equipment.serialNumber,
      url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/equipment/${equipment.id}`
    };

    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData));
    equipment.qrCode = qrCodeDataURL;
    await equipment.save();

    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search equipment
router.get('/search/:query', authenticateToken, async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 20 } = req.query;

    const equipment = await Equipment.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { model: { [Op.iLike]: `%${query}%` } },
          { serialNumber: { [Op.iLike]: `%${query}%` } },
          { location: { [Op.iLike]: `%${query}%` } }
        ]
      },
      limit: parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json(equipment);
  } catch (error) {
    console.error('Equipment search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;