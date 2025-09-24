const { Point, Route, RoutePoint } = require('../models');

/**
 * Criar novo ponto (apenas admin)
 */
const createPoint = async (req, res) => {
  try {
    const { name, description, latitude, longitude, address } = req.body;

    const point = await Point.create({
      name,
      description,
      latitude,
      longitude,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Ponto criado com sucesso',
      data: { point }
    });
  } catch (error) {
    console.error('Erro ao criar ponto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Listar todos os pontos
 */
const getAllPoints = async (req, res) => {
  try {
    const points = await Point.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { points }
    });
  } catch (error) {
    console.error('Erro ao listar pontos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Obter ponto por ID
 */
const getPointById = async (req, res) => {
  try {
    const { id } = req.params;

    const point = await Point.findByPk(id, {
      include: [{
        model: Route,
        as: 'routes',
        through: {
          attributes: ['order', 'estimatedTime', 'isPassed']
        }
      }]
    });

    if (!point) {
      return res.status(404).json({
        success: false,
        message: 'Ponto não encontrado'
      });
    }

    res.json({
      success: true,
      data: { point }
    });
  } catch (error) {
    console.error('Erro ao obter ponto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Atualizar ponto (apenas admin)
 */
const updatePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, latitude, longitude, address, isActive } = req.body;

    const point = await Point.findByPk(id);
    if (!point) {
      return res.status(404).json({
        success: false,
        message: 'Ponto não encontrado'
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;

    await point.update(updateData);

    res.json({
      success: true,
      message: 'Ponto atualizado com sucesso',
      data: { point }
    });
  } catch (error) {
    console.error('Erro ao atualizar ponto:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Adicionar ponto a uma rota (apenas admin)
 */
const addPointToRoute = async (req, res) => {
  try {
    const { routeId, pointId, order, estimatedTime } = req.body;

    // Verificar se a rota existe
    const route = await Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    }

    // Verificar se o ponto existe
    const point = await Point.findByPk(pointId);
    if (!point) {
      return res.status(404).json({
        success: false,
        message: 'Ponto não encontrado'
      });
    }

    // Verificar se a associação já existe
    const existingAssociation = await RoutePoint.findOne({
      where: { routeId, pointId }
    });

    if (existingAssociation) {
      return res.status(400).json({
        success: false,
        message: 'Ponto já está associado a esta rota'
      });
    }

    // Verificar se a ordem já está em uso
    if (order !== undefined) {
      const existingOrder = await RoutePoint.findOne({
        where: { routeId, order }
      });

      if (existingOrder) {
        return res.status(400).json({
          success: false,
          message: 'Ordem já está em uso nesta rota'
        });
      }
    }

    // Se ordem não foi especificada, usar a próxima disponível
    let finalOrder = order;
    if (finalOrder === undefined) {
      const maxOrder = await RoutePoint.max('order', {
        where: { routeId }
      });
      finalOrder = (maxOrder || -1) + 1;
    }

    const routePoint = await RoutePoint.create({
      routeId,
      pointId,
      order: finalOrder,
      estimatedTime
    });

    // Buscar a associação criada com os dados do ponto
    const routePointWithPoint = await RoutePoint.findByPk(routePoint.id, {
      include: [{
        model: Point,
        as: 'point'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Ponto adicionado à rota com sucesso',
      data: { routePoint: routePointWithPoint }
    });
  } catch (error) {
    console.error('Erro ao adicionar ponto à rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

/**
 * Remover ponto de uma rota (apenas admin)
 */
const removePointFromRoute = async (req, res) => {
  try {
    const { routeId, pointId } = req.params;

    const routePoint = await RoutePoint.findOne({
      where: { routeId, pointId }
    });

    if (!routePoint) {
      return res.status(404).json({
        success: false,
        message: 'Associação entre rota e ponto não encontrada'
      });
    }

    await routePoint.destroy();

    res.json({
      success: true,
      message: 'Ponto removido da rota com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover ponto da rota:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  createPoint,
  getAllPoints,
  getPointById,
  updatePoint,
  addPointToRoute,
  removePointFromRoute
};

