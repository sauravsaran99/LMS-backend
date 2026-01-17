const { User, Role } = require('../models');

const seedTechnicians = async () => {
    const technicianRole = await Role.findOne({
        where: { name: 'TECHNICIAN' },
    });

    if (!technicianRole) {
        console.log('❌ TECHNICIAN role not found');
        return;
    }

    const technicians = [
        {
            name: 'Rahul Technician',
            email: 'rahul.tech@lms.com',
            password: 'Tech@123',
            base_branch_id: 1, // change if needed
        },
        {
            name: 'Amit Technician',
            email: 'amit.tech@lms.com',
            password: 'Tech@123',
            base_branch_id: 1,
        },
    ];

    for (const tech of technicians) {
        await User.findOrCreate({
            where: { email: tech.email },
            defaults: {
                name: tech.name,
                password: tech.password, // your User model hook hashes this
                role_id: technicianRole.id,
                base_branch_id: tech.base_branch_id,
            },
        });
    }

    console.log('✅ Technicians seeded');
};

module.exports = seedTechnicians;
