const { Test, AuditLog } = require("../models");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");
  const { BranchTestPrice } = require("../models");

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);

    await AuditLog.create({
      action_type: "CREATE",
      entity: "Test",
      entity_id: test.id,
      new_value: test,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: req.user.base_branch_id,
    });

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllTests = async (req, res) => {
  const paginationParams = getPaginationParams(req.query);
  const options = {};

  // Determine branch context: explicit query param OR logged-in user's base branch
  const targetBranchId = req.query.branch_id || req.user?.base_branch_id;



  if (paginationParams) {
    options.limit = paginationParams.limit;
    options.offset = paginationParams.offset;
  }

  // If we have a target branch, include its specific prices
  if (targetBranchId) {
    options.include = [{
      model: BranchTestPrice,
      required: false,
      where: { branch_id: targetBranchId }
    }];
  }

  if (paginationParams) {
    const result = await Test.findAndCountAll(options);

    // Process rows to override price if branch price exists
    const processedRows = result.rows.map(test => {
      const testJson = test.toJSON();
      if (testJson.BranchTestPrices && testJson.BranchTestPrices.length > 0) {
        testJson.price = testJson.BranchTestPrices[0].price;
      }
      delete testJson.BranchTestPrices; // Clean up
      return testJson;
    });

    res.json(
      getPaginatedResponse(
        processedRows,
        result.count,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  } else {
    const tests = await Test.findAll(options);

    // Process rows
    const processedTests = tests.map(test => {
      const testJson = test.toJSON();
      if (testJson.BranchTestPrices && testJson.BranchTestPrices.length > 0) {
        testJson.price = testJson.BranchTestPrices[0].price;
      }
      delete testJson.BranchTestPrices;
      return testJson;
    });

    res.json(processedTests);
  }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByPk(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const oldValue = { ...test.dataValues };
    await test.update(req.body);

    await AuditLog.create({
      action_type: "UPDATE",
      entity: "Test",
      entity_id: test.id,
      old_value: oldValue,
      new_value: test,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: req.user.base_branch_id,
    });

    res.json(test);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
