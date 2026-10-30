const jwt = require("jsonwebtoken");
const User = require("../models/User");
class AuthMiddleware {
  static async protect(req, res, next) {
    try {
      const [scheme, token] = (req.headers.authorization || "").split(" ");
      if (scheme !== "Bearer" || !token)
        return res
          .status(401)
          .json({ success: false, message: "Authentication required" });
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("_id name email");
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: "User no longer exists" });
      req.user = user;
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
  }
}
module.exports = AuthMiddleware;
