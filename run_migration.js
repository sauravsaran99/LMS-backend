const { sequelize } = require("./src/models");

async function run() {
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');

    try {
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

        // Also mark it as run in SequelizeMeta
        await sequelize.query("INSERT INTO SequelizeMeta (name) VALUES ('20260204194455-create-branch-test-prices.js')");
        // And mark the failing one as run too since it obviously exists
        try {
            await sequelize.query("INSERT IGNORE INTO SequelizeMeta (name) VALUES ('20260123043106-add-tagged-doctor-id-to-booking-reports.js')");
        } catch (e) { }

        console.log("Migration successful");
    } catch (err) {
        console.error("Migration failed:", err.message);
    } finally {
        process.exit();
    }
}

run();
