const { User, Role } = require('../models');

const seedSuperAdmin = async () => {
  const superAdminRole = await Role.findOne({
    where: { name: 'SUPER_ADMIN' }
  });

  if (!superAdminRole) return;

  await User.findOrCreate({
    where: { email: 'admin@lms.com' },
    defaults: {
      name: 'Super Admin',
      password: 'Admin@123',
      role_id: superAdminRole.id
    }
  });

  console.log('✅ Super Admin seeded');
};

module.exports = seedSuperAdmin;
