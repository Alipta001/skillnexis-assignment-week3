const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
class AuthController {
  static token(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
  }
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name?.trim() || !email?.trim() || !password)
        return res.status(400).json({
          success: false,
          message: "Name, email and password are required",
        });
      if (password.length < 8)
        return res.status(400).json({
          success: false,
          message: "Password must contain at least 8 characters",
        });
      const normalized = email.trim().toLowerCase();
      if (await User.findOne({ email: normalized }))
        return res
          .status(409)
          .json({ success: false, message: "Email already registered" });
      const user = await User.create({
        name: name.trim(),
        email: normalized,
        password: await bcrypt.hash(password, 12),
      });
      return res.status(201).json({
        success: true,
        message: "Account created",
        token: AuthController.token(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error) {
      return res.status(error.code === 11000 ? 409 : 500).json({
        success: false,
        message:
          error.code === 11000
            ? "Email already registered"
            : "Unable to register user",
      });
    }
  }
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email?.trim() || !password)
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      }).select("+password");
      if (!user || !(await bcrypt.compare(password, user.password)))
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token: AuthController.token(user._id),
        user: { id: user._id, name: user.name, email: user.email },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to log in" });
    }
  }
  static async me(req, res) {
    return res.json({
      success: true,
      user: { id: req.user._id, name: req.user.name, email: req.user.email },
    });
  }
}
module.exports = AuthController;
