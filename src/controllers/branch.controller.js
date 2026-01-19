const { AuditLog } = require("../models");
const branchService = require("../services/branch.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getBranches = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await branchService.listBranches(paginationParams);

    if (result.branches) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.branches,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const branch = await branchService.createBranch(req.body);

    await AuditLog.create({
      action: "CREATE_BRANCH",
      action_type: "CREATE",
      entity: "BRANCH",
      entity_id: branch.id,
      old_value: null,
      new_value: branch,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: null, // SUPER ADMIN → PAN INDIA
    });

    res.status(201).json(branch);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await branchService.getAllBranches(paginationParams);

    if (result.branches) {
      // Pagination enabled
      res.json(
        getPaginatedResponse(
          result.branches,
          result.total,
          paginationParams.page,
          paginationParams.limit,
        ),
      );
    } else {
      // Legacy response
      res.json(result);
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    let branch = await branchService.updateBranch(req.params.id, req.body);

    let dataAudit = await AuditLog.create({
      action: "UPDATE_BRANCH",
      action_type: "UPDATE",
      entity: "BRANCH",
      entity_id: branch.id,
      old_value: req.body,
      new_value: branch,
      user_id: req.user.id,
      role: req.user.role,
      branch_id: null,
    });

    console.log("dataAudit", dataAudit);

    res.json({ message: "Branch updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBranchStatus = async (req, res) => {
  try {
    const branch = await branchService.toggleStatus(
      req.params.id,
      req.body.status,
    );

    await AuditLog.create({
      action: "CHANGE_BRANCH_STATUS",
      action_type: "STATUS_CHANGE",
      entity: "BRANCH",
      entity_id: branch.id,
      old_value: { status: req.body.status },
      new_value: { status: branch.status },
      user_id: req.user.id,
      role: req.user.role,
      branch_id: null,
    });

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
