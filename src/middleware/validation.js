/**
 * Middleware para validar dados de entrada
 */

/**
 * Valida dados de registro de usuário
 */
const validateUserRegistration = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('Email válido é obrigatório');
  }

  if (!password || password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

/**
 * Valida dados de login
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('Email válido é obrigatório');
  }

  if (!password) {
    errors.push('Senha é obrigatória');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

/**
 * Valida dados de criação de rota
 */
const validateRouteCreation = (req, res, next) => {
  const { name, busNumber, maxCapacity } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Nome da rota deve ter pelo menos 2 caracteres');
  }

  if (!busNumber || busNumber.trim().length < 1) {
    errors.push('Número do ônibus é obrigatório');
  }

  if (maxCapacity && (isNaN(maxCapacity) || maxCapacity < 1)) {
    errors.push('Capacidade máxima deve ser um número maior que 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

/**
 * Valida dados de criação de ponto
 */
const validatePointCreation = (req, res, next) => {
  const { name, latitude, longitude } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Nome do ponto deve ter pelo menos 2 caracteres');
  }

  if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
    errors.push('Latitude deve ser um número entre -90 e 90');
  }

  if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
    errors.push('Longitude deve ser um número entre -180 e 180');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

/**
 * Valida atualização de status da rota
 */
const validateRouteStatusUpdate = (req, res, next) => {
  const { currentPassengers, isActive, currentPointIndex } = req.body;
  const errors = [];

  if (currentPassengers !== undefined && (isNaN(currentPassengers) || currentPassengers < 0)) {
    errors.push('Número de passageiros deve ser um número maior ou igual a 0');
  }

  if (isActive !== undefined && typeof isActive !== 'boolean') {
    errors.push('Status ativo deve ser verdadeiro ou falso');
  }

  if (currentPointIndex !== undefined && (isNaN(currentPointIndex) || currentPointIndex < 0)) {
    errors.push('Índice do ponto atual deve ser um número maior ou igual a 0');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors
    });
  }

  next();
};

/**
 * Valida chave de administrador
 */
const validateAdminKey = (req, res, next) => {
  const { adminKey } = req.body;

  if (!adminKey) {
    return res.status(400).json({
      success: false,
      message: 'Chave de administrador é obrigatória'
    });
  }

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Chave de administrador inválida'
    });
  }

  next();
};

/**
 * Função auxiliar para validar email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateUserRegistration,
  validateLogin,
  validateRouteCreation,
  validatePointCreation,
  validateRouteStatusUpdate,
  validateAdminKey
};

