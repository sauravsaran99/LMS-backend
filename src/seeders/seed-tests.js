const { Test } = require("../models");

const BATCH_SIZE = 5000;

module.exports = async () => {
  let batch = [];

  for (let i = 1; i <= 100000; i++) {
    batch.push({
      name: `Test ${i}`,
      category: `Category ${i % 10}`,
      price: (Math.random() * 5000 + 500).toFixed(2),
      status: "ACTIVE",
    });

    if (batch.length === BATCH_SIZE) {
      await Test.bulkCreate(batch);
      batch = [];
      console.log(`Inserted tests up to ${i}`);
    }
  }

  if (batch.length) {
    await Test.bulkCreate(batch);
  }

  console.log("✅ 100,000 tests seeded");
};
