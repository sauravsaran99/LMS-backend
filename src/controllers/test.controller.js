const { Test, AuditLog } = require('../models');

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);

    await AuditLog.create({
      action_type: 'CREATE',
      entity: 'Test',
      entity_id: test.id,
      new_value: test,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: req.user.base_branch_id
    });

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTests = async (req, res) => {
  const tests = await Test.findAll();
  res.json(tests);
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const oldValue = { ...test.dataValues };
    await test.update(req.body);

    await AuditLog.create({
      action_type: 'UPDATE',
      entity: 'Test',
      entity_id: test.id,
      old_value: oldValue,
      new_value: test,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: req.user.base_branch_id
    });

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
