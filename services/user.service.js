import prisma from "../config/prisma.js";

// ─── LIST USERS (admin, paginated) ──────────────────────────────────────────
export const getUsers = async ({ page = 1, limit = 20, role, status, search } = {}) => {
  const where = {};
  if (role) where.role = role.toUpperCase();
  if (status) where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { full_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: docs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

// ─── GET BY ID ──────────────────────────────────────────────────────────────
export const getUserById = (id) => prisma.user.findUnique({ where: { id } });

// ─── GET PROFILE (self) ─────────────────────────────────────────────────────
export const getProfile = (id) =>
  prisma.user.findUnique({ where: { id }, select: { id: true, full_name: true, email: true, phone: true, role: true, status: true, createdAt: true, updatedAt: true } });

// ─── UPDATE USER (admin) ────────────────────────────────────────────────────
export const updateUser = async (id, data) => {
  try {
    if (data.role) data.role = data.role.toUpperCase();
    if (data.status) data.status = data.status.toUpperCase();
    return await prisma.user.update({ where: { id }, data });
  } catch (e) {
    return null;
  }
};

// ─── UPDATE PROFILE (self) ──────────────────────────────────────────────────
export const updateProfile = async (id, { full_name, phone }) => {
  try {
    return await prisma.user.update({ where: { id }, data: { full_name, phone } });
  } catch (e) {
    return null;
  }
};

// ─── DELETE / SUSPEND ───────────────────────────────────────────────────────
export const deleteUser = async (id) => {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (e) {
    return null;
  }
};
