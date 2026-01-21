const app = require("./app");
const { sequelize } = require("./models");
const seedRoles = require("./seeders/role.seeder");
const seedBranches = require("./seeders/seedBranches");
const seedSuperAdmin = require("./seeders/superAdmin.seeder");
const seedTechnicians = require("./seeders/seed-technicians");
const seedBranchAdmin = require("./seeders/seedBranchAdmins");

// require("dotenv").config();

//trying to push in main
slfd;

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1️⃣ Try DB connection (DO NOT BLOCK SERVER)
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
  } catch (error) {
    console.warn("⚠️ Database not reachable, starting server anyway");
    console.warn(error.message);
  }

  // 2️⃣ Sync & seed ONLY when explicitly allowed
  if (process.env.DB_SYNC === "true") {
    try {
      await sequelize.sync();
      console.log("✅ Models synced");

      await seedRoles();
      await seedSuperAdmin();
      await seedBranches();
      await seedTechnicians();
      await seedBranchAdmin();

      console.log("🌱 Database seeded");
    } catch (error) {
      console.error("⚠️ DB sync/seed failed (ignored in Docker/CI)");
      console.error(error.message);
    }
  }

  // 3️⃣ ALWAYS start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();

startServer();
