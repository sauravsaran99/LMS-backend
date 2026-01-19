const { Branch } = require("../models");

module.exports = async () => {
  const branches = [];

  for (let i = 1; i <= 100; i++) {
    branches.push({
      name: `Branch ${i}`,
      city: `City ${i}`,
      status: "ACTIVE",
    });
  }

  await Branch.bulkCreate(branches, {
    ignoreDuplicates: true,
  });

  console.log("✅ 100 branches seeded");
};
