const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const BookingReport = sequelize.define(
  "BookingReport",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    booking_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    uploaded_by_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    uploaded_by_role: {
      type: DataTypes.ENUM("TECHNICIAN"),
      allowNull: false,
    },
  },
  {
    tableName: "booking_reports",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

module.exports = BookingReport;
