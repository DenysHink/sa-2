const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo de Rota
 * 
 * Representa as rotas de ônibus no sistema. Cada rota possui:
 * - Informações básicas (nome, número do ônibus, descrição)
 * - Status operacional (ativa/inativa, passageiros atuais)
 * - Capacidade máxima e controle de lotação
 * - Relacionamento com motorista responsável
 * - Controle de progresso na rota (ponto atual)
 * 
 * Regras de negócio:
 * - Apenas motoristas atribuídos podem atualizar o status
 * - Administradores podem criar e gerenciar todas as rotas
 * - Número do ônibus deve ser único no sistema
 * - Passageiros atuais não pode exceder capacidade máxima
 */
const Route = sequelize.define('Route', {
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
      len: [2, 100] // Nome da rota deve ter entre 2 e 100 caracteres
    }
  },
  busNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Garante que cada ônibus tenha um número único
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true // Descrição é opcional
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Rotas são criadas como inativas por padrão
  },
  currentPassengers: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Inicia sem passageiros
    validate: {
      min: 0 // Não pode ter número negativo de passageiros
    }
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50, // Capacidade padrão de 50 passageiros
    validate: {
      min: 1 // Capacidade mínima de 1 passageiro
    }
  },
  currentPointIndex: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Inicia no primeiro ponto (índice 0)
    validate: {
      min: 0 // Índice não pode ser negativo
    }
  },
  driverId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Rota pode ser criada sem motorista atribuído
    references: {
      model: 'users', // Referência à tabela de usuários
      key: 'id'
    }
  }
}, {
  tableName: 'routes',
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  
  /**
   * Validações customizadas a nível de modelo
   * Executadas antes de salvar no banco de dados
   */
  validate: {
    /**
     * Validação para garantir que o número de passageiros
     * não exceda a capacidade máxima da rota
     */
    passengersWithinCapacity() {
      if (this.currentPassengers > this.maxCapacity) {
        throw new Error(`Número de passageiros (${this.currentPassengers}) não pode exceder a capacidade máxima (${this.maxCapacity})`);
      }
    }
  }
});

module.exports = Route;

