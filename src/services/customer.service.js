const { Customer, AuditLog } = require("../models");
const customerRepo = require("../repositories/customer.repository");

class CustomerService {
    async createCustomer(payload, user) {
        // 1. Phone uniqueness check
        const existing = await customerRepo.findByPhone(payload.phone);
        if (existing) {
            throw new Error("Customer with this phone already exists");
        }

        // 2. Resolve base_branch_id (DOMAIN RULE)
        let baseBranchId;

        if (user.role === "SUPER_ADMIN") {
            if (!payload.base_branch_id) {
                throw new Error("Branch is required for customer creation");
            }
            baseBranchId = payload.base_branch_id;
        } else {
            if (!user.base_branch_id) {
                throw new Error("User is not assigned to any branch");
            }
            baseBranchId = user.base_branch_id;
        }

        // 3. Create customer
        return customerRepo.create({
            name: payload.name,
            phone: payload.phone,
            age: payload.age,
            gender: payload.gender,
            address: payload.address,
            base_branch_id: baseBranchId,
        });
    }

    async searchCustomers(query) {
        if (!query || query.length < 2) {
            return [];
        }

        return customerRepo.search(query);
    }

    getCustomers(user) {
        return Customer.findAll({
            where: { base_branch_id: user.base_branch_id },
            order: [["created_at", "DESC"]]
        });
    }

    async updateCustomer(id, payload, user) {
        const customer = await Customer.findByPk(id);

        if (!customer || customer.base_branch_id !== user.base_branch_id) {
            throw new Error("Unauthorized");
        }

        const oldData = customer.toJSON();

        await customer.update({
            name: payload.name,
            phone: payload.phone,
            
            address: payload.address
        });

        await AuditLog.create({
            action: "UPDATE_CUSTOMER",
            action_type: "UPDATE",
            entity: "CUSTOMER",
            entity_id: customer.id,
            old_value: oldData,
            new_value: payload,
            user_id: user.id,
            role: user.role,
            branch_id: user.base_branch_id
        });
    }

    async toggleStatus(id, user) {
        const customer = await Customer.findByPk(id);

        if (!customer || customer.base_branch_id !== user.base_branch_id) {
            throw new Error("Unauthorized");
        }

        const oldStatus = customer.status;
        const newStatus = oldStatus === "ACTIVE" ? false : true;

        await customer.update({ status: newStatus });

        await AuditLog.create({
            action: "CHANGE_CUSTOMER_STATUS",
            action_type: "STATUS_CHANGE",
            entity: "CUSTOMER",
            entity_id: customer.id,
            old_value: { status: oldStatus },
            new_value: { status: newStatus },
            user_id: user.id,
            role: user.role,
            branch_id: user.base_branch_id
        });
    }

}

module.exports = new CustomerService();
