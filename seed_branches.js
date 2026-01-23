const { Branch, sequelize } = require('./src/models');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        const branches = Array.from({ length: 20 }).map((_, i) => ({
            name: `Test Branch ${i + 1}`,
            city: 'Test City',
            is_active: true
        }));

        await Branch.bulkCreate(branches);
        console.log('Seeded 20 branches');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
