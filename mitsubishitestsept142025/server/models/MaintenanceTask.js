const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceTask = sequelize.define('MaintenanceTask', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Equipment',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('preventive', 'corrective', 'predictive', 'routine'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue'),
      defaultValue: 'pending'
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    estimatedDuration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    requiredParts: {
      type: DataTypes.JSON,
      allowNull: true
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    frequency: {
      type: DataTypes.STRING, // e.g., "weekly", "monthly", "quarterly"
      allowNull: true
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  return MaintenanceTask;
};