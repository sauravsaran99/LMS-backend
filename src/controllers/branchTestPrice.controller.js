const { BranchTestPrice, Branch, Test, AuditLog } = require("../models");

exports.setBranchPrice = async (req, res) => {
    try {
        const { branch_id, test_id, price } = req.body;

        if (!branch_id || !test_id || price === undefined) {
            return res.status(400).json({ message: "branch_id, test_id and price are required" });
        }

        // Check if branch and test exist
        const branch = await Branch.findByPk(branch_id);
        if (!branch) return res.status(404).json({ message: "Branch not found" });

        const test = await Test.findByPk(test_id);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const [branchPrice, created] = await BranchTestPrice.upsert({
            branch_id,
            test_id,
            price
        });

        await AuditLog.create({
            action_type: created ? "CREATE" : "UPDATE",
            entity: "BranchTestPrice",
            entity_id: branchPrice.id,
            new_value: branchPrice,
            user_id: req.user.id,
            role: req.user.role,
            branch_id: req.user.base_branch_id,
        });

        res.status(200).json(branchPrice);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBranchPricesByTest = async (req, res) => {
    try {
        const { test_id } = req.params;
        const prices = await BranchTestPrice.findAll({
            where: { test_id },
            include: [{ model: Branch, attributes: ['id', 'name'] }]
        });
        res.json(prices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteBranchPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const branchPrice = await BranchTestPrice.findByPk(id);
        if (!branchPrice) return res.status(404).json({ message: "Branch price not found" });

        const oldValue = { ...branchPrice.dataValues };
        await branchPrice.destroy();

        await AuditLog.create({
            action_type: "DELETE",
            entity: "BranchTestPrice",
            entity_id: id,
            old_value: oldValue,
            user_id: req.user.id,
            role: req.user.role,
            branch_id: req.user.base_branch_id,
        });

        res.json({ message: "Branch specific price removed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
