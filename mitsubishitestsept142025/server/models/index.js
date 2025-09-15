const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'manufacturing_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 20,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User')(sequelize);
const Equipment = require('./Equipment')(sequelize);
const MaintenanceTask = require('./MaintenanceTask')(sequelize);
const Issue = require('./Issue')(sequelize);
const MaintenanceHistory = require('./MaintenanceHistory')(sequelize);

// Define associations
User.hasMany(Issue, { foreignKey: 'reportedBy' });
User.hasMany(MaintenanceHistory, { foreignKey: 'performedBy' });

Equipment.hasMany(Issue, { foreignKey: 'equipmentId' });
Equipment.hasMany(MaintenanceTask, { foreignKey: 'equipmentId' });
Equipment.hasMany(MaintenanceHistory, { foreignKey: 'equipmentId' });

MaintenanceTask.hasMany(MaintenanceHistory, { foreignKey: 'maintenanceTaskId' });

Issue.belongsTo(User, { foreignKey: 'reportedBy', as: 'reporter' });
Issue.belongsTo(Equipment, { foreignKey: 'equipmentId' });

MaintenanceTask.belongsTo(Equipment, { foreignKey: 'equipmentId' });

MaintenanceHistory.belongsTo(User, { foreignKey: 'performedBy', as: 'technician' });
MaintenanceHistory.belongsTo(Equipment, { foreignKey: 'equipmentId' });
MaintenanceHistory.belongsTo(MaintenanceTask, { foreignKey: 'maintenanceTaskId' });

module.exports = {
  sequelize,
  User,
  Equipment,
  MaintenanceTask,
  Issue,
  MaintenanceHistory
};