const userService = require("../services/user.service");
const {
  getPaginationParams,
  getPaginatedResponse,
} = require("../utils/pagination.util");

exports.getUsers = async (req, res, next) => {
  try {
    const paginationParams = getPaginationParams(req.query);
    const result = await userService.getUsersByRole({
      roleName: req.query.role, // "TECHNICIAN"
      user: req.user,
      pagination: paginationParams,
    });

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
  } catch (err) {
    next(err);
  }
};
