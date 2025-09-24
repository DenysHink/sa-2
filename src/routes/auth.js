const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateUserRegistration, validateLogin, validateAdminKey } = require('../middleware/validation');

/**
 * @route   POST /api/auth/register
 * @desc    Registrar novo usuário
 * @access  Public
 */
router.post('/register', validateUserRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login do usuário
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/promote
 * @desc    Promover usuário a administrador
 * @access  Public (mas requer chave especial)
 */
router.post('/promote', validateAdminKey, authController.promoteToAdmin);

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;

