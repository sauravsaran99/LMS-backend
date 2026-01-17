const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingTest = sequelize.define(
  'BookingTest',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    test_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    price_snapshot: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  },
  {
    tableName: 'booking_tests',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['booking_id', 'test_id']
      }
    ]
  }
);

module.exports = BookingTest;
