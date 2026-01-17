const bcrypt = require("bcrypt");
const authRepo = require("../repositories/auth.repository");
const { generateToken } = require("../utils/jwt.util");

class AuthService {
    async login({ email, password }) {
        const user = await authRepo.findUserByEmail(email);

        if (!user || !user.is_active) {
            throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password");
        }


        const token = generateToken({
            id: user.id,
            role: user.Role.name,
            name: user.name,
            base_branch_id: user.base_branch_id,
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.Role.name,
                base_branch_id: user.base_branch_id,
            },
        };
    }
}

module.exports = new AuthService();
