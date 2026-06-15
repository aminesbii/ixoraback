import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ixora_dev_secret_change_in_prod";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Middleware: Verify Bearer JWT from the Authorization header.
 * Attaches `req.user` with `{ userId, email, role, status }` on success.
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }
};

/**
 * Middleware: Requires the authenticated user to be an admin.
 * Must be used AFTER `verifyToken`.
 */
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

/**
 * Helper: Sign a JWT for the given user document.
 * @param {import('../models/user.model.js').default} user
 * @returns {string}
 */
export const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
