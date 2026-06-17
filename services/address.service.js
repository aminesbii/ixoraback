import prisma from "../config/prisma.js";

// ─── GET USER'S SAVED ADDRESSES ─────────────────────────────────────────────
export const getUserAddresses = async (userId) =>
  prisma.address.findMany({ where: { user_id: userId, order_id: null }, orderBy: { createdAt: 'desc' } });

// ─── GET SINGLE ADDRESS ─────────────────────────────────────────────────────
export const getAddressById = async (id) => prisma.address.findUnique({ where: { id } });

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createAddress = async (data) => {
  if (data.type) data.type = data.type.toUpperCase();
  return prisma.address.create({ data });
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateAddress = async (id, data) => {
  try {
    if (data.type) data.type = data.type.toUpperCase();
    return await prisma.address.update({ where: { id }, data });
  } catch (e) { return null; }
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteAddress = async (id) => {
  try { return await prisma.address.delete({ where: { id } }); } catch (e) { return null; }
}

// ─── GET ADDRESSES FOR AN ORDER ─────────────────────────────────────────────
export const getOrderAddresses = async (orderId) =>
  prisma.address.findMany({ where: { order_id: orderId } });
