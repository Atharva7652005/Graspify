const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Authentication is required." });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).sub;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Your session is invalid or has expired." });
  }
}

module.exports = { requireAuth };
