const sequelize = require("../config/database");

// Import models
const Branch = require("./branch.model");
const Role = require("./role.model");
const User = require("./user.model");
const UserBranch = require("./userBranch.model");
const AuditLog = require("./auditLog.model");
const Test = require("./test.model");
const Doctor = require("./doctor.model");
const Customer = require("./customer.model");
const Booking = require("./booking.model");
const BookingTest = require("./bookingTest.model");
const Payment = require("./payment.model");
const Refund = require("./refund.model");
// Associations
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

Branch.hasMany(User, { foreignKey: "base_branch_id" });
User.belongsTo(Branch, { foreignKey: "base_branch_id" });

// Many-to-Many (User ↔ Branch)
User.belongsToMany(Branch, {
  through: UserBranch,
  foreignKey: "user_id",
});

Branch.belongsToMany(User, {
  through: UserBranch,
  foreignKey: "branch_id",
});

// Explicit associations for UserBranch accessibility
User.hasMany(UserBranch, { foreignKey: "user_id" });
UserBranch.belongsTo(User, { foreignKey: "user_id" });

Branch.hasMany(UserBranch, { foreignKey: "branch_id" });
UserBranch.belongsTo(Branch, { foreignKey: "branch_id" });

// Booking relations
Booking.belongsTo(Customer, { foreignKey: "customer_id" });
Customer.hasMany(Booking, { foreignKey: "customer_id" });

Booking.belongsTo(User, { as: "technician", foreignKey: "technician_id" });

Booking.belongsTo(Branch, { foreignKey: "branch_id" });
Branch.hasMany(Booking, { foreignKey: "branch_id" });

// Booking ↔ Test (Many-to-Many)
Booking.belongsToMany(Test, {
  through: BookingTest,
  foreignKey: "booking_id",
});

Test.belongsToMany(Booking, {
  through: BookingTest,
  foreignKey: "test_id",
});

Booking.hasOne(Payment, { foreignKey: "booking_id" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

AuditLog.belongsTo(User, { foreignKey: "user_id" });
AuditLog.belongsTo(Branch, { foreignKey: "branch_id" });

User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

// Booking ↔ BookingTest
Booking.hasMany(BookingTest, { foreignKey: "booking_id" });
BookingTest.belongsTo(Booking, { foreignKey: "booking_id" });

Test.hasMany(BookingTest, { foreignKey: "test_id" });
BookingTest.belongsTo(Test, { foreignKey: "test_id" });

// Export models
module.exports = {
  sequelize,
  Branch,
  Role,
  User,
  UserBranch,
  AuditLog,
  Test,
  Doctor,
  Customer,
  Booking,
  BookingTest,
  Payment,
  Refund,
};
