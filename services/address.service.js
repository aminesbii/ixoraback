import Address from "../models/address.model.js";

// ─── GET USER'S SAVED ADDRESSES ─────────────────────────────────────────────
export const getUserAddresses = (userId) =>
  Address.find({ user_id: userId, order_id: null }).sort({ createdAt: -1 }).lean();

// ─── GET SINGLE ADDRESS ─────────────────────────────────────────────────────
export const getAddressById = (id) => Address.findById(id).lean();

// ─── CREATE ──────────────────────────────────────────────────────────────────
export const createAddress = (data) => Address.create(data);

// ─── UPDATE ──────────────────────────────────────────────────────────────────
export const updateAddress = (id, data) =>
  Address.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// ─── DELETE ──────────────────────────────────────────────────────────────────
export const deleteAddress = (id) => Address.findByIdAndDelete(id);

// ─── GET ADDRESSES FOR AN ORDER ─────────────────────────────────────────────
export const getOrderAddresses = (orderId) =>
  Address.find({ order_id: orderId }).lean();
