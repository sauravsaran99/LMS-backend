const { Role } = require('../models');

const seedRoles = async () => {
  const roles = [
    'SUPER_ADMIN',
    'BRANCH_ADMIN',
    'RECEPTIONIST',
    'TECHNICIAN',
    'CUSTOMER'
  ];
console.log('Role', Role)
  for (const role of roles) {
    await Role.findOrCreate({ where: { name: role } });
  }

  console.log('✅ Roles seeded');
};

module.exports = seedRoles;
