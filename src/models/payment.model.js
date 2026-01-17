const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define(
    'Payment',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        booking_number: {
            type: DataTypes.STRING(30),
            allowNull: false,
            // ❌ NOT UNIQUE
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        payment_mode: {
            type: DataTypes.ENUM('CASH', 'ONLINE'),
            allowNull: false,
        },

        proof_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        collected_by_role: {
            type: DataTypes.ENUM('RECEPTIONIST', 'TECHNICIAN'),
            allowNull: false,
        },

        collected_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        payment_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: 'payments',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
);

module.exports = Payment;
