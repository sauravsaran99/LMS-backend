const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ContactQuery = sequelize.define(
    "ContactQuery",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("new", "read", "replied"),
            defaultValue: "new",
        },
    },
    {
        tableName: "contact_queries",
        timestamps: true,
        underscored: true,
    }
);

module.exports = ContactQuery;
