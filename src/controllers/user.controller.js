const userService = require("../services/user.service");

exports.getUsers = async (req, res, next) => {
    try {
        const users = await userService.getUsersByRole({
            roleName: req.query.role, // "TECHNICIAN"
            user: req.user,
        });

        res.json(users);
    } catch (err) {
        next(err);
    }
};
