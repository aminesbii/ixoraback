import * as cartService from "../services/cart.service.js";
// ─── GET (or create) CART ───────────────────────────────────────────────────
export const getCart = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        if (!userId && !sessionToken) {
            return res.status(400).json({ message: "Login or provide x-session-token header." });
        }
        const cart = await cartService.getOrCreateCart({ userId, sessionToken });
        const full = await cartService.getCartWithItems(cart._id);
        res.json(full);
    }
    catch (err) {
        console.error("[Cart] Get error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── ADD TO CART ─────────────────────────────────────────────────────────────
export const addItem = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        const { product_id, variant_id, quantity } = req.body;
        if (!product_id) {
            return res.status(400).json({ message: "product_id is required." });
        }
        const cart = await cartService.getOrCreateCart({ userId, sessionToken });
        await cartService.addToCart({
            cartId: cart._id,
            productId: product_id,
            variantId: variant_id || null,
            quantity: Number(quantity) || 1,
        });
        const full = await cartService.getCartWithItems(cart._id);
        res.json(full);
    }
    catch (err) {
        console.error("[Cart] AddItem error:", err);
        res.status(400).json({ message: err.message });
    }
};
// ─── UPDATE ITEM QUANTITY ────────────────────────────────────────────────────
export const updateItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        await cartService.updateCartItem(req.params.itemId, Number(quantity));
        // Re-fetch the caller's cart
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        const cart = await cartService.getOrCreateCart({ userId, sessionToken });
        const full = await cartService.getCartWithItems(cart._id);
        res.json(full);
    }
    catch (err) {
        console.error("[Cart] UpdateItem error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── REMOVE ITEM ─────────────────────────────────────────────────────────────
export const removeItem = async (req, res) => {
    try {
        await cartService.removeCartItem(req.params.itemId);
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        const cart = await cartService.getOrCreateCart({ userId, sessionToken });
        const full = await cartService.getCartWithItems(cart._id);
        res.json(full);
    }
    catch (err) {
        console.error("[Cart] RemoveItem error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── CLEAR ──────────────────────────────────────────────────────────────────
export const clear = async (req, res) => {
    try {
        const userId = req.user?.userId || null;
        const sessionToken = req.headers["x-session-token"] || null;
        const cart = await cartService.getOrCreateCart({ userId, sessionToken });
        await cartService.clearCart(cart._id);
        res.json({ message: "Cart cleared." });
    }
    catch (err) {
        console.error("[Cart] Clear error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// ─── MERGE GUEST → USER (called after login) ───────────────────────────────
export const merge = async (req, res) => {
    try {
        const { session_token } = req.body;
        if (!session_token) {
            return res.status(400).json({ message: "session_token is required." });
        }
        const result = await cartService.mergeGuestCart(session_token, req.user.userId);
        res.json(result || { message: "No guest cart found to merge." });
    }
    catch (err) {
        console.error("[Cart] Merge error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
