const branchAdminService = require("../services/branchAdmin.service");

exports.getBranchUsers = async (req, res) => {
    const users = await branchAdminService.getUsers(req.user);
    res.json(users);
};

exports.createBranchUser = async (req, res) => {
    try {
        const user = await branchAdminService.createUser(req.body, req.user);
        res.status(201).json(user);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        await branchAdminService.toggleUserStatus(req.params.id, req.user);
        res.json({ message: "Status updated" });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
};
