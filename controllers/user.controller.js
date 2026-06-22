import * as userService from "../services/user.service.js";

// ─── LIST USERS (admin) ────────────────────────────────────────────────────
export const list = async (req, res) => {
  try {
    const { page, limit, role, status, search } = req.query;
    const result = await userService.getUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      role,
      status,
      search,
    });
    res.json(result);
  } catch (err) {
    console.error("[User] List error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET BY ID (admin) ─────────────────────────────────────────────────────
export const getById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("[User] GetById error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── UPDATE (admin — can change role, status) ───────────────────────────────
export const update = async (req, res) => {
  try {
    const { full_name, phone, role, status } = req.body;
    const user = await userService.updateUser(req.params.id, { full_name, phone, role, status });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("[User] Update error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── GET PROFILE (self) ────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("[User] GetProfile error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── UPDATE PROFILE (self) ─────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await userService.updateProfile(req.user.userId, { full_name, phone });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    console.error("[User] UpdateProfile error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── DELETE (admin) ─────────────────────────────────────────────────────────
export const remove = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: "User deleted." });
  } catch (err) {
    console.error("[User] Delete error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
