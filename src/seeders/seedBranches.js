const { Branch } = require("../models");

async function seedBranches() {
    const branches = [
        { name: "Mumbai Central", city: 'Mumbai', is_active: true },
        { name: "Andheri East", city: 'Mumbai', is_active: true },
        { name: "Pune Hinjewadi", city: 'Mumbai', is_active: true },
    ];

    for (const branch of branches) {
        await Branch.findOrCreate({
            where: { name: branch.name },
            defaults: branch,
        });
    }

    console.log("✅ Branches seeded successfully");
}

module.exports = seedBranches;
