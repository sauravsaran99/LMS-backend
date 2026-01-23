const branchAdminService = require("../services/branchAdmin.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getBranchUsers = async (req, res) => {
  const paginationParams = getPaginationParams(req.query);
  const result = await branchAdminService.getUsers(req.user, paginationParams);

  if (result.users) {
    // Pagination enabled
    res.json(
      getPaginatedResponse(
        result.users,
        result.total,
        paginationParams.page,
        paginationParams.limit,
      ),
    );
  } else {
    // Legacy response
    res.json(result);
  }
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

exports.updateBranchUser = async (req, res) => {
  try {
    const user = await branchAdminService.updateUser(req.params.id, req.body, req.user);
    res.json(user);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.createBranchAdmin = async (req, res) => {
  try {
    const result = await branchAdminService.createBranchAdmin(
      req.body,
      req.user,
    );
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.getBranchAdmins = async (req, res) => {
  try {
    const pagination = getPaginationParams(req.query);
    const result = await branchAdminService.getBranchAdmins(pagination);

    if (result.users) {
      return res.json(
        getPaginatedResponse(
          result.users,
          result.total,
          pagination.page,
          pagination.limit,
        ),
      );
    }

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
