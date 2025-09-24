const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, requireAdmin, requireRouteOwnerOrAdmin } = require('../middleware/auth');
const { validateRouteCreation, validateRouteStatusUpdate } = require('../middleware/validation');

/**
 * @route   POST /api/routes
 * @desc    Criar nova rota
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, validateRouteCreation, routeController.createRoute);

/**
 * @route   GET /api/routes
 * @desc    Listar todas as rotas
 * @access  Private
 */
router.get('/', authenticate, routeController.getAllRoutes);

/**
 * @route   GET /api/routes/:id
 * @desc    Obter rota por ID
 * @access  Private
 */
router.get('/:id', authenticate, routeController.getRouteById);

/**
 * @route   PUT /api/routes/:id/status
 * @desc    Atualizar status da rota
 * @access  Private (Route owner or Admin)
 */
router.put('/:id/status', authenticate, requireRouteOwnerOrAdmin, validateRouteStatusUpdate, routeController.updateRouteStatus);

/**
 * @route   PUT /api/routes/:id/driver
 * @desc    Atribuir motorista a uma rota
 * @access  Private (Admin only)
 */
router.put('/:id/driver', authenticate, requireAdmin, routeController.assignDriverToRoute);

module.exports = router;

