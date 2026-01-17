const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define(
  'AuditLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    action_type: {
      type: DataTypes.STRING(50),
      allowNull: false
      // CREATE, UPDATE, DELETE, STATUS_CHANGE
    },

    entity: {
      type: DataTypes.STRING(100),
      allowNull: false
      // Branch, User, Test, Booking, Payment
    },

    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    old_value: {
      type: DataTypes.JSON,
      allowNull: true
    },

    new_value: {
      type: DataTypes.JSON,
      allowNull: true
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    role: {
      type: DataTypes.STRING(50),
      allowNull: true
    },

    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = AuditLog;
