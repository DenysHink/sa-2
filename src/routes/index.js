const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./auth');
const routeRoutes = require('./routes');
const pointRoutes = require('./points');
const publicRoutes = require('./public');

// Configurar as rotas
router.use('/auth', authRoutes);
router.use('/routes', routeRoutes);
router.use('/points', pointRoutes);
router.use('/public', publicRoutes);

// Rota raiz da API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API do Sistema de Gerenciamento de Rotas de Ônibus',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      routes: '/api/routes',
      points: '/api/points',
      public: '/api/public'
    },
    documentation: {
      auth: {
        'POST /api/auth/register': 'Registrar novo usuário',
        'POST /api/auth/login': 'Login do usuário',
        'POST /api/auth/promote': 'Promover usuário a administrador',
        'GET /api/auth/profile': 'Obter perfil do usuário logado'
      },
      routes: {
        'POST /api/routes': 'Criar nova rota (Admin)',
        'GET /api/routes': 'Listar todas as rotas',
        'GET /api/routes/:id': 'Obter rota por ID',
        'PUT /api/routes/:id/status': 'Atualizar status da rota (Dono ou Admin)',
        'PUT /api/routes/:id/driver': 'Atribuir motorista à rota (Admin)'
      },
      points: {
        'POST /api/points': 'Criar novo ponto (Admin)',
        'GET /api/points': 'Listar todos os pontos',
        'GET /api/points/:id': 'Obter ponto por ID',
        'PUT /api/points/:id': 'Atualizar ponto (Admin)',
        'POST /api/points/route': 'Adicionar ponto à rota (Admin)',
        'DELETE /api/points/route/:routeId/:pointId': 'Remover ponto da rota (Admin)'
      },
      public: {
        'GET /api/public/bus/:busNumber': 'Obter status público do ônibus',
        'GET /api/public/health': 'Health check da API'
      }
    }
  });
});

module.exports = router;

