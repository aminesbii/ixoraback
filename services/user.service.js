import User from "../models/user.model.js";

// ─── LIST USERS (admin, paginated) ──────────────────────────────────────────
export const getUsers = async ({ page = 1, limit = 20, role, status, search } = {}) => {
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { full_name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return {
    users: docs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// ─── GET BY ID ──────────────────────────────────────────────────────────────
export const getUserById = (id) => User.findById(id).lean();

// ─── UPDATE USER (admin) ────────────────────────────────────────────────────
export const updateUser = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();

// ─── UPDATE PROFILE (self) ──────────────────────────────────────────────────
export const updateProfile = (id, { full_name, phone }) =>
  User.findByIdAndUpdate(id, { full_name, phone }, { new: true, runValidators: true }).lean();

// ─── DELETE / SUSPEND ───────────────────────────────────────────────────────
export const deleteUser = (id) => User.findByIdAndDelete(id);
