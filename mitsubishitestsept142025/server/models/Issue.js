const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Issue = sequelize.define('Issue', {
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
    reportedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
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
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('mechanical', 'electrical', 'software', 'safety', 'other'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'open'
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    downtimeStart: {
      type: DataTypes.DATE,
      allowNull: true
    },
    downtimeEnd: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolution: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    partsUsed: {
      type: DataTypes.JSON,
      allowNull: true
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estimatedRepairTime: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    },
    actualRepairTime: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: true
    }
  });

  return Issue;
};