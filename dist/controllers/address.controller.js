import * as addressService from "../services/address.service.js";
// ─── GET MY ADDRESSES ───────────────────────────────────────────────────────
export const myAddresses = async (req, res) => {
    try {
        const addresses = await addressService.getUserAddresses(req.user.userId);
        res.json(addresses);
    }
    catch (err) {
        console.error("[Address] MyAddresses error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── GET BY ID ──────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const address = await addressService.getAddressById(req.params.id);
        if (!address)
            return res.status(404).json({ message: "Address not found." });
        // Non-admin users can only see their own addresses
        if (req.user.role !== "admin" && address.user_id?.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied." });
        }
        res.json(address);
    }
    catch (err) {
        console.error("[Address] GetById error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── CREATE ─────────────────────────────────────────────────────────────────
export const create = async (req, res) => {
    try {
        const address = await addressService.createAddress({
            ...req.body,
            user_id: req.user.userId,
            order_id: null, // saved address, not tied to an order
        });
        res.status(201).json(address);
    }
    catch (err) {
        console.error("[Address] Create error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── UPDATE ─────────────────────────────────────────────────────────────────
export const update = async (req, res) => {
    try {
        // Verify ownership
        const existing = await addressService.getAddressById(req.params.id);
        if (!existing)
            return res.status(404).json({ message: "Address not found." });
        if (existing.user_id?.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }
        const address = await addressService.updateAddress(req.params.id, req.body);
        res.json(address);
    }
    catch (err) {
        console.error("[Address] Update error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── DELETE ─────────────────────────────────────────────────────────────────
export const remove = async (req, res) => {
    try {
        const existing = await addressService.getAddressById(req.params.id);
        if (!existing)
            return res.status(404).json({ message: "Address not found." });
        if (existing.user_id?.toString() !== req.user.userId && req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied." });
        }
        await addressService.deleteAddress(req.params.id);
        res.json({ message: "Address deleted." });
    }
    catch (err) {
        console.error("[Address] Delete error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
