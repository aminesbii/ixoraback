import rateLimit from "express-rate-limit";
const isProd = process.env.NODE_ENV === "production";
// Configurable limits via env with higher defaults
const READ_WINDOW_MS = Number(process.env.RATE_READ_WINDOW_MS ?? (isProd ? 60_000 : 10_000));
const READ_LIMIT = Number(process.env.RATE_READ_LIMIT ?? (isProd ? 2000 : 500));
const WRITE_WINDOW_MS = Number(process.env.RATE_WRITE_WINDOW_MS ?? (isProd ? 15 * 60_000 : 60_000));
const WRITE_LIMIT = Number(process.env.RATE_WRITE_LIMIT ?? (isProd ? 200 : 80));
const AUTH_WINDOW_MS = Number(process.env.RATE_AUTH_WINDOW_MS ?? (isProd ? 15 * 60_000 : 60_000));
const AUTH_LIMIT = Number(process.env.RATE_AUTH_LIMIT ?? (isProd ? 10 : 5));
// Create base limiters (no console logging handlers)
const readLimiter = rateLimit({
    windowMs: READ_WINDOW_MS,
    limit: READ_LIMIT,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
const writeLimiter = rateLimit({
    windowMs: WRITE_WINDOW_MS,
    limit: WRITE_LIMIT,
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
export const authLimiter = rateLimit({
    windowMs: AUTH_WINDOW_MS,
    limit: AUTH_LIMIT,
    message: "Too many login attempts, please try again later.",
    standardHeaders: "draft-7",
    legacyHeaders: false,
});
// Helpers to apply limiters by HTTP method
const limitMethods = (limiter, methods) => (req, res, next) => methods.includes(req.method) ? limiter(req, res, next) : next();
export const limitReadsOnly = limitMethods(readLimiter, ["GET", "HEAD"]);
export const limitWritesOnly = limitMethods(writeLimiter, [
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
]);
export default {
    limitReadsOnly,
    limitWritesOnly,
    authLimiter,
};
