const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
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
    maintenanceTaskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'MaintenanceTasks',
        key: 'id'
      }
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('preventive', 'corrective', 'predictive', 'routine'),
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    partsUsed: {
      type: DataTypes.JSON,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('completed', 'partial', 'failed'),
      defaultValue: 'completed'
    }
  });

  return MaintenanceHistory;
};