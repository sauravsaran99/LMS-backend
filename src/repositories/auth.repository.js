const { User, Role, Branch } = require("../models");

class AuthRepository {
    async findUserByEmail(email) {
        return User.findOne({
            where: { email },
            include: [
                { model: Role, attributes: ["name"] },
                { model: Branch, attributes: ["id", "name"] },
            ],
        });
    }
}

module.exports = new AuthRepository();
