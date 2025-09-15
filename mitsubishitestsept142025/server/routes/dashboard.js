const express = require('express');
const { Equipment, MaintenanceTask, Issue, MaintenanceHistory, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { Op, sequelize } = require('sequelize');

const router = express.Router();

// Main dashboard metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { department, dateRange = '30' } = req.query;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(dateRange));

    const where = { isActive: true };
    if (department) where.department = department;

    // Equipment metrics
    const totalEquipment = await Equipment.count({ where });
    
    const equipmentByStatus = await Equipment.findAll({
      where,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Critical equipment count
    const criticalEquipment = await Equipment.count({
      where: { 
        ...where,
        criticalLevel: { [Op.in]: ['high', 'critical'] }
      }
    });

    // Maintenance metrics
    const overdueTasks = await MaintenanceTask.count({
      where: {
        scheduledDate: { [Op.lt]: new Date() },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    const upcomingTasks = await MaintenanceTask.count({
      where: {
        scheduledDate: { 
          [Op.gte]: new Date(),
          [Op.lt]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    const completedMaintenance = await MaintenanceHistory.count({
      where: {
        startTime: { [Op.gte]: dateFilter }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    // Issue metrics
    const openIssues = await Issue.count({
      where: {
        status: { [Op.in]: ['open', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    const criticalIssues = await Issue.count({
      where: {
        severity: { [Op.in]: ['critical', 'high'] },
        status: { [Op.in]: ['open', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    const resolvedIssues = await Issue.count({
      where: {
        status: 'resolved',
        resolvedAt: { [Op.gte]: dateFilter }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }]
    });

    // Calculate downtime
    const downtimeData = await Issue.findAll({
      where: {
        downtimeStart: { [Op.gte]: dateFilter },
        downtimeEnd: { [Op.ne]: null }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }],
      attributes: ['downtimeStart', 'downtimeEnd']
    });

    const totalDowntimeMinutes = downtimeData.reduce((total, issue) => {
      const downtime = new Date(issue.downtimeEnd) - new Date(issue.downtimeStart);
      return total + (downtime / (1000 * 60));
    }, 0);

    res.json({
      equipment: {
        total: totalEquipment,
        critical: criticalEquipment,
        byStatus: equipmentByStatus.reduce((acc, item) => {
          acc[item.status] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      },
      maintenance: {
        overdue: overdueTasks,
        upcoming: upcomingTasks,
        completed: completedMaintenance
      },
      issues: {
        open: openIssues,
        critical: criticalIssues,
        resolved: resolvedIssues
      },
      downtime: {
        totalMinutes: Math.round(totalDowntimeMinutes),
        totalHours: Math.round(totalDowntimeMinutes / 60 * 10) / 10
      }
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Equipment health overview
router.get('/equipment-health', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    const where = { isActive: true };
    if (department) where.department = department;

    const equipment = await Equipment.findAll({
      where,
      attributes: [
        'id', 'name', 'model', 'location', 'status', 'criticalLevel',
        'lastMaintenanceDate', 'nextMaintenanceDate'
      ],
      include: [
        {
          model: Issue,
          where: { status: { [Op.in]: ['open', 'in_progress'] } },
          required: false,
          attributes: ['severity']
        },
        {
          model: MaintenanceTask,
          where: { 
            status: { [Op.in]: ['pending', 'in_progress'] },
            scheduledDate: { [Op.lt]: new Date() }
          },
          required: false,
          attributes: ['priority', 'scheduledDate']
        }
      ]
    });

    // Calculate health score for each equipment
    const equipmentWithHealth = equipment.map(eq => {
      let healthScore = 100;
      
      // Reduce score for open issues
      const openIssues = eq.Issues || [];
      openIssues.forEach(issue => {
        switch (issue.severity) {
          case 'critical': healthScore -= 30; break;
          case 'high': healthScore -= 20; break;
          case 'medium': healthScore -= 10; break;
          case 'low': healthScore -= 5; break;
        }
      });
      
      // Reduce score for overdue maintenance
      const overdueTasks = eq.MaintenanceTasks || [];
      overdueTasks.forEach(task => {
        const daysOverdue = Math.floor((new Date() - new Date(task.scheduledDate)) / (1000 * 60 * 60 * 24));
        healthScore -= Math.min(daysOverdue * 2, 25);
      });
      
      // Equipment status impact
      switch (eq.status) {
        case 'down': healthScore -= 50; break;
        case 'maintenance': healthScore -= 20; break;
      }
      
      healthScore = Math.max(0, healthScore);
      
      let healthCategory;
      if (healthScore >= 80) healthCategory = 'excellent';
      else if (healthScore >= 60) healthCategory = 'good';
      else if (healthScore >= 40) healthCategory = 'fair';
      else healthCategory = 'poor';

      return {
        ...eq.toJSON(),
        healthScore,
        healthCategory,
        openIssuesCount: openIssues.length,
        overdueTasksCount: overdueTasks.length
      };
    });

    res.json(equipmentWithHealth);
  } catch (error) {
    console.error('Equipment health error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Maintenance schedule overview
router.get('/maintenance-schedule', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const tasks = await MaintenanceTask.findAll({
      where: {
        scheduledDate: { [Op.between]: [start, end] }
      },
      include: [
        {
          model: Equipment,
          where: department ? { department } : {},
          attributes: ['id', 'name', 'model', 'location', 'criticalLevel']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    // Group by date
    const tasksByDate = tasks.reduce((acc, task) => {
      const date = task.scheduledDate.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {});

    res.json(tasksByDate);
  } catch (error) {
    console.error('Maintenance schedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Issue trends
router.get('/issue-trends', authenticateToken, async (req, res) => {
  try {
    const { period = '30', department } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Issues by day
    const issuesByDay = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        severity
      FROM issues i
      INNER JOIN equipment e ON i.equipment_id = e.id
      WHERE i.created_at >= :startDate
      ${department ? 'AND e.department = :department' : ''}
      GROUP BY DATE(created_at), severity
      ORDER BY date ASC
    `, {
      replacements: { startDate, department },
      type: sequelize.QueryTypes.SELECT
    });

    // Issues by type
    const issuesByType = await Issue.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }],
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('Issue.id')), 'count']
      ],
      group: ['type']
    });

    // Average resolution time
    const resolvedIssues = await Issue.findAll({
      where: {
        status: 'resolved',
        resolvedAt: { [Op.gte]: startDate }
      },
      include: [{
        model: Equipment,
        where: department ? { department } : {},
        attributes: []
      }],
      attributes: ['createdAt', 'resolvedAt', 'severity']
    });

    const avgResolutionTime = resolvedIssues.reduce((acc, issue) => {
      const resolutionTime = new Date(issue.resolvedAt) - new Date(issue.createdAt);
      const hours = resolutionTime / (1000 * 60 * 60);
      
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(hours);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(avgResolutionTime).forEach(severity => {
      const times = avgResolutionTime[severity];
      avgResolutionTime[severity] = times.reduce((a, b) => a + b, 0) / times.length;
    });

    res.json({
      dailyTrends: issuesByDay,
      typeDistribution: issuesByType.map(item => ({
        type: item.type,
        count: parseInt(item.dataValues.count)
      })),
      avgResolutionTime
    });
  } catch (error) {
    console.error('Issue trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Performance metrics (supervisor only)
router.get('/performance', [
  authenticateToken,
  authorizeRoles(['supervisor'])
], async (req, res) => {
  try {
    const { period = '30', department } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Technician performance
    const technicianPerformance = await MaintenanceHistory.findAll({
      where: {
        startTime: { [Op.gte]: startDate }
      },
      include: [
        {
          model: User,
          as: 'technician',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Equipment,
          where: department ? { department } : {},
          attributes: []
        }
      ],
      attributes: [
        'performedBy',
        [sequelize.fn('COUNT', sequelize.col('MaintenanceHistory.id')), 'tasksCompleted'],
        [sequelize.fn('AVG', sequelize.col('duration')), 'avgDuration'],
        [sequelize.fn('SUM', sequelize.col('cost')), 'totalCost']
      ],
      group: ['performedBy', 'technician.id', 'technician.firstName', 'technician.lastName']
    });

    // Equipment utilization
    const equipmentUtilization = await Equipment.findAll({
      where: {
        isActive: true,
        ...(department && { department })
      },
      attributes: [
        'id', 'name', 'operatingHours', 'status'
      ],
      include: [
        {
          model: Issue,
          where: {
            createdAt: { [Op.gte]: startDate },
            downtimeStart: { [Op.ne]: null },
            downtimeEnd: { [Op.ne]: null }
          },
          required: false,
          attributes: ['downtimeStart', 'downtimeEnd']
        }
      ]
    });

    // Calculate uptime percentage
    const utilizationData = equipmentUtilization.map(eq => {
      const issues = eq.Issues || [];
      const totalDowntime = issues.reduce((acc, issue) => {
        const downtime = new Date(issue.downtimeEnd) - new Date(issue.downtimeStart);
        return acc + downtime;
      }, 0);
      
      const periodMs = Date.now() - startDate.getTime();
      const uptimePercentage = ((periodMs - totalDowntime) / periodMs) * 100;
      
      return {
        id: eq.id,
        name: eq.name,
        operatingHours: eq.operatingHours,
        status: eq.status,
        uptimePercentage: Math.max(0, Math.min(100, uptimePercentage))
      };
    });

    res.json({
      technicianPerformance,
      equipmentUtilization: utilizationData
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alerts and notifications
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const { department } = req.query;
    const alerts = [];

    // Critical equipment down
    const criticalDown = await Equipment.findAll({
      where: {
        isActive: true,
        status: 'down',
        criticalLevel: { [Op.in]: ['high', 'critical'] },
        ...(department && { department })
      },
      attributes: ['id', 'name', 'location', 'criticalLevel']
    });

    criticalDown.forEach(eq => {
      alerts.push({
        type: 'critical',
        category: 'equipment',
        message: `Critical equipment "${eq.name}" is down at ${eq.location}`,
        equipmentId: eq.id,
        timestamp: new Date()
      });
    });

    // Overdue maintenance
    const overdueMaintenance = await MaintenanceTask.findAll({
      where: {
        scheduledDate: { [Op.lt]: new Date() },
        status: { [Op.in]: ['pending', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: {
          isActive: true,
          ...(department && { department })
        },
        attributes: ['id', 'name', 'location', 'criticalLevel']
      }],
      limit: 10,
      order: [['scheduledDate', 'ASC']]
    });

    overdueMaintenance.forEach(task => {
      const daysOverdue = Math.floor((new Date() - new Date(task.scheduledDate)) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: task.Equipment.criticalLevel === 'critical' ? 'critical' : 'warning',
        category: 'maintenance',
        message: `Maintenance task "${task.title}" is ${daysOverdue} days overdue`,
        equipmentId: task.Equipment.id,
        taskId: task.id,
        timestamp: task.scheduledDate
      });
    });

    // High severity open issues
    const highSeverityIssues = await Issue.findAll({
      where: {
        severity: { [Op.in]: ['critical', 'high'] },
        status: { [Op.in]: ['open', 'in_progress'] }
      },
      include: [{
        model: Equipment,
        where: {
          isActive: true,
          ...(department && { department })
        },
        attributes: ['id', 'name', 'location']
      }],
      limit: 10,
      order: [['createdAt', 'ASC']]
    });

    highSeverityIssues.forEach(issue => {
      alerts.push({
        type: issue.severity === 'critical' ? 'critical' : 'warning',
        category: 'issue',
        message: `${issue.severity} issue: "${issue.title}" on ${issue.Equipment.name}`,
        equipmentId: issue.Equipment.id,
        issueId: issue.id,
        timestamp: issue.createdAt
      });
    });

    // Sort by severity and timestamp
    alerts.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'critical' ? -1 : 1;
      }
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json(alerts.slice(0, 20)); // Return top 20 alerts
  } catch (error) {
    console.error('Alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;