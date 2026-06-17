/**
 * Middleware: Optionally parse JWT from Authorization header.
 * If a valid token is present, attaches req.user. If not, continues without error.
 * Use this for routes that work for both guests and authenticated users.
 */
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "ixora_dev_secret_change_in_prod";
export const optionalAuth = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
            const token = authHeader.split(" ")[1];
            req.user = jwt.verify(token, JWT_SECRET);
        }
        catch {
            // Invalid/expired token — continue as guest
            req.user = null;
        }
    }
    else {
        req.user = null;
    }
    next();
};
