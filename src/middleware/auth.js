const { verifyToken, extractToken } = require('../utils/jwt');
const { User } = require('../models');

/**
 * Middleware de Autenticação
 * 
 * Este arquivo contém middlewares responsáveis por:
 * 1. Verificar se o usuário está autenticado (possui token válido)
 * 2. Verificar permissões baseadas em roles (admin/driver)
 * 3. Verificar propriedade de recursos (motorista só pode editar suas rotas)
 * 
 * Fluxo de autenticação:
 * 1. Extrair token do header Authorization
 * 2. Verificar validade do token JWT
 * 3. Buscar usuário no banco de dados
 * 4. Verificar se usuário está ativo
 * 5. Adicionar usuário ao objeto request para uso posterior
 */

/**
 * Middleware principal de autenticação
 * Verifica se o usuário possui um token JWT válido
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para continuar para o próximo middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // Extrair token do header Authorization (formato: "Bearer <token>")
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    // Verificar se token foi fornecido
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }

    // Verificar validade do token e decodificar payload
    const decoded = verifyToken(token);
    
    // Buscar usuário no banco de dados usando ID do token
    // Importante: sempre buscar dados atuais do usuário, não confiar apenas no token
    const user = await User.findByPk(decoded.id);
    
    // Verificar se usuário existe e está ativo
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar usuário ao objeto request para uso em middlewares/controllers posteriores
    req.user = user;
    next(); // Continuar para o próximo middleware
  } catch (error) {
    // Token inválido, expirado ou malformado
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
};

/**
 * Middleware de autorização para administradores
 * Verifica se o usuário autenticado possui role 'admin'
 * 
 * IMPORTANTE: Este middleware deve ser usado APÓS o middleware authenticate
 * 
 * @param {Object} req - Objeto de requisição Express (deve conter req.user)
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para continuar para o próximo middleware
 */
const requireAdmin = (req, res, next) => {
  // Verificar se usuário foi autenticado (middleware authenticate deve ter executado antes)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação requerida'
    });
  }

  // Verificar se usuário possui role de administrador
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.'
    });
  }

  next(); // Usuário é admin, pode continuar
};

/**
 * Middleware de autorização para motoristas
 * Verifica se o usuário autenticado possui role 'driver'
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para continuar para o próximo middleware
 */
const requireDriver = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Autenticação requerida'
    });
  }

  if (req.user.role !== 'driver') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas motoristas podem acessar este recurso.'
    });
  }

  next();
};

/**
 * Middleware de autorização para proprietário da rota ou administrador
 * 
 * Regra de negócio complexa:
 * - Administradores podem acessar/modificar qualquer rota
 * - Motoristas só podem acessar/modificar rotas atribuídas a eles
 * 
 * Este middleware implementa a lógica de propriedade de recursos,
 * garantindo que motoristas só possam modificar suas próprias rotas.
 * 
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para continuar para o próximo middleware
 */
const requireRouteOwnerOrAdmin = async (req, res, next) => {
  try {
    // Verificar autenticação
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticação requerida'
      });
    }

    // Administradores têm acesso total - podem modificar qualquer rota
    if (req.user.role === 'admin') {
      return next();
    }

    // Para motoristas, verificar se são donos da rota
    // Obter ID da rota dos parâmetros da URL ou corpo da requisição
    const routeId = req.params.id || req.body.routeId;
    
    if (!routeId) {
      return res.status(400).json({
        success: false,
        message: 'ID da rota requerido'
      });
    }

    // Buscar rota no banco de dados
    const { Route } = require('../models');
    const route = await Route.findByPk(routeId);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
      });
    }

    // Verificar se o motorista é o dono da rota
    if (route.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você só pode modificar suas próprias rotas.'
      });
    }

    next(); // Motorista é dono da rota, pode continuar
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireDriver,
  requireRouteOwnerOrAdmin
};

