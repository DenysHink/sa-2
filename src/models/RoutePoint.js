const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoutePoint = sequelize.define('RoutePoint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'routes',
      key: 'id'
    }
  },
  pointId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'points',
      key: 'id'
    }
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  estimatedTime: {
    type: DataTypes.INTEGER, // em minutos
    allowNull: true,
    validate: {
      min: 0
    }
  },
  isPassed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'route_points',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['routeId', 'pointId']
    },
    {
      unique: true,
      fields: ['routeId', 'order']
    }
  ]
});

module.exports = RoutePoint;

