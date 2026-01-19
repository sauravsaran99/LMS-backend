const { User, Customer, Role } = require("../models");

const BATCH_SIZE = 1000;

module.exports = async () => {
  const customerRole = await Role.findOne({ where: { name: "CUSTOMER" } });
  if (!customerRole) throw new Error("CUSTOMER role missing");

  let users = [];

  for (let i = 1; i <= 10000; i++) {
    const phone = `90000${String(i).padStart(5, "0")}`;
    const email = `${phone}@lms.com`;

    users.push({
      name: `Customer ${i}`,
      email,
      password: "Admin@123", // ✅ PLAIN TEXT
      role_id: customerRole.id,
      base_branch_id: (i % 100) + 1,
      status: "ACTIVE",
      _phone: phone, // 👈 temp helper (not DB field)
    });

    if (users.length === BATCH_SIZE || i === 10000) {
      // 1️⃣ Create users (HOOKS ENABLED)
      const createdUsers = await User.bulkCreate(users, {
        hooks: true, // 🔒 REQUIRED for bcrypt
        returning: true,
      });

      // 2️⃣ Create customers mapped correctly
      const customers = createdUsers.map((u, idx) => ({
        name: u.name,
        phone: users[idx]._phone, // ✅ correct phone
        base_branch_id: u.base_branch_id,
        user_id: u.id,
        status: "ACTIVE",
      }));

      await Customer.bulkCreate(customers);

      users = [];
      console.log(`✅ Seeded customers up to ${i}`);
    }
  }

  console.log("🎉 10,000 customers seeded safely");
};
