const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

/**
 * @route   GET /api/public/bus/:busNumber
 * @desc    Obter status público de um ônibus pelo número
 * @access  Public
 */
router.get('/bus/:busNumber', routeController.getPublicRouteStatus);

/**
 * @route   GET /api/public/health
 * @desc    Health check da API
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema de Ônibus funcionando corretamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

module.exports = router;

