import bcrypt from "bcryptjs";
import prisma from "../config/prisma.js";

const AVAILABLE_PAGES = ["home", "products", "orders", "analytics"];

export const getAvailablePages = async (req, res) => {
  res.json({ pages: AVAILABLE_PAGES });
};

export const createManager = async (req, res) => {
  try {
    const { full_name, email, password, phone, permissions } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Full name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: "A user with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        full_name,
        email: email.toLowerCase(),
        passwordHash,
        phone: phone || null,
        role: "MANAGER",
        status: "ACTIVE",
        permissions: JSON.stringify(permissions || []),
      },
    });

    res.status(201).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      permissions: JSON.parse(user.permissions),
    });
  } catch (err) {
    console.error("[Settings] Create manager error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const listManagers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "MANAGER" },
      orderBy: { createdAt: "desc" },
    });
    const mapped = users.map((u) => ({
      ...u,
      permissions: JSON.parse(u.permissions),
    }));
    res.json({ users: mapped });
  } catch (err) {
    console.error("[Settings] List managers error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getManager = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, role: "MANAGER" },
    });
    if (!user) return res.status(404).json({ message: "Manager not found." });
    res.json({ ...user, permissions: JSON.parse(user.permissions) });
  } catch (err) {
    console.error("[Settings] Get manager error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateManager = async (req, res) => {
  try {
    const { full_name, phone, status, permissions } = req.body;
    const data = {};
    if (full_name !== undefined) data.full_name = full_name;
    if (phone !== undefined) data.phone = phone;
    if (status !== undefined) data.status = status;
    if (permissions !== undefined) data.permissions = JSON.stringify(permissions);

    const user = await prisma.user.update({ where: { id: req.params.id }, data });
    if (!user) return res.status(404).json({ message: "Manager not found." });
    res.json({ ...user, permissions: JSON.parse(user.permissions) });
  } catch (err) {
    console.error("[Settings] Update manager error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteManager = async (req, res) => {
  try {
    const user = await prisma.user.delete({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: "Manager not found." });
    res.json({ message: "Manager deleted." });
  } catch (err) {
    console.error("[Settings] Delete manager error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
