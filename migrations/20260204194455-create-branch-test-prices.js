'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('branch_test_prices', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            branch_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'branches',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            test_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'tests',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('branch_test_prices', ['branch_id', 'test_id'], {
            unique: true,
            name: 'branch_test_prices_branch_id_test_id_unique'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('branch_test_prices');
    }
};
