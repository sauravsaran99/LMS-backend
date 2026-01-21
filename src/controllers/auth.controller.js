const authService = require("../services/auth.service");
const { loginSchema } = require("../validators/auth.validator");

exports.login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { token, user } = await authService.login(value);

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "none",
      // sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("access_token");
  res.json({ message: "Logged out successfully" });
};

exports.me = async (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
    base_branch_id: req.user.base_branch_id,
  });
};
