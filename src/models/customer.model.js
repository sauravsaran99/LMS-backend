const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define(
  'Customer',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false
    },

    age: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    base_branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'customers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Customer;
