const { ContactQuery } = require("../models");

class ContactRepository {
    async create(data) {
        return await ContactQuery.create(data);
    }

    async findAll() {
        return await ContactQuery.findAll({
            order: [["created_at", "DESC"]],
        });
    }

    async findById(id) {
        return await ContactQuery.findByPk(id);
    }

    async updateStatus(id, status) {
        const query = await this.findById(id);
        if (!query) return null;
        return await query.update({ status });
    }
}

module.exports = new ContactRepository();
