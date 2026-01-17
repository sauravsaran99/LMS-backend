const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define(
  'Booking',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    booking_number: {
      type: DataTypes.STRING(30),
      unique: true
    },

    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    scheduled_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },

    scheduled_time: {
      type: DataTypes.STRING(20),
      allowNull: false
      // Example: "09:00-10:00"
    },

    original_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    discount_type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },

    discount_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },

    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },

    final_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },

    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "CREATED",
        "TECH_ASSIGNED",
        "SAMPLE_COLLECTED",
        "COMPLETED",
        "CANCELLED"
      ),
      defaultValue: "CREATED",
    },
  },
  {
    tableName: 'bookings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Booking;
