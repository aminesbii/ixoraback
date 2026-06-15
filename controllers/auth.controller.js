import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { signToken } from "../middlewares/auth.middleware.js";

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

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ full_name, email, passwordHash, phone: phone || null });

    const token = signToken(user);

    res.status(201).json({
      token,
      userId: user._id,
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

    // Explicitly select passwordHash since it is excluded by default
    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ message: "Your account has been suspended." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    res.json({
      token,
      userId: user._id,
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

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      userId: user._id,
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
