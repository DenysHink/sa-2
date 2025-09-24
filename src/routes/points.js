const express = require('express');
const router = express.Router();
const pointController = require('../controllers/pointController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validatePointCreation } = require('../middleware/validation');

/**
 * @route   POST /api/points
 * @desc    Criar novo ponto
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, validatePointCreation, pointController.createPoint);

/**
 * @route   GET /api/points
 * @desc    Listar todos os pontos
 * @access  Private
 */
router.get('/', authenticate, pointController.getAllPoints);

/**
 * @route   GET /api/points/:id
 * @desc    Obter ponto por ID
 * @access  Private
 */
router.get('/:id', authenticate, pointController.getPointById);

/**
 * @route   PUT /api/points/:id
 * @desc    Atualizar ponto
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, pointController.updatePoint);

/**
 * @route   POST /api/points/route
 * @desc    Adicionar ponto a uma rota
 * @access  Private (Admin only)
 */
router.post('/route', authenticate, requireAdmin, pointController.addPointToRoute);

/**
 * @route   DELETE /api/points/route/:routeId/:pointId
 * @desc    Remover ponto de uma rota
 * @access  Private (Admin only)
 */
router.delete('/route/:routeId/:pointId', authenticate, requireAdmin, pointController.removePointFromRoute);

module.exports = router;

