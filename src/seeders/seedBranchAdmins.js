const { User, Role, Branch } = require("../models");
const bcrypt = require("bcrypt");

module.exports = async () => {
    const role = await Role.findOne({ where: { name: "BRANCH_ADMIN" } });
    const branches = await Branch.findAll();

    if (!role || branches.length < 2) return;

    const admins = [
        {
            name: "Andheri Admin",
            email: "andheri.admin@lms.com",
            branch: branches[0]
        },
        {
            name: "Borivali Admin",
            email: "borivali.admin@lms.com",
            branch: branches[1]
        }
    ];

    for (const a of admins) {
        await User.findOrCreate({
            where: { email: a.email },
            defaults: {
                name: a.name,
                email: a.email,
                password: "Admin@123",
                role_id: role.id,
                base_branch_id: a.branch.id,
            }
        });
    }

    console.log("✅ Branch Admins seeded");
};
