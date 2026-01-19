const sequelize = require("../config/database");
const seedBranches = require("./seed-branches");
const seedTests = require("./seed-tests");
const seedCustomers = require("./seed-customers");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await seedBranches();
    await seedTests();
    await seedCustomers();

    console.log("🎉 ALL SEEDING COMPLETED");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
})();
