const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Refund = sequelize.define(
    "Refund",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        booking_number: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },

        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },

        refund_mode: {
            type: DataTypes.ENUM("CASH", "ONLINE"),
            allowNull: false,
        },

        reference_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        refunded_by_role: {
            type: DataTypes.ENUM("RECEPTIONIST", "BRANCH_ADMIN"),
            allowNull: false,
        },

        refunded_by_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        refunded_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "refunds",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

module.exports = Refund;
