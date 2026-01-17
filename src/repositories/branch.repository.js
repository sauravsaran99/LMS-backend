const { Branch } = require("../models");

class BranchRepository {
    async getAll() {
        return Branch.findAll({
            where: { is_active: true },
            attributes: ["id", "name"],
            order: [["name", "ASC"]],
        });
    }

    create(data) {
        return Branch.create(data);
    }

    findAll() {
        return Branch.findAll({ order: [['name', 'ASC']] });
    }

    findById(id) {
        return Branch.findByPk(id);
    }

    findByName(name) {
        return Branch.findOne({ where: { name } });
    }

    update(id, data) {
        return Branch.update(data, { where: { id } });
    }
}

module.exports = new BranchRepository();
