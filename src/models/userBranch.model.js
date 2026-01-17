const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBranch = sequelize.define(
  'UserBranch',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'user_branches',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'branch_id']
      }
    ]
  }
);

module.exports = UserBranch;
