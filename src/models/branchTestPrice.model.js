const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BranchTestPrice = sequelize.define(
    'BranchTestPrice',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        test_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'tests',
                key: 'id'
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        tableName: 'branch_test_prices',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['branch_id', 'test_id']
            }
        ]
    }
);

module.exports = BranchTestPrice;
