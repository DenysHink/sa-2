const { Route, User, Point, RoutePoint } = require('../models');

/**
 * Criar nova rota (apenas admin)
 */
const createRoute = async (req, res) => {
  try {
    const { name, busNumber, description, maxCapacity, driverId } = req.body;

    // Verificar se o número do ônibus já existe
    const existingRoute = await Route.findOne({ where: { busNumber } });
    if (existingRoute) {
      return res.status(400).json({
        success: false,
        message: 'Número do ônibus já está em uso'
      });
    }

    // Se driverId foi fornecido, verificar se o usuário existe e é motorista
    if (driverId) {
      const driver = await User.findByPk(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Motorista não encontrado'
        });
      }
      if (driver.role !== 'driver') {
        return res.status(400).json({
          success: false,
          message: 'Usuário especificado não é um motorista'
        });
      }
    }

    const route = await Route.create({
      name,
      busNumber,
      description,
      maxCapacity: maxCapacity || 50,
      driverId
    });

    // Buscar a rota criada com o motorista
    const routeWithDriver = await Route.findByPk(route.id, {
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Rota criada com sucesso',
      data: { route: routeWithDriver }
    });
  } catch (error) {
    console.error('Erro ao criar rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Listar todas as rotas
 */
const getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.findAll({
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Point,
          as: 'points',
          through: {
            attributes: ['order', 'estimatedTime', 'isPassed']
          }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { routes }
    });
  } catch (error) {
    console.error('Erro ao listar rotas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obter rota por ID
 */
const getRouteById = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await Route.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: RoutePoint,
          as: 'routePoints',
          include: [{
            model: Point,
            as: 'point'
          }],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    }

    res.json({
      success: true,
      data: { route }
    });
  } catch (error) {
    console.error('Erro ao obter rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Atualizar status da rota (apenas motorista dono da rota ou admin)
 */
const updateRouteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassengers, isActive, currentPointIndex } = req.body;

    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    }

    // Verificar se o número de passageiros não excede a capacidade
    if (currentPassengers !== undefined && currentPassengers > route.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: `Número de passageiros não pode exceder a capacidade máxima de ${route.maxCapacity}`
      });
    }

    // Atualizar apenas os campos fornecidos
    const updateData = {};
    if (currentPassengers !== undefined) updateData.currentPassengers = currentPassengers;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (currentPointIndex !== undefined) updateData.currentPointIndex = currentPointIndex;

    await route.update(updateData);

    // Se currentPointIndex foi atualizado, marcar pontos como passados
    if (currentPointIndex !== undefined) {
      await RoutePoint.update(
        { isPassed: true },
        {
          where: {
            routeId: id,
            order: { [require('sequelize').Op.lte]: currentPointIndex }
          }
        }
      );

      await RoutePoint.update(
        { isPassed: false },
        {
          where: {
            routeId: id,
            order: { [require('sequelize').Op.gt]: currentPointIndex }
          }
        }
      );
    }

    // Buscar rota atualizada
    const updatedRoute = await Route.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'name', 'email']
        },
        {
          model: RoutePoint,
          as: 'routePoints',
          include: [{
            model: Point,
            as: 'point'
          }],
          order: [['order', 'ASC']]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Status da rota atualizado com sucesso',
      data: { route: updatedRoute }
    });
  } catch (error) {
    console.error('Erro ao atualizar status da rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obter status público de uma rota pelo número do ônibus
 */
const getPublicRouteStatus = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const route = await Route.findOne({
      where: { busNumber },
      attributes: ['id', 'name', 'busNumber', 'isActive', 'currentPassengers', 'maxCapacity', 'currentPointIndex'],
      include: [
        {
          model: RoutePoint,
          as: 'routePoints',
          include: [{
            model: Point,
            as: 'point',
            attributes: ['id', 'name', 'address']
          }],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Ônibus não encontrado'
      });
    }

    // Calcular informações úteis
    const occupancyPercentage = Math.round((route.currentPassengers / route.maxCapacity) * 100);
    const currentPoint = route.routePoints.find(rp => rp.order === route.currentPointIndex);
    const nextPoint = route.routePoints.find(rp => rp.order === route.currentPointIndex + 1);

    res.json({
      success: true,
      data: {
        busNumber: route.busNumber,
        routeName: route.name,
        isActive: route.isActive,
        currentPassengers: route.currentPassengers,
        maxCapacity: route.maxCapacity,
        occupancyPercentage,
        currentPoint: currentPoint ? currentPoint.point : null,
        nextPoint: nextPoint ? nextPoint.point : null,
        allPoints: route.routePoints.map(rp => ({
          ...rp.point.toJSON(),
          order: rp.order,
          isPassed: rp.isPassed,
          estimatedTime: rp.estimatedTime
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao obter status público da rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Atribuir motorista a uma rota (apenas admin)
 */
const assignDriverToRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { driverId } = req.body;

    const route = await Route.findByPk(id);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    }

    if (driverId) {
      const driver = await User.findByPk(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Motorista não encontrado'
        });
      }
      if (driver.role !== 'driver') {
        return res.status(400).json({
          success: false,
          message: 'Usuário especificado não é um motorista'
        });
      }
    }

    await route.update({ driverId });

    const updatedRoute = await Route.findByPk(id, {
      include: [{
        model: User,
        as: 'driver',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Motorista atribuído à rota com sucesso',
      data: { route: updatedRoute }
    });
  } catch (error) {
    console.error('Erro ao atribuir motorista:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRouteStatus,
  getPublicRouteStatus,
  assignDriverToRoute
};

