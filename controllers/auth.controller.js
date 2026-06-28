import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { signToken } from "../middlewares/auth.middleware.js";
import { sendPasswordResetEmail } from "../utils/email.js";

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        full_name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null
      }
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      userId: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ message: "Internal server error during registration." });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      token,
      userId: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ message: "Internal server error during login." });
  }
};

// ─── POST /api/auth/forgot-password ────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, purpose: "password_reset" },
      process.env.JWT_SECRET || "ixora_dev_secret_change_in_prod",
      { expiresIn: "15m" }
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
    const resetLink = `${frontendUrl}/auth/reset-password/${resetToken}`;

    const sent = await sendPasswordResetEmail(email, resetLink);
    if (!sent) {
      console.warn(`[Auth] Failed to send reset email to ${email}`);
    }

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("[Auth] Forgot password error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── POST /api/auth/reset-password/:token ─────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ixora_dev_secret_change_in_prod");
    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid reset token." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash },
    });

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired. Please request a new one." });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid reset token." });
    }
    console.error("[Auth] Reset password error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      userId: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("[Auth] Me error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
