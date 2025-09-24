const sequelize = require('../config/database');
const User = require('./User');
const Route = require('./Route');
const Point = require('./Point');
const RoutePoint = require('./RoutePoint');

// Definir relacionamentos

// Um usuário (motorista) pode ter várias rotas
User.hasMany(Route, {
  foreignKey: 'driverId',
  as: 'routes'
});

Route.belongsTo(User, {
  foreignKey: 'driverId',
  as: 'driver'
});

// Relacionamento many-to-many entre Route e Point através de RoutePoint
Route.belongsToMany(Point, {
  through: RoutePoint,
  foreignKey: 'routeId',
  otherKey: 'pointId',
  as: 'points'
});

Point.belongsToMany(Route, {
  through: RoutePoint,
  foreignKey: 'pointId',
  otherKey: 'routeId',
  as: 'routes'
});

// Relacionamentos diretos com RoutePoint
Route.hasMany(RoutePoint, {
  foreignKey: 'routeId',
  as: 'routePoints'
});

Point.hasMany(RoutePoint, {
  foreignKey: 'pointId',
  as: 'routePoints'
});

RoutePoint.belongsTo(Route, {
  foreignKey: 'routeId',
  as: 'route'
});

RoutePoint.belongsTo(Point, {
  foreignKey: 'pointId',
  as: 'point'
});

// Função para sincronizar o banco de dados
const syncDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    
    await sequelize.sync({ force });
    console.log('Banco de dados sincronizado com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Route,
  Point,
  RoutePoint,
  syncDatabase
};

