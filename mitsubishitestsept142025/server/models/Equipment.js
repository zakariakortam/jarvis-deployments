const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Equipment = sequelize.define('Equipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('operational', 'maintenance', 'down', 'retired'),
      defaultValue: 'operational'
    },
    installationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specifications: {
      type: DataTypes.JSON,
      allowNull: true
    },
    manualUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    operatingHours: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    criticalLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return Equipment;
};