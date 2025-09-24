const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Modelo de Usuário
 * 
 * Representa os usuários do sistema que podem ser:
 * - Administradores: Podem criar rotas, pontos e gerenciar o sistema
 * - Motoristas: Podem atualizar status das rotas atribuídas a eles
 * 
 * Funcionalidades de segurança:
 * - Senhas são automaticamente hasheadas antes de salvar no banco
 * - Método para validação de senha
 * - Exclusão da senha ao serializar para JSON
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100] // Nome deve ter entre 2 e 100 caracteres
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Garante que não haverá emails duplicados
    validate: {
      isEmail: true // Validação de formato de email
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255] // Senha deve ter pelo menos 6 caracteres
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'driver'),
    allowNull: false,
    defaultValue: 'driver' // Por padrão, novos usuários são motoristas
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true // Usuários são criados como ativos por padrão
  }
}, {
  tableName: 'users',
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  hooks: {
    /**
     * Hook executado antes de criar um usuário
     * Responsável por hashear a senha antes de salvar no banco
     */
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10); // Salt com 10 rounds para segurança
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    /**
     * Hook executado antes de atualizar um usuário
     * Hasheia a senha apenas se ela foi modificada
     */
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

/**
 * Método de instância para validar senha
 * Compara a senha fornecida com o hash armazenado no banco
 * 
 * @param {string} password - Senha em texto plano para validar
 * @returns {Promise<boolean>} - True se a senha estiver correta
 */
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

/**
 * Método para serialização JSON
 * Remove a senha do objeto quando convertido para JSON
 * Importante para não expor senhas em respostas da API
 * 
 * @returns {Object} - Objeto do usuário sem a senha
 */
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password; // Remove senha da resposta
  return values;
};

module.exports = User;

