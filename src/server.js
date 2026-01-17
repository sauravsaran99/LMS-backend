const app = require('./app');
const { sequelize } = require('./models');
const seedRoles = require('./seeders/role.seeder');
const seedBranches = require('./seeders/seedBranches');
const seedSuperAdmin = require('./seeders/superAdmin.seeder');
const seedTechnicians = require('./seeders/seed-technicians');
const seedBranchAdmin = require("./seeders/seedBranchAdmins")


require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync();
    console.log('✅ Models synced');

    await seedRoles();

    await seedSuperAdmin();

    await seedBranches();

    await seedTechnicians();

    await seedBranchAdmin();


    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
  }
};

startServer();
